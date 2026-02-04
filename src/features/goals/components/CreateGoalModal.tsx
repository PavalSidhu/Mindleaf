import { useState } from 'react';
import { Modal, ModalFooter } from '@/shared/components/Modal';
import { Button } from '@/shared/components/Button';
import { Input } from '@/shared/components/Input';
import { cn } from '@/shared/utils/cn';
import { goalService } from '../services/goalService';
import { useUIStore } from '@/store/uiStore';
import type { GoalType, GoalFrequency } from '@/db/schema';

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
}

const goalTypes: { value: GoalType; label: string; icon: string; description: string }[] = [
  {
    value: 'reading-time',
    label: 'Reading Time',
    icon: '⏱️',
    description: 'Track minutes spent reading'
  },
  {
    value: 'reading-pages',
    label: 'Pages Read',
    icon: '📖',
    description: 'Track pages read'
  },
  {
    value: 'journal-entries',
    label: 'Journal Entries',
    icon: '✍️',
    description: 'Write journal entries'
  },
  {
    value: 'mood-logs',
    label: 'Mood Logs',
    icon: '😊',
    description: 'Log your mood'
  }
];

const frequencies: { value: GoalFrequency; label: string }[] = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' }
];

const defaultTargets: Record<GoalType, Record<GoalFrequency, number>> = {
  'reading-time': { daily: 30, weekly: 150, monthly: 600 },
  'reading-pages': { daily: 20, weekly: 100, monthly: 400 },
  'journal-entries': { daily: 1, weekly: 3, monthly: 10 },
  'mood-logs': { daily: 1, weekly: 7, monthly: 20 }
};

const units: Record<GoalType, string> = {
  'reading-time': 'minutes',
  'reading-pages': 'pages',
  'journal-entries': 'entries',
  'mood-logs': 'logs'
};

export function CreateGoalModal({ isOpen, onClose, onCreated }: CreateGoalModalProps) {
  const [type, setType] = useState<GoalType | null>(null);
  const [frequency, setFrequency] = useState<GoalFrequency>('daily');
  const [target, setTarget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addToast = useUIStore((state) => state.addToast);

  const handleTypeSelect = (selectedType: GoalType) => {
    setType(selectedType);
    setTarget(String(defaultTargets[selectedType][frequency]));
  };

  const handleFrequencyChange = (newFrequency: GoalFrequency) => {
    setFrequency(newFrequency);
    if (type) {
      setTarget(String(defaultTargets[type][newFrequency]));
    }
  };

  const handleSubmit = async () => {
    if (!type || !target) return;

    setIsSubmitting(true);

    try {
      await goalService.create({
        type,
        frequency,
        target: parseInt(target, 10),
        unit: units[type]
      });

      addToast({ type: 'success', message: 'Goal created' });
      handleClose();
      onCreated?.();
    } catch {
      addToast({ type: 'error', message: 'Failed to create goal' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setType(null);
    setFrequency('daily');
    setTarget('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create Goal" size="lg">
      <div className="space-y-6">
        {/* Goal type selection */}
        <div>
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
            What do you want to track?
          </label>
          <div className="grid grid-cols-2 gap-3">
            {goalTypes.map((goalType) => (
              <button
                key={goalType.value}
                onClick={() => handleTypeSelect(goalType.value)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-colors',
                  type === goalType.value
                    ? 'border-calm-500 bg-calm-50 dark:bg-calm-900/30'
                    : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                )}
              >
                <span className="text-2xl mb-2 block">{goalType.icon}</span>
                <span className="font-medium text-neutral-900 dark:text-neutral-100 block">
                  {goalType.label}
                </span>
                <span className="text-xs text-neutral-500">{goalType.description}</span>
              </button>
            ))}
          </div>
        </div>

        {type && (
          <>
            {/* Frequency */}
            <div>
              <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 block">
                How often?
              </label>
              <div className="flex gap-2">
                {frequencies.map((freq) => (
                  <button
                    key={freq.value}
                    onClick={() => handleFrequencyChange(freq.value)}
                    className={cn(
                      'flex-1 py-2 rounded-lg text-sm font-medium transition-colors',
                      frequency === freq.value
                        ? 'bg-calm-500 text-white'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Target */}
            <Input
              label={`Target (${units[type]})`}
              type="number"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
              min={1}
              hint={`Set a realistic target you can achieve ${frequency}`}
            />
          </>
        )}
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!type || !target || parseInt(target, 10) <= 0}
          isLoading={isSubmitting}
        >
          Create Goal
        </Button>
      </ModalFooter>
    </Modal>
  );
}
