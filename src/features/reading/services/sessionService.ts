import { db } from '@/db/database';
import type { ReadingSession, Quote } from '@/db/schema';
import { v4 as uuid } from 'uuid';
import { bookService } from './bookService';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface CreateSessionInput {
  bookId: string;
  startTime: Date;
  endTime?: Date;
  duration: number;
  pagesRead: number;
  quotes?: Quote[];
  thoughts?: string[];
  moodBefore?: number;
  moodAfter?: number;
}

export interface ManualSessionInput {
  bookId: string;
  date: Date;
  duration: number;
  pagesRead: number;
  moodBefore?: number;
  moodAfter?: number;
}

export const sessionService = {
  async create(input: CreateSessionInput): Promise<ReadingSession> {
    const session: ReadingSession = {
      id: uuid(),
      bookId: input.bookId,
      startTime: input.startTime,
      endTime: input.endTime || new Date(),
      duration: input.duration,
      pagesRead: input.pagesRead,
      quotes: input.quotes || [],
      thoughts: input.thoughts || [],
      moodBefore: input.moodBefore,
      moodAfter: input.moodAfter
    };

    await db.readingSessions.add(session);

    // Update book progress
    const book = await db.books.get(input.bookId);
    if (book) {
      const newPage = book.currentPage + input.pagesRead;
      await bookService.updateProgress(input.bookId, newPage);
    }

    return session;
  },

  async createManual(input: ManualSessionInput): Promise<ReadingSession> {
    const session: ReadingSession = {
      id: uuid(),
      bookId: input.bookId,
      startTime: input.date,
      endTime: new Date(input.date.getTime() + input.duration * 1000),
      duration: input.duration,
      pagesRead: input.pagesRead,
      quotes: [],
      thoughts: [],
      moodBefore: input.moodBefore,
      moodAfter: input.moodAfter
    };

    await db.readingSessions.add(session);

    // Update book progress
    const book = await db.books.get(input.bookId);
    if (book) {
      const newPage = book.currentPage + input.pagesRead;
      await bookService.updateProgress(input.bookId, newPage);
    }

    return session;
  },

  async update(id: string, updates: Partial<ReadingSession>): Promise<void> {
    await db.readingSessions.update(id, updates);
  },

  async addQuote(sessionId: string, quote: Omit<Quote, 'id' | 'createdAt'>): Promise<Quote> {
    const session = await db.readingSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    const newQuote: Quote = {
      id: uuid(),
      text: quote.text,
      pageNumber: quote.pageNumber,
      createdAt: new Date()
    };

    await db.readingSessions.update(sessionId, {
      quotes: [...session.quotes, newQuote]
    });

    return newQuote;
  },

  async addThought(sessionId: string, thought: string): Promise<void> {
    const session = await db.readingSessions.get(sessionId);
    if (!session) throw new Error('Session not found');

    await db.readingSessions.update(sessionId, {
      thoughts: [...session.thoughts, thought]
    });
  },

  async delete(id: string): Promise<void> {
    await db.readingSessions.delete(id);
  },

  async getById(id: string): Promise<ReadingSession | undefined> {
    return db.readingSessions.get(id);
  },

  async getByBook(bookId: string): Promise<ReadingSession[]> {
    return db.readingSessions
      .where('bookId')
      .equals(bookId)
      .reverse()
      .sortBy('startTime');
  },

  async getRecent(limit: number = 10): Promise<ReadingSession[]> {
    return db.readingSessions
      .orderBy('startTime')
      .reverse()
      .limit(limit)
      .toArray();
  },

  async getByDateRange(start: Date, end: Date): Promise<ReadingSession[]> {
    return db.readingSessions
      .where('startTime')
      .between(start, end)
      .toArray();
  },

  async getTodaySessions(): Promise<ReadingSession[]> {
    const today = new Date();
    return this.getByDateRange(startOfDay(today), endOfDay(today));
  },

  async getWeekSessions(): Promise<ReadingSession[]> {
    const today = new Date();
    const weekAgo = subDays(today, 7);
    return this.getByDateRange(startOfDay(weekAgo), endOfDay(today));
  },

  async getTotalReadingTime(days?: number): Promise<number> {
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
  },

  async getReadingDays(days: number = 30): Promise<Date[]> {
    const cutoff = subDays(new Date(), days);
    const sessions = await db.readingSessions
      .where('startTime')
      .above(cutoff)
      .toArray();

    // Get unique days
    const daySet = new Set<string>();
    sessions.forEach((session) => {
      daySet.add(startOfDay(session.startTime).toISOString());
    });

    return Array.from(daySet).map((iso) => new Date(iso));
  },

  async getAllQuotes(bookId?: string): Promise<Array<Quote & { bookId: string; sessionId: string }>> {
    let sessions: ReadingSession[];

    if (bookId) {
      sessions = await db.readingSessions.where('bookId').equals(bookId).toArray();
    } else {
      sessions = await db.readingSessions.toArray();
    }

    const quotes: Array<Quote & { bookId: string; sessionId: string }> = [];
    sessions.forEach((session) => {
      session.quotes.forEach((quote) => {
        quotes.push({
          ...quote,
          bookId: session.bookId,
          sessionId: session.id
        });
      });
    });

    return quotes.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
};
