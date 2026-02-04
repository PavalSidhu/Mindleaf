import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { JournalEditor, PromptSelector, PromptSuggestions } from '@/features/journal/components';
import { useAutoSave } from '@/features/journal/hooks/useAutoSave';
import { journalService } from '@/features/journal/services/journalService';
import { useJournalStore } from '@/store/journalStore';
import { useUIStore } from '@/store/uiStore';
import { useJournalEntry } from '@/db/hooks';
import { Button } from '@/shared/components/Button';
import { MoodSelector } from '@/shared/components/MoodSelector';
import { TagInput } from '@/shared/components/TagInput';
import { cn } from '@/shared/utils/cn';

export default function JournalEditorPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const existingEntry = useJournalEntry(entryId);

  const addToast = useUIStore((state) => state.addToast);
  const clearDraft = useJournalStore((state) => state.clearDraft);
  const entryMoodBefore = useJournalStore((state) => state.entryMoodBefore);
  const entryMoodAfter = useJournalStore((state) => state.entryMoodAfter);
  const setEntryMoodBefore = useJournalStore((state) => state.setEntryMoodBefore);
  const setEntryMoodAfter = useJournalStore((state) => state.setEntryMoodAfter);
  const entryTags = useJournalStore((state) => state.entryTags);
  const setEntryTags = useJournalStore((state) => state.setEntryTags);

  const [content, setContent] = useState('');
  const [plainText, setPlainText] = useState('');
  const [isPromptSelectorOpen, setPromptSelectorOpen] = useState(false);
  const [currentEntryId, setCurrentEntryId] = useState<string | null>(entryId || null);
  const [showMoodCapture, setShowMoodCapture] = useState(false);

  // Auto-save hook
  const { saveStatus, saveImmediately } = useAutoSave({
    entryId: currentEntryId,
    content,
    plainText,
    debounceMs: 1000,
    enabled: content.trim().length > 0
  });

  // Load existing entry
  useEffect(() => {
    if (existingEntry) {
      setContent(existingEntry.content);
      setPlainText(existingEntry.plainText);
      setCurrentEntryId(existingEntry.id);
      setEntryTags(existingEntry.tags);
      if (existingEntry.moodBefore) setEntryMoodBefore(existingEntry.moodBefore);
      if (existingEntry.moodAfter) setEntryMoodAfter(existingEntry.moodAfter);
    }
  }, [existingEntry, setEntryTags, setEntryMoodBefore, setEntryMoodAfter]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      clearDraft();
    };
  }, [clearDraft]);

  const handleContentChange = (newContent: string, newPlainText: string) => {
    setContent(newContent);
    setPlainText(newPlainText);
  };

  const handleSelectPrompt = (promptText: string) => {
    // Prepend prompt to content
    const promptHtml = `<p><em>${promptText}</em></p><p></p>`;
    setContent(promptHtml + content);
    setPlainText(promptText + '\n\n' + plainText);
  };

  const handlePublish = async () => {
    if (!currentEntryId) {
      // Create and publish new entry
      try {
        const entry = await journalService.create({
          content,
          plainText,
          tags: entryTags,
          moodBefore: entryMoodBefore ?? undefined,
          moodAfter: entryMoodAfter ?? undefined,
          isDraft: false
        });
        addToast({ type: 'success', message: 'Entry saved' });
        clearDraft();
        navigate('/journal');
      } catch {
        addToast({ type: 'error', message: 'Failed to save entry' });
      }
    } else {
      // Publish existing draft
      try {
        await saveImmediately();
        await journalService.publish(currentEntryId);
        addToast({ type: 'success', message: 'Entry published' });
        clearDraft();
        navigate('/journal');
      } catch {
        addToast({ type: 'error', message: 'Failed to publish entry' });
      }
    }
  };

  const handleDelete = async () => {
    if (currentEntryId && confirm('Are you sure you want to delete this entry?')) {
      try {
        await journalService.delete(currentEntryId);
        addToast({ type: 'success', message: 'Entry deleted' });
        clearDraft();
        navigate('/journal');
      } catch {
        addToast({ type: 'error', message: 'Failed to delete entry' });
      }
    } else if (!currentEntryId) {
      clearDraft();
      navigate('/journal');
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Error saving';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/journal')}
          className="flex items-center gap-2 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <div className="flex items-center gap-3">
          <span className={cn(
            'text-sm',
            saveStatus === 'saving' && 'text-energy-500',
            saveStatus === 'saved' && 'text-positive-500',
            saveStatus === 'error' && 'text-tense-500'
          )}>
            {getSaveStatusText()}
          </span>

          {currentEntryId && (
            <Button variant="ghost" onClick={handleDelete} className="text-tense-500">
              Delete
            </Button>
          )}

          <Button onClick={handlePublish} disabled={!content.trim()}>
            {existingEntry?.isDraft === false ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>

      {/* Mood capture toggle */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setShowMoodCapture(!showMoodCapture)}
          className="text-sm text-calm-500 hover:text-calm-600 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {showMoodCapture ? 'Hide mood' : 'Add mood'}
        </button>

        <Button variant="ghost" size="sm" onClick={() => setPromptSelectorOpen(true)}>
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Get prompt
        </Button>
      </div>

      {/* Mood capture */}
      {showMoodCapture && (
        <div className="grid grid-cols-2 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Before writing
            </p>
            <MoodSelector
              value={entryMoodBefore}
              onChange={setEntryMoodBefore}
              size="sm"
              showLabels={false}
            />
          </div>
          <div>
            <p className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              After writing
            </p>
            <MoodSelector
              value={entryMoodAfter}
              onChange={setEntryMoodAfter}
              size="sm"
              showLabels={false}
            />
          </div>
        </div>
      )}

      {/* Prompt suggestions for empty editor */}
      {!content.trim() && (
        <PromptSuggestions onSelectPrompt={handleSelectPrompt} />
      )}

      {/* Editor */}
      <JournalEditor
        content={content}
        onChange={handleContentChange}
        placeholder="Start writing... Let your thoughts flow freely."
        autoFocus
      />

      {/* Tags */}
      <div>
        <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2 block">
          Tags
        </label>
        <TagInput
          value={entryTags}
          onChange={setEntryTags}
          suggestions={['reflection', 'gratitude', 'goals', 'reading', 'feelings', 'ideas']}
          placeholder="Add tags..."
        />
      </div>

      {/* Prompt selector modal */}
      <PromptSelector
        isOpen={isPromptSelectorOpen}
        onClose={() => setPromptSelectorOpen(false)}
        onSelectPrompt={handleSelectPrompt}
      />
    </div>
  );
}
