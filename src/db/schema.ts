// Core data model types for Mindleaf

export type BookStatus = 'reading' | 'completed' | 'want-to-read' | 'paused';

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  totalPages?: number;
  currentPage: number;
  status: BookStatus;
  dateAdded: Date;
  dateCompleted?: Date;
  tags: string[];
}

export interface ReadingSession {
  id: string;
  bookId: string;
  startTime: Date;
  endTime?: Date;
  duration: number; // in seconds
  pagesRead: number;
  quotes: Quote[];
  thoughts: string[];
  moodBefore?: number; // 1-5
  moodAfter?: number; // 1-5
}

export interface Quote {
  id: string;
  text: string;
  pageNumber?: number;
  createdAt: Date;
}

export interface JournalEntry {
  id: string;
  content: string; // HTML from TipTap
  plainText: string; // Stripped text for search
  dateCreated: Date;
  dateModified: Date;
  moodBefore?: number;
  moodAfter?: number;
  tags: string[];
  bookId?: string; // Optional link to a book
  isDraft: boolean;
}

export interface MoodEntry {
  id: string;
  timestamp: Date;
  moodLevel: 1 | 2 | 3 | 4 | 5;
  specificEmotions: string[];
  activityTags: string[];
  note?: string;
}

export type GoalFrequency = 'daily' | 'weekly' | 'monthly';
export type GoalType = 'reading-time' | 'reading-pages' | 'journal-entries' | 'mood-logs';

export interface Goal {
  id: string;
  type: GoalType;
  frequency: GoalFrequency;
  target: number;
  unit: string;
  createdAt: Date;
  pausedUntil?: Date;
  isActive: boolean;
}

export type AchievementType =
  | 'first-session'
  | 'first-entry'
  | 'first-book'
  | 'week-mood'
  | 'wordsmith'
  | 'bookworm'
  | 'consistent-reader'
  | 'reflective'
  | 'quote-collector';

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  earnedAt: Date;
  icon: string;
}

export type TagCategory = 'emotion' | 'topic' | 'activity';

export interface Tag {
  id: string;
  name: string;
  category: TagCategory;
  color?: string;
  isCustom: boolean;
}

// Emotion categories for mood logging
export const EMOTION_CATEGORIES = {
  happy: ['joyful', 'content', 'grateful', 'excited', 'hopeful', 'proud'],
  calm: ['peaceful', 'relaxed', 'focused', 'balanced', 'mindful', 'serene'],
  sad: ['melancholic', 'lonely', 'disappointed', 'grieving', 'nostalgic', 'empty'],
  anxious: ['worried', 'nervous', 'overwhelmed', 'restless', 'uncertain', 'tense'],
  angry: ['frustrated', 'irritated', 'resentful', 'impatient', 'annoyed', 'bitter']
} as const;

export type EmotionCategory = keyof typeof EMOTION_CATEGORIES;
export type Emotion = typeof EMOTION_CATEGORIES[EmotionCategory][number];

// Default activity tags
export const DEFAULT_ACTIVITIES = [
  'reading',
  'exercise',
  'meditation',
  'work',
  'socializing',
  'nature',
  'creative',
  'rest',
  'learning',
  'cooking',
  'music',
  'journaling'
] as const;

export type DefaultActivity = typeof DEFAULT_ACTIVITIES[number];

// Mood level labels for compassionate UX
export const MOOD_LABELS: Record<number, string> = {
  1: 'Struggling',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great'
};

export const MOOD_EMOJIS: Record<number, string> = {
  1: '😔',
  2: '😕',
  3: '😐',
  4: '🙂',
  5: '😊'
};
