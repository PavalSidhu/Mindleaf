import { useLiveQuery } from 'dexie-react-hooks';
import { db } from './database';
import type {
  Book,
  ReadingSession,
  JournalEntry,
  MoodEntry,
  Goal,
  Achievement,
  Tag,
  BookStatus,
  TagCategory
} from './schema';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, subDays } from 'date-fns';

// Book hooks
export function useBooks(status?: BookStatus) {
  return useLiveQuery(
    () => status
      ? db.books.where('status').equals(status).toArray()
      : db.books.toArray(),
    [status]
  );
}

export function useBook(id: string | undefined) {
  return useLiveQuery(
    () => id ? db.books.get(id) : undefined,
    [id]
  );
}

export function useBooksByStatus() {
  return useLiveQuery(async () => {
    const books = await db.books.toArray();
    return {
      reading: books.filter(b => b.status === 'reading'),
      completed: books.filter(b => b.status === 'completed'),
      wantToRead: books.filter(b => b.status === 'want-to-read'),
      paused: books.filter(b => b.status === 'paused')
    };
  });
}

// Reading session hooks
export function useReadingSessions(bookId?: string) {
  return useLiveQuery(
    () => bookId
      ? db.readingSessions.where('bookId').equals(bookId).toArray()
      : db.readingSessions.toArray(),
    [bookId]
  );
}

export function useRecentSessions(days: number = 7) {
  return useLiveQuery(async () => {
    const cutoff = subDays(new Date(), days);
    return db.readingSessions
      .where('startTime')
      .above(cutoff)
      .reverse()
      .toArray();
  }, [days]);
}

export function useTodaySessions() {
  return useLiveQuery(async () => {
    const today = new Date();
    return db.readingSessions
      .where('startTime')
      .between(startOfDay(today), endOfDay(today))
      .toArray();
  });
}

// Journal entry hooks
export function useJournalEntries(options?: { includeDrafts?: boolean; limit?: number }) {
  return useLiveQuery(async () => {
    let query = db.journalEntries.orderBy('dateCreated').reverse();

    if (!options?.includeDrafts) {
      query = db.journalEntries
        .where('isDraft')
        .equals(0 as unknown as boolean) // Dexie stores booleans as 0/1
        .reverse();
    }

    const entries = await query.toArray();
    return options?.limit ? entries.slice(0, options.limit) : entries;
  }, [options?.includeDrafts, options?.limit]);
}

export function useJournalEntry(id: string | undefined) {
  return useLiveQuery(
    () => id ? db.journalEntries.get(id) : undefined,
    [id]
  );
}

export function useJournalDrafts() {
  return useLiveQuery(
    () => db.journalEntries.where('isDraft').equals(1 as unknown as boolean).toArray()
  );
}

// Mood entry hooks
export function useMoodEntries(dateRange?: { start: Date; end: Date }) {
  return useLiveQuery(async () => {
    if (dateRange) {
      return db.moodEntries
        .where('timestamp')
        .between(dateRange.start, dateRange.end)
        .toArray();
    }
    return db.moodEntries.orderBy('timestamp').reverse().toArray();
  }, [dateRange?.start?.getTime(), dateRange?.end?.getTime()]);
}

export function useTodayMoods() {
  return useLiveQuery(async () => {
    const today = new Date();
    return db.moodEntries
      .where('timestamp')
      .between(startOfDay(today), endOfDay(today))
      .toArray();
  });
}

export function useWeekMoods() {
  return useLiveQuery(async () => {
    const today = new Date();
    return db.moodEntries
      .where('timestamp')
      .between(startOfWeek(today), endOfWeek(today))
      .toArray();
  });
}

export function useMonthMoods() {
  return useLiveQuery(async () => {
    const today = new Date();
    return db.moodEntries
      .where('timestamp')
      .between(startOfMonth(today), endOfMonth(today))
      .toArray();
  });
}

export function useLatestMood() {
  return useLiveQuery(async () => {
    const moods = await db.moodEntries.orderBy('timestamp').reverse().limit(1).toArray();
    return moods[0];
  });
}

// Goal hooks
export function useGoals(activeOnly: boolean = true) {
  return useLiveQuery(
    () => activeOnly
      ? db.goals.where('isActive').equals(1 as unknown as boolean).toArray()
      : db.goals.toArray(),
    [activeOnly]
  );
}

export function useGoal(id: string | undefined) {
  return useLiveQuery(
    () => id ? db.goals.get(id) : undefined,
    [id]
  );
}

// Achievement hooks
export function useAchievements() {
  return useLiveQuery(
    () => db.achievements.orderBy('earnedAt').reverse().toArray()
  );
}

export function useLatestAchievements(limit: number = 5) {
  return useLiveQuery(async () => {
    return db.achievements
      .orderBy('earnedAt')
      .reverse()
      .limit(limit)
      .toArray();
  }, [limit]);
}

// Tag hooks
export function useTags(category?: TagCategory) {
  return useLiveQuery(
    () => category
      ? db.tags.where('category').equals(category).toArray()
      : db.tags.toArray(),
    [category]
  );
}

export function useEmotionTags() {
  return useTags('emotion');
}

export function useActivityTags() {
  return useTags('activity');
}

export function useTopicTags() {
  return useTags('topic');
}

// Stats and aggregations
export function useTotalReadingTime(days?: number) {
  return useLiveQuery(async () => {
    let sessions: ReadingSession[];

    if (days) {
      const cutoff = subDays(new Date(), days);
      sessions = await db.readingSessions
        .where('startTime')
        .above(cutoff)
        .toArray();
    } else {
      sessions = await db.readingSessions.toArray();
    }

    return sessions.reduce((total, session) => total + session.duration, 0);
  }, [days]);
}

export function useBookCount() {
  return useLiveQuery(async () => {
    const books = await db.books.toArray();
    return {
      total: books.length,
      reading: books.filter(b => b.status === 'reading').length,
      completed: books.filter(b => b.status === 'completed').length,
      wantToRead: books.filter(b => b.status === 'want-to-read').length,
      paused: books.filter(b => b.status === 'paused').length
    };
  });
}

export function useJournalCount() {
  return useLiveQuery(async () => {
    const entries = await db.journalEntries.where('isDraft').equals(0 as unknown as boolean).count();
    return entries;
  });
}

export function useMoodAverages(days: number = 30) {
  return useLiveQuery(async () => {
    const cutoff = subDays(new Date(), days);
    const moods = await db.moodEntries
      .where('timestamp')
      .above(cutoff)
      .toArray();

    if (moods.length === 0) return null;

    const sum = moods.reduce((acc, m) => acc + m.moodLevel, 0);
    return {
      average: sum / moods.length,
      count: moods.length,
      highest: Math.max(...moods.map(m => m.moodLevel)),
      lowest: Math.min(...moods.map(m => m.moodLevel))
    };
  }, [days]);
}
