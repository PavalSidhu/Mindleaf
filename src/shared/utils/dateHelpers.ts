import {
  format,
  formatDistanceToNow,
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInDays,
  differenceInMinutes,
  addDays,
  subDays,
  eachDayOfInterval,
  isSameDay
} from 'date-fns';

/**
 * Format a date for display
 */
export function formatDate(date: Date, formatStr: string = 'MMM d, yyyy'): string {
  return format(date, formatStr);
}

/**
 * Format a date relative to now (e.g., "2 hours ago")
 */
export function formatRelative(date: Date): string {
  return formatDistanceToNow(date, { addSuffix: true });
}

/**
 * Format a date with smart relative formatting
 */
export function formatSmartDate(date: Date): string {
  if (isToday(date)) {
    return `Today at ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  if (isThisWeek(date)) {
    return format(date, 'EEEE');
  }
  if (isThisMonth(date)) {
    return format(date, 'MMM d');
  }
  return format(date, 'MMM d, yyyy');
}

/**
 * Get a friendly time-based greeting
 */
export function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  if (hour < 21) {
    return 'Good evening';
  }
  return 'Good night';
}

/**
 * Get date range helpers
 */
export function getDateRanges() {
  const now = new Date();

  return {
    today: {
      start: startOfDay(now),
      end: endOfDay(now)
    },
    thisWeek: {
      start: startOfWeek(now),
      end: endOfWeek(now)
    },
    thisMonth: {
      start: startOfMonth(now),
      end: endOfMonth(now)
    },
    last7Days: {
      start: subDays(startOfDay(now), 6),
      end: endOfDay(now)
    },
    last30Days: {
      start: subDays(startOfDay(now), 29),
      end: endOfDay(now)
    }
  };
}

/**
 * Get all days in a date range
 */
export function getDaysInRange(start: Date, end: Date): Date[] {
  return eachDayOfInterval({ start, end });
}

/**
 * Calculate consistency percentage for a period
 * Returns what percentage of days in the period had activity
 */
export function calculateConsistency(
  activeDates: Date[],
  periodStart: Date,
  periodEnd: Date
): number {
  const allDays = getDaysInRange(periodStart, periodEnd);
  const totalDays = allDays.length;

  if (totalDays === 0) return 0;

  const activeDays = allDays.filter((day) =>
    activeDates.some((activeDate) => isSameDay(day, activeDate))
  ).length;

  return Math.round((activeDays / totalDays) * 100);
}

/**
 * Get a human-readable consistency message (compassionate design)
 */
export function getConsistencyMessage(percentage: number, activity: string): string {
  if (percentage >= 100) {
    return `Amazing! You've ${activity} every day`;
  }
  if (percentage >= 80) {
    return `Great consistency! You've ${activity} on ${percentage}% of days`;
  }
  if (percentage >= 50) {
    return `Nice progress! You've ${activity} on ${percentage}% of days`;
  }
  if (percentage >= 20) {
    return `You're building a habit - ${percentage}% of days`;
  }
  if (percentage > 0) {
    return `Every small step counts`;
  }
  return `Ready when you are`;
}

export {
  isToday,
  isYesterday,
  isThisWeek,
  isThisMonth,
  differenceInDays,
  differenceInMinutes,
  addDays,
  subDays,
  isSameDay,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth
};
