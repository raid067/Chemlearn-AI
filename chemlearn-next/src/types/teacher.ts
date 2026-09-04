export interface TeacherStudent {
  name: string;
  email: string;
  score: number;
  xp: number;
  streak: number;
  level: string;
}

export interface ClassData {
  id: string;
  label: string;
  students: number;
  avgScore: number;
  topPerformer: string;
}
