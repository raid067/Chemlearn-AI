import { submitDuelAnswer, finishDuelPlayer, storeAuthoritativeDuel } from '@/lib/server/duels';

const mockDuelStore = new Map<string, Record<string, any>>();
let transactionQueue = Promise.resolve();

jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn((colName: string) => ({
      doc: jest.fn((docId: string) => {
        const fullKey = `${colName}/${docId}`;
        return {
          id: docId,
          path: fullKey,
          get: jest.fn(async () => {
            const data = mockDuelStore.get(fullKey);
            return {
              exists: !!data,
              data: () => (data ? { ...data } : {}),
            };
          }),
          set: jest.fn(async (newData: any) => {
            mockDuelStore.set(fullKey, { ...newData });
          }),
          update: jest.fn(async (updates: any) => {
            const current = mockDuelStore.get(fullKey) || {};
            // Handle dotted keys like 'player1.score'
            const merged = { ...current };
            for (const [k, v] of Object.entries(updates)) {
              if (k.includes('.')) {
                const [parent, child] = k.split('.');
                merged[parent] = { ...(merged[parent] || {}), [child]: v };
              } else {
                merged[k] = v;
              }
            }
            mockDuelStore.set(fullKey, merged);
          }),
        };
      }),
    })),
    runTransaction: jest.fn((updateFunction: (tx: any) => Promise<any>) => {
      const execute = async () => {
        const tx = {
          get: jest.fn(async (docRef: any) => {
            const data = mockDuelStore.get(docRef.path);
            return {
              exists: !!data,
              data: () => (data ? { ...data } : {}),
            };
          }),
          update: jest.fn((docRef: any, updates: any) => {
            const current = mockDuelStore.get(docRef.path) || {};
            const merged = { ...current };
            for (const [k, v] of Object.entries(updates)) {
              if (k.includes('.')) {
                const [parent, child] = k.split('.');
                merged[parent] = { ...(merged[parent] || {}), [child]: v };
              } else {
                merged[k] = v;
              }
            }
            mockDuelStore.set(docRef.path, merged);
          }),
        };
        return await updateFunction(tx);
      };

      const next = transactionQueue.then(execute, execute);
      transactionQueue = next.then(() => {}, () => {});
      return next;
    }),
  },
}));

const mockAwardXPEvent = jest.fn();
jest.mock('@/lib/server/gamification', () => ({
  awardXPEvent: (...args: any[]) => mockAwardXPEvent(...args),
}));

describe('Phase 7: Duel Race-Condition & Concurrency Stress Testing', () => {
  const matchId = 'duel_race_match_999';
  const player1 = 'p1_alice';
  const player2 = 'p2_bob';

  beforeEach(async () => {
    mockDuelStore.clear();
    jest.clearAllMocks();
    mockAwardXPEvent.mockResolvedValue({
      alreadyAwarded: false,
      xpAwarded: 20,
    });

    // Store server secret answers
    await storeAuthoritativeDuel(matchId, player1, [
      { q: 'Acid pH?', options: ['1', '7', '14'], ans: 0 },
      { q: 'Base pH?', options: ['1', '7', '14'], ans: 2 },
      { q: 'Neutral pH?', options: ['1', '7', '14'], ans: 1 },
    ]);

    // Initialize duel state
    mockDuelStore.set(`duels/${matchId}`, {
      status: 'playing',
      createdAt: Date.now(),
      player1: { uid: player1, displayName: 'Alice', score: 0, finished: false, answeredIndices: [] },
      player2: { uid: player2, displayName: 'Bob', score: 0, finished: false, answeredIndices: [] },
    });
  });

  it('handles simultaneous answers from Player 1 and Player 2 without collision', async () => {
    // Both players answer question 0 simultaneously
    const [res1, res2] = await Promise.all([
      submitDuelAnswer(matchId, player1, 0, 0), // Alice submits correct answer (0)
      submitDuelAnswer(matchId, player2, 0, 1), // Bob submits incorrect answer (1)
    ]);

    expect(res1.correct).toBe(true);
    expect(res1.score).toBe(10);
    expect(res2.correct).toBe(false);
    expect(res2.score).toBe(0);

    const duelDoc = mockDuelStore.get(`duels/${matchId}`)!;
    expect(duelDoc.player1.score).toBe(10);
    expect(duelDoc.player1.answeredIndices).toEqual([0]);
    expect(duelDoc.player2.score).toBe(0);
    expect(duelDoc.player2.answeredIndices).toEqual([0]);
  });

  it('rejects duplicate or replayed answer submissions for the same question', async () => {
    // Alice answers question 0
    await submitDuelAnswer(matchId, player1, 0, 0);

    // Alice attempts to submit answer for question 0 again
    await expect(submitDuelAnswer(matchId, player1, 0, 0)).rejects.toThrow(/already answered/i);

    const duelDoc = mockDuelStore.get(`duels/${matchId}`)!;
    expect(duelDoc.player1.score).toBe(10); // Score was not duplicated
  });

  it('rejects answers submitted after 15-minute match expiration', async () => {
    // Modify match createdAt to 16 minutes in the past
    const duelDoc = mockDuelStore.get(`duels/${matchId}`)!;
    duelDoc.createdAt = Date.now() - 16 * 60 * 1000;

    await expect(submitDuelAnswer(matchId, player1, 0, 0)).rejects.toThrow(/timed out/i);
  });

  it('rejects answers from unauthorized non-participants', async () => {
    await expect(submitDuelAnswer(matchId, 'attacker_mallory', 0, 0)).rejects.toThrow(/not a participant/i);
  });

  it('resolves simultaneous match finish requests: awards reward exactly once', async () => {
    // Set scores: Alice 20, Bob 10
    const duelDoc = mockDuelStore.get(`duels/${matchId}`)!;
    duelDoc.player1.score = 20;
    duelDoc.player2.score = 10;

    // Both players submit finish call simultaneously
    const [finish1, finish2] = await Promise.all([
      finishDuelPlayer(matchId, player1),
      finishDuelPlayer(matchId, player2),
    ]);

    // The second player to finish completes the match
    const finishes = [finish1, finish2];
    expect(finishes.some((f) => f.status === 'finished')).toBe(true);

    const finalDuelDoc = mockDuelStore.get(`duels/${matchId}`)!;
    expect(finalDuelDoc.status).toBe('finished');
    expect(finalDuelDoc.winnerUid).toBe(player1);
    expect(finalDuelDoc.player1.finished).toBe(true);
    expect(finalDuelDoc.player2.finished).toBe(true);

    // XP award was called exactly ONCE for the winner
    expect(mockAwardXPEvent).toHaveBeenCalledTimes(1);
    expect(mockAwardXPEvent).toHaveBeenCalledWith(player1, 'DUEL', matchId, 20, expect.any(Object));
  });

  it('handles idempotent finish call when match is already awarded', async () => {
    const duelDoc = mockDuelStore.get(`duels/${matchId}`)!;
    duelDoc.status = 'finished';
    duelDoc.winnerUid = player1;
    duelDoc.rewardStatus = 'awarded';

    const result = await finishDuelPlayer(matchId, player1);
    expect(result.status).toBe('finished');
    expect(result.winnerUid).toBe(player1);
    expect(result.rewardStatus).toBe('awarded');
    expect(mockAwardXPEvent).not.toHaveBeenCalled();
  });
});
