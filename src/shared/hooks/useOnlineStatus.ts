import { useUIStore } from '@/store/uiStore';

/**
 * Hook to get the current online status
 */
export function useOnlineStatus(): boolean {
  return useUIStore((state) => state.isOnline);
}
