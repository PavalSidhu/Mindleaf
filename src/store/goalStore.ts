import { create } from 'zustand';
import type { GoalType, GoalFrequency } from '@/db/schema';

interface GoalFormState {
  type: GoalType | null;
  frequency: GoalFrequency;
  target: number;
  unit: string;
}

interface GoalState {
  // Goal creation form
  goalForm: GoalFormState;
  setGoalType: (type: GoalType) => void;
  setGoalFrequency: (frequency: GoalFrequency) => void;
  setGoalTarget: (target: number) => void;
  resetGoalForm: () => void;

  // Goal modal state
  isCreateModalOpen: boolean;
  setCreateModalOpen: (open: boolean) => void;

  // Editing
  editingGoalId: string | null;
  setEditingGoalId: (id: string | null) => void;
}

const DEFAULT_UNITS: Record<GoalType, string> = {
  'reading-time': 'minutes',
  'reading-pages': 'pages',
  'journal-entries': 'entries',
  'mood-logs': 'logs'
};

const DEFAULT_TARGETS: Record<GoalType, number> = {
  'reading-time': 30,
  'reading-pages': 20,
  'journal-entries': 1,
  'mood-logs': 1
};

export const useGoalStore = create<GoalState>((set, get) => ({
  // Goal creation form
  goalForm: {
    type: null,
    frequency: 'daily',
    target: 30,
    unit: 'minutes'
  },

  setGoalType: (type) => {
    set({
      goalForm: {
        ...get().goalForm,
        type,
        target: DEFAULT_TARGETS[type],
        unit: DEFAULT_UNITS[type]
      }
    });
  },

  setGoalFrequency: (frequency) => {
    set({
      goalForm: {
        ...get().goalForm,
        frequency
      }
    });
  },

  setGoalTarget: (target) => {
    set({
      goalForm: {
        ...get().goalForm,
        target
      }
    });
  },

  resetGoalForm: () => set({
    goalForm: {
      type: null,
      frequency: 'daily',
      target: 30,
      unit: 'minutes'
    },
    editingGoalId: null
  }),

  // Goal modal state
  isCreateModalOpen: false,
  setCreateModalOpen: (open) => {
    set({ isCreateModalOpen: open });
    if (!open) {
      get().resetGoalForm();
    }
  },

  // Editing
  editingGoalId: null,
  setEditingGoalId: (id) => set({ editingGoalId: id })
}));
