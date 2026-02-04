import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { cn } from '@/shared/utils/cn';

interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hoverable?: boolean;
  clickable?: boolean;
}

const variants = {
  default: 'bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700',
  outlined: 'bg-transparent border-2 border-neutral-200 dark:border-neutral-700',
  elevated: 'bg-white dark:bg-neutral-800 shadow-card'
};

const paddings = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6'
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  hoverable = false,
  clickable = false,
  className,
  ...props
}: CardProps) {
  const prefersReducedMotion = useReducedMotion();

  const hoverAnimation =
    hoverable && !prefersReducedMotion
      ? {
          whileHover: { y: -2, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)' },
          transition: { duration: 0.2 }
        }
      : {};

  const tapAnimation =
    clickable && !prefersReducedMotion
      ? {
          whileTap: { scale: 0.98 }
        }
      : {};

  return (
    <motion.div
      className={cn(
        'rounded-xl',
        variants[variant],
        paddings[padding],
        hoverable && 'transition-shadow',
        clickable && 'cursor-pointer',
        className
      )}
      {...hoverAnimation}
      {...tapAnimation}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Card Header helper
interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">{title}</h3>
        {subtitle && (
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// Card Content helper
interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className }: CardContentProps) {
  return <div className={className}>{children}</div>;
}

// Card Footer helper
interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div
      className={cn(
        'mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-700',
        className
      )}
    >
      {children}
    </div>
  );
}
