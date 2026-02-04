import { useState, useMemo } from 'react';
import { useBooks } from '@/db/hooks';
import { BookCard } from './BookCard';
import { EmptyState, EmptyStateIcons, EMPTY_STATE_MESSAGES } from '@/shared/components/EmptyState';
import { Input } from '@/shared/components/Input';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';
import type { BookStatus } from '@/db/schema';

interface BookListProps {
  onAddBook: () => void;
}

type ViewMode = 'grid' | 'list';
type FilterStatus = BookStatus | 'all';

const statusOptions: { value: FilterStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'paused', label: 'Paused' }
];

export function BookList({ onAddBook }: BookListProps) {
  const books = useBooks();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const filteredBooks = useMemo(() => {
    if (!books) return [];

    return books.filter((book) => {
      // Status filter
      if (statusFilter !== 'all' && book.status !== statusFilter) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [books, searchQuery, statusFilter]);

  if (!books) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-calm-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon={EmptyStateIcons.book}
        title={EMPTY_STATE_MESSAGES.books.title}
        description={EMPTY_STATE_MESSAGES.books.description}
        action={{ label: 'Add Your First Book', onClick: onAddBook }}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search books..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        <div className="flex gap-2">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as FilterStatus)}
            className={cn(
              'h-10 px-3 rounded-lg border transition-colors',
              'bg-white dark:bg-neutral-800',
              'border-neutral-200 dark:border-neutral-700',
              'text-neutral-900 dark:text-neutral-100',
              'focus:outline-none focus:ring-2 focus:ring-calm-500'
            )}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* View mode toggle */}
          <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'grid'
                  ? 'bg-calm-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
              aria-label="Grid view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 transition-colors',
                viewMode === 'list'
                  ? 'bg-calm-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
              aria-label="List view"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-neutral-500">
        {filteredBooks.length} {filteredBooks.length === 1 ? 'book' : 'books'}
        {statusFilter !== 'all' && ` in "${statusOptions.find(o => o.value === statusFilter)?.label}"`}
      </p>

      {/* Book grid/list */}
      {filteredBooks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No books found matching your filters</p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('all');
            }}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} variant="compact" />
          ))}
        </div>
      )}
    </div>
  );
}
