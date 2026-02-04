import { db } from '@/db/database';
import type { Goal, GoalType, GoalFrequency } from '@/db/schema';
import { v4 as uuid } from 'uuid';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay
} from 'date-fns';

export interface CreateGoalInput {
  type: GoalType;
  frequency: GoalFrequency;
  target: number;
  unit: string;
}

const DEFAULT_UNITS: Record<GoalType, string> = {
  'reading-time': 'minutes',
  'reading-pages': 'pages',
  'journal-entries': 'entries',
  'mood-logs': 'logs'
};

export const goalService = {
  async create(input: CreateGoalInput): Promise<Goal> {
    const goal: Goal = {
      id: uuid(),
      type: input.type,
      frequency: input.frequency,
      target: input.target,
      unit: input.unit || DEFAULT_UNITS[input.type],
      createdAt: new Date(),
      isActive: true
    };

    await db.goals.add(goal);
    return goal;
  },

  async update(id: string, updates: Partial<Goal>): Promise<void> {
    await db.goals.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    await db.goals.delete(id);
  },

  async getById(id: string): Promise<Goal | undefined> {
    return db.goals.get(id);
  },

  async getAll(): Promise<Goal[]> {
    return db.goals.toArray();
  },

  async getActive(): Promise<Goal[]> {
    const now = new Date();
    const goals = await db.goals.where('isActive').equals(1 as unknown as boolean).toArray();

    // Filter out paused goals
    return goals.filter((g) => !g.pausedUntil || g.pausedUntil <= now);
  },

  async pause(id: string, until: Date): Promise<void> {
    await db.goals.update(id, { pausedUntil: until });
  },

  async unpause(id: string): Promise<void> {
    await db.goals.update(id, { pausedUntil: undefined });
  },

  async deactivate(id: string): Promise<void> {
    await db.goals.update(id, { isActive: false });
  },

  async reactivate(id: string): Promise<void> {
    await db.goals.update(id, { isActive: true, pausedUntil: undefined });
  },

  // Calculate progress for a goal
  async getProgress(goal: Goal): Promise<{ current: number; target: number; percentage: number }> {
    const now = new Date();
    let start: Date;
    let end: Date;

    switch (goal.frequency) {
      case 'daily':
        start = startOfDay(now);
        end = endOfDay(now);
        break;
      case 'weekly':
        start = startOfWeek(now);
        end = endOfWeek(now);
        break;
      case 'monthly':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
    }

    let current = 0;

    switch (goal.type) {
      case 'reading-time': {
        const sessions = await db.readingSessions
          .where('startTime')
          .between(start, end)
          .toArray();
        current = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60);
        break;
      }
      case 'reading-pages': {
        const sessions = await db.readingSessions
          .where('startTime')
          .between(start, end)
          .toArray();
        current = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
        break;
      }
      case 'journal-entries': {
        current = await db.journalEntries
          .where('dateCreated')
          .between(start, end)
          .filter((e) => !e.isDraft)
          .count();
        break;
      }
      case 'mood-logs': {
        current = await db.moodEntries
          .where('timestamp')
          .between(start, end)
          .count();
        break;
      }
    }

    const percentage = Math.min(100, Math.round((current / goal.target) * 100));

    return { current, target: goal.target, percentage };
  },

  // Calculate consistency score (compassionate design - no streaks!)
  async getConsistency(
    goal: Goal,
    lookbackDays: number = 30
  ): Promise<{ completedDays: number; totalDays: number; percentage: number }> {
    const now = new Date();
    const start = new Date(now.getTime() - lookbackDays * 24 * 60 * 60 * 1000);
    const days = eachDayOfInterval({ start: startOfDay(start), end: startOfDay(now) });

    let completedDays = 0;

    for (const day of days) {
      const dayStart = startOfDay(day);
      const dayEnd = endOfDay(day);

      let dayProgress = 0;

      switch (goal.type) {
        case 'reading-time': {
          const sessions = await db.readingSessions
            .where('startTime')
            .between(dayStart, dayEnd)
            .toArray();
          dayProgress = Math.round(sessions.reduce((sum, s) => sum + s.duration, 0) / 60);
          break;
        }
        case 'reading-pages': {
          const sessions = await db.readingSessions
            .where('startTime')
            .between(dayStart, dayEnd)
            .toArray();
          dayProgress = sessions.reduce((sum, s) => sum + s.pagesRead, 0);
          break;
        }
        case 'journal-entries': {
          dayProgress = await db.journalEntries
            .where('dateCreated')
            .between(dayStart, dayEnd)
            .filter((e) => !e.isDraft)
            .count();
          break;
        }
        case 'mood-logs': {
          dayProgress = await db.moodEntries
            .where('timestamp')
            .between(dayStart, dayEnd)
            .count();
          break;
        }
      }

      // For daily goals, check against target
      // For weekly/monthly, check if any progress was made
      const target = goal.frequency === 'daily' ? goal.target : 1;
      if (dayProgress >= target) {
        completedDays++;
      }
    }

    const percentage = Math.round((completedDays / days.length) * 100);

    return { completedDays, totalDays: days.length, percentage };
  },

  // Get encouragement message based on progress (compassionate design)
  getEncouragementMessage(percentage: number): string {
    if (percentage >= 100) {
      return "You've reached your goal!";
    }
    if (percentage >= 75) {
      return "Almost there - you're doing great!";
    }
    if (percentage >= 50) {
      return "Halfway there! Keep it up.";
    }
    if (percentage >= 25) {
      return "Good start! Every bit counts.";
    }
    if (percentage > 0) {
      return "You've begun - that's what matters.";
    }
    return "Ready when you are.";
  }
};
