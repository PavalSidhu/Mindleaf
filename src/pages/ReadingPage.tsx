import { useState } from 'react';
import { BookList, AddBookModal } from '@/features/reading/components';
import { Button } from '@/shared/components/Button';

export default function ReadingPage() {
  const [isAddModalOpen, setAddModalOpen] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            My Library
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Track your reading journey
          </p>
        </div>
        <Button
          onClick={() => setAddModalOpen(true)}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          Add Book
        </Button>
      </div>

      {/* Book list */}
      <BookList onAddBook={() => setAddModalOpen(true)} />

      {/* Add book modal */}
      <AddBookModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  );
}
