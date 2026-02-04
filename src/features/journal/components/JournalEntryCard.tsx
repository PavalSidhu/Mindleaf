import { Link } from 'react-router-dom';
import { Card } from '@/shared/components/Card';
import { Badge } from '@/shared/components/Badge';
import { MoodBadge } from '@/shared/components/MoodSelector';
import { formatSmartDate } from '@/shared/utils/dateHelpers';
import { getExcerpt } from '@/shared/utils/formatters';
import type { JournalEntry } from '@/db/schema';

interface JournalEntryCardProps {
  entry: JournalEntry;
}

export function JournalEntryCard({ entry }: JournalEntryCardProps) {
  const excerpt = getExcerpt(entry.plainText, 120);

  return (
    <Link to={`/journal/${entry.id}`}>
      <Card hoverable clickable padding="md">
        <div className="space-y-2">
          {/* Header with date and moods */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {formatSmartDate(entry.dateCreated)}
              </p>
              {entry.isDraft && (
                <Badge variant="energy" size="sm">Draft</Badge>
              )}
            </div>
            <div className="flex gap-1">
              {entry.moodBefore && <MoodBadge mood={entry.moodBefore} />}
              {entry.moodAfter && entry.moodAfter !== entry.moodBefore && (
                <>
                  <span className="text-neutral-400">→</span>
                  <MoodBadge mood={entry.moodAfter} />
                </>
              )}
            </div>
          </div>

          {/* Content preview */}
          <p className="text-neutral-700 dark:text-neutral-300 line-clamp-3">
            {excerpt || 'Empty entry...'}
          </p>

          {/* Tags */}
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {entry.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} size="sm" variant="neutral">
                  {tag}
                </Badge>
              ))}
              {entry.tags.length > 3 && (
                <Badge size="sm" variant="neutral">
                  +{entry.tags.length - 3}
                </Badge>
              )}
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
}
