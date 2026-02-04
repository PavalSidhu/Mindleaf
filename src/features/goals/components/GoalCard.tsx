import { useState, useEffect } from 'react';
import { Card } from '@/shared/components/Card';
import { ProgressRing } from '@/shared/components/ProgressRing';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';
import { goalService } from '../services/goalService';
import type { Goal } from '@/db/schema';

interface GoalCardProps {
  goal: Goal;
  onEdit?: () => void;
  onDelete?: () => void;
}

const goalTypeLabels: Record<Goal['type'], string> = {
  'reading-time': 'Reading Time',
  'reading-pages': 'Pages Read',
  'journal-entries': 'Journal Entries',
  'mood-logs': 'Mood Logs'
};

const goalTypeIcons: Record<Goal['type'], string> = {
  'reading-time': '⏱️',
  'reading-pages': '📖',
  'journal-entries': '✍️',
  'mood-logs': '😊'
};

const frequencyLabels: Record<Goal['frequency'], string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly'
};

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const [progress, setProgress] = useState<{ current: number; target: number; percentage: number } | null>(null);
  const [consistency, setConsistency] = useState<{ completedDays: number; totalDays: number; percentage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [progressData, consistencyData] = await Promise.all([
          goalService.getProgress(goal),
          goalService.getConsistency(goal, 7)
        ]);
        setProgress(progressData);
        setConsistency(consistencyData);
      } catch (error) {
        console.error('Failed to load goal data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [goal]);

  const isPaused = goal.pausedUntil && goal.pausedUntil > new Date();

  if (isLoading) {
    return (
      <Card padding="md">
        <div className="animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-neutral-200 dark:bg-neutral-700 rounded-full" />
            <div className="flex-1">
              <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 mb-2" />
              <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2" />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="md" className={cn(isPaused && 'opacity-60')}>
      <div className="flex items-start gap-4">
        {/* Progress ring */}
        <ProgressRing
          progress={progress?.percentage ?? 0}
          size={80}
          color={progress && progress.percentage >= 100 ? 'positive' : 'calm'}
        >
          <span className="text-2xl">{goalTypeIcons[goal.type]}</span>
        </ProgressRing>

        {/* Goal info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                {goalTypeLabels[goal.type]}
              </h3>
              <p className="text-sm text-neutral-500">
                {frequencyLabels[goal.frequency]} • {goal.target} {goal.unit}
              </p>
            </div>

            {isPaused && (
              <span className="text-xs bg-energy-100 text-energy-700 dark:bg-energy-900 dark:text-energy-300 px-2 py-0.5 rounded-full">
                Paused
              </span>
            )}
          </div>

          {/* Progress text */}
          {progress && (
            <div className="mt-2">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                {progress.current} / {progress.target} {goal.unit}
              </p>
              <p className="text-sm text-calm-600 dark:text-calm-400 mt-1">
                {goalService.getEncouragementMessage(progress.percentage)}
              </p>
            </div>
          )}

          {/* Consistency (not streak!) */}
          {consistency && goal.frequency === 'daily' && (
            <p className="text-xs text-neutral-500 mt-2">
              {consistency.completedDays} of {consistency.totalDays} days this week ({consistency.percentage}%)
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-3">
            {onEdit && (
              <Button variant="ghost" size="sm" onClick={onEdit}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="sm" onClick={onDelete} className="text-tense-500">
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
