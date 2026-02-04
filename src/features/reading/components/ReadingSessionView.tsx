import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadingStore } from '@/store/readingStore';
import { useReadingTimer } from '../hooks/useReadingTimer';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Button } from '@/shared/components/Button';
import { MoodSelector } from '@/shared/components/MoodSelector';
import { cn } from '@/shared/utils/cn';
import { formatTimerDisplay } from '@/shared/utils/formatters';
import { AddQuoteModal } from './AddQuoteModal';
import { EndSessionModal } from './EndSessionModal';

export function ReadingSessionView() {
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  const activeSession = useReadingStore((state) => state.activeSession);
  const sessionPhase = useReadingStore((state) => state.sessionPhase);
  const setSessionPhase = useReadingStore((state) => state.setSessionPhase);
  const cancelSession = useReadingStore((state) => state.cancelSession);

  const { elapsedSeconds, isPaused, pause, resume } = useReadingTimer();

  const [isQuoteModalOpen, setQuoteModalOpen] = useState(false);
  const [isEndModalOpen, setEndModalOpen] = useState(false);
  const [preMood, setPreMood] = useState<number | null>(null);

  if (!activeSession) {
    return null;
  }

  const handleStartReading = () => {
    if (preMood) {
      useReadingStore.getState().startSession(activeSession.book, preMood);
    }
    setSessionPhase('reading');
  };

  const handleCancel = () => {
    cancelSession();
    navigate(`/reading/${activeSession.bookId}`);
  };

  // Pre-mood capture phase
  if (sessionPhase === 'pre-mood') {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex flex-col items-center justify-center p-6">
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 20 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Before you start reading
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 mb-8">
            How are you feeling right now?
          </p>

          <MoodSelector
            value={preMood}
            onChange={setPreMood}
            size="lg"
            className="mb-8"
          />

          <div className="flex gap-3 justify-center">
            <Button variant="ghost" onClick={handleCancel}>
              Cancel
            </Button>
            <Button onClick={handleStartReading} disabled={!preMood}>
              Start Reading
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Main reading timer view
  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-neutral-800">
        <button
          onClick={() => setEndModalOpen(true)}
          className="p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          aria-label="End session"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="text-center">
          <h1 className="font-medium truncate max-w-[200px]">{activeSession.book.title}</h1>
          <p className="text-sm text-neutral-400">{activeSession.book.author}</p>
        </div>

        <div className="w-10" /> {/* Spacer for alignment */}
      </header>

      {/* Timer display */}
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <motion.div
          className="text-center"
          animate={isPaused ? { opacity: 0.5 } : { opacity: 1 }}
        >
          <p className="text-sm text-neutral-400 mb-2 uppercase tracking-wide">
            {isPaused ? 'Paused' : 'Reading Time'}
          </p>
          <div className="text-7xl md:text-8xl font-light tabular-nums mb-8">
            {formatTimerDisplay(elapsedSeconds)}
          </div>
        </motion.div>

        {/* Play/Pause button */}
        <motion.button
          onClick={isPaused ? resume : pause}
          className={cn(
            'w-20 h-20 rounded-full flex items-center justify-center transition-colors',
            isPaused
              ? 'bg-calm-500 hover:bg-calm-600'
              : 'bg-neutral-700 hover:bg-neutral-600'
          )}
          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          aria-label={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? (
            <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          )}
        </motion.button>

        {/* Session stats */}
        <div className="flex gap-8 mt-8 text-center">
          <div>
            <p className="text-2xl font-semibold">{activeSession.quotes.length}</p>
            <p className="text-sm text-neutral-400">Quotes</p>
          </div>
          <div>
            <p className="text-2xl font-semibold">{activeSession.thoughts.length}</p>
            <p className="text-sm text-neutral-400">Thoughts</p>
          </div>
        </div>
      </main>

      {/* Quick actions */}
      <footer className="p-4 border-t border-neutral-800">
        <div className="flex gap-3 justify-center">
          <Button
            variant="secondary"
            onClick={() => setQuoteModalOpen(true)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            }
          >
            Add Quote
          </Button>
          <Button
            variant="primary"
            onClick={() => setEndModalOpen(true)}
          >
            Finish Session
          </Button>
        </div>
      </footer>

      {/* Modals */}
      <AddQuoteModal
        isOpen={isQuoteModalOpen}
        onClose={() => setQuoteModalOpen(false)}
      />
      <EndSessionModal
        isOpen={isEndModalOpen}
        onClose={() => setEndModalOpen(false)}
        elapsedSeconds={elapsedSeconds}
      />
    </div>
  );
}
