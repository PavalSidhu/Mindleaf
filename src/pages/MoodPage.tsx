import { useState } from 'react';
import { QuickMoodLog, MoodCalendar, MoodHistoryList } from '@/features/mood/components';
import { Card, CardHeader } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { Modal } from '@/shared/components/Modal';
import { cn } from '@/shared/utils/cn';

type TabType = 'log' | 'calendar' | 'history';

export default function MoodPage() {
  const [activeTab, setActiveTab] = useState<TabType>('log');
  const [isLogModalOpen, setLogModalOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  const tabs: { value: TabType; label: string }[] = [
    { value: 'log', label: 'Log Mood' },
    { value: 'calendar', label: 'Calendar' },
    { value: 'history', label: 'History' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Mood Tracker
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Understand your emotional patterns
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

      {/* Tab content */}
      {activeTab === 'log' && (
        <Card padding="lg">
          <QuickMoodLog onComplete={() => setActiveTab('history')} />
        </Card>
      )}

      {activeTab === 'calendar' && (
        <Card padding="lg">
          <MoodCalendar
            month={calendarMonth}
            onMonthChange={setCalendarMonth}
          />
        </Card>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setActiveTab('log')}>
              Log New Mood
            </Button>
          </div>
          <MoodHistoryList onLogMood={() => setActiveTab('log')} />
        </div>
      )}

      {/* Quick log modal (for mobile FAB) */}
      <Modal isOpen={isLogModalOpen} onClose={() => setLogModalOpen(false)} title="Log Mood">
        <QuickMoodLog
          onComplete={() => setLogModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
