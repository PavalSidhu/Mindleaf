import { getGreeting } from '@/shared/utils/dateHelpers';
import { useLatestMood, useTodaySessions, useJournalEntries } from '@/db/hooks';
import { MoodBadge } from '@/shared/components/MoodSelector';
import { formatDuration } from '@/shared/utils/formatters';

interface WelcomeHeaderProps {
  userName?: string;
}

export function WelcomeHeader({ userName }: WelcomeHeaderProps) {
  const greeting = getGreeting();
  const latestMood = useLatestMood();
  const todaySessions = useTodaySessions();
  const todayEntries = useJournalEntries({ limit: 100 });

  const todayReadingTime = todaySessions?.reduce((sum, s) => sum + s.duration, 0) ?? 0;
  const todayJournalCount = todayEntries?.filter((e) => {
    const today = new Date();
    const entryDate = e.dateCreated;
    return (
      entryDate.getDate() === today.getDate() &&
      entryDate.getMonth() === today.getMonth() &&
      entryDate.getFullYear() === today.getFullYear()
    );
  }).length ?? 0;

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          {greeting}{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Here's your wellness snapshot
        </p>
      </div>

      {/* Quick stats */}
      <div className="flex flex-wrap gap-4">
        {/* Current mood */}
        {latestMood && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Current mood:</span>
            <MoodBadge mood={latestMood.moodLevel} showLabel />
          </div>
        )}

        {/* Today's reading */}
        {todayReadingTime > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Read today:</span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {formatDuration(todayReadingTime)}
            </span>
          </div>
        )}

        {/* Today's journal entries */}
        {todayJournalCount > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Journal entries:</span>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {todayJournalCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
