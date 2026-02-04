import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/layouts/MainLayout';

// Lazy load pages for code splitting
import { lazy, Suspense } from 'react';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ReadingPage = lazy(() => import('@/pages/ReadingPage'));
const BookDetailPage = lazy(() => import('@/pages/BookDetailPage'));
const ReadingSessionPage = lazy(() => import('@/pages/ReadingSessionPage'));
const JournalPage = lazy(() => import('@/pages/JournalPage'));
const JournalEditorPage = lazy(() => import('@/pages/JournalEditorPage'));
const MoodPage = lazy(() => import('@/pages/MoodPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-calm-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-500 text-sm">Loading...</p>
      </div>
    </div>
  );
}

// Wrap lazy components with Suspense
function withSuspense(Component: React.ComponentType) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />
      },
      {
        path: 'dashboard',
        element: withSuspense(DashboardPage)
      },
      {
        path: 'reading',
        element: withSuspense(ReadingPage)
      },
      {
        path: 'reading/:bookId',
        element: withSuspense(BookDetailPage)
      },
      {
        path: 'reading/:bookId/session',
        element: withSuspense(ReadingSessionPage)
      },
      {
        path: 'journal',
        element: withSuspense(JournalPage)
      },
      {
        path: 'journal/new',
        element: withSuspense(JournalEditorPage)
      },
      {
        path: 'journal/:entryId',
        element: withSuspense(JournalEditorPage)
      },
      {
        path: 'mood',
        element: withSuspense(MoodPage)
      },
      {
        path: 'goals',
        element: withSuspense(GoalsPage)
      },
      {
        path: 'settings',
        element: withSuspense(SettingsPage)
      }
    ]
  }
]);
