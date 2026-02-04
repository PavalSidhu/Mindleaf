import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ReadingSessionView } from '@/features/reading/components';
import { useReadingStore } from '@/store/readingStore';
import { useBook } from '@/db/hooks';

export default function ReadingSessionPage() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const book = useBook(bookId);
  const activeSession = useReadingStore((state) => state.activeSession);
  const sessionPhase = useReadingStore((state) => state.sessionPhase);
  const startSession = useReadingStore((state) => state.startSession);
  const setSessionPhase = useReadingStore((state) => state.setSessionPhase);

  useEffect(() => {
    // If there's no active session, initialize one with pre-mood phase
    if (book && !activeSession) {
      startSession(book);
      setSessionPhase('pre-mood');
    }
  }, [book, activeSession, startSession, setSessionPhase]);

  useEffect(() => {
    // If no session and no book, redirect
    if (!activeSession && !book) {
      navigate('/reading');
    }
  }, [activeSession, book, navigate]);

  if (!activeSession && !book) {
    return null;
  }

  return <ReadingSessionView />;
}
