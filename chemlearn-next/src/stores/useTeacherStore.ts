import { create } from 'zustand';

export interface ClassData {
  id: string;
  name: string;
  inviteCode: string;
  studentIds: string[];
}

interface TeacherState {
  classes: ClassData[];
  selectedClassId: string | null;
  setClasses: (classes: ClassData[]) => void;
  setSelectedClassId: (id: string | null) => void;
}

export const useTeacherStore = create<TeacherState>((set) => ({
  classes: [],
  selectedClassId: null,
  setClasses: (classes) => set({ classes }),
  setSelectedClassId: (selectedClassId) => set({ selectedClassId })
}));
