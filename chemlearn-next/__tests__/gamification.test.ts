import { calculateLevel } from '@/lib/server/gamification';

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

describe('Gamification System - calculateLevel', () => {
  it('should return level 1 for negative XP', () => {
    expect(calculateLevel(-100)).toBe(1);
    expect(calculateLevel(-1)).toBe(1);
  });

  it('should return level 1 for 0 XP', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('should return level 1 for XP just below level 2 threshold', () => {
    expect(calculateLevel(499)).toBe(1);
  });

  it('should return level 2 exactly at level 2 threshold', () => {
    expect(calculateLevel(500)).toBe(2);
  });

  it('should handle all intermediate thresholds correctly', () => {
    expect(calculateLevel(1200)).toBe(3);
    expect(calculateLevel(2199)).toBe(3);

    expect(calculateLevel(2200)).toBe(4);
    expect(calculateLevel(3499)).toBe(4);

    expect(calculateLevel(3500)).toBe(5);
    expect(calculateLevel(4999)).toBe(5);

    expect(calculateLevel(5000)).toBe(6);
    expect(calculateLevel(6799)).toBe(6);

    expect(calculateLevel(6800)).toBe(7);
    expect(calculateLevel(8799)).toBe(7);

    expect(calculateLevel(8800)).toBe(8);
    expect(calculateLevel(10999)).toBe(8);

    expect(calculateLevel(11000)).toBe(9);
    expect(calculateLevel(13999)).toBe(9);
  });

  it('should return level 10 exactly at max threshold', () => {
    expect(calculateLevel(14000)).toBe(10);
  });

  it('should return level 10 for XP well above max threshold', () => {
    expect(calculateLevel(20000)).toBe(10);
    expect(calculateLevel(999999)).toBe(10);
  });
});
