import { motion } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/utils/cn';
import { MOOD_EMOJIS, MOOD_LABELS } from '@/db/schema';

interface MoodSelectorProps {
  value?: number | null;
  onChange: (mood: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showLabels?: boolean;
  className?: string;
}

const sizes = {
  sm: 'w-10 h-10 text-xl',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-16 h-16 text-3xl'
};

const moodColors: Record<number, string> = {
  1: 'bg-mood-1/20 hover:bg-mood-1/30 ring-mood-1',
  2: 'bg-mood-2/20 hover:bg-mood-2/30 ring-mood-2',
  3: 'bg-mood-3/20 hover:bg-mood-3/30 ring-mood-3',
  4: 'bg-mood-4/20 hover:bg-mood-4/30 ring-mood-4',
  5: 'bg-mood-5/20 hover:bg-mood-5/30 ring-mood-5'
};

export function MoodSelector({
  value,
  onChange,
  size = 'md',
  showLabels = true,
  className
}: MoodSelectorProps) {
  const prefersReducedMotion = useReducedMotion();
  const moods = [1, 2, 3, 4, 5] as const;

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div className="flex items-center gap-2">
        {moods.map((mood) => {
          const isSelected = value === mood;

          return (
            <motion.button
              key={mood}
              onClick={() => onChange(mood)}
              className={cn(
                'rounded-full flex items-center justify-center transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                sizes[size],
                moodColors[mood],
                isSelected && 'ring-2 scale-110'
              )}
              whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
              whileHover={prefersReducedMotion ? {} : { scale: isSelected ? 1.1 : 1.05 }}
              aria-label={`${MOOD_LABELS[mood]} mood`}
              aria-pressed={isSelected}
            >
              <span role="img" aria-hidden="true">
                {MOOD_EMOJIS[mood]}
              </span>
            </motion.button>
          );
        })}
      </div>

      {showLabels && value && (
        <motion.p
          key={value}
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 5 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          className="text-sm font-medium text-neutral-600 dark:text-neutral-400"
        >
          Feeling {MOOD_LABELS[value]?.toLowerCase()}
        </motion.p>
      )}
    </div>
  );
}

// Compact inline mood display
interface MoodBadgeProps {
  mood: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export function MoodBadge({ mood, size = 'sm', showLabel = false }: MoodBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full',
        moodColors[mood],
        size === 'sm' ? 'px-2 py-0.5 text-sm' : 'px-3 py-1 text-base'
      )}
    >
      <span role="img" aria-label={MOOD_LABELS[mood]}>
        {MOOD_EMOJIS[mood]}
      </span>
      {showLabel && (
        <span className="font-medium">{MOOD_LABELS[mood]}</span>
      )}
    </span>
  );
}
