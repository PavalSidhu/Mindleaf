import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useUIStore, initializeTheme } from '@/store/uiStore';
import { initializeDefaultTags } from '@/db/database';

export default function App() {
  const setOnline = useUIStore((state) => state.setOnline);
  const setPrefersReducedMotion = useUIStore((state) => state.setPrefersReducedMotion);

  useEffect(() => {
    // Initialize theme
    initializeTheme();

    // Initialize default tags in database
    initializeDefaultTags();

    // Online/offline status listeners
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Reduced motion preference listener
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);

    // System theme preference listener
    const themeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      const theme = useUIStore.getState().theme;
      if (theme === 'system') {
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };

    themeQuery.addEventListener('change', handleThemeChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      motionQuery.removeEventListener('change', handleMotionChange);
      themeQuery.removeEventListener('change', handleThemeChange);
    };
  }, [setOnline, setPrefersReducedMotion]);

  return <RouterProvider router={router} />;
}
