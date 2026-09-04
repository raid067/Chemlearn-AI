import { create } from 'zustand';

type LabType = 'thermal' | 'dilution' | 'gas-test' | 'qualitative' | 'alloys' | 'glass' | 'ceramics' | 'composites' | null;

interface LabState {
  activeLab: LabType;
  selectedCompound: string | null;
  step: number;
  setActiveLab: (lab: LabType) => void;
  setCompound: (compound: string) => void;
  nextStep: () => void;
  resetLab: () => void;
}

export const useLabStore = create<LabState>((set) => ({
  activeLab: null,
  selectedCompound: null,
  step: 0,
  setActiveLab: (lab) => set({ activeLab: lab, step: 0, selectedCompound: null }),
  setCompound: (compound) => set({ selectedCompound: compound }),
  nextStep: () => set((s) => ({ step: s.step + 1 })),
  resetLab: () => set({ activeLab: null, selectedCompound: null, step: 0 }),
}));
