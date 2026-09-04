import { escapeHtml, formatTime, getLevelTitle, calcTotalXP, cn } from '@/lib/utils';

describe('Utility Functions', () => {
  describe('formatTime', () => {
    it('formats seconds correctly', () => {
      expect(formatTime(0)).toBe('00:00');
      expect(formatTime(59)).toBe('00:59');
      expect(formatTime(60)).toBe('01:00');
      expect(formatTime(125)).toBe('02:05');
    });
  });

  describe('getLevelTitle', () => {
    it('returns the correct title based on score', () => {
      expect(getLevelTitle(90)).toBe('Master Chemist');
      expect(getLevelTitle(80)).toBe('Master Chemist');
      expect(getLevelTitle(60)).toBe('Advanced Chemist');
      expect(getLevelTitle(30)).toBe('Apprentice Chemist');
      expect(getLevelTitle(10)).toBe('Novice Chemist');
    });
  });

  describe('calcTotalXP', () => {
    it('calculates total XP correctly', () => {
      expect(calcTotalXP({ quizScore: 10, streak: 2, xp: 50 })).toBe(160); // 10*8 + 2*15 + 50
      expect(calcTotalXP({})).toBe(0);
    });
  });

  describe('cn (Tailwind merge utility)', () => {
    it('merges class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
      expect(cn('class1', false && 'class2', 'class3')).toBe('class1 class3');
      expect(cn(undefined, null, 'valid')).toBe('valid');
    });
  });

  describe('escapeHtml', () => {
    it('escapes special characters', () => {
      expect(escapeHtml('<div>&"\'</div>')).toBe('&lt;div&gt;&amp;&quot;&#039;&lt;/div&gt;');
    });
  });
});
