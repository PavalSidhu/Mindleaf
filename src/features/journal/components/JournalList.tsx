import { useState, useMemo } from 'react';
import { useJournalEntries } from '@/db/hooks';
import { JournalEntryCard } from './JournalEntryCard';
import { EmptyState, EmptyStateIcons, EMPTY_STATE_MESSAGES } from '@/shared/components/EmptyState';
import { Input } from '@/shared/components/Input';
import { cn } from '@/shared/utils/cn';
import { isThisWeek, isThisMonth, isToday } from 'date-fns';

interface JournalListProps {
  onNewEntry: () => void;
}

type FilterPeriod = 'all' | 'today' | 'week' | 'month';

export function JournalList({ onNewEntry }: JournalListProps) {
  const entries = useJournalEntries({ includeDrafts: true });
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>('all');

  const filteredEntries = useMemo(() => {
    if (!entries) return [];

    return entries.filter((entry) => {
      // Period filter
      if (filterPeriod !== 'all') {
        const date = entry.dateCreated;
        if (filterPeriod === 'today' && !isToday(date)) return false;
        if (filterPeriod === 'week' && !isThisWeek(date)) return false;
        if (filterPeriod === 'month' && !isThisMonth(date)) return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          entry.plainText.toLowerCase().includes(query) ||
          entry.tags.some((tag) => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [entries, searchQuery, filterPeriod]);

  if (!entries) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-calm-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <EmptyState
        icon={EmptyStateIcons.journal}
        title={EMPTY_STATE_MESSAGES.journal.title}
        description={EMPTY_STATE_MESSAGES.journal.description}
        action={{ label: 'Write Your First Entry', onClick: onNewEntry }}
      />
    );
  }

  const periods: { value: FilterPeriod; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' }
  ];

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search entries..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
        </div>

        <div className="flex gap-2">
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => setFilterPeriod(period.value)}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                filterPeriod === period.value
                  ? 'bg-calm-500 text-white'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-600'
              )}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <p className="text-sm text-neutral-500">
        {filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}
      </p>

      {/* Entry list */}
      {filteredEntries.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-neutral-500">No entries found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <JournalEntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
