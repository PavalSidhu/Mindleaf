import { useState } from 'react';
import { Modal } from '@/shared/components/Modal';
import { Card } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';
import {
  JOURNAL_PROMPTS,
  PROMPT_CATEGORIES,
  getPromptsByCategory,
  getRandomPrompt,
  type PromptCategory,
  type JournalPrompt
} from '../data/prompts';

interface PromptSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

export function PromptSelector({ isOpen, onClose, onSelectPrompt }: PromptSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<PromptCategory | 'all'>('all');
  const [selectedPrompt, setSelectedPrompt] = useState<JournalPrompt | null>(null);

  const categories = Object.entries(PROMPT_CATEGORIES) as [PromptCategory, typeof PROMPT_CATEGORIES[PromptCategory]][];
  const displayedPrompts = selectedCategory === 'all'
    ? JOURNAL_PROMPTS
    : getPromptsByCategory(selectedCategory);

  const handleSelectPrompt = (prompt: JournalPrompt) => {
    setSelectedPrompt(prompt);
  };

  const handleUsePrompt = () => {
    if (selectedPrompt) {
      onSelectPrompt(selectedPrompt.text);
      handleClose();
    }
  };

  const handleRandomPrompt = () => {
    const prompt = getRandomPrompt(selectedCategory === 'all' ? undefined : selectedCategory);
    setSelectedPrompt(prompt);
  };

  const handleClose = () => {
    setSelectedPrompt(null);
    setSelectedCategory('all');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Choose a Prompt" size="lg">
      <div className="space-y-4">
        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
              selectedCategory === 'all'
                ? 'bg-calm-500 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
            )}
          >
            All
          </button>
          {categories.map(([key, { label, icon }]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5',
                selectedCategory === key
                  ? 'bg-calm-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
              )}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </div>

        {/* Random button */}
        <Button variant="ghost" onClick={handleRandomPrompt} size="sm">
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Surprise me
        </Button>

        {/* Prompts list */}
        <div className="max-h-64 overflow-y-auto space-y-2">
          {displayedPrompts.map((prompt) => {
            const category = PROMPT_CATEGORIES[prompt.category];
            const isSelected = selectedPrompt?.id === prompt.id;

            return (
              <Card
                key={prompt.id}
                padding="sm"
                clickable
                className={cn(
                  'cursor-pointer',
                  isSelected && 'ring-2 ring-calm-500'
                )}
                onClick={() => handleSelectPrompt(prompt)}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">{category.icon}</span>
                  <div className="flex-1">
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {prompt.text}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {category.label}
                    </p>
                  </div>
                  {isSelected && (
                    <svg className="w-5 h-5 text-calm-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button onClick={handleUsePrompt} disabled={!selectedPrompt}>
          Use This Prompt
        </Button>
      </div>
    </Modal>
  );
}

// Inline prompt suggestions component
interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void;
  hasActiveBook?: boolean;
}

export function PromptSuggestions({ onSelectPrompt, hasActiveBook }: PromptSuggestionsProps) {
  const hour = new Date().getHours();
  const timeOfDay: 'morning' | 'afternoon' | 'evening' =
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const suggestions = [
    getRandomPrompt('reflection'),
    getRandomPrompt('gratitude'),
    hasActiveBook ? getRandomPrompt('reading') : getRandomPrompt('emotions')
  ];

  return (
    <div className="space-y-2">
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Need inspiration?
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((prompt) => (
          <button
            key={prompt.id}
            onClick={() => onSelectPrompt(prompt.text)}
            className={cn(
              'px-3 py-2 rounded-lg text-sm text-left transition-colors',
              'bg-neutral-100 dark:bg-neutral-800',
              'hover:bg-neutral-200 dark:hover:bg-neutral-700',
              'text-neutral-700 dark:text-neutral-300'
            )}
          >
            <span className="mr-2">{PROMPT_CATEGORIES[prompt.category].icon}</span>
            {prompt.text.length > 50 ? prompt.text.slice(0, 50) + '...' : prompt.text}
          </button>
        ))}
      </div>
    </div>
  );
}
