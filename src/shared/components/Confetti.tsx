import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  delay: number;
}

interface ConfettiProps {
  isActive: boolean;
  duration?: number;
  particleCount?: number;
  onComplete?: () => void;
}

const COLORS = [
  '#3B82F6', // calm blue
  '#22C55E', // positive green
  '#F97316', // energy orange
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6'  // teal
];

function generateConfetti(count: number): ConfettiPiece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100, // percentage
    y: -10,
    rotation: Math.random() * 360,
    color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
    size: Math.random() * 8 + 4,
    delay: Math.random() * 0.3
  }));
}

export function Confetti({
  isActive,
  duration = 2000,
  particleCount = 30,
  onComplete
}: ConfettiProps) {
  const prefersReducedMotion = useReducedMotion();
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (isActive && !prefersReducedMotion) {
      setPieces(generateConfetti(particleCount));

      const timer = setTimeout(() => {
        setPieces([]);
        onComplete?.();
      }, duration);

      return () => clearTimeout(timer);
    } else if (isActive && prefersReducedMotion) {
      // For reduced motion, just call onComplete immediately
      onComplete?.();
    }
  }, [isActive, duration, particleCount, prefersReducedMotion, onComplete]);

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      <AnimatePresence>
        {pieces.map((piece) => (
          <motion.div
            key={piece.id}
            className="absolute"
            style={{
              left: `${piece.x}%`,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px'
            }}
            initial={{
              y: piece.y,
              rotate: piece.rotation,
              opacity: 1
            }}
            animate={{
              y: window.innerHeight + 50,
              rotate: piece.rotation + (Math.random() > 0.5 ? 360 : -360),
              opacity: [1, 1, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 2 + Math.random(),
              delay: piece.delay,
              ease: [0.2, 0.8, 0.2, 1]
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

// Subtle sparkle animation for achievements
interface SparkleProps {
  isActive: boolean;
  color?: string;
}

export function Sparkle({ isActive, color = '#F59E0B' }: SparkleProps) {
  const prefersReducedMotion = useReducedMotion();

  if (!isActive || prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      className="absolute inset-0 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: 1, repeat: 2 }}
    >
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            left: `${20 + i * 20}%`,
            top: `${30 + (i % 2) * 40}%`,
            width: 4,
            height: 4,
            backgroundColor: color,
            borderRadius: '50%'
          }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.1,
            repeat: 2
          }}
        />
      ))}
    </motion.div>
  );
}
