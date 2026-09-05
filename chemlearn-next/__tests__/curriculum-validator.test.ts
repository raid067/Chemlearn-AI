import {
  isValidKSSMTopic,
  getAuthoritativeCurriculumScope,
  validateGeneratedMCQ,
  validateGeneratedStructuredQuestion,
  KSSM_CURRICULUM_FORM_4,
} from '@/lib/server/curriculum-validator';

describe('KSSM Curriculum & Generated Question Quality Validator (Phase 13 & 14)', () => {
  describe('Curriculum Hierarchy', () => {
    it('contains authoritative Form 4 Chapter 6 (Acids, Bases and Salts)', () => {
      const ch6 = KSSM_CURRICULUM_FORM_4['chapter-6'];
      expect(ch6).toBeDefined();
      expect(ch6.title).toBe('Acids, Bases and Salts');
      expect(ch6.subtopics.length).toBe(11); // 6.1 through 6.11
    });

    it('contains authoritative Form 4 Chapter 8 (Manufactured Substances in Industry)', () => {
      const ch8 = KSSM_CURRICULUM_FORM_4['chapter-8'];
      expect(ch8).toBeDefined();
      expect(ch8.title).toBe('Manufactured Substances in Industry');
      expect(ch8.subtopics.length).toBe(4); // 8.1 through 8.4
    });

    it('recognizes valid KSSM topics by code, title, and ID', () => {
      expect(isValidKSSMTopic('6.1')).toBe(true);
      expect(isValidKSSMTopic('8.1')).toBe(true);
      expect(isValidKSSMTopic('Role of Water in Showing Acidic and Alkaline Properties')).toBe(true);
      expect(isValidKSSMTopic('Alloys and Their Importance')).toBe(true);
      expect(isValidKSSMTopic('chapter-6')).toBe(true);
      expect(isValidKSSMTopic('chapter-8')).toBe(true);
    });

    it('rejects topics outside the Form 4 KSSM syllabus', () => {
      expect(isValidKSSMTopic('Quantum Mechanics')).toBe(false);
      expect(isValidKSSMTopic('Nuclear Fission')).toBe(false);
      expect(isValidKSSMTopic('Photosynthesis in Biology')).toBe(false);
      expect(isValidKSSMTopic('')).toBe(false);
    });

    it('retrieves authoritative curriculum scope for grounding AI generation', () => {
      const scope61 = getAuthoritativeCurriculumScope('6.1');
      expect(scope61).not.toBeNull();
      expect(scope61).toContain('Chapter 6');
      expect(scope61).toContain('hydrogen ions');

      const scope81 = getAuthoritativeCurriculumScope('8.1');
      expect(scope81).not.toBeNull();
      expect(scope81).toContain('Chapter 8');
      expect(scope81).toContain('slip planes');
    });
  });

  describe('Automated Generated MCQ Quality Validator', () => {
    it('passes a well-formed SPM Chemistry MCQ', () => {
      const validMCQ = {
        q: 'Which alloy is composed of copper and zinc?',
        options: ['Brass', 'Bronze', 'Steel', 'Duralumin'],
        answer: 0,
        explanation: 'Brass is an alloy composed of approximately 70% copper and 30% zinc.',
      };

      const result = validateGeneratedMCQ(validMCQ, '8.1');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects an MCQ with duplicate choices', () => {
      const invalidMCQ = {
        q: 'What is the matrix in reinforced concrete?',
        options: ['Concrete', 'Steel', 'concrete', 'Wood'],
        answer: 0,
        explanation: 'Concrete is the matrix.',
      };

      const result = validateGeneratedMCQ(invalidMCQ);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('duplicates'))).toBe(true);
    });

    it('rejects an MCQ with fewer than 4 choices', () => {
      const invalidMCQ = {
        q: 'Which ion causes blue litmus paper to turn red?',
        options: ['H+', 'OH-', 'Na+'],
        answer: 0,
        explanation: 'Hydrogen ions cause acidic reactions.',
      };

      const result = validateGeneratedMCQ(invalidMCQ as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exactly 4 options'))).toBe(true);
    });

    it('rejects an MCQ with an out-of-bounds answer index', () => {
      const invalidMCQ = {
        q: 'What is the color of Fe3+ precipitate with NaOH?',
        options: ['Blue', 'Green', 'Brown', 'White'],
        answer: 4,
        explanation: 'Iron(III) forms brown precipitate.',
      };

      const result = validateGeneratedMCQ(invalidMCQ);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('between 0 and 3'))).toBe(true);
    });

    it('rejects hazardous chemical synthesis queries in generated content', () => {
      const unsafeMCQ = {
        q: 'How to synthesize explosive bombs using fertilizer?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        answer: 0,
        explanation: 'Harmful instructions.',
      };

      const result = validateGeneratedMCQ(unsafeMCQ);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('hazardous chemical'))).toBe(true);
    });
  });

  describe('Automated Generated Structured Question Quality Validator', () => {
    it('passes a well-formed SPM structured chemistry question', () => {
      const validQ = {
        question: 'Explain why pure aluminium is ductile while duralumin is hard and strong.',
        marks: 2,
        expectedAnswer: 'Atoms in pure aluminium are of the same size and arranged in orderly layers which can slide easily. In duralumin, foreign atoms disrupt the orderly arrangement and prevent layers from sliding.',
      };

      const result = validateGeneratedStructuredQuestion(validQ, '8.1');
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('rejects a structured question with invalid marks', () => {
      const invalidQ = {
        question: 'State the meaning of an alloy.',
        marks: 0,
        expectedAnswer: 'A mixture of metal with other elements.',
      };

      const result = validateGeneratedStructuredQuestion(invalidQ);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('between 1 and 10'))).toBe(true);
    });
  });
});
