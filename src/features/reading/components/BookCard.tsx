import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Card } from '@/shared/components/Card';
import { ProgressBar } from '@/shared/components/ProgressRing';
import { Badge } from '@/shared/components/Badge';
import { cn } from '@/shared/utils/cn';
import type { Book } from '@/db/schema';
import { formatProgress } from '@/shared/utils/formatters';

interface BookCardProps {
  book: Book;
  variant?: 'default' | 'compact';
}

const statusColors: Record<Book['status'], string> = {
  reading: 'bg-calm-100 text-calm-700 dark:bg-calm-900 dark:text-calm-300',
  completed: 'bg-positive-100 text-positive-700 dark:bg-positive-900 dark:text-positive-300',
  'want-to-read': 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300',
  paused: 'bg-energy-100 text-energy-700 dark:bg-energy-900 dark:text-energy-300'
};

const statusLabels: Record<Book['status'], string> = {
  reading: 'Reading',
  completed: 'Completed',
  'want-to-read': 'Want to Read',
  paused: 'Paused'
};

export function BookCard({ book, variant = 'default' }: BookCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const progress = book.totalPages
    ? formatProgress(book.currentPage, book.totalPages)
    : 0;

  if (variant === 'compact') {
    return (
      <Link to={`/reading/${book.id}`}>
        <Card hoverable clickable padding="sm" className="flex items-center gap-3">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              className="w-12 h-16 object-cover rounded"
            />
          ) : (
            <div className="w-12 h-16 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
              <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
              {book.title}
            </h3>
            <p className="text-sm text-neutral-500 truncate">{book.author}</p>
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <Link to={`/reading/${book.id}`}>
      <motion.div
        whileHover={prefersReducedMotion ? {} : { y: -4 }}
        transition={{ duration: 0.2 }}
      >
        <Card hoverable clickable padding="none" className="overflow-hidden">
          {/* Cover */}
          <div className="relative aspect-[2/3] bg-neutral-100 dark:bg-neutral-800">
            {book.coverUrl ? (
              <img
                src={book.coverUrl}
                alt={`Cover of ${book.title}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <svg className="w-12 h-12 text-neutral-300 dark:text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}

            {/* Status badge */}
            <div className="absolute top-2 right-2">
              <span className={cn('text-xs font-medium px-2 py-1 rounded-full', statusColors[book.status])}>
                {statusLabels[book.status]}
              </span>
            </div>
          </div>

          {/* Info */}
          <div className="p-3">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-2 mb-1">
              {book.title}
            </h3>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate mb-3">
              {book.author}
            </p>

            {/* Progress */}
            {book.totalPages && book.status !== 'want-to-read' && (
              <div className="space-y-1">
                <ProgressBar
                  progress={progress}
                  size="sm"
                  color={book.status === 'completed' ? 'positive' : 'calm'}
                />
                <p className="text-xs text-neutral-500">
                  {book.currentPage} / {book.totalPages} pages
                </p>
              </div>
            )}

            {/* Tags */}
            {book.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {book.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} size="sm" variant="neutral">
                    {tag}
                  </Badge>
                ))}
                {book.tags.length > 2 && (
                  <Badge size="sm" variant="neutral">
                    +{book.tags.length - 2}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}
