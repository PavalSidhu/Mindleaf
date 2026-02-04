import { create } from 'zustand';
import type { Book, Quote } from '@/db/schema';

export type SessionPhase = 'idle' | 'pre-mood' | 'reading' | 'paused' | 'post-session';

interface ActiveSession {
  bookId: string;
  book: Book;
  startTime: Date;
  elapsedSeconds: number;
  isPaused: boolean;
  quotes: Quote[];
  thoughts: string[];
  moodBefore?: number;
  startPage: number;
}

interface ReadingState {
  // Active session
  activeSession: ActiveSession | null;
  sessionPhase: SessionPhase;

  // Session actions
  startSession: (book: Book, moodBefore?: number) => void;
  pauseSession: () => void;
  resumeSession: () => void;
  updateElapsed: (seconds: number) => void;
  addQuote: (quote: Quote) => void;
  addThought: (thought: string) => void;
  endSession: () => ActiveSession | null;
  cancelSession: () => void;

  // Session phase management
  setSessionPhase: (phase: SessionPhase) => void;

  // Quick actions panel
  isQuickActionsOpen: boolean;
  setQuickActionsOpen: (open: boolean) => void;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  // Active session
  activeSession: null,
  sessionPhase: 'idle',

  // Session actions
  startSession: (book, moodBefore) => {
    set({
      activeSession: {
        bookId: book.id,
        book,
        startTime: new Date(),
        elapsedSeconds: 0,
        isPaused: false,
        quotes: [],
        thoughts: [],
        moodBefore,
        startPage: book.currentPage
      },
      sessionPhase: 'reading'
    });
  },

  pauseSession: () => {
    const { activeSession } = get();
    if (activeSession) {
      set({
        activeSession: { ...activeSession, isPaused: true },
        sessionPhase: 'paused'
      });
    }
  },

  resumeSession: () => {
    const { activeSession } = get();
    if (activeSession) {
      set({
        activeSession: { ...activeSession, isPaused: false },
        sessionPhase: 'reading'
      });
    }
  },

  updateElapsed: (seconds) => {
    const { activeSession } = get();
    if (activeSession && !activeSession.isPaused) {
      set({
        activeSession: { ...activeSession, elapsedSeconds: seconds }
      });
    }
  },

  addQuote: (quote) => {
    const { activeSession } = get();
    if (activeSession) {
      set({
        activeSession: {
          ...activeSession,
          quotes: [...activeSession.quotes, quote]
        }
      });
    }
  },

  addThought: (thought) => {
    const { activeSession } = get();
    if (activeSession) {
      set({
        activeSession: {
          ...activeSession,
          thoughts: [...activeSession.thoughts, thought]
        }
      });
    }
  },

  endSession: () => {
    const { activeSession } = get();
    set({
      activeSession: null,
      sessionPhase: 'idle',
      isQuickActionsOpen: false
    });
    return activeSession;
  },

  cancelSession: () => {
    set({
      activeSession: null,
      sessionPhase: 'idle',
      isQuickActionsOpen: false
    });
  },

  // Session phase management
  setSessionPhase: (phase) => set({ sessionPhase: phase }),

  // Quick actions panel
  isQuickActionsOpen: false,
  setQuickActionsOpen: (open) => set({ isQuickActionsOpen: open })
}));
