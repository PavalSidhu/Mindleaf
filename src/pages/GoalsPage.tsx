import { useState } from 'react';
import { useGoals, useAchievements } from '@/db/hooks';
import { GoalCard, CreateGoalModal } from '@/features/goals/components';
import { AchievementsGrid } from '@/features/dashboard/components';
import { goalService } from '@/features/goals/services/goalService';
import { EmptyState, EmptyStateIcons, EMPTY_STATE_MESSAGES } from '@/shared/components/EmptyState';
import { Card, CardHeader } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/shared/utils/cn';

type TabType = 'goals' | 'achievements';

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('goals');
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);

  const goals = useGoals(false); // Include inactive
  const achievements = useAchievements();
  const addToast = useUIStore((state) => state.addToast);

  const activeGoals = goals?.filter((g) => g.isActive) ?? [];
  const inactiveGoals = goals?.filter((g) => !g.isActive) ?? [];

  const handleDeleteGoal = async (goalId: string) => {
    if (confirm('Are you sure you want to delete this goal?')) {
      try {
        await goalService.delete(goalId);
        addToast({ type: 'success', message: 'Goal deleted' });
      } catch {
        addToast({ type: 'error', message: 'Failed to delete goal' });
      }
    }
  };

  const tabs: { value: TabType; label: string }[] = [
    { value: 'goals', label: 'Goals' },
    { value: 'achievements', label: 'Achievements' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Goals & Achievements
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Track your progress at your own pace
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-neutral-200 dark:border-neutral-700">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              'px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors',
              activeTab === tab.value
                ? 'border-calm-500 text-calm-600 dark:text-calm-400'
                : 'border-transparent text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Goals tab */}
      {activeTab === 'goals' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <Button onClick={() => setCreateModalOpen(true)}>
              Create Goal
            </Button>
          </div>

          {/* Active goals */}
          {activeGoals.length > 0 ? (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                Active Goals
              </h2>
              {activeGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={EmptyStateIcons.goal}
              title={EMPTY_STATE_MESSAGES.goals.title}
              description={EMPTY_STATE_MESSAGES.goals.description}
              action={{ label: 'Create Your First Goal', onClick: () => setCreateModalOpen(true) }}
            />
          )}

          {/* Inactive goals */}
          {inactiveGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-neutral-500">
                Inactive Goals
              </h2>
              {inactiveGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onDelete={() => handleDeleteGoal(goal.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Achievements tab */}
      {activeTab === 'achievements' && (
        <Card padding="lg">
          <CardHeader title="Your Achievements" subtitle="Earned forever, never lost" />
          <AchievementsGrid
            achievements={achievements ?? []}
            emptyMessage={EMPTY_STATE_MESSAGES.achievements.description}
          />
        </Card>
      )}

      {/* Create goal modal */}
      <CreateGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
    </div>
  );
}
