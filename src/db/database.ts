import Dexie, { type EntityTable } from 'dexie';
import type {
  Book,
  ReadingSession,
  JournalEntry,
  MoodEntry,
  Goal,
  Achievement,
  Tag
} from './schema';

// Dexie database instance
class MindleafDatabase extends Dexie {
  books!: EntityTable<Book, 'id'>;
  readingSessions!: EntityTable<ReadingSession, 'id'>;
  journalEntries!: EntityTable<JournalEntry, 'id'>;
  moodEntries!: EntityTable<MoodEntry, 'id'>;
  goals!: EntityTable<Goal, 'id'>;
  achievements!: EntityTable<Achievement, 'id'>;
  tags!: EntityTable<Tag, 'id'>;

  constructor() {
    super('MindleafDB');

    this.version(1).stores({
      books: 'id, title, author, status, dateAdded, *tags',
      readingSessions: 'id, bookId, startTime, endTime',
      journalEntries: 'id, dateCreated, dateModified, bookId, isDraft, *tags',
      moodEntries: 'id, timestamp, moodLevel, *specificEmotions, *activityTags',
      goals: 'id, type, frequency, isActive',
      achievements: 'id, type, earnedAt',
      tags: 'id, name, category, isCustom'
    });
  }
}

export const db = new MindleafDatabase();

// Initialize default tags if they don't exist
export async function initializeDefaultTags(): Promise<void> {
  const existingTags = await db.tags.count();

  if (existingTags === 0) {
    const defaultEmotionTags: Tag[] = [
      // Happy emotions
      { id: 'emotion-joyful', name: 'joyful', category: 'emotion', color: '#22c55e', isCustom: false },
      { id: 'emotion-content', name: 'content', category: 'emotion', color: '#22c55e', isCustom: false },
      { id: 'emotion-grateful', name: 'grateful', category: 'emotion', color: '#22c55e', isCustom: false },
      { id: 'emotion-excited', name: 'excited', category: 'emotion', color: '#22c55e', isCustom: false },
      { id: 'emotion-hopeful', name: 'hopeful', category: 'emotion', color: '#22c55e', isCustom: false },
      { id: 'emotion-proud', name: 'proud', category: 'emotion', color: '#22c55e', isCustom: false },
      // Calm emotions
      { id: 'emotion-peaceful', name: 'peaceful', category: 'emotion', color: '#3b82f6', isCustom: false },
      { id: 'emotion-relaxed', name: 'relaxed', category: 'emotion', color: '#3b82f6', isCustom: false },
      { id: 'emotion-focused', name: 'focused', category: 'emotion', color: '#3b82f6', isCustom: false },
      { id: 'emotion-balanced', name: 'balanced', category: 'emotion', color: '#3b82f6', isCustom: false },
      { id: 'emotion-mindful', name: 'mindful', category: 'emotion', color: '#3b82f6', isCustom: false },
      { id: 'emotion-serene', name: 'serene', category: 'emotion', color: '#3b82f6', isCustom: false },
      // Sad emotions
      { id: 'emotion-melancholic', name: 'melancholic', category: 'emotion', color: '#6366f1', isCustom: false },
      { id: 'emotion-lonely', name: 'lonely', category: 'emotion', color: '#6366f1', isCustom: false },
      { id: 'emotion-disappointed', name: 'disappointed', category: 'emotion', color: '#6366f1', isCustom: false },
      { id: 'emotion-grieving', name: 'grieving', category: 'emotion', color: '#6366f1', isCustom: false },
      { id: 'emotion-nostalgic', name: 'nostalgic', category: 'emotion', color: '#6366f1', isCustom: false },
      { id: 'emotion-empty', name: 'empty', category: 'emotion', color: '#6366f1', isCustom: false },
      // Anxious emotions
      { id: 'emotion-worried', name: 'worried', category: 'emotion', color: '#f97316', isCustom: false },
      { id: 'emotion-nervous', name: 'nervous', category: 'emotion', color: '#f97316', isCustom: false },
      { id: 'emotion-overwhelmed', name: 'overwhelmed', category: 'emotion', color: '#f97316', isCustom: false },
      { id: 'emotion-restless', name: 'restless', category: 'emotion', color: '#f97316', isCustom: false },
      { id: 'emotion-uncertain', name: 'uncertain', category: 'emotion', color: '#f97316', isCustom: false },
      { id: 'emotion-tense', name: 'tense', category: 'emotion', color: '#f97316', isCustom: false },
      // Angry emotions
      { id: 'emotion-frustrated', name: 'frustrated', category: 'emotion', color: '#ef4444', isCustom: false },
      { id: 'emotion-irritated', name: 'irritated', category: 'emotion', color: '#ef4444', isCustom: false },
      { id: 'emotion-resentful', name: 'resentful', category: 'emotion', color: '#ef4444', isCustom: false },
      { id: 'emotion-impatient', name: 'impatient', category: 'emotion', color: '#ef4444', isCustom: false },
      { id: 'emotion-annoyed', name: 'annoyed', category: 'emotion', color: '#ef4444', isCustom: false },
      { id: 'emotion-bitter', name: 'bitter', category: 'emotion', color: '#ef4444', isCustom: false },
    ];

    const defaultActivityTags: Tag[] = [
      { id: 'activity-reading', name: 'reading', category: 'activity', color: '#3b82f6', isCustom: false },
      { id: 'activity-exercise', name: 'exercise', category: 'activity', color: '#22c55e', isCustom: false },
      { id: 'activity-meditation', name: 'meditation', category: 'activity', color: '#8b5cf6', isCustom: false },
      { id: 'activity-work', name: 'work', category: 'activity', color: '#6366f1', isCustom: false },
      { id: 'activity-socializing', name: 'socializing', category: 'activity', color: '#ec4899', isCustom: false },
      { id: 'activity-nature', name: 'nature', category: 'activity', color: '#10b981', isCustom: false },
      { id: 'activity-creative', name: 'creative', category: 'activity', color: '#f59e0b', isCustom: false },
      { id: 'activity-rest', name: 'rest', category: 'activity', color: '#06b6d4', isCustom: false },
      { id: 'activity-learning', name: 'learning', category: 'activity', color: '#3b82f6', isCustom: false },
      { id: 'activity-cooking', name: 'cooking', category: 'activity', color: '#f97316', isCustom: false },
      { id: 'activity-music', name: 'music', category: 'activity', color: '#a855f7', isCustom: false },
      { id: 'activity-journaling', name: 'journaling', category: 'activity', color: '#14b8a6', isCustom: false },
    ];

    await db.tags.bulkAdd([...defaultEmotionTags, ...defaultActivityTags]);
  }
}

// Helper to clear all data (for settings)
export async function clearAllData(): Promise<void> {
  await db.transaction('rw', db.books, db.readingSessions, db.journalEntries, db.moodEntries, db.goals, db.achievements, db.tags, async () => {
    await db.books.clear();
    await db.readingSessions.clear();
    await db.journalEntries.clear();
    await db.moodEntries.clear();
    await db.goals.clear();
    await db.achievements.clear();
    await db.tags.clear();
  });
  // Re-initialize default tags
  await initializeDefaultTags();
}
