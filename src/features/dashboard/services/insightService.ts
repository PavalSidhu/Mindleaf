import { db } from '@/db/database';
import { moodService } from '@/features/mood/services/moodService';
import { startOfDay, subDays, isSameDay } from 'date-fns';

export interface Insight {
  id: string;
  type: 'mood-trend' | 'activity-correlation' | 'reading-mood' | 'consistency' | 'emotion-pattern';
  title: string;
  description: string;
  icon: string;
  sentiment: 'positive' | 'neutral' | 'encouraging';
}

export const insightService = {
  async generateInsights(): Promise<Insight[]> {
    const insights: Insight[] = [];

    // Check mood on reading vs non-reading days
    const readingMoodInsight = await this.getReadingMoodInsight();
    if (readingMoodInsight) insights.push(readingMoodInsight);

    // Check activity correlations
    const activityInsight = await this.getActivityInsight();
    if (activityInsight) insights.push(activityInsight);

    // Check mood trend
    const trendInsight = await this.getMoodTrendInsight();
    if (trendInsight) insights.push(trendInsight);

    // Check top emotion
    const emotionInsight = await this.getTopEmotionInsight();
    if (emotionInsight) insights.push(emotionInsight);

    // Consistency insight
    const consistencyInsight = await this.getConsistencyInsight();
    if (consistencyInsight) insights.push(consistencyInsight);

    return insights.slice(0, 3); // Return top 3 insights
  },

  async getReadingMoodInsight(): Promise<Insight | null> {
    const days = 30;
    const cutoff = subDays(new Date(), days);

    // Get all moods and sessions
    const moods = await db.moodEntries.where('timestamp').above(cutoff).toArray();
    const sessions = await db.readingSessions.where('startTime').above(cutoff).toArray();

    if (moods.length < 7 || sessions.length < 3) return null;

    // Get reading days
    const readingDays = new Set<string>();
    sessions.forEach((s) => readingDays.add(startOfDay(s.startTime).toISOString()));

    // Calculate average mood on reading vs non-reading days
    let readingDayMoodSum = 0;
    let readingDayMoodCount = 0;
    let nonReadingDayMoodSum = 0;
    let nonReadingDayMoodCount = 0;

    moods.forEach((mood) => {
      const dayKey = startOfDay(mood.timestamp).toISOString();
      if (readingDays.has(dayKey)) {
        readingDayMoodSum += mood.moodLevel;
        readingDayMoodCount++;
      } else {
        nonReadingDayMoodSum += mood.moodLevel;
        nonReadingDayMoodCount++;
      }
    });

    if (readingDayMoodCount < 3 || nonReadingDayMoodCount < 3) return null;

    const readingAvg = readingDayMoodSum / readingDayMoodCount;
    const nonReadingAvg = nonReadingDayMoodSum / nonReadingDayMoodCount;
    const diff = readingAvg - nonReadingAvg;

    if (Math.abs(diff) < 0.3) return null;

    if (diff > 0) {
      return {
        id: 'reading-mood',
        type: 'reading-mood',
        title: 'Reading boosts your mood',
        description: `You tend to feel ${(diff * 20).toFixed(0)}% better on days you read.`,
        icon: '📚',
        sentiment: 'positive'
      };
    }

    return null;
  },

  async getActivityInsight(): Promise<Insight | null> {
    const correlations = await moodService.getActivityCorrelations(30);

    if (correlations.size < 2) return null;

    // Find best activity correlation
    let bestActivity = '';
    let bestAvg = 0;
    let bestCount = 0;

    correlations.forEach((data, activity) => {
      if (data.count >= 3 && data.avgMood > bestAvg) {
        bestActivity = activity;
        bestAvg = data.avgMood;
        bestCount = data.count;
      }
    });

    if (!bestActivity || bestAvg < 3.5) return null;

    return {
      id: 'activity-correlation',
      type: 'activity-correlation',
      title: `${bestActivity} lifts your spirits`,
      description: `When you ${bestActivity}, your average mood is ${bestAvg.toFixed(1)}/5.`,
      icon: '✨',
      sentiment: 'positive'
    };
  },

  async getMoodTrendInsight(): Promise<Insight | null> {
    const lastWeekAvg = await moodService.getAverageForPeriod(7);
    const prevWeekStart = subDays(new Date(), 14);
    const prevWeekEnd = subDays(new Date(), 7);

    const prevWeekMoods = await db.moodEntries
      .where('timestamp')
      .between(prevWeekStart, prevWeekEnd)
      .toArray();

    if (!lastWeekAvg || prevWeekMoods.length < 3) return null;

    const prevWeekAvg = prevWeekMoods.reduce((sum, m) => sum + m.moodLevel, 0) / prevWeekMoods.length;
    const change = lastWeekAvg - prevWeekAvg;

    if (Math.abs(change) < 0.3) return null;

    if (change > 0) {
      return {
        id: 'mood-trend-up',
        type: 'mood-trend',
        title: 'Your mood is improving',
        description: `You're feeling ${(change * 20).toFixed(0)}% better than last week.`,
        icon: '📈',
        sentiment: 'positive'
      };
    } else {
      return {
        id: 'mood-trend-down',
        type: 'mood-trend',
        title: 'A gentle check-in',
        description: "Your mood has dipped a bit this week. Remember, it's okay to have ups and downs.",
        icon: '💙',
        sentiment: 'encouraging'
      };
    }
  },

  async getTopEmotionInsight(): Promise<Insight | null> {
    const frequency = await moodService.getEmotionFrequency(14);

    if (frequency.size < 3) return null;

    let topEmotion = '';
    let topCount = 0;

    frequency.forEach((count, emotion) => {
      if (count > topCount) {
        topEmotion = emotion;
        topCount = count;
      }
    });

    if (!topEmotion || topCount < 3) return null;

    const positiveEmotions = ['joyful', 'content', 'grateful', 'excited', 'hopeful', 'proud', 'peaceful', 'relaxed', 'focused'];
    const isPositive = positiveEmotions.includes(topEmotion);

    return {
      id: 'emotion-pattern',
      type: 'emotion-pattern',
      title: `Feeling ${topEmotion} often`,
      description: isPositive
        ? `"${topEmotion}" has been your most common feeling lately. Keep nurturing what brings this feeling.`
        : `"${topEmotion}" has come up often. Journaling might help you explore what's behind it.`,
      icon: isPositive ? '🌟' : '💭',
      sentiment: isPositive ? 'positive' : 'encouraging'
    };
  },

  async getConsistencyInsight(): Promise<Insight | null> {
    const moodDays = await moodService.getLoggingDays(7);
    const percentage = (moodDays.length / 7) * 100;

    if (moodDays.length >= 5) {
      return {
        id: 'consistency-good',
        type: 'consistency',
        title: 'Great consistency',
        description: `You've logged your mood ${moodDays.length} out of 7 days this week.`,
        icon: '🎯',
        sentiment: 'positive'
      };
    } else if (moodDays.length >= 3) {
      return {
        id: 'consistency-moderate',
        type: 'consistency',
        title: 'Building the habit',
        description: `${moodDays.length} mood logs this week. Every check-in helps you understand yourself better.`,
        icon: '🌱',
        sentiment: 'encouraging'
      };
    }

    return null;
  }
};
