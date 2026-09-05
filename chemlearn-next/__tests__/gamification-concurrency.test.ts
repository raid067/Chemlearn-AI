const mockTx = {
  get: jest.fn(),
  set: jest.fn(),
  update: jest.fn(),
};

const mockServerDuelSnap = {
  exists: true,
  data: () => ({
    matchId: 'match_123',
    creatorUid: 'user_a',
    questions: [
      { q: 'What is the formula for water?', options: ['H2O', 'CO2', 'O2', 'H2'], ans: 0 },
    ],
  }),
};

jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn((colName: string) => ({
      doc: jest.fn((id: string) => ({
        id,
        get: jest.fn(async () => {
          if (colName === 'server_duels') return mockServerDuelSnap;
          return { exists: false, data: () => null };
        }),
      })),
    })),
    runTransaction: jest.fn(async (cb) => cb(mockTx)),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import { awardXPEvent } from '@/lib/server/gamification';
import { submitDuelAnswer, finishDuelPlayer } from '@/lib/server/duels';

describe('Gamification & Duel Concurrency and Replay Attacks (Phase 16 & 17)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Lesson Completion & XP Replay Defenses', () => {
    it('rejects tampered XP amounts exceeding allowable boundaries (< 1 or > 200)', async () => {
      // Tamper 1: 0 XP
      await expect(
        awardXPEvent('student_123', 'LESSON', '6-1', 0)
      ).rejects.toThrow(/1-200 XP/);

      // Tamper 2: Negative XP
      await expect(
        awardXPEvent('student_123', 'LESSON', '6-1', -50)
      ).rejects.toThrow(/1-200 XP/);

      // Tamper 3: 1,000,000 XP cheat
      await expect(
        awardXPEvent('student_123', 'LESSON', '6-1', 1000000)
      ).rejects.toThrow(/1-200 XP/);
    });

    it('defends against duplicate / replayed XP event IDs idempotently', async () => {
      // Simulate that the event ID already exists in the ledger
      mockTx.get.mockImplementation(async (ref: any) => {
        if (ref?.id?.includes('lesson')) {
          return {
            exists: true,
            data: () => ({
              uid: 'student_123',
              amount: 25,
              createdAt: new Date(),
            }),
          };
        }
        return {
          exists: true,
          data: () => ({ xp: 100, level: 1 }),
        };
      });

      const result = await awardXPEvent('student_123', 'LESSON', '6-1', 25);

      // Should return alreadyAwarded: true without adding extra XP
      expect(result.alreadyAwarded).toBe(true);
      expect(result.xpAwarded).toBe(0);
      expect(mockTx.set).not.toHaveBeenCalled();
    });

    it('handles concurrent identical completion requests gracefully (only awards once)', async () => {
      let isFirst = true;
      mockTx.get.mockImplementation(async (ref: any) => {
        if (ref?.id?.includes('lesson')) {
          if (isFirst) {
            isFirst = false;
            return { exists: false, data: () => null };
          }
          return {
            exists: true,
            data: () => ({ uid: 'student_concurrent', amount: 25 }),
          };
        }
        return {
          exists: true,
          data: () => ({ xp: 100, level: 1 }),
        };
      });

      // Simulate 10 simultaneous completion requests
      const promises = Array.from({ length: 10 }).map(() =>
        awardXPEvent('student_concurrent', 'LESSON', '6-1', 25).catch((e) => e)
      );

      const results = await Promise.all(promises);

      // Exactly one should succeed with xpAwarded: 25, rest should be alreadyAwarded: true
      const awarded = results.filter((r) => r && r.xpAwarded === 25);
      const blocked = results.filter((r) => r && r.alreadyAwarded === true);

      expect(awarded.length).toBe(1);
      expect(blocked.length).toBe(9);
    });
  });

  describe('Duel Concurrency, Expiration & Replay Defenses', () => {
    it('rejects submissions for matches that have expired (> 15 minutes)', async () => {
      const expiredCreatedAtMillis = Date.now() - 16 * 60 * 1000; // 16 mins ago
      mockTx.get.mockImplementation(async () => {
        return {
          exists: true,
          data: () => ({
            id: 'match_expired',
            status: 'playing',
            player1: { uid: 'user_a', score: 0 },
            player2: { uid: 'user_b', score: 0 },
            createdAt: { toMillis: () => expiredCreatedAtMillis },
          }),
        };
      });

      await expect(
        submitDuelAnswer('match_expired', 'user_a', 0, 0)
      ).rejects.toThrow(/timed out/);
    });

    it('rejects duplicate answers for the same question index (replay prevention)', async () => {
      mockTx.get.mockImplementation(async () => {
        return {
          exists: true,
          data: () => ({
            id: 'match_active',
            status: 'playing',
            player1: { uid: 'user_a', score: 10, answeredIndices: [0] },
            player2: { uid: 'user_b', score: 0, answeredIndices: [] },
            createdAt: { toMillis: () => Date.now() },
          }),
        };
      });

      await expect(
        submitDuelAnswer('match_active', 'user_a', 0, 0)
      ).rejects.toThrow(/already answered/i);
    });

    it('handles duel finish idempotently when player is already finished', async () => {
      mockTx.get.mockImplementation(async () => {
        return {
          exists: true,
          data: () => ({
            id: 'match_done',
            status: 'completed',
            winnerUid: 'user_a',
            player1: { uid: 'user_a', score: 30, finished: true },
            player2: { uid: 'user_b', score: 10, finished: true },
            rewardStatus: 'awarded',
          }),
        };
      });

      const result = await finishDuelPlayer('match_done', 'user_a');
      expect(result.status).toBe('completed');
      expect(result.winnerUid).toBe('user_a');
    });
  });
});
