import { evaluateQuizAnswers, AuthoritativeMCQQuestion, AuthoritativeStructuredQuestion } from '../src/lib/server/quizzes';

jest.mock('@/lib/firebase-admin', () => ({
  adminDb: {
    collection: jest.fn(),
  },
}));

describe('evaluateQuizAnswers', () => {
  describe('MCQ questions', () => {
    const mockMCQQuestions: AuthoritativeMCQQuestion[] = [
      { q: 'Q1', options: ['A', 'B', 'C', 'D'], answer: 0, explanation: 'A is correct' },
      { q: 'Q2', options: ['A', 'B', 'C', 'D'], answer: 1, explanation: 'B is correct' },
      { q: 'Q3', options: ['A', 'B', 'C', 'D'], answer: 2, explanation: 'C is correct' },
    ];

    it('should correctly evaluate all correct answers', () => {
      const answers = { 0: 0, 1: 1, 2: 2 };
      const result = evaluateQuizAnswers(mockMCQQuestions, 'MCQ', answers);

      expect(result.score).toBe(3);
      expect(result.percentage).toBe(100);
      expect(result.total).toBe(3);
      expect(result.breakdown).toHaveLength(3);
      expect(result.breakdown[0].isCorrect).toBe(true);
      expect(result.breakdown[1].isCorrect).toBe(true);
      expect(result.breakdown[2].isCorrect).toBe(true);
    });

    it('should correctly evaluate mixed answers (some correct, some incorrect)', () => {
      const answers = { 0: 0, 1: 0, 2: 2 }; // Q2 is incorrect
      const result = evaluateQuizAnswers(mockMCQQuestions, 'MCQ', answers);

      expect(result.score).toBe(2);
      expect(result.percentage).toBe(67); // Math.round((2/3)*100)
      expect(result.total).toBe(3);
      expect(result.breakdown[1].isCorrect).toBe(false);
      expect(result.breakdown[1].selectedOption).toBe(0);
      expect(result.breakdown[1].correctIndex).toBe(1);
    });

    it('should handle missing answers correctly', () => {
      const answers = { 0: 0, 2: 2 }; // Q1 missing
      const result = evaluateQuizAnswers(mockMCQQuestions, 'MCQ', answers);

      expect(result.score).toBe(2);
      expect(result.percentage).toBe(67);
      expect(result.total).toBe(3);
      expect(result.breakdown[1].isCorrect).toBe(false);
      // undefined selected Option defaults to NaN or similar through Number(undefined) -> NaN, and NaN !== 1
      expect(result.breakdown[1].selectedOption).toBeNaN();
    });

    it('should handle string indices and values for answers', () => {
      const answers = { '0': '0', '1': '1', '2': '2' };
      const result = evaluateQuizAnswers(mockMCQQuestions, 'MCQ', answers);

      expect(result.score).toBe(3);
      expect(result.percentage).toBe(100);
      expect(result.total).toBe(3);
    });

    it('should return 0 percentage if total is 0 to avoid NaN', () => {
      const result = evaluateQuizAnswers([], 'MCQ', {});

      expect(result.score).toBe(0);
      expect(result.percentage).toBe(0);
      expect(result.total).toBe(0);
      expect(result.breakdown).toHaveLength(0);
    });
  });

  describe('Structured questions', () => {
    const mockStructuredQuestions: AuthoritativeStructuredQuestion[] = [
      { question: 'What is H2O?', expectedAnswer: 'Water', marks: 2 },
      { question: 'What is CO2?', expectedAnswer: 'Carbon dioxide', marks: 3 },
      { question: 'What is NaCl?', expectedAnswer: 'Sodium chloride' }, // missing marks, should default to 2
    ];

    it('should correctly evaluate exact match correct answers', () => {
      const answers = { 0: 'Water', 1: 'Carbon dioxide', 2: 'Sodium chloride' };
      const result = evaluateQuizAnswers(mockStructuredQuestions, 'Structured', answers);

      // Expected total marks: 2 + 3 + 2 = 7
      expect(result.score).toBe(7);
      expect(result.percentage).toBe(100);
      expect(result.total).toBe(3);
      expect(result.breakdown).toHaveLength(3);
      expect(result.breakdown[0].isCorrect).toBe(true);
      expect(result.breakdown[1].isCorrect).toBe(true);
      expect(result.breakdown[2].isCorrect).toBe(true);
    });

    it('should correctly evaluate incorrect answers', () => {
      // For Q2 (Carbon dioxide) we provide "Helium" to ensure no partial keywords match.
      const answers = { 0: 'Water', 1: 'Helium', 2: 'Sodium chloride' }; // Q2 incorrect
      const result = evaluateQuizAnswers(mockStructuredQuestions, 'Structured', answers);

      // Expected total marks: 2 + 0 + 2 = 4 (out of 7)
      expect(result.score).toBe(4);
      expect(result.percentage).toBe(57); // Math.round((4/7)*100) = 57
      expect(result.total).toBe(3);
      expect(result.breakdown[1].isCorrect).toBe(false);
      expect(result.breakdown[1].selectedOption).toBe('Helium');
    });

    it('should handle missing answers correctly, returning 0 marks for missing', () => {
      const answers = { 0: 'Water', 2: 'Sodium chloride' }; // Q2 missing
      const result = evaluateQuizAnswers(mockStructuredQuestions, 'Structured', answers);

      expect(result.score).toBe(4);
      expect(result.percentage).toBe(57);
      expect(result.total).toBe(3);
      expect(result.breakdown[1].isCorrect).toBe(false);
      expect(result.breakdown[1].selectedOption).toBe(''); // Evaluates string cast of undefined to '' when grading empty
    });

    it('should handle default maxMarks of 2 when missing in question', () => {
      const q: AuthoritativeStructuredQuestion[] = [{ question: 'Q', expectedAnswer: 'A' }];
      const result = evaluateQuizAnswers(q, 'Structured', { 0: 'A' });

      expect(result.score).toBe(2);
      expect(result.percentage).toBe(100);
      expect(result.total).toBe(1);
    });

    it('should return 0 percentage if total marks is 0 to avoid NaN', () => {
      const q: AuthoritativeStructuredQuestion[] = [{ question: 'Q', expectedAnswer: 'A', marks: 0 }];
      // When maxMarks=0, the grading logic might still award 0, but total possible is 0
      const result = evaluateQuizAnswers(q, 'Structured', { 0: 'A' });

      expect(result.score).toBe(0);
      expect(result.percentage).toBe(0); // 0/0 edge case handled in evaluateQuizAnswers
      expect(result.total).toBe(1);
    });
  });
});
