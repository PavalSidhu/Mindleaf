import { db } from '@/db/database';
import type { Book, BookStatus } from '@/db/schema';
import { v4 as uuid } from 'uuid';

export interface CreateBookInput {
  title: string;
  author: string;
  isbn?: string;
  coverUrl?: string;
  totalPages?: number;
  status?: BookStatus;
  tags?: string[];
}

export interface UpdateBookInput {
  title?: string;
  author?: string;
  isbn?: string;
  coverUrl?: string;
  totalPages?: number;
  currentPage?: number;
  status?: BookStatus;
  tags?: string[];
}

export const bookService = {
  async create(input: CreateBookInput): Promise<Book> {
    const book: Book = {
      id: uuid(),
      title: input.title,
      author: input.author,
      isbn: input.isbn,
      coverUrl: input.coverUrl,
      totalPages: input.totalPages,
      currentPage: 0,
      status: input.status || 'want-to-read',
      dateAdded: new Date(),
      tags: input.tags || []
    };

    await db.books.add(book);
    return book;
  },

  async update(id: string, input: UpdateBookInput): Promise<void> {
    const updates: Partial<Book> = {};

    if (input.title !== undefined) updates.title = input.title;
    if (input.author !== undefined) updates.author = input.author;
    if (input.isbn !== undefined) updates.isbn = input.isbn;
    if (input.coverUrl !== undefined) updates.coverUrl = input.coverUrl;
    if (input.totalPages !== undefined) updates.totalPages = input.totalPages;
    if (input.currentPage !== undefined) updates.currentPage = input.currentPage;
    if (input.status !== undefined) updates.status = input.status;
    if (input.tags !== undefined) updates.tags = input.tags;

    // If marking as completed, set the completion date
    if (input.status === 'completed') {
      updates.dateCompleted = new Date();
    }

    await db.books.update(id, updates);
  },

  async updateProgress(id: string, currentPage: number): Promise<void> {
    const book = await db.books.get(id);
    if (!book) return;

    const updates: Partial<Book> = { currentPage };

    // Auto-complete if reached total pages
    if (book.totalPages && currentPage >= book.totalPages) {
      updates.status = 'completed';
      updates.dateCompleted = new Date();
      updates.currentPage = book.totalPages;
    }

    await db.books.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    // Delete associated reading sessions first
    await db.readingSessions.where('bookId').equals(id).delete();
    await db.books.delete(id);
  },

  async getById(id: string): Promise<Book | undefined> {
    return db.books.get(id);
  },

  async getAll(): Promise<Book[]> {
    return db.books.toArray();
  },

  async getByStatus(status: BookStatus): Promise<Book[]> {
    return db.books.where('status').equals(status).toArray();
  },

  async search(query: string): Promise<Book[]> {
    const lowerQuery = query.toLowerCase();
    const books = await db.books.toArray();
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(lowerQuery) ||
        book.author.toLowerCase().includes(lowerQuery)
    );
  },

  async getReadingStats(bookId: string) {
    const sessions = await db.readingSessions.where('bookId').equals(bookId).toArray();

    const totalTime = sessions.reduce((acc, s) => acc + s.duration, 0);
    const totalPages = sessions.reduce((acc, s) => acc + s.pagesRead, 0);
    const totalQuotes = sessions.reduce((acc, s) => acc + s.quotes.length, 0);

    return {
      sessionCount: sessions.length,
      totalTime,
      totalPages,
      totalQuotes,
      averageSessionTime: sessions.length > 0 ? totalTime / sessions.length : 0
    };
  }
};
