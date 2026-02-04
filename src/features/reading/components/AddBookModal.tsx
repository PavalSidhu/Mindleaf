import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { Card } from '@/shared/components/Card';
import { cn } from '@/shared/utils/cn';
import { useBookSearch } from '../hooks/useBookSearch';
import { bookService } from '../services/bookService';
import { useUIStore } from '@/store/uiStore';
import type { BookSearchResult } from '../services/openLibraryService';
import type { BookStatus } from '@/db/schema';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = 'search' | 'manual';

export function AddBookModal({ isOpen, onClose }: AddBookModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [selectedBook, setSelectedBook] = useState<BookSearchResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const addToast = useUIStore((state) => state.addToast);

  // Search state
  const { results, isLoading, error, search, clearResults } = useBookSearch();
  const [searchQuery, setSearchQuery] = useState('');

  // Manual form state
  const [manualForm, setManualForm] = useState({
    title: '',
    author: '',
    totalPages: '',
    isbn: ''
  });

  // Shared state
  const [status, setStatus] = useState<BookStatus>('want-to-read');

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    search(value);
    setSelectedBook(null);
  };

  const handleSelectBook = (book: BookSearchResult) => {
    setSelectedBook(book);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      if (activeTab === 'search' && selectedBook) {
        await bookService.create({
          title: selectedBook.title,
          author: selectedBook.author,
          coverUrl: selectedBook.coverUrl,
          totalPages: selectedBook.pageCount,
          isbn: selectedBook.isbn,
          status
        });
      } else if (activeTab === 'manual') {
        if (!manualForm.title.trim() || !manualForm.author.trim()) {
          addToast({ type: 'error', message: 'Please fill in title and author' });
          setIsSubmitting(false);
          return;
        }

        await bookService.create({
          title: manualForm.title.trim(),
          author: manualForm.author.trim(),
          totalPages: manualForm.totalPages ? parseInt(manualForm.totalPages, 10) : undefined,
          isbn: manualForm.isbn || undefined,
          status
        });
      }

      addToast({ type: 'success', message: 'Book added to your library' });
      handleClose();
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to add book' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveTab('search');
    setSelectedBook(null);
    setSearchQuery('');
    clearResults();
    setManualForm({ title: '', author: '', totalPages: '', isbn: '' });
    setStatus('want-to-read');
    onClose();
  };

  const canSubmit =
    (activeTab === 'search' && selectedBook !== null) ||
    (activeTab === 'manual' && manualForm.title.trim() && manualForm.author.trim());

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add Book" size="lg">
      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700 mb-4">
        <button
          onClick={() => setActiveTab('search')}
          className={cn(
            'px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors',
            activeTab === 'search'
              ? 'border-calm-500 text-calm-600 dark:text-calm-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          )}
        >
          Search Online
        </button>
        <button
          onClick={() => setActiveTab('manual')}
          className={cn(
            'px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors',
            activeTab === 'manual'
              ? 'border-calm-500 text-calm-600 dark:text-calm-400'
              : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
          )}
        >
          Add Manually
        </button>
      </div>

      {/* Search Tab */}
      {activeTab === 'search' && (
        <div className="space-y-4">
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />

          {/* Search results */}
          <div className="max-h-64 overflow-y-auto space-y-2">
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-calm-500 border-t-transparent rounded-full animate-spin" />
              </div>
            )}

            {error && (
              <p className="text-center text-tense-500 py-4">{error}</p>
            )}

            {!isLoading && results.length === 0 && searchQuery && (
              <p className="text-center text-neutral-500 py-4">
                No books found. Try a different search or add manually.
              </p>
            )}

            {results.map((book) => (
              <Card
                key={book.id}
                padding="sm"
                clickable
                className={cn(
                  'cursor-pointer',
                  selectedBook?.id === book.id && 'ring-2 ring-calm-500'
                )}
                onClick={() => handleSelectBook(book)}
              >
                <div className="flex gap-3">
                  {book.coverUrl ? (
                    <img
                      src={book.coverUrl}
                      alt={book.title}
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
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 line-clamp-1">
                      {book.title}
                    </h4>
                    <p className="text-sm text-neutral-500">{book.author}</p>
                    {book.year && (
                      <p className="text-xs text-neutral-400">{book.year}</p>
                    )}
                  </div>
                  {selectedBook?.id === book.id && (
                    <div className="text-calm-500">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Manual Tab */}
      {activeTab === 'manual' && (
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Book title"
            value={manualForm.title}
            onChange={(e) => setManualForm({ ...manualForm, title: e.target.value })}
          />
          <Input
            label="Author"
            placeholder="Author name"
            value={manualForm.author}
            onChange={(e) => setManualForm({ ...manualForm, author: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Total Pages"
              type="number"
              placeholder="Optional"
              value={manualForm.totalPages}
              onChange={(e) => setManualForm({ ...manualForm, totalPages: e.target.value })}
            />
            <Input
              label="ISBN"
              placeholder="Optional"
              value={manualForm.isbn}
              onChange={(e) => setManualForm({ ...manualForm, isbn: e.target.value })}
            />
          </div>
        </div>
      )}

      {/* Status selector */}
      <div className="mt-6">
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
          Add to
        </label>
        <div className="flex flex-wrap gap-2">
          {(['want-to-read', 'reading', 'completed'] as BookStatus[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                status === s
                  ? 'bg-calm-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              )}
            >
              {s === 'want-to-read' ? 'Want to Read' : s === 'reading' ? 'Currently Reading' : 'Completed'}
            </button>
          ))}
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={!canSubmit} isLoading={isSubmitting}>
          Add Book
        </Button>
      </ModalFooter>
    </Modal>
  );
}
