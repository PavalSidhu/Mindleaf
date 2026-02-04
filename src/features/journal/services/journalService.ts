import { db } from '@/db/database';
import type { JournalEntry } from '@/db/schema';
import { v4 as uuid } from 'uuid';
import { startOfDay, endOfDay, subDays } from 'date-fns';

export interface CreateEntryInput {
  content: string;
  plainText: string;
  tags?: string[];
  bookId?: string;
  moodBefore?: number;
  moodAfter?: number;
  isDraft?: boolean;
}

export interface UpdateEntryInput {
  content?: string;
  plainText?: string;
  tags?: string[];
  bookId?: string | null;
  moodBefore?: number | null;
  moodAfter?: number | null;
  isDraft?: boolean;
}

export const journalService = {
  async create(input: CreateEntryInput): Promise<JournalEntry> {
    const now = new Date();
    const entry: JournalEntry = {
      id: uuid(),
      content: input.content,
      plainText: input.plainText,
      dateCreated: now,
      dateModified: now,
      moodBefore: input.moodBefore,
      moodAfter: input.moodAfter,
      tags: input.tags || [],
      bookId: input.bookId,
      isDraft: input.isDraft ?? false
    };

    await db.journalEntries.add(entry);
    return entry;
  },

  async update(id: string, input: UpdateEntryInput): Promise<void> {
    const updates: Partial<JournalEntry> = {
      dateModified: new Date()
    };

    if (input.content !== undefined) updates.content = input.content;
    if (input.plainText !== undefined) updates.plainText = input.plainText;
    if (input.tags !== undefined) updates.tags = input.tags;
    if (input.bookId !== undefined) updates.bookId = input.bookId ?? undefined;
    if (input.moodBefore !== undefined) updates.moodBefore = input.moodBefore ?? undefined;
    if (input.moodAfter !== undefined) updates.moodAfter = input.moodAfter ?? undefined;
    if (input.isDraft !== undefined) updates.isDraft = input.isDraft;

    await db.journalEntries.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    await db.journalEntries.delete(id);
  },

  async getById(id: string): Promise<JournalEntry | undefined> {
    return db.journalEntries.get(id);
  },

  async getAll(options?: { includeDrafts?: boolean }): Promise<JournalEntry[]> {
    const entries = await db.journalEntries
      .orderBy('dateCreated')
      .reverse()
      .toArray();

    if (!options?.includeDrafts) {
      return entries.filter((e) => !e.isDraft);
    }
    return entries;
  },

  async getDrafts(): Promise<JournalEntry[]> {
    return db.journalEntries
      .where('isDraft')
      .equals(1 as unknown as boolean)
      .toArray();
  },

  async getByDateRange(start: Date, end: Date): Promise<JournalEntry[]> {
    return db.journalEntries
      .where('dateCreated')
      .between(start, end)
      .filter((e) => !e.isDraft)
      .toArray();
  },

  async getByBook(bookId: string): Promise<JournalEntry[]> {
    return db.journalEntries
      .where('bookId')
      .equals(bookId)
      .filter((e) => !e.isDraft)
      .reverse()
      .sortBy('dateCreated');
  },

  async getByTag(tag: string): Promise<JournalEntry[]> {
    const entries = await db.journalEntries.toArray();
    return entries
      .filter((e) => !e.isDraft && e.tags.includes(tag))
      .sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
  },

  async search(query: string): Promise<JournalEntry[]> {
    const lowerQuery = query.toLowerCase();
    const entries = await db.journalEntries.toArray();
    return entries
      .filter(
        (e) =>
          !e.isDraft &&
          (e.plainText.toLowerCase().includes(lowerQuery) ||
            e.tags.some((t) => t.toLowerCase().includes(lowerQuery)))
      )
      .sort((a, b) => b.dateCreated.getTime() - a.dateCreated.getTime());
  },

  async getRecent(limit: number = 10): Promise<JournalEntry[]> {
    return db.journalEntries
      .orderBy('dateCreated')
      .reverse()
      .filter((e) => !e.isDraft)
      .limit(limit)
      .toArray();
  },

  async getTodayEntries(): Promise<JournalEntry[]> {
    const today = new Date();
    return this.getByDateRange(startOfDay(today), endOfDay(today));
  },

  async getEntriesCount(days?: number): Promise<number> {
    if (days) {
      const cutoff = subDays(new Date(), days);
      return db.journalEntries
        .where('dateCreated')
        .above(cutoff)
        .filter((e) => !e.isDraft)
        .count();
    }
    return db.journalEntries.where('isDraft').equals(0 as unknown as boolean).count();
  },

  async getJournalingDays(days: number = 30): Promise<Date[]> {
    const cutoff = subDays(new Date(), days);
    const entries = await db.journalEntries
      .where('dateCreated')
      .above(cutoff)
      .filter((e) => !e.isDraft)
      .toArray();

    // Get unique days
    const daySet = new Set<string>();
    entries.forEach((entry) => {
      daySet.add(startOfDay(entry.dateCreated).toISOString());
    });

    return Array.from(daySet).map((iso) => new Date(iso));
  },

  // Publish a draft (marks it as not a draft)
  async publish(id: string): Promise<void> {
    await db.journalEntries.update(id, {
      isDraft: false,
      dateModified: new Date()
    });
  }
};
