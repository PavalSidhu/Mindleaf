import { useMemo } from 'react';
import { useMoodEntries } from '@/db/hooks';
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  format,
  isSameDay,
  startOfWeek,
  addMonths,
  subMonths,
  isToday
} from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { MOOD_EMOJIS } from '@/db/schema';

interface MoodCalendarProps {
  month?: Date;
  onMonthChange?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
}

const moodColors: Record<number, string> = {
  1: 'bg-mood-1',
  2: 'bg-mood-2',
  3: 'bg-mood-3',
  4: 'bg-mood-4',
  5: 'bg-mood-5'
};

export function MoodCalendar({
  month = new Date(),
  onMonthChange,
  onDayClick
}: MoodCalendarProps) {
  const start = startOfMonth(month);
  const end = endOfMonth(month);

  const moods = useMoodEntries({ start, end });

  // Create map of day -> average mood
  const moodByDay = useMemo(() => {
    if (!moods) return new Map<string, number>();

    const map = new Map<string, { total: number; count: number }>();

    moods.forEach((mood) => {
      const dayKey = format(mood.timestamp, 'yyyy-MM-dd');
      const existing = map.get(dayKey) || { total: 0, count: 0 };
      map.set(dayKey, {
        total: existing.total + mood.moodLevel,
        count: existing.count + 1
      });
    });

    const avgMap = new Map<string, number>();
    map.forEach((data, day) => {
      avgMap.set(day, Math.round(data.total / data.count));
    });

    return avgMap;
  }, [moods]);

  // Generate calendar days
  const calendarStart = startOfWeek(start);
  const days = eachDayOfInterval({
    start: calendarStart,
    end: endOfMonth(month)
  });

  // Ensure we have complete weeks
  while (days.length % 7 !== 0) {
    days.push(new Date(days[days.length - 1]!.getTime() + 86400000));
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-4">
      {/* Month navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onMonthChange?.(subMonths(month, 1))}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
          {format(month, 'MMMM yyyy')}
        </h3>

        <button
          onClick={() => onMonthChange?.(addMonths(month, 1))}
          className="p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {weekDays.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-neutral-500 py-2"
          >
            {day}
          </div>
        ))}

        {/* Day cells */}
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd');
          const mood = moodByDay.get(dayKey);
          const isCurrentMonth = day.getMonth() === month.getMonth();
          const isCurrentDay = isToday(day);

          return (
            <button
              key={dayKey}
              onClick={() => onDayClick?.(day)}
              disabled={!isCurrentMonth}
              className={cn(
                'aspect-square rounded-lg flex items-center justify-center relative transition-colors',
                isCurrentMonth
                  ? 'hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  : 'opacity-30 cursor-default',
                isCurrentDay && 'ring-2 ring-calm-500'
              )}
            >
              {mood ? (
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm',
                    moodColors[mood]
                  )}
                  title={`Mood: ${mood}/5`}
                >
                  <span className="text-white font-medium">{format(day, 'd')}</span>
                </div>
              ) : (
                <span
                  className={cn(
                    'text-sm',
                    isCurrentMonth
                      ? 'text-neutral-700 dark:text-neutral-300'
                      : 'text-neutral-400'
                  )}
                >
                  {format(day, 'd')}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-2">
        {[1, 2, 3, 4, 5].map((level) => (
          <div key={level} className="flex items-center gap-1">
            <div className={cn('w-3 h-3 rounded-full', moodColors[level])} />
            <span className="text-xs text-neutral-500">{MOOD_EMOJIS[level]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
