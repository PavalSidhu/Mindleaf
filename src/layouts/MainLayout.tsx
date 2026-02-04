import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from '@/shared/components/BottomNav';
import { Sidebar } from '@/shared/components/Sidebar';
import { ToastContainer } from '@/shared/components/Toast';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';

export function MainLayout() {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const location = useLocation();
  const prefersReducedMotion = useUIStore((state) => state.prefersReducedMotion);

  // Check if we're in a full-screen mode (reading session, distraction-free journal)
  const isFullScreenRoute = location.pathname.includes('/session');

  if (isFullScreenRoute) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <Outlet />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {isDesktop ? (
        // Desktop layout with sidebar
        <div className="flex">
          <Sidebar />
          <main className="flex-1 ml-64 min-h-screen">
            <div className="max-w-5xl mx-auto px-6 py-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                  animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                  exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      ) : (
        // Mobile layout with bottom nav
        <div className="pb-20">
          <main className="px-4 py-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={prefersReducedMotion ? {} : { opacity: 0, y: 10 }}
                animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
                exit={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </main>
          <BottomNav />
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
