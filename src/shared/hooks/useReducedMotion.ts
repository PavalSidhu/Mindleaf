import { useUIStore } from '@/store/uiStore';

/**
 * Hook to check if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  return useUIStore((state) => state.prefersReducedMotion);
}
