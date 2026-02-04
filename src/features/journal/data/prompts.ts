// Curated journal prompt library

export interface JournalPrompt {
  id: string;
  text: string;
  category: PromptCategory;
}

export type PromptCategory = 'reflection' | 'gratitude' | 'reading' | 'emotions' | 'goals' | 'creative';

export const PROMPT_CATEGORIES: Record<PromptCategory, { label: string; icon: string; color: string }> = {
  reflection: { label: 'Reflection', icon: '🪞', color: '#3B82F6' },
  gratitude: { label: 'Gratitude', icon: '🙏', color: '#22C55E' },
  reading: { label: 'Reading', icon: '📚', color: '#8B5CF6' },
  emotions: { label: 'Emotions', icon: '💭', color: '#F97316' },
  goals: { label: 'Goals', icon: '🎯', color: '#EC4899' },
  creative: { label: 'Creative', icon: '✨', color: '#14B8A6' }
};

export const JOURNAL_PROMPTS: JournalPrompt[] = [
  // Reflection prompts
  {
    id: 'reflect-1',
    text: 'What is one thing that challenged you today, and what did you learn from it?',
    category: 'reflection'
  },
  {
    id: 'reflect-2',
    text: 'Describe a moment today when you felt truly present.',
    category: 'reflection'
  },
  {
    id: 'reflect-3',
    text: 'What would you tell your past self from a week ago?',
    category: 'reflection'
  },
  {
    id: 'reflect-4',
    text: 'What patterns do you notice in your thoughts lately?',
    category: 'reflection'
  },
  {
    id: 'reflect-5',
    text: 'What is something you\'ve been avoiding? Why might that be?',
    category: 'reflection'
  },

  // Gratitude prompts
  {
    id: 'gratitude-1',
    text: 'List three small things that brought you joy today.',
    category: 'gratitude'
  },
  {
    id: 'gratitude-2',
    text: 'Who made a positive difference in your life recently, and how?',
    category: 'gratitude'
  },
  {
    id: 'gratitude-3',
    text: 'What is a simple pleasure you often take for granted?',
    category: 'gratitude'
  },
  {
    id: 'gratitude-4',
    text: 'Describe a challenge that helped you grow.',
    category: 'gratitude'
  },
  {
    id: 'gratitude-5',
    text: 'What about today made you smile?',
    category: 'gratitude'
  },

  // Reading prompts
  {
    id: 'reading-1',
    text: 'What themes from your current book relate to your own life?',
    category: 'reading'
  },
  {
    id: 'reading-2',
    text: 'Describe a character you identify with and why.',
    category: 'reading'
  },
  {
    id: 'reading-3',
    text: 'What passage or quote resonated with you most recently?',
    category: 'reading'
  },
  {
    id: 'reading-4',
    text: 'How has your current book changed your perspective?',
    category: 'reading'
  },
  {
    id: 'reading-5',
    text: 'If you could ask the author one question, what would it be?',
    category: 'reading'
  },

  // Emotions prompts
  {
    id: 'emotions-1',
    text: 'What emotions have you felt most intensely today?',
    category: 'emotions'
  },
  {
    id: 'emotions-2',
    text: 'Where do you feel stress in your body right now?',
    category: 'emotions'
  },
  {
    id: 'emotions-3',
    text: 'What is weighing on your mind? Write without judgment.',
    category: 'emotions'
  },
  {
    id: 'emotions-4',
    text: 'Describe how you\'re feeling using only metaphors.',
    category: 'emotions'
  },
  {
    id: 'emotions-5',
    text: 'What would help you feel more at peace right now?',
    category: 'emotions'
  },

  // Goals prompts
  {
    id: 'goals-1',
    text: 'What is one small step you can take tomorrow toward a goal?',
    category: 'goals'
  },
  {
    id: 'goals-2',
    text: 'What habits are serving you well? Which ones aren\'t?',
    category: 'goals'
  },
  {
    id: 'goals-3',
    text: 'Imagine your ideal day six months from now. Describe it.',
    category: 'goals'
  },
  {
    id: 'goals-4',
    text: 'What accomplishment, big or small, are you proud of?',
    category: 'goals'
  },
  {
    id: 'goals-5',
    text: 'What is holding you back from something you want?',
    category: 'goals'
  },

  // Creative prompts
  {
    id: 'creative-1',
    text: 'Write a letter to your future self.',
    category: 'creative'
  },
  {
    id: 'creative-2',
    text: 'Describe your perfect peaceful place in vivid detail.',
    category: 'creative'
  },
  {
    id: 'creative-3',
    text: 'If today was a color, what would it be and why?',
    category: 'creative'
  },
  {
    id: 'creative-4',
    text: 'Write about a memory that makes you feel warm.',
    category: 'creative'
  },
  {
    id: 'creative-5',
    text: 'If your current mood was weather, what would it be?',
    category: 'creative'
  }
];

// Get prompts by category
export function getPromptsByCategory(category: PromptCategory): JournalPrompt[] {
  return JOURNAL_PROMPTS.filter((p) => p.category === category);
}

// Get a random prompt
export function getRandomPrompt(category?: PromptCategory): JournalPrompt {
  const prompts = category ? getPromptsByCategory(category) : JOURNAL_PROMPTS;
  return prompts[Math.floor(Math.random() * prompts.length)]!;
}

// Get prompts for suggestions (context-aware)
export function getSuggestedPrompts(options?: {
  hasActiveBook?: boolean;
  currentMood?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
}): JournalPrompt[] {
  const suggestions: JournalPrompt[] = [];

  // Add reading prompt if user has an active book
  if (options?.hasActiveBook) {
    const readingPrompts = getPromptsByCategory('reading');
    suggestions.push(readingPrompts[Math.floor(Math.random() * readingPrompts.length)]!);
  }

  // Add emotion prompt if mood is low
  if (options?.currentMood && options.currentMood <= 2) {
    const emotionPrompts = getPromptsByCategory('emotions');
    suggestions.push(emotionPrompts[Math.floor(Math.random() * emotionPrompts.length)]!);
  }

  // Add gratitude prompt in the evening
  if (options?.timeOfDay === 'evening') {
    const gratitudePrompts = getPromptsByCategory('gratitude');
    suggestions.push(gratitudePrompts[Math.floor(Math.random() * gratitudePrompts.length)]!);
  }

  // Add reflection prompt in the morning
  if (options?.timeOfDay === 'morning') {
    const reflectionPrompts = getPromptsByCategory('reflection');
    suggestions.push(reflectionPrompts[Math.floor(Math.random() * reflectionPrompts.length)]!);
  }

  // Fill remaining slots with random prompts
  while (suggestions.length < 3) {
    const randomPrompt = getRandomPrompt();
    if (!suggestions.find((p) => p.id === randomPrompt.id)) {
      suggestions.push(randomPrompt);
    }
  }

  return suggestions.slice(0, 3);
}
