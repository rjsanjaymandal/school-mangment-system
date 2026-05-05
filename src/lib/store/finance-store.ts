import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FinanceState {
  activeSession: string;
  setActiveSession: (session: string) => void;
  feeHeads: { id: string; name: string }[];
  setFeeHeads: (heads: { id: string; name: string }[]) => void;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set) => ({
      activeSession: '2026-27',
      setActiveSession: (session) => set({ activeSession: session }),
      
      feeHeads: [
        { id: '1', name: 'Tuition Fee' },
        { id: '2', name: 'Admission Fee' },
        { id: '3', name: 'Transport Fee' },
        { id: '4', name: 'Exam Fee' },
        { id: '5', name: 'Library Fee' },
        { id: '6', name: 'Lab Fee' },
        { id: '7', name: 'Sports Fee' },
        { id: '8', name: 'Annual Fee' },
        { id: '9', name: 'Uniform Fee' },
        { id: '10', name: 'Books Fee' },
      ],
      setFeeHeads: (heads) => set({ feeHeads: heads }),
    }),
    {
      name: 'finance-storage',
    }
  )
);