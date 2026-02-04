import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMoodStore } from '@/store/moodStore';
import { useUIStore } from '@/store/uiStore';
import { useReducedMotion } from '@/shared/hooks/useReducedMotion';
import { moodService } from '../services/moodService';
import { achievementService } from '@/features/dashboard/services/achievementService';
import { MoodSelector } from '@/shared/components/MoodSelector';
import { Button } from '@/shared/components/Button';
import { Textarea } from '@/shared/components/Input';
import { Confetti } from '@/shared/components/Confetti';
import { cn } from '@/shared/utils/cn';
import { EMOTION_CATEGORIES, DEFAULT_ACTIVITIES, MOOD_LABELS } from '@/db/schema';

interface QuickMoodLogProps {
  onComplete?: () => void;
  compact?: boolean;
}

export function QuickMoodLog({ onComplete, compact = false }: QuickMoodLogProps) {
  const prefersReducedMotion = useReducedMotion();
  const addToast = useUIStore((state) => state.addToast);

  const currentMoodLevel = useMoodStore((state) => state.currentMoodLevel);
  const selectedEmotions = useMoodStore((state) => state.selectedEmotions);
  const selectedActivities = useMoodStore((state) => state.selectedActivities);
  const moodNote = useMoodStore((state) => state.moodNote);
  const currentStep = useMoodStore((state) => state.currentStep);
  const setMoodLevel = useMoodStore((state) => state.setMoodLevel);
  const toggleEmotion = useMoodStore((state) => state.toggleEmotion);
  const toggleActivity = useMoodStore((state) => state.toggleActivity);
  const setMoodNote = useMoodStore((state) => state.setMoodNote);
  const nextStep = useMoodStore((state) => state.nextStep);
  const previousStep = useMoodStore((state) => state.previousStep);
  const resetMoodLog = useMoodStore((state) => state.resetMoodLog);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleSubmit = async () => {
    if (!currentMoodLevel) return;

    setIsSubmitting(true);

    try {
      await moodService.create({
        moodLevel: currentMoodLevel as 1 | 2 | 3 | 4 | 5,
        specificEmotions: selectedEmotions,
        activityTags: selectedActivities,
        note: moodNote || undefined
      });

      // Check for achievements
      const newAchievements = await achievementService.checkAllAchievements();
      if (newAchievements.length > 0) {
        setShowConfetti(true);
        newAchievements.forEach((a) => {
          addToast({ type: 'success', message: `Achievement unlocked: ${a.name}!` });
        });
      } else {
        addToast({ type: 'success', message: 'Mood logged' });
      }

      resetMoodLog();
      onComplete?.();
    } catch {
      addToast({ type: 'error', message: 'Failed to save mood' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const animation = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, x: 20 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
        transition: { duration: 0.2 }
      };

  // Compact mode - just mood selector
  if (compact) {
    return (
      <div className="flex flex-col items-center gap-4">
        <p className="text-sm text-neutral-500">How are you feeling?</p>
        <MoodSelector
          value={currentMoodLevel}
          onChange={async (mood) => {
            setMoodLevel(mood);
            // Quick save in compact mode
            try {
              await moodService.create({
                moodLevel: mood as 1 | 2 | 3 | 4 | 5,
                specificEmotions: [],
                activityTags: []
              });
              addToast({ type: 'success', message: 'Mood logged' });
              resetMoodLog();
              onComplete?.();
            } catch {
              addToast({ type: 'error', message: 'Failed to save mood' });
            }
          }}
          size="md"
        />
      </div>
    );
  }

  return (
    <>
      <Confetti isActive={showConfetti} onComplete={() => setShowConfetti(false)} />

      <div className="space-y-6">
        <AnimatePresence mode="wait">
          {/* Step 1: Mood Selection */}
          {currentStep === 'mood' && (
            <motion.div key="mood" {...animation} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  How are you feeling?
                </h2>
                <p className="text-neutral-500">Take a moment to check in with yourself</p>
              </div>

              <MoodSelector
                value={currentMoodLevel}
                onChange={setMoodLevel}
                size="lg"
              />

              <div className="flex justify-end">
                <Button onClick={nextStep} disabled={!currentMoodLevel}>
                  Continue
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Emotions */}
          {currentStep === 'emotions' && (
            <motion.div key="emotions" {...animation} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  What emotions are present?
                </h2>
                <p className="text-neutral-500">Select any that resonate</p>
              </div>

              <div className="space-y-4">
                {Object.entries(EMOTION_CATEGORIES).map(([category, emotions]) => (
                  <div key={category}>
                    <h3 className="text-sm font-medium text-neutral-500 mb-2 capitalize">
                      {category}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {emotions.map((emotion) => (
                        <button
                          key={emotion}
                          onClick={() => toggleEmotion(emotion)}
                          className={cn(
                            'px-3 py-1.5 rounded-full text-sm transition-colors',
                            selectedEmotions.includes(emotion)
                              ? 'bg-calm-500 text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
                          )}
                        >
                          {emotion}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={previousStep}>
                  Back
                </Button>
                <Button onClick={nextStep}>
                  {selectedEmotions.length > 0 ? 'Continue' : 'Skip'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Activities */}
          {currentStep === 'activities' && (
            <motion.div key="activities" {...animation} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  What have you been doing?
                </h2>
                <p className="text-neutral-500">Select any activities from today</p>
              </div>

              <div className="flex flex-wrap gap-2">
                {DEFAULT_ACTIVITIES.map((activity) => (
                  <button
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    className={cn(
                      'px-3 py-1.5 rounded-full text-sm transition-colors',
                      selectedActivities.includes(activity)
                        ? 'bg-positive-500 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-700 dark:text-neutral-300'
                    )}
                  >
                    {activity}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <Button variant="ghost" onClick={previousStep}>
                  Back
                </Button>
                <Button onClick={nextStep}>
                  {selectedActivities.length > 0 ? 'Continue' : 'Skip'}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Note */}
          {currentStep === 'note' && (
            <motion.div key="note" {...animation} className="space-y-6">
              <div className="text-center">
                <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  Anything else to note?
                </h2>
                <p className="text-neutral-500">Optional - add any context or thoughts</p>
              </div>

              <Textarea
                placeholder="What's on your mind? (optional)"
                value={moodNote}
                onChange={(e) => setMoodNote(e.target.value)}
                rows={4}
              />

              <div className="flex justify-between">
                <Button variant="ghost" onClick={previousStep}>
                  Back
                </Button>
                <Button onClick={handleSubmit} isLoading={isSubmitting}>
                  Save Mood
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Complete */}
          {currentStep === 'complete' && (
            <motion.div key="complete" {...animation} className="text-center space-y-4">
              <div className="text-6xl">
                {MOOD_LABELS[currentMoodLevel || 3] === 'Great' ? '🎉' : '✓'}
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                Mood logged!
              </h2>
              <p className="text-neutral-500">
                Thank you for checking in with yourself
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
