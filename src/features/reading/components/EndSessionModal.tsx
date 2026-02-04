import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { MoodSelector } from '@/shared/components/MoodSelector';
import { Confetti } from '@/shared/components/Confetti';
import { useReadingStore } from '@/store/readingStore';
import { useUIStore } from '@/store/uiStore';
import { sessionService } from '../services/sessionService';
import { formatDuration } from '@/shared/utils/formatters';

interface EndSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  elapsedSeconds: number;
}

export function EndSessionModal({ isOpen, onClose, elapsedSeconds }: EndSessionModalProps) {
  const navigate = useNavigate();
  const activeSession = useReadingStore((state) => state.activeSession);
  const endSession = useReadingStore((state) => state.endSession);
  const cancelSession = useReadingStore((state) => state.cancelSession);
  const addToast = useUIStore((state) => state.addToast);

  const [pagesRead, setPagesRead] = useState('');
  const [postMood, setPostMood] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSave = async () => {
    if (!activeSession) return;

    setIsSubmitting(true);

    try {
      const pages = pagesRead ? parseInt(pagesRead, 10) : 0;

      await sessionService.create({
        bookId: activeSession.bookId,
        startTime: activeSession.startTime,
        endTime: new Date(),
        duration: elapsedSeconds,
        pagesRead: pages,
        quotes: activeSession.quotes,
        thoughts: activeSession.thoughts,
        moodBefore: activeSession.moodBefore,
        moodAfter: postMood ?? undefined
      });

      setShowConfetti(true);

      // Clear session state
      endSession();

      addToast({
        type: 'success',
        message: `Great session! You read for ${formatDuration(elapsedSeconds)}`
      });

      // Navigate after a short delay to show confetti
      setTimeout(() => {
        navigate(`/reading/${activeSession.bookId}`);
      }, 1500);
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to save session' });
      setIsSubmitting(false);
    }
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard this session?')) {
      cancelSession();
      navigate(activeSession ? `/reading/${activeSession.bookId}` : '/reading');
    }
  };

  if (!activeSession) return null;

  return (
    <>
      <Confetti isActive={showConfetti} />

      <Modal isOpen={isOpen} onClose={onClose} title="End Session" closeOnOverlayClick={false}>
        <div className="space-y-6">
          {/* Session summary */}
          <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4 text-center">
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Reading Time</p>
            <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
              {formatDuration(elapsedSeconds)}
            </p>
          </div>

          {/* Pages read */}
          <Input
            label="Pages Read"
            type="number"
            placeholder="How many pages did you read?"
            value={pagesRead}
            onChange={(e) => setPagesRead(e.target.value)}
            hint={
              activeSession.book.totalPages
                ? `Currently on page ${activeSession.book.currentPage} of ${activeSession.book.totalPages}`
                : undefined
            }
          />

          {/* Post-session mood */}
          <div>
            <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
              How are you feeling now?
            </label>
            <MoodSelector value={postMood} onChange={setPostMood} size="md" />
          </div>

          {/* Session stats */}
          {(activeSession.quotes.length > 0 || activeSession.thoughts.length > 0) && (
            <div className="flex justify-center gap-6 text-center pt-2 border-t border-neutral-200 dark:border-neutral-700">
              {activeSession.quotes.length > 0 && (
                <div>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {activeSession.quotes.length}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {activeSession.quotes.length === 1 ? 'Quote' : 'Quotes'}
                  </p>
                </div>
              )}
              {activeSession.thoughts.length > 0 && (
                <div>
                  <p className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {activeSession.thoughts.length}
                  </p>
                  <p className="text-sm text-neutral-500">
                    {activeSession.thoughts.length === 1 ? 'Thought' : 'Thoughts'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        <ModalFooter className="flex-col sm:flex-row">
          <Button variant="ghost" onClick={handleDiscard} className="text-tense-500 hover:text-tense-600">
            Discard Session
          </Button>
          <div className="flex gap-3">
            <Button variant="secondary" onClick={onClose}>
              Continue Reading
            </Button>
            <Button onClick={handleSave} isLoading={isSubmitting}>
              Save Session
            </Button>
          </div>
        </ModalFooter>
      </Modal>
    </>
  );
}
