import { create } from 'zustand';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface DraftState {
  id: string;
  content: string;
  plainText: string;
  lastModified: Date;
}

interface JournalState {
  // Active draft
  activeDraft: DraftState | null;
  saveStatus: SaveStatus;

  // Draft actions
  setActiveDraft: (draft: DraftState | null) => void;
  updateDraftContent: (content: string, plainText: string) => void;
  setSaveStatus: (status: SaveStatus) => void;
  clearDraft: () => void;

  // Editor state
  isDistractfreeMode: boolean;
  setDistractionFreeMode: (enabled: boolean) => void;

  // Prompt selector
  isPromptSelectorOpen: boolean;
  setPromptSelectorOpen: (open: boolean) => void;
  selectedPrompt: string | null;
  setSelectedPrompt: (prompt: string | null) => void;

  // Link to book
  linkedBookId: string | null;
  setLinkedBookId: (bookId: string | null) => void;

  // Mood capture
  entryMoodBefore: number | null;
  entryMoodAfter: number | null;
  setEntryMoodBefore: (mood: number | null) => void;
  setEntryMoodAfter: (mood: number | null) => void;

  // Tags
  entryTags: string[];
  addEntryTag: (tag: string) => void;
  removeEntryTag: (tag: string) => void;
  setEntryTags: (tags: string[]) => void;
}

export const useJournalStore = create<JournalState>((set, get) => ({
  // Active draft
  activeDraft: null,
  saveStatus: 'idle',

  // Draft actions
  setActiveDraft: (draft) => set({ activeDraft: draft }),

  updateDraftContent: (content, plainText) => {
    const { activeDraft } = get();
    if (activeDraft) {
      set({
        activeDraft: {
          ...activeDraft,
          content,
          plainText,
          lastModified: new Date()
        },
        saveStatus: 'saving'
      });
    }
  },

  setSaveStatus: (status) => set({ saveStatus: status }),

  clearDraft: () => set({
    activeDraft: null,
    saveStatus: 'idle',
    linkedBookId: null,
    entryMoodBefore: null,
    entryMoodAfter: null,
    entryTags: [],
    selectedPrompt: null
  }),

  // Editor state
  isDistractfreeMode: false,
  setDistractionFreeMode: (enabled) => set({ isDistractfreeMode: enabled }),

  // Prompt selector
  isPromptSelectorOpen: false,
  setPromptSelectorOpen: (open) => set({ isPromptSelectorOpen: open }),
  selectedPrompt: null,
  setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),

  // Link to book
  linkedBookId: null,
  setLinkedBookId: (bookId) => set({ linkedBookId: bookId }),

  // Mood capture
  entryMoodBefore: null,
  entryMoodAfter: null,
  setEntryMoodBefore: (mood) => set({ entryMoodBefore: mood }),
  setEntryMoodAfter: (mood) => set({ entryMoodAfter: mood }),

  // Tags
  entryTags: [],
  addEntryTag: (tag) => {
    const { entryTags } = get();
    if (!entryTags.includes(tag)) {
      set({ entryTags: [...entryTags, tag] });
    }
  },
  removeEntryTag: (tag) => {
    const { entryTags } = get();
    set({ entryTags: entryTags.filter((t) => t !== tag) });
  },
  setEntryTags: (tags) => set({ entryTags: tags })
}));
