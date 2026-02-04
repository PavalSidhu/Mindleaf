import { create } from 'zustand';

export type MoodLogStep = 'mood' | 'emotions' | 'activities' | 'note' | 'complete';

interface MoodLogState {
  // Current mood log in progress
  currentMoodLevel: number | null;
  selectedEmotions: string[];
  selectedActivities: string[];
  moodNote: string;
  currentStep: MoodLogStep;

  // Actions
  setMoodLevel: (level: number) => void;
  toggleEmotion: (emotion: string) => void;
  toggleActivity: (activity: string) => void;
  setMoodNote: (note: string) => void;
  nextStep: () => void;
  previousStep: () => void;
  setStep: (step: MoodLogStep) => void;
  resetMoodLog: () => void;

  // Quick log mode (skips steps)
  isQuickLogMode: boolean;
  setQuickLogMode: (quick: boolean) => void;
}

const STEP_ORDER: MoodLogStep[] = ['mood', 'emotions', 'activities', 'note', 'complete'];

export const useMoodStore = create<MoodLogState>((set, get) => ({
  // Current mood log in progress
  currentMoodLevel: null,
  selectedEmotions: [],
  selectedActivities: [],
  moodNote: '',
  currentStep: 'mood',

  // Actions
  setMoodLevel: (level) => set({ currentMoodLevel: level }),

  toggleEmotion: (emotion) => {
    const { selectedEmotions } = get();
    if (selectedEmotions.includes(emotion)) {
      set({ selectedEmotions: selectedEmotions.filter((e) => e !== emotion) });
    } else {
      set({ selectedEmotions: [...selectedEmotions, emotion] });
    }
  },

  toggleActivity: (activity) => {
    const { selectedActivities } = get();
    if (selectedActivities.includes(activity)) {
      set({ selectedActivities: selectedActivities.filter((a) => a !== activity) });
    } else {
      set({ selectedActivities: [...selectedActivities, activity] });
    }
  },

  setMoodNote: (note) => set({ moodNote: note }),

  nextStep: () => {
    const { currentStep, isQuickLogMode } = get();
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    if (isQuickLogMode && currentStep === 'mood') {
      // In quick mode, skip directly to complete after mood selection
      set({ currentStep: 'complete' });
    } else if (currentIndex < STEP_ORDER.length - 1) {
      set({ currentStep: STEP_ORDER[currentIndex + 1] });
    }
  },

  previousStep: () => {
    const { currentStep, isQuickLogMode } = get();
    const currentIndex = STEP_ORDER.indexOf(currentStep);

    if (isQuickLogMode && currentStep === 'complete') {
      // In quick mode, go back to mood from complete
      set({ currentStep: 'mood' });
    } else if (currentIndex > 0) {
      set({ currentStep: STEP_ORDER[currentIndex - 1] });
    }
  },

  setStep: (step) => set({ currentStep: step }),

  resetMoodLog: () => set({
    currentMoodLevel: null,
    selectedEmotions: [],
    selectedActivities: [],
    moodNote: '',
    currentStep: 'mood',
    isQuickLogMode: false
  }),

  // Quick log mode
  isQuickLogMode: false,
  setQuickLogMode: (quick) => set({ isQuickLogMode: quick })
}));
