import { db } from '@/db/database';
import type { MoodEntry } from '@/db/schema';
import { v4 as uuid } from 'uuid';
import { startOfDay, endOfDay, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

export interface CreateMoodInput {
  moodLevel: 1 | 2 | 3 | 4 | 5;
  specificEmotions?: string[];
  activityTags?: string[];
  note?: string;
}

export const moodService = {
  async create(input: CreateMoodInput): Promise<MoodEntry> {
    const entry: MoodEntry = {
      id: uuid(),
      timestamp: new Date(),
      moodLevel: input.moodLevel,
      specificEmotions: input.specificEmotions || [],
      activityTags: input.activityTags || [],
      note: input.note
    };

    await db.moodEntries.add(entry);
    return entry;
  },

  async update(id: string, input: Partial<CreateMoodInput>): Promise<void> {
    const updates: Partial<MoodEntry> = {};
    if (input.moodLevel !== undefined) updates.moodLevel = input.moodLevel;
    if (input.specificEmotions !== undefined) updates.specificEmotions = input.specificEmotions;
    if (input.activityTags !== undefined) updates.activityTags = input.activityTags;
    if (input.note !== undefined) updates.note = input.note;

    await db.moodEntries.update(id, updates);
  },

  async delete(id: string): Promise<void> {
    await db.moodEntries.delete(id);
  },

  async getById(id: string): Promise<MoodEntry | undefined> {
    return db.moodEntries.get(id);
  },

  async getAll(): Promise<MoodEntry[]> {
    return db.moodEntries.orderBy('timestamp').reverse().toArray();
  },

  async getByDateRange(start: Date, end: Date): Promise<MoodEntry[]> {
    return db.moodEntries
      .where('timestamp')
      .between(start, end)
      .toArray();
  },

  async getTodayMoods(): Promise<MoodEntry[]> {
    const today = new Date();
    return this.getByDateRange(startOfDay(today), endOfDay(today));
  },

  async getLatestMood(): Promise<MoodEntry | undefined> {
    const moods = await db.moodEntries.orderBy('timestamp').reverse().limit(1).toArray();
    return moods[0];
  },

  async getAverageForPeriod(days: number): Promise<number | null> {
    const cutoff = subDays(new Date(), days);
    const moods = await db.moodEntries
      .where('timestamp')
      .above(cutoff)
      .toArray();

    if (moods.length === 0) return null;
    return moods.reduce((sum, m) => sum + m.moodLevel, 0) / moods.length;
  },

  async getMoodsByDay(days: number = 30): Promise<Map<string, MoodEntry[]>> {
    const cutoff = subDays(new Date(), days - 1);
    const moods = await db.moodEntries
      .where('timestamp')
      .above(startOfDay(cutoff))
      .toArray();

    const byDay = new Map<string, MoodEntry[]>();
    moods.forEach((mood) => {
      const dayKey = startOfDay(mood.timestamp).toISOString();
      const existing = byDay.get(dayKey) || [];
      byDay.set(dayKey, [...existing, mood]);
    });

    return byDay;
  },

  async getDailyAverages(days: number = 30): Promise<Array<{ date: Date; average: number; count: number }>> {
    const moodsByDay = await this.getMoodsByDay(days);
    const result: Array<{ date: Date; average: number; count: number }> = [];

    const end = new Date();
    const start = subDays(end, days - 1);
    const allDays = eachDayOfInterval({ start, end });

    allDays.forEach((day) => {
      const dayKey = startOfDay(day).toISOString();
      const dayMoods = moodsByDay.get(dayKey) || [];

      if (dayMoods.length > 0) {
        const average = dayMoods.reduce((sum, m) => sum + m.moodLevel, 0) / dayMoods.length;
        result.push({ date: day, average, count: dayMoods.length });
      } else {
        result.push({ date: day, average: 0, count: 0 });
      }
    });

    return result;
  },

  async getLoggingDays(days: number = 30): Promise<Date[]> {
    const cutoff = subDays(new Date(), days);
    const moods = await db.moodEntries
      .where('timestamp')
      .above(cutoff)
      .toArray();

    const daySet = new Set<string>();
    moods.forEach((mood) => {
      daySet.add(startOfDay(mood.timestamp).toISOString());
    });

    return Array.from(daySet).map((iso) => new Date(iso));
  },

  async getEmotionFrequency(days: number = 30): Promise<Map<string, number>> {
    const cutoff = subDays(new Date(), days);
    const moods = await db.moodEntries
      .where('timestamp')
      .above(cutoff)
      .toArray();

    const frequency = new Map<string, number>();
    moods.forEach((mood) => {
      mood.specificEmotions.forEach((emotion) => {
        frequency.set(emotion, (frequency.get(emotion) || 0) + 1);
      });
    });

    return frequency;
  },

  async getActivityCorrelations(days: number = 30): Promise<Map<string, { count: number; avgMood: number }>> {
    const cutoff = subDays(new Date(), days);
    const moods = await db.moodEntries
      .where('timestamp')
      .above(cutoff)
      .toArray();

    const activityData = new Map<string, { total: number; count: number }>();

    moods.forEach((mood) => {
      mood.activityTags.forEach((activity) => {
        const existing = activityData.get(activity) || { total: 0, count: 0 };
        activityData.set(activity, {
          total: existing.total + mood.moodLevel,
          count: existing.count + 1
        });
      });
    });

    const correlations = new Map<string, { count: number; avgMood: number }>();
    activityData.forEach((data, activity) => {
      correlations.set(activity, {
        count: data.count,
        avgMood: data.total / data.count
      });
    });

    return correlations;
  }
};
