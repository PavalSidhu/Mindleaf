import { useEffect, useRef, useCallback } from 'react';
import { useDebouncedCallback } from '@/shared/hooks/useDebounce';
import { useJournalStore, type SaveStatus } from '@/store/journalStore';
import { journalService } from '../services/journalService';

interface UseAutoSaveOptions {
  entryId: string | null;
  content: string;
  plainText: string;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseAutoSaveResult {
  saveStatus: SaveStatus;
  save: () => Promise<void>;
  saveImmediately: () => Promise<void>;
}

export function useAutoSave({
  entryId,
  content,
  plainText,
  debounceMs = 1000,
  enabled = true
}: UseAutoSaveOptions): UseAutoSaveResult {
  const saveStatus = useJournalStore((state) => state.saveStatus);
  const setSaveStatus = useJournalStore((state) => state.setSaveStatus);
  const activeDraft = useJournalStore((state) => state.activeDraft);
  const setActiveDraft = useJournalStore((state) => state.setActiveDraft);
  const linkedBookId = useJournalStore((state) => state.linkedBookId);
  const entryMoodBefore = useJournalStore((state) => state.entryMoodBefore);
  const entryMoodAfter = useJournalStore((state) => state.entryMoodAfter);
  const entryTags = useJournalStore((state) => state.entryTags);

  const lastSavedContent = useRef<string>(content);
  const currentEntryId = useRef<string | null>(entryId);

  // Update entry ID ref when it changes
  useEffect(() => {
    currentEntryId.current = entryId;
  }, [entryId]);

  const performSave = useCallback(async () => {
    // Don't save if content hasn't changed
    if (content === lastSavedContent.current && currentEntryId.current) {
      setSaveStatus('saved');
      return;
    }

    // Don't save empty content
    if (!content.trim() || content === '<p></p>') {
      setSaveStatus('idle');
      return;
    }

    setSaveStatus('saving');

    try {
      if (currentEntryId.current) {
        // Update existing entry
        await journalService.update(currentEntryId.current, {
          content,
          plainText,
          tags: entryTags,
          bookId: linkedBookId,
          moodBefore: entryMoodBefore,
          moodAfter: entryMoodAfter,
          isDraft: true
        });
      } else {
        // Create new entry
        const entry = await journalService.create({
          content,
          plainText,
          tags: entryTags,
          bookId: linkedBookId ?? undefined,
          moodBefore: entryMoodBefore ?? undefined,
          moodAfter: entryMoodAfter ?? undefined,
          isDraft: true
        });

        currentEntryId.current = entry.id;
        setActiveDraft({
          id: entry.id,
          content,
          plainText,
          lastModified: new Date()
        });
      }

      lastSavedContent.current = content;
      setSaveStatus('saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
      setSaveStatus('error');
    }
  }, [
    content,
    plainText,
    entryTags,
    linkedBookId,
    entryMoodBefore,
    entryMoodAfter,
    setSaveStatus,
    setActiveDraft
  ]);

  // Debounced save function
  const debouncedSave = useDebouncedCallback(performSave, debounceMs);

  // Trigger auto-save when content changes
  useEffect(() => {
    if (!enabled) return;

    // Mark as saving when content changes
    if (content !== lastSavedContent.current && content.trim() && content !== '<p></p>') {
      setSaveStatus('saving');
      debouncedSave();
    }
  }, [content, enabled, debouncedSave, setSaveStatus]);

  // Initialize last saved content when loading existing entry
  useEffect(() => {
    if (activeDraft) {
      lastSavedContent.current = activeDraft.content;
    }
  }, [activeDraft]);

  return {
    saveStatus,
    save: performSave,
    saveImmediately: performSave
  };
}
