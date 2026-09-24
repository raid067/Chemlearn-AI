import fs from 'fs';
import path from 'path';

describe('Quiz Results Authorization & Tenant Isolation Rules', () => {
  const firestoreRulesPath = path.resolve(__dirname, '../firestore.rules');
  let rulesContent: string;

  beforeAll(() => {
    rulesContent = fs.readFileSync(firestoreRulesPath, 'utf8');
  });

  it('prohibits all client-side writes to quiz_results', () => {
    const quizResultsBlock = rulesContent.match(
      /match \/quiz_results\/\{resultId\}\s*\{[\s\S]*?allow write:\s*if false;[\s\S]*?\}/
    );
    expect(quizResultsBlock).not.toBeNull();
  });

  it('prohibits arbitrary teachers from globally reading quiz_results', () => {
    // Must NOT contain global isTeacher() or token.role == 'teacher' in quiz_results match
    const quizResultsBlock = rulesContent.match(
      /match \/quiz_results\/\{resultId\}\s*\{([\s\S]*?)\}/
    );
    expect(quizResultsBlock).not.toBeNull();
    const innerRules = quizResultsBlock ? quizResultsBlock[1] : '';
    expect(innerRules).not.toContain('isTeacher()');
    expect(innerRules).toContain("'teacherIds' in resource.data && request.auth.uid in resource.data.teacherIds");
  });

  describe('Emulated Quiz Results Read Logic', () => {
    interface AuthContext {
      uid: string;
      token?: { admin?: boolean; role?: string; teacher?: boolean };
    }

    interface QuizResultDoc {
      uid: string;
      studentId?: string;
      teacherIds?: string[];
      score: number;
    }

    function evaluateQuizResultRead(auth: AuthContext | null, doc: QuizResultDoc): boolean {
      if (!auth) return false;
      const isOwner = auth.uid === doc.uid || (doc.studentId !== undefined && auth.uid === doc.studentId);
      const isAssignedTeacher = Array.isArray(doc.teacherIds) && doc.teacherIds.includes(auth.uid);
      const isAdmin = auth.token?.admin === true;

      return isOwner || isAssignedTeacher || isAdmin;
    }

    const mockResult: QuizResultDoc = {
      uid: 'student_alice',
      teacherIds: ['teacher_mr_tan', 'teacher_ms_nurul'],
      score: 85,
    };

    it('ALLOWS the student to read their own quiz results', () => {
      expect(evaluateQuizResultRead({ uid: 'student_alice' }, mockResult)).toBe(true);
    });

    it('DENIES another student from reading Alice quiz result', () => {
      expect(evaluateQuizResultRead({ uid: 'student_bob' }, mockResult)).toBe(false);
    });

    it('ALLOWS an assigned teacher (in teacherIds) to read the quiz result', () => {
      expect(evaluateQuizResultRead({ uid: 'teacher_mr_tan', token: { teacher: true } }, mockResult)).toBe(true);
      expect(evaluateQuizResultRead({ uid: 'teacher_ms_nurul', token: { teacher: true } }, mockResult)).toBe(true);
    });

    it('DENIES an unrelated teacher (NOT in teacherIds) from reading the quiz result', () => {
      expect(evaluateQuizResultRead({ uid: 'teacher_stranger', token: { teacher: true } }, mockResult)).toBe(false);
    });

    it('ALLOWS admin to read any quiz result', () => {
      expect(evaluateQuizResultRead({ uid: 'admin_user', token: { admin: true } }, mockResult)).toBe(true);
    });
  });
});
