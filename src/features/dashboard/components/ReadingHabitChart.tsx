import { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { useRecentSessions } from '@/db/hooks';
import { format, startOfDay, eachDayOfInterval, subDays, isSameDay } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { formatDuration } from '@/shared/utils/formatters';

type ViewMode = 'time' | 'pages';
type Period = 7 | 30;

export function ReadingHabitChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('time');
  const [period, setPeriod] = useState<Period>(7);

  const sessions = useRecentSessions(period);

  const chartData = useMemo(() => {
    if (!sessions) return [];

    const end = new Date();
    const start = subDays(end, period - 1);
    const days = eachDayOfInterval({ start, end });

    return days.map((day) => {
      const daySessions = sessions.filter((s) => isSameDay(s.startTime, day));
      const totalMinutes = daySessions.reduce((sum, s) => sum + s.duration / 60, 0);
      const totalPages = daySessions.reduce((sum, s) => sum + s.pagesRead, 0);

      return {
        date: format(day, period === 7 ? 'EEE' : 'MMM d'),
        minutes: Math.round(totalMinutes),
        pages: totalPages,
        sessions: daySessions.length
      };
    });
  }, [sessions, period]);

  const totals = useMemo(() => {
    if (!chartData.length) return { minutes: 0, pages: 0, sessions: 0 };

    return chartData.reduce(
      (acc, d) => ({
        minutes: acc.minutes + d.minutes,
        pages: acc.pages + d.pages,
        sessions: acc.sessions + d.sessions
      }),
      { minutes: 0, pages: 0, sessions: 0 }
    );
  }, [chartData]);

  if (!sessions) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-calm-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = chartData.some((d) => d.minutes > 0 || d.pages > 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-4 text-sm">
          <span className="text-neutral-500">
            Total: <span className="font-medium text-neutral-700 dark:text-neutral-300">
              {viewMode === 'time' ? formatDuration(totals.minutes * 60) : `${totals.pages} pages`}
            </span>
          </span>
        </div>

        <div className="flex gap-2">
          {/* View mode toggle */}
          <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <button
              onClick={() => setViewMode('time')}
              className={cn(
                'px-3 py-1 text-sm transition-colors',
                viewMode === 'time'
                  ? 'bg-calm-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              )}
            >
              Time
            </button>
            <button
              onClick={() => setViewMode('pages')}
              className={cn(
                'px-3 py-1 text-sm transition-colors',
                viewMode === 'pages'
                  ? 'bg-calm-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              )}
            >
              Pages
            </button>
          </div>

          {/* Period toggle */}
          <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
            <button
              onClick={() => setPeriod(7)}
              className={cn(
                'px-3 py-1 text-sm transition-colors',
                period === 7
                  ? 'bg-positive-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              )}
            >
              7d
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={cn(
                'px-3 py-1 text-sm transition-colors',
                period === 30
                  ? 'bg-positive-500 text-white'
                  : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
              )}
            >
              30d
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#737373' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#737373' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload as { date: string; minutes: number; pages: number; sessions: number };

                  return (
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {data.date}
                      </p>
                      <p className="text-sm text-neutral-500">
                        {formatDuration(data.minutes * 60)} • {data.pages} pages
                      </p>
                      <p className="text-xs text-neutral-400">
                        {data.sessions} {data.sessions === 1 ? 'session' : 'sessions'}
                      </p>
                    </div>
                  );
                }}
              />
              <Bar
                dataKey={viewMode === 'time' ? 'minutes' : 'pages'}
                fill="#22C55E"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-neutral-500">
          No reading data for this period
        </div>
      )}
    </div>
  );
}
