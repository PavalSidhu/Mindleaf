import { useMoodEntries } from '@/db/hooks';
import { Card } from '@/shared/components/Card';
import { MoodBadge } from '@/shared/components/MoodSelector';
import { Badge } from '@/shared/components/Badge';
import { EmptyState, EmptyStateIcons, EMPTY_STATE_MESSAGES } from '@/shared/components/EmptyState';
import { formatSmartDate } from '@/shared/utils/dateHelpers';

interface MoodHistoryListProps {
  limit?: number;
  onLogMood?: () => void;
}

export function MoodHistoryList({ limit, onLogMood }: MoodHistoryListProps) {
  const moods = useMoodEntries();

  if (!moods) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-6 h-6 border-2 border-calm-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const displayedMoods = limit ? moods.slice(0, limit) : moods;

  if (displayedMoods.length === 0) {
    return (
      <EmptyState
        icon={EmptyStateIcons.mood}
        title={EMPTY_STATE_MESSAGES.mood.title}
        description={EMPTY_STATE_MESSAGES.mood.description}
        action={onLogMood ? { label: 'Log Your Mood', onClick: onLogMood } : undefined}
      />
    );
  }

  return (
    <div className="space-y-3">
      {displayedMoods.map((mood) => (
        <Card key={mood.id} padding="md">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <MoodBadge mood={mood.moodLevel} showLabel />
                <span className="text-sm text-neutral-500">
                  {formatSmartDate(mood.timestamp)}
                </span>
              </div>

              {mood.specificEmotions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {mood.specificEmotions.map((emotion) => (
                    <Badge key={emotion} size="sm" variant="neutral">
                      {emotion}
                    </Badge>
                  ))}
                </div>
              )}

              {mood.activityTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {mood.activityTags.map((activity) => (
                    <Badge key={activity} size="sm" variant="primary">
                      {activity}
                    </Badge>
                  ))}
                </div>
              )}

              {mood.note && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2">
                  {mood.note}
                </p>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
