import { motion } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { Card } from '@/shared/components/Card';
import { Sparkle } from '@/shared/components/Confetti';
import { cn } from '@/shared/utils/cn';
import type { Achievement } from '@/db/schema';
import { formatSmartDate } from '@/shared/utils/dateHelpers';

interface AchievementBadgeProps {
  achievement: Achievement;
  size?: 'sm' | 'md' | 'lg';
  showDate?: boolean;
  isNew?: boolean;
}

export function AchievementBadge({
  achievement,
  size = 'md',
  showDate = false,
  isNew = false
}: AchievementBadgeProps) {
  const prefersReducedMotion = useReducedMotion();

  const sizes = {
    sm: 'w-12 h-12 text-2xl',
    md: 'w-16 h-16 text-3xl',
    lg: 'w-20 h-20 text-4xl'
  };

  return (
    <div className="flex flex-col items-center gap-2 text-center relative">
      <Sparkle isActive={isNew} />

      <motion.div
        initial={isNew && !prefersReducedMotion ? { scale: 0, rotate: -180 } : {}}
        animate={isNew && !prefersReducedMotion ? { scale: 1, rotate: 0 } : {}}
        transition={{ type: 'spring', duration: 0.6 }}
        className={cn(
          'rounded-full bg-gradient-to-br from-energy-400 to-energy-600',
          'flex items-center justify-center shadow-lg',
          sizes[size]
        )}
      >
        <span role="img" aria-hidden="true">
          {achievement.icon}
        </span>
      </motion.div>

      <div>
        <p className={cn(
          'font-medium text-neutral-900 dark:text-neutral-100',
          size === 'sm' && 'text-sm',
          size === 'lg' && 'text-lg'
        )}>
          {achievement.name}
        </p>
        {showDate && (
          <p className="text-xs text-neutral-500">
            {formatSmartDate(achievement.earnedAt)}
          </p>
        )}
      </div>
    </div>
  );
}

// Grid of achievements
interface AchievementsGridProps {
  achievements: Achievement[];
  emptyMessage?: string;
}

export function AchievementsGrid({ achievements, emptyMessage }: AchievementsGridProps) {
  if (achievements.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-neutral-500">
          {emptyMessage || "You'll earn achievements as you build your wellness habits."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
      {achievements.map((achievement) => (
        <AchievementBadge
          key={achievement.id}
          achievement={achievement}
          size="sm"
          showDate
        />
      ))}
    </div>
  );
}

// Compact achievement card for dashboard
interface AchievementCardProps {
  achievement: Achievement;
  isNew?: boolean;
}

export function AchievementCard({ achievement, isNew }: AchievementCardProps) {
  return (
    <Card padding="sm" className={cn(isNew && 'ring-2 ring-energy-500')}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{achievement.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
            {achievement.name}
          </p>
          <p className="text-xs text-neutral-500 truncate">
            {achievement.description}
          </p>
        </div>
      </div>
    </Card>
  );
}
