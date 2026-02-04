import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

export type Theme = 'light' | 'dark' | 'system';

interface UIState {
  // Online status
  isOnline: boolean;
  setOnline: (online: boolean) => void;

  // Modal management
  activeModal: string | null;
  modalData: Record<string, unknown>;
  openModal: (modalId: string, data?: Record<string, unknown>) => void;
  closeModal: () => void;

  // Toast notifications
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Reduced motion preference
  prefersReducedMotion: boolean;
  setPrefersReducedMotion: (prefers: boolean) => void;

  // Mobile nav state
  isMobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;

  // Sidebar collapsed state (desktop)
  isSidebarCollapsed: boolean;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Online status
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  setOnline: (online) => set({ isOnline: online }),

  // Modal management
  activeModal: null,
  modalData: {},
  openModal: (modalId, data = {}) => set({ activeModal: modalId, modalData: data }),
  closeModal: () => set({ activeModal: null, modalData: {} }),

  // Toast notifications
  toasts: [],
  addToast: (toast) => {
    const id = crypto.randomUUID();
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }]
    }));

    // Auto-remove after duration
    const duration = toast.duration ?? 4000;
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }));
    }, duration);
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    })),

  // Theme
  theme: 'system',
  setTheme: (theme) => {
    set({ theme });
    // Apply theme to document
    const root = document.documentElement;
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark', prefersDark);
    } else {
      root.classList.toggle('dark', theme === 'dark');
    }
    localStorage.setItem('mindleaf-theme', theme);
  },

  // Reduced motion preference
  prefersReducedMotion: typeof window !== 'undefined'
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false,
  setPrefersReducedMotion: (prefers) => set({ prefersReducedMotion: prefers }),

  // Mobile nav state
  isMobileNavOpen: false,
  setMobileNavOpen: (open) => set({ isMobileNavOpen: open }),

  // Sidebar collapsed state
  isSidebarCollapsed: false,
  setSidebarCollapsed: (collapsed) => set({ isSidebarCollapsed: collapsed })
}));

// Initialize theme from localStorage
export function initializeTheme(): void {
  const stored = localStorage.getItem('mindleaf-theme') as Theme | null;
  if (stored) {
    useUIStore.getState().setTheme(stored);
  } else {
    // Apply system preference by default
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', prefersDark);
  }
}
