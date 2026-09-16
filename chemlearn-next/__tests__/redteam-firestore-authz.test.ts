jest.mock('@/lib/firebase-admin', () => ({
  adminApp: {},
  adminDb: {
    collection: jest.fn(),
    runTransaction: jest.fn(),
  },
  adminAuth: {
    verifyIdToken: jest.fn(),
  },
}));

import firestoreAuthzBenchmarks from '@/lib/redteam/benchmarks/firestore-authz.json';
import { executeSingleTest } from '@/lib/redteam/runner';
import { TestCase } from '@/lib/redteam/types';

describe('Firestore Security Rules Authorization Red Team Suite', () => {
  it('contains test cases across student-student, student-teacher, gamification, and duels', () => {
    expect(firestoreAuthzBenchmarks.length).toBeGreaterThanOrEqual(10);
  });

  describe('Student → Student Privilege Boundaries', () => {
    it('denies Student A modifying or deleting Student B profile', async () => {
      const s2sTests = (firestoreAuthzBenchmarks as TestCase[]).filter((t) =>
        t.id.startsWith('fs-s2s')
      );
      expect(s2sTests.length).toBeGreaterThanOrEqual(2);
      for (const t of s2sTests) {
        const record = await executeSingleTest(t);
        expect(record.result).toBe('PASS');
      }
    });
  });

  describe('Student → Teacher Role Escalation', () => {
    it('denies privilege escalation and direct writes to teachers / classes collections', async () => {
      const s2tTests = (firestoreAuthzBenchmarks as TestCase[]).filter((t) =>
        t.id.startsWith('fs-s2t')
      );
      expect(s2tTests.length).toBeGreaterThanOrEqual(3);
      for (const t of s2tTests) {
        const record = await executeSingleTest(t);
        expect(record.result).toBe('PASS');
      }
    });
  });

  describe('Gamification Tampering Resistance', () => {
    it('denies direct mutations to XP, level, streak, quizScore, and badges', async () => {
      const gamTests = (firestoreAuthzBenchmarks as TestCase[]).filter((t) =>
        t.id.startsWith('fs-gam')
      );
      expect(gamTests.length).toBeGreaterThanOrEqual(4);
      for (const t of gamTests) {
        const record = await executeSingleTest(t);
        expect(record.result).toBe('PASS');
      }
    });
  });

  describe('Real-Time Duel Tampering Resistance', () => {
    it('denies modifying opponent score, winnerUid, questions, or rewardStatus', async () => {
      const duelTests = (firestoreAuthzBenchmarks as TestCase[]).filter((t) =>
        t.id.startsWith('fs-duel')
      );
      expect(duelTests.length).toBeGreaterThanOrEqual(3);
      for (const t of duelTests) {
        const record = await executeSingleTest(t);
        expect(record.result).toBe('PASS');
      }
    });
  });
});
