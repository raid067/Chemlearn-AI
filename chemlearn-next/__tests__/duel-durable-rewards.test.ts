const mockDoc = jest.fn();
const mockRunTransaction = jest.fn();
const mockAwardXPEvent = jest.fn();
const mockUpdate = jest.fn();

jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn(() => ({
      doc: (...args: any[]) => mockDoc(...args),
    })),
    runTransaction: (...args: any[]) => mockRunTransaction(...args),
  },
}));

jest.mock('@/lib/server/gamification', () => ({
  awardXPEvent: (...args: any[]) => mockAwardXPEvent(...args),
}));

import { finishDuelPlayer } from '@/lib/server/duels';

describe('Duel Durable Rewards & Finalization State Machine', () => {
  const matchId = 'duel-match-456';
  const player1Uid = 'p1-alice';
  const player2Uid = 'p2-bob';

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReturnValue({
      update: (...args: any[]) => mockUpdate(...args),
    });
    mockUpdate.mockResolvedValue(undefined);
  });

  it('marks match finished and sets rewardStatus to awarded on successful XP award', async () => {
    // Player 2 already finished, Player 1 finishes now with higher score (winner)
    mockRunTransaction.mockImplementationOnce(async (callback) => {
      const mockTx = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            status: 'playing',
            player1: { uid: player1Uid, score: 30, finished: false },
            player2: { uid: player2Uid, score: 20, finished: true },
          }),
        }),
        update: jest.fn(),
      };
      return callback(mockTx);
    });

    mockAwardXPEvent.mockResolvedValueOnce({
      alreadyAwarded: false,
      xpAwarded: 20,
      currentXp: 120,
      currentLevel: 2,
      levelUp: false,
    });

    const result = await finishDuelPlayer(matchId, player1Uid);

    expect(result.status).toBe('finished');
    expect(result.winnerUid).toBe(player1Uid);
    expect(result.rewardStatus).toBe('awarded');
    expect(result.xpAwarded).toBe(20);

    // Verify duel doc was updated with awarded state
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        rewardStatus: 'awarded',
      })
    );
  });

  it('marks rewardStatus as failed if XP award fails, allowing durable retry', async () => {
    mockRunTransaction.mockImplementationOnce(async (callback) => {
      const mockTx = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            status: 'playing',
            player1: { uid: player1Uid, score: 30, finished: false },
            player2: { uid: player2Uid, score: 20, finished: true },
          }),
        }),
        update: jest.fn(),
      };
      return callback(mockTx);
    });

    mockAwardXPEvent.mockRejectedValueOnce(new Error('Network failure'));

    const result = await finishDuelPlayer(matchId, player1Uid);

    expect(result.status).toBe('finished');
    expect(result.winnerUid).toBe(player1Uid);
    expect(result.rewardStatus).toBe('failed');
    expect(result.xpAwarded).toBe(0);

    // Verify duel doc was marked failed with error message
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        rewardStatus: 'failed',
        rewardError: 'Network failure',
      })
    );
  });

  it('does not re-award XP if duel reward was already awarded (idempotency)', async () => {
    // Match was already finished and awarded in a prior call
    mockRunTransaction.mockImplementationOnce(async (callback) => {
      const mockTx = {
        get: jest.fn().mockResolvedValue({
          exists: true,
          data: () => ({
            status: 'finished',
            player1: { uid: player1Uid, score: 30, finished: true },
            player2: { uid: player2Uid, score: 20, finished: true },
            winnerUid: player1Uid,
            rewardStatus: 'awarded',
          }),
        }),
        update: jest.fn(),
      };
      return callback(mockTx);
    });

    const result = await finishDuelPlayer(matchId, player1Uid);

    expect(result.rewardStatus).toBe('awarded');
    expect(result.xpAwarded).toBe(0);
    // awardXPEvent should NOT have been called
    expect(mockAwardXPEvent).not.toHaveBeenCalled();
  });
});
