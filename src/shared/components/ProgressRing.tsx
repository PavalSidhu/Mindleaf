import { motion } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/utils/cn';

interface ProgressRingProps {
  progress: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: 'calm' | 'positive' | 'energy' | 'neutral';
  showPercentage?: boolean;
  children?: React.ReactNode;
  className?: string;
}

const colors = {
  calm: 'stroke-calm-500',
  positive: 'stroke-positive-500',
  energy: 'stroke-energy-500',
  neutral: 'stroke-neutral-400'
};

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = 'calm',
  showPercentage = true,
  children,
  className
}: ProgressRingProps) {
  const prefersReducedMotion = useReducedMotion();

  // Clamp progress between 0 and 100
  const clampedProgress = Math.min(100, Math.max(0, progress));

  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (clampedProgress / 100) * circumference;

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        aria-hidden="true"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-neutral-200 dark:stroke-neutral-700"
        />

        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colors[color]}
          initial={prefersReducedMotion ? { strokeDashoffset: offset } : { strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={prefersReducedMotion ? {} : { duration: 0.5, ease: 'easeOut' }}
          style={{
            strokeDasharray: circumference
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {children ?? (
          showPercentage && (
            <span className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {Math.round(clampedProgress)}%
            </span>
          )
        )}
      </div>
    </div>
  );
}

// Linear progress bar variant
interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  color?: 'calm' | 'positive' | 'energy' | 'neutral';
  showLabel?: boolean;
  className?: string;
}

const barSizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3'
};

const barColors = {
  calm: 'bg-calm-500',
  positive: 'bg-positive-500',
  energy: 'bg-energy-500',
  neutral: 'bg-neutral-400'
};

export function ProgressBar({
  progress,
  size = 'md',
  color = 'calm',
  showLabel = false,
  className
}: ProgressBarProps) {
  const prefersReducedMotion = useReducedMotion();
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-sm mb-1">
          <span className="text-neutral-600 dark:text-neutral-400">Progress</span>
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            {Math.round(clampedProgress)}%
          </span>
        </div>
      )}
      <div
        className={cn(
          'w-full rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden',
          barSizes[size]
        )}
        role="progressbar"
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <motion.div
          className={cn('h-full rounded-full', barColors[color])}
          initial={prefersReducedMotion ? { width: `${clampedProgress}%` } : { width: 0 }}
          animate={{ width: `${clampedProgress}%` }}
          transition={prefersReducedMotion ? {} : { duration: 0.5, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}
