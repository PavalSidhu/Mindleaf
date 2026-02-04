import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { moodService } from '@/features/mood/services/moodService';
import { useLiveQuery } from 'dexie-react-hooks';
import { format } from 'date-fns';
import { cn } from '@/shared/utils/cn';
import { MOOD_LABELS } from '@/db/schema';

type Period = 7 | 30;

export function MoodTrendChart() {
  const [period, setPeriod] = useState<Period>(7);

  const data = useLiveQuery(
    () => moodService.getDailyAverages(period),
    [period]
  );

  const chartData = useMemo(() => {
    if (!data) return [];

    return data.map((d) => ({
      date: format(d.date, period === 7 ? 'EEE' : 'MMM d'),
      mood: d.count > 0 ? Number(d.average.toFixed(1)) : null,
      count: d.count
    }));
  }, [data, period]);

  const averageMood = useMemo(() => {
    if (!data) return null;
    const validDays = data.filter((d) => d.count > 0);
    if (validDays.length === 0) return null;
    return validDays.reduce((sum, d) => sum + d.average, 0) / validDays.length;
  }, [data]);

  if (!data) {
    return (
      <div className="h-48 flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-calm-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const hasData = chartData.some((d) => d.mood !== null);

  return (
    <div className="space-y-4">
      {/* Period toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {averageMood && (
            <span className="text-sm text-neutral-500">
              Avg: <span className="font-medium text-neutral-700 dark:text-neutral-300">
                {averageMood.toFixed(1)}/5
              </span>
            </span>
          )}
        </div>
        <div className="flex rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden">
          <button
            onClick={() => setPeriod(7)}
            className={cn(
              'px-3 py-1 text-sm transition-colors',
              period === 7
                ? 'bg-calm-500 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            )}
          >
            7 days
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={cn(
              'px-3 py-1 text-sm transition-colors',
              period === 30
                ? 'bg-calm-500 text-white'
                : 'bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
            )}
          >
            30 days
          </button>
        </div>
      </div>

      {/* Chart */}
      {hasData ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="moodGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#737373' }}
              />
              <YAxis
                domain={[1, 5]}
                ticks={[1, 2, 3, 4, 5]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#737373' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.[0]) return null;
                  const data = payload[0].payload as { date: string; mood: number | null; count: number };
                  if (data.mood === null) return null;

                  return (
                    <div className="bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg p-2 shadow-lg">
                      <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {data.date}
                      </p>
                      <p className="text-sm text-neutral-500">
                        Mood: {data.mood}/5 ({MOOD_LABELS[Math.round(data.mood)]})
                      </p>
                      <p className="text-xs text-neutral-400">
                        {data.count} {data.count === 1 ? 'entry' : 'entries'}
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="mood"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#moodGradient)"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-neutral-500">
          No mood data for this period
        </div>
      )}
    </div>
  );
}
