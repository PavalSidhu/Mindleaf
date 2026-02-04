import { useEffect, useRef, useCallback } from 'react';
import { setInterval, clearInterval } from 'worker-timers';
import { useReadingStore } from '@/store/readingStore';

interface UseReadingTimerResult {
  elapsedSeconds: number;
  isRunning: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  stop: () => number;
}

export function useReadingTimer(): UseReadingTimerResult {
  const activeSession = useReadingStore((state) => state.activeSession);
  const updateElapsed = useReadingStore((state) => state.updateElapsed);
  const pauseSession = useReadingStore((state) => state.pauseSession);
  const resumeSession = useReadingStore((state) => state.resumeSession);

  const intervalRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const accumulatedTimeRef = useRef<number>(0);

  const isRunning = activeSession !== null && !activeSession.isPaused;
  const isPaused = activeSession?.isPaused ?? false;
  const elapsedSeconds = activeSession?.elapsedSeconds ?? 0;

  // Start the timer interval
  const startInterval = useCallback(() => {
    if (intervalRef.current !== null) return;

    startTimeRef.current = Date.now();

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const elapsed = Math.floor((now - startTimeRef.current) / 1000) + accumulatedTimeRef.current;
      updateElapsed(elapsed);
    }, 1000);
  }, [updateElapsed]);

  // Stop the timer interval
  const stopInterval = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Handle visibility change (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Tab is hidden - pause interval but keep tracking time
        if (isRunning && intervalRef.current !== null) {
          accumulatedTimeRef.current = elapsedSeconds;
          stopInterval();
        }
      } else {
        // Tab is visible again - restart interval
        if (isRunning) {
          startInterval();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isRunning, elapsedSeconds, startInterval, stopInterval]);

  // Start/stop interval based on running state
  useEffect(() => {
    if (isRunning) {
      accumulatedTimeRef.current = elapsedSeconds;
      startInterval();
    } else {
      stopInterval();
    }

    return () => {
      stopInterval();
    };
  }, [isRunning, startInterval, stopInterval, elapsedSeconds]);

  const start = useCallback(() => {
    accumulatedTimeRef.current = 0;
    startTimeRef.current = Date.now();
  }, []);

  const pause = useCallback(() => {
    accumulatedTimeRef.current = elapsedSeconds;
    stopInterval();
    pauseSession();
  }, [elapsedSeconds, stopInterval, pauseSession]);

  const resume = useCallback(() => {
    resumeSession();
  }, [resumeSession]);

  const stop = useCallback(() => {
    stopInterval();
    const finalTime = elapsedSeconds;
    accumulatedTimeRef.current = 0;
    return finalTime;
  }, [stopInterval, elapsedSeconds]);

  return {
    elapsedSeconds,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop
  };
}
