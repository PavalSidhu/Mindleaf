import { Card } from '@/shared/components/Card';
import { cn } from '@/shared/utils/cn';
import type { Insight } from '../services/insightService';

interface InsightCardProps {
  insight: Insight;
}

const sentimentStyles = {
  positive: 'border-l-positive-500',
  neutral: 'border-l-calm-500',
  encouraging: 'border-l-energy-500'
};

export function InsightCard({ insight }: InsightCardProps) {
  return (
    <Card
      padding="md"
      className={cn(
        'border-l-4',
        sentimentStyles[insight.sentiment]
      )}
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl" role="img" aria-hidden="true">
          {insight.icon}
        </span>
        <div>
          <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
            {insight.title}
          </h4>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            {insight.description}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Loading skeleton
export function InsightCardSkeleton() {
  return (
    <Card padding="md" className="border-l-4 border-l-neutral-200 dark:border-l-neutral-700">
      <div className="flex items-start gap-3 animate-pulse">
        <div className="w-8 h-8 bg-neutral-200 dark:bg-neutral-700 rounded" />
        <div className="flex-1">
          <div className="h-5 bg-neutral-200 dark:bg-neutral-700 rounded w-2/3 mb-2" />
          <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-full" />
        </div>
      </div>
    </Card>
  );
}
