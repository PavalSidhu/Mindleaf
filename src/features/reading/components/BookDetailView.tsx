import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBook, useReadingSessions } from '@/db/hooks';
import { useReadingStore } from '@/store/readingStore';
import { useUIStore } from '@/store/uiStore';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { ProgressBar } from '@/shared/components/ProgressRing';
import { EmptyState, EmptyStateIcons, EMPTY_STATE_MESSAGES } from '@/shared/components/EmptyState';
import { MoodBadge } from '@/shared/components/MoodSelector';
import { cn } from '@/shared/utils/cn';
import { formatProgress, formatDuration, formatCount } from '@/shared/utils/formatters';
import { formatSmartDate } from '@/shared/utils/dateHelpers';
import { bookService } from '../services/bookService';
import type { BookStatus } from '@/db/schema';

type TabType = 'sessions' | 'quotes' | 'info';

const statusOptions: { value: BookStatus; label: string }[] = [
  { value: 'reading', label: 'Reading' },
  { value: 'completed', label: 'Completed' },
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'paused', label: 'Paused' }
];

export function BookDetailView() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();

  const book = useBook(bookId);
  const sessions = useReadingSessions(bookId);
  const startSession = useReadingStore((state) => state.startSession);
  const setSessionPhase = useReadingStore((state) => state.setSessionPhase);
  const addToast = useUIStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<TabType>('sessions');

  if (!book) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-calm-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const progress = book.totalPages ? formatProgress(book.currentPage, book.totalPages) : 0;
  const totalTime = sessions?.reduce((acc, s) => acc + s.duration, 0) ?? 0;
  const allQuotes = sessions?.flatMap((s) => s.quotes) ?? [];

  const handleStartSession = () => {
    startSession(book);
    setSessionPhase('pre-mood');
    navigate(`/reading/${book.id}/session`);
  };

  const handleStatusChange = async (newStatus: BookStatus) => {
    try {
      await bookService.update(book.id, { status: newStatus });
      addToast({ type: 'success', message: 'Status updated' });
    } catch {
      addToast({ type: 'error', message: 'Failed to update status' });
    }
  };

  const handleUpdateProgress = async () => {
    const newPage = prompt('Enter your current page:', String(book.currentPage));
    if (newPage !== null) {
      const page = parseInt(newPage, 10);
      if (!isNaN(page) && page >= 0) {
        try {
          await bookService.updateProgress(book.id, page);
          addToast({ type: 'success', message: 'Progress updated' });
        } catch {
          addToast({ type: 'error', message: 'Failed to update progress' });
        }
      }
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete "${book.title}"? This will also delete all reading sessions.`)) {
      try {
        await bookService.delete(book.id);
        addToast({ type: 'success', message: 'Book deleted' });
        navigate('/reading');
      } catch {
        addToast({ type: 'error', message: 'Failed to delete book' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/reading')}
        className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Library
      </button>

      {/* Book header */}
      <div className="flex flex-col sm:flex-row gap-6">
        {/* Cover */}
        <div className="flex-shrink-0">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={`Cover of ${book.title}`}
              className="w-32 h-48 object-cover rounded-lg shadow-lg mx-auto sm:mx-0"
            />
          ) : (
            <div className="w-32 h-48 bg-neutral-200 dark:bg-neutral-700 rounded-lg flex items-center justify-center mx-auto sm:mx-0">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-1">
            {book.title}
          </h1>
          <p className="text-lg text-neutral-500 dark:text-neutral-400 mb-4">
            {book.author}
          </p>

          {/* Status selector */}
          <select
            value={book.status}
            onChange={(e) => handleStatusChange(e.target.value as BookStatus)}
            className={cn(
              'mb-4 px-3 py-1.5 rounded-lg border text-sm',
              'bg-white dark:bg-neutral-800',
              'border-neutral-200 dark:border-neutral-700',
              'focus:outline-none focus:ring-2 focus:ring-calm-500'
            )}
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          {/* Progress */}
          {book.totalPages && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-neutral-500">Progress</span>
                <button
                  onClick={handleUpdateProgress}
                  className="text-sm text-calm-500 hover:text-calm-600"
                >
                  Update
                </button>
              </div>
              <ProgressBar progress={progress} showLabel />
              <p className="text-sm text-neutral-500 mt-1">
                {book.currentPage} of {book.totalPages} pages
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
            <Button onClick={handleStartSession}>
              Start Reading
            </Button>
            <Button variant="ghost" onClick={handleDelete} className="text-tense-500">
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {sessions?.length ?? 0}
          </p>
          <p className="text-sm text-neutral-500">Sessions</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {formatDuration(totalTime)}
          </p>
          <p className="text-sm text-neutral-500">Total Time</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {allQuotes.length}
          </p>
          <p className="text-sm text-neutral-500">Quotes</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 dark:border-neutral-700">
        <nav className="flex gap-6">
          {(['sessions', 'quotes', 'info'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                'pb-3 text-sm font-medium border-b-2 -mb-px transition-colors capitalize',
                activeTab === tab
                  ? 'border-calm-500 text-calm-600 dark:text-calm-400'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      {activeTab === 'sessions' && (
        <div className="space-y-3">
          {sessions && sessions.length > 0 ? (
            sessions.map((session) => (
              <Card key={session.id} padding="md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {formatDuration(session.duration)}
                    </p>
                    <p className="text-sm text-neutral-500">
                      {formatSmartDate(session.startTime)} • {session.pagesRead} pages
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {session.moodBefore && <MoodBadge mood={session.moodBefore} />}
                    {session.moodAfter && <MoodBadge mood={session.moodAfter} />}
                  </div>
                </div>
                {session.quotes.length > 0 && (
                  <p className="text-sm text-neutral-500 mt-2">
                    {formatCount(session.quotes.length, 'quote')} saved
                  </p>
                )}
              </Card>
            ))
          ) : (
            <EmptyState
              icon={EmptyStateIcons.book}
              title={EMPTY_STATE_MESSAGES.sessions.title}
              description={EMPTY_STATE_MESSAGES.sessions.description}
              action={{ label: 'Start Reading', onClick: handleStartSession }}
            />
          )}
        </div>
      )}

      {activeTab === 'quotes' && (
        <div className="space-y-3">
          {allQuotes.length > 0 ? (
            allQuotes.map((quote) => (
              <Card key={quote.id} padding="md">
                <blockquote className="text-neutral-700 dark:text-neutral-300 italic">
                  "{quote.text}"
                </blockquote>
                {quote.pageNumber && (
                  <p className="text-sm text-neutral-500 mt-2">Page {quote.pageNumber}</p>
                )}
              </Card>
            ))
          ) : (
            <EmptyState
              icon={EmptyStateIcons.quote}
              title={EMPTY_STATE_MESSAGES.quotes.title}
              description={EMPTY_STATE_MESSAGES.quotes.description}
            />
          )}
        </div>
      )}

      {activeTab === 'info' && (
        <Card padding="md">
          <dl className="space-y-3">
            {book.isbn && (
              <div>
                <dt className="text-sm text-neutral-500">ISBN</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">{book.isbn}</dd>
              </div>
            )}
            {book.totalPages && (
              <div>
                <dt className="text-sm text-neutral-500">Total Pages</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">{book.totalPages}</dd>
              </div>
            )}
            <div>
              <dt className="text-sm text-neutral-500">Added</dt>
              <dd className="text-neutral-900 dark:text-neutral-100">
                {formatSmartDate(book.dateAdded)}
              </dd>
            </div>
            {book.dateCompleted && (
              <div>
                <dt className="text-sm text-neutral-500">Completed</dt>
                <dd className="text-neutral-900 dark:text-neutral-100">
                  {formatSmartDate(book.dateCompleted)}
                </dd>
              </div>
            )}
            {book.tags.length > 0 && (
              <div>
                <dt className="text-sm text-neutral-500 mb-1">Tags</dt>
                <dd className="flex flex-wrap gap-1">
                  {book.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </dd>
              </div>
            )}
          </dl>
        </Card>
      )}
    </div>
  );
}
