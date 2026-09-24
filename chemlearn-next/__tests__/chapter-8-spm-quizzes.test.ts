import { chapter8SPMQuiz } from '@/content/quizzes/chapter8-spm';

describe('Chapter 8 SPM Question Bank (Form 4)', () => {
  it('contains exactly 15 comprehensive SPM questions', () => {
    expect(chapter8SPMQuiz.questions).toHaveLength(15);
  });

  it('covers all 4 KSSM Chapter 8 subtopics', () => {
    const subtopics = new Set(chapter8SPMQuiz.questions.map((q) => q.subtopic));
    expect(subtopics.has('8.1')).toBe(true);
    expect(subtopics.has('8.2')).toBe(true);
    expect(subtopics.has('8.3')).toBe(true);
    expect(subtopics.has('8.4')).toBe(true);
  });

  it('validates MCQ questions structure and correct option index', () => {
    const mcqs = chapter8SPMQuiz.questions.filter((q) => q.type === 'MCQ');
    expect(mcqs.length).toBeGreaterThanOrEqual(5);

    mcqs.forEach((mcq) => {
      expect(mcq.options).toHaveLength(4);
      expect(mcq.correctIndex).toBeGreaterThanOrEqual(0);
      expect(mcq.correctIndex).toBeLessThanOrEqual(3);
      expect(mcq.explanation).toBeTruthy();
    });
  });

  it('validates Structured questions with marks and marking schemes', () => {
    const structured = chapter8SPMQuiz.questions.filter((q) => q.type === 'Structured');
    expect(structured.length).toBeGreaterThanOrEqual(5);

    structured.forEach((sq) => {
      expect(sq.marks).toBeGreaterThanOrEqual(1);
      expect(sq.expectedAnswer).toBeTruthy();
      expect(sq.markingScheme).toBeInstanceOf(Array);
      expect(sq.markingScheme?.length).toBeGreaterThanOrEqual(1);
    });
  });

  it('enforces SPM KSSM key concepts in answer schemes', () => {
    const allAnswers = chapter8SPMQuiz.questions
      .map((q) => (q.type === 'MCQ' ? q.explanation : q.expectedAnswer))
      .join(' ')
      .toLowerCase();

    // Alloy slip plane disruption
    expect(allAnswers).toMatch(/disrupt.*orderly.*arrangement|slide/i);
    // Borosilicate thermal shock
    expect(allAnswers).toMatch(/thermal.*shock|expansion/i);
    // Ceramics Kaolin
    expect(allAnswers).toMatch(/kaolin|ceramic/i);
    // Composites: Concrete, Photochromic, Optical fibres
    expect(allAnswers).toMatch(/matrix|reinforcement|internal reflection/i);
  });
});
