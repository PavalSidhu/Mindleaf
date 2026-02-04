// Open Library API integration for book search

export interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  number_of_pages_median?: number;
}

export interface OpenLibrarySearchResult {
  numFound: number;
  start: number;
  docs: OpenLibraryBook[];
}

export interface BookSearchResult {
  id: string;
  title: string;
  author: string;
  year?: number;
  coverUrl?: string;
  isbn?: string;
  pageCount?: number;
}

const OPEN_LIBRARY_API = 'https://openlibrary.org';
const COVER_BASE_URL = 'https://covers.openlibrary.org/b/id';

export const openLibraryService = {
  async search(query: string, limit: number = 10): Promise<BookSearchResult[]> {
    if (!query.trim()) return [];

    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `${OPEN_LIBRARY_API}/search.json?q=${encodedQuery}&limit=${limit}&fields=key,title,author_name,first_publish_year,cover_i,isbn,number_of_pages_median`
      );

      if (!response.ok) {
        throw new Error('Failed to search books');
      }

      const data: OpenLibrarySearchResult = await response.json();

      return data.docs.map((book) => ({
        id: book.key,
        title: book.title,
        author: book.author_name?.[0] || 'Unknown Author',
        year: book.first_publish_year,
        coverUrl: book.cover_i
          ? `${COVER_BASE_URL}/${book.cover_i}-M.jpg`
          : undefined,
        isbn: book.isbn?.[0],
        pageCount: book.number_of_pages_median
      }));
    } catch (error) {
      console.error('Open Library search error:', error);
      return [];
    }
  },

  async searchByISBN(isbn: string): Promise<BookSearchResult | null> {
    try {
      const response = await fetch(
        `${OPEN_LIBRARY_API}/isbn/${isbn}.json`
      );

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      // Get author info
      let author = 'Unknown Author';
      if (data.authors?.[0]?.key) {
        try {
          const authorResponse = await fetch(
            `${OPEN_LIBRARY_API}${data.authors[0].key}.json`
          );
          if (authorResponse.ok) {
            const authorData = await authorResponse.json();
            author = authorData.name || author;
          }
        } catch {
          // Keep default author
        }
      }

      return {
        id: data.key,
        title: data.title,
        author,
        coverUrl: data.covers?.[0]
          ? `${COVER_BASE_URL}/${data.covers[0]}-M.jpg`
          : undefined,
        isbn,
        pageCount: data.number_of_pages
      };
    } catch (error) {
      console.error('Open Library ISBN search error:', error);
      return null;
    }
  },

  getCoverUrl(coverId: number, size: 'S' | 'M' | 'L' = 'M'): string {
    return `${COVER_BASE_URL}/${coverId}-${size}.jpg`;
  },

  getCoverUrlByISBN(isbn: string, size: 'S' | 'M' | 'L' = 'M'): string {
    return `https://covers.openlibrary.org/b/isbn/${isbn}-${size}.jpg`;
  }
};
