const mockDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockGetDoc = jest.fn();
const mockRunTransaction = jest.fn();
const mockOnSnapshot = jest.fn();

jest.mock('../firebase', () => ({
  app: {},
  auth: { currentUser: null },
  db: {},
}));

jest.mock('@/lib/firebase', () => ({
  app: {},
  auth: { currentUser: null },
  db: {},
}));

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: (...args: any[]) => mockDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  runTransaction: (...args: any[]) => mockRunTransaction(...args),
  onSnapshot: (...args: any[]) => mockOnSnapshot(...args),
  serverTimestamp: () => '2026-09-05T00:00:00Z',
  getFirestore: jest.fn(() => ({})),
}));

import { createMatch, joinMatch, finishMatch } from '@/lib/firebase/duel';

describe('Duel Multiplayer Engine (Concurrency & State Transitions)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc.mockReturnValue('mock-duel-ref');
  });

  describe('createMatch', () => {
    it('creates a new duel in waiting state with player 1 initialized', async () => {
      mockSetDoc.mockResolvedValueOnce(undefined);

      const matchId = await createMatch('player1-uid', 'Alice', [
        { q: 'Test question', options: ['A', 'B', 'C', 'D'] },
      ]);
      expect(typeof matchId).toBe('string');
      expect(mockSetDoc).toHaveBeenCalledWith(
        'mock-duel-ref',
        expect.objectContaining({
          status: 'waiting',
          player1: { uid: 'player1-uid', displayName: 'Alice', score: 0, finished: false },
        })
      );
    });
  });

  describe('joinMatch', () => {
    it('rejects joining when match does not exist', async () => {
      mockRunTransaction.mockImplementation(async (db, updateFn) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({ exists: () => false }),
          update: jest.fn(),
        };
        return updateFn(mockTransaction);
      });

      await expect(joinMatch('missing-match', 'player2-uid', 'Bob')).rejects.toThrow('Match not found');
    });

    it('rejects joining when match status is not waiting', async () => {
      mockRunTransaction.mockImplementation(async (db, updateFn) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({ status: 'playing', player1: { uid: 'p1' } }),
          }),
          update: jest.fn(),
        };
        return updateFn(mockTransaction);
      });

      await expect(joinMatch('active-match', 'player2-uid', 'Bob')).rejects.toThrow('Match already started or finished');
    });

    it('successfully joins waiting match atomically and sets player2', async () => {
      const updateSpy = jest.fn();
      mockRunTransaction.mockImplementation(async (db, updateFn) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue({
            exists: () => true,
            data: () => ({
              matchId: 'duel-123',
              status: 'waiting',
              player1: { uid: 'p1', displayName: 'Alice', score: 0, finished: false },
            }),
          }),
          update: updateSpy,
        };
        return updateFn(mockTransaction);
      });

      const result = await joinMatch('duel-123', 'p2-uid', 'Bob');
      expect(result.status).toBe('playing');
      expect(result.player2).toEqual({ uid: 'p2-uid', displayName: 'Bob', score: 0, finished: false });
      expect(updateSpy).toHaveBeenCalledWith(
        'mock-duel-ref',
        expect.objectContaining({
          status: 'playing',
          player2: { uid: 'p2-uid', displayName: 'Bob', score: 0, finished: false },
        })
      );
    });
  });

  describe('finishMatch', () => {
    it('marks player1 finished without changing match status if opponent has not finished', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          status: 'playing',
          player1: { uid: 'p1', finished: false },
          player2: { uid: 'p2', finished: false },
        }),
      });

      await finishMatch('duel-123', 'p1');
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-duel-ref',
        { 'player1.finished': true }
      );
    });

    it('marks status as finished in the same write if opponent is already finished', async () => {
      mockGetDoc.mockResolvedValueOnce({
        exists: () => true,
        data: () => ({
          status: 'playing',
          player1: { uid: 'p1', finished: false },
          player2: { uid: 'p2', finished: true },
        }),
      });

      await finishMatch('duel-123', 'p1');
      expect(mockUpdateDoc).toHaveBeenCalledWith(
        'mock-duel-ref',
        { 'player1.finished': true, status: 'finished' }
      );
    });
  });
});
