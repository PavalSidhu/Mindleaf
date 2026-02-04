import { db } from '@/db/database';
import type { Achievement, AchievementType } from '@/db/schema';
import { v4 as uuid } from 'uuid';
import { startOfDay, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

// Achievement definitions
export const ACHIEVEMENT_DEFINITIONS: Record<
  AchievementType,
  { name: string; description: string; icon: string }
> = {
  'first-session': {
    name: 'First Chapter',
    description: 'Complete your first reading session',
    icon: '📖'
  },
  'first-entry': {
    name: 'Dear Diary',
    description: 'Write your first journal entry',
    icon: '✍️'
  },
  'first-book': {
    name: 'Bookworm',
    description: 'Finish your first book',
    icon: '📚'
  },
  'week-mood': {
    name: 'Week of Wellness',
    description: 'Log your mood for 7 days',
    icon: '🌟'
  },
  'wordsmith': {
    name: 'Wordsmith',
    description: 'Write 5 journal entries',
    icon: '🖊️'
  },
  'bookworm': {
    name: 'Avid Reader',
    description: 'Complete 3 books',
    icon: '🏆'
  },
  'consistent-reader': {
    name: 'Consistent Reader',
    description: 'Read on 5 different days',
    icon: '📅'
  },
  'reflective': {
    name: 'Reflective Soul',
    description: 'Journal for 7 days',
    icon: '💭'
  },
  'quote-collector': {
    name: 'Quote Collector',
    description: 'Save 10 quotes',
    icon: '💬'
  }
};

export const achievementService = {
  async grant(type: AchievementType): Promise<Achievement | null> {
    // Check if already earned
    const existing = await db.achievements.where('type').equals(type).first();
    if (existing) return null;

    const definition = ACHIEVEMENT_DEFINITIONS[type];
    const achievement: Achievement = {
      id: uuid(),
      type,
      name: definition.name,
      description: definition.description,
      earnedAt: new Date(),
      icon: definition.icon
    };

    await db.achievements.add(achievement);
    return achievement;
  },

  async checkAndGrant(type: AchievementType): Promise<Achievement | null> {
    return this.grant(type);
  },

  async getAll(): Promise<Achievement[]> {
    return db.achievements.orderBy('earnedAt').reverse().toArray();
  },

  async hasAchievement(type: AchievementType): Promise<boolean> {
    const count = await db.achievements.where('type').equals(type).count();
    return count > 0;
  },

  async getLatest(limit: number = 5): Promise<Achievement[]> {
    return db.achievements.orderBy('earnedAt').reverse().limit(limit).toArray();
  },

  // Check all achievements and grant any newly earned
  async checkAllAchievements(): Promise<Achievement[]> {
    const earned: Achievement[] = [];

    // First session
    const sessionCount = await db.readingSessions.count();
    if (sessionCount >= 1) {
      const achievement = await this.checkAndGrant('first-session');
      if (achievement) earned.push(achievement);
    }

    // First journal entry
    const entryCount = await db.journalEntries.where('isDraft').equals(0 as unknown as boolean).count();
    if (entryCount >= 1) {
      const achievement = await this.checkAndGrant('first-entry');
      if (achievement) earned.push(achievement);
    }

    // 5 journal entries
    if (entryCount >= 5) {
      const achievement = await this.checkAndGrant('wordsmith');
      if (achievement) earned.push(achievement);
    }

    // First completed book
    const completedBooks = await db.books.where('status').equals('completed').count();
    if (completedBooks >= 1) {
      const achievement = await this.checkAndGrant('first-book');
      if (achievement) earned.push(achievement);
    }

    // 3 completed books
    if (completedBooks >= 3) {
      const achievement = await this.checkAndGrant('bookworm');
      if (achievement) earned.push(achievement);
    }

    // Week of mood logging
    const moodDays = await this.getMoodLoggingDays(30);
    if (moodDays >= 7) {
      const achievement = await this.checkAndGrant('week-mood');
      if (achievement) earned.push(achievement);
    }

    // Consistent reader (5 different reading days)
    const readingDays = await this.getReadingDays(30);
    if (readingDays >= 5) {
      const achievement = await this.checkAndGrant('consistent-reader');
      if (achievement) earned.push(achievement);
    }

    // Reflective (7 journal days)
    const journalDays = await this.getJournalDays(30);
    if (journalDays >= 7) {
      const achievement = await this.checkAndGrant('reflective');
      if (achievement) earned.push(achievement);
    }

    // Quote collector (10 quotes)
    const sessions = await db.readingSessions.toArray();
    const quoteCount = sessions.reduce((sum, s) => sum + s.quotes.length, 0);
    if (quoteCount >= 10) {
      const achievement = await this.checkAndGrant('quote-collector');
      if (achievement) earned.push(achievement);
    }

    return earned;
  },

  // Helper methods for achievement checking
  async getMoodLoggingDays(days: number): Promise<number> {
    const cutoff = subDays(new Date(), days);
    const moods = await db.moodEntries.where('timestamp').above(cutoff).toArray();

    const daySet = new Set<string>();
    moods.forEach((m) => daySet.add(startOfDay(m.timestamp).toISOString()));
    return daySet.size;
  },

  async getReadingDays(days: number): Promise<number> {
    const cutoff = subDays(new Date(), days);
    const sessions = await db.readingSessions.where('startTime').above(cutoff).toArray();

    const daySet = new Set<string>();
    sessions.forEach((s) => daySet.add(startOfDay(s.startTime).toISOString()));
    return daySet.size;
  },

  async getJournalDays(days: number): Promise<number> {
    const cutoff = subDays(new Date(), days);
    const entries = await db.journalEntries
      .where('dateCreated')
      .above(cutoff)
      .filter((e) => !e.isDraft)
      .toArray();

    const daySet = new Set<string>();
    entries.forEach((e) => daySet.add(startOfDay(e.dateCreated).toISOString()));
    return daySet.size;
  }
};
