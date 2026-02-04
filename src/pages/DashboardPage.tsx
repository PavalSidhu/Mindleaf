import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  WelcomeHeader,
  MoodTrendChart,
  ReadingHabitChart,
  InsightCard,
  InsightCardSkeleton,
  AchievementCard
} from '@/features/dashboard/components';
import { QuickMoodLog } from '@/features/mood/components';
import { insightService, type Insight } from '@/features/dashboard/services/insightService';
import { useLatestAchievements, useBooks, useTodayMoods } from '@/db/hooks';
import { Card, CardHeader } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { EmptyState, EmptyStateIcons, EMPTY_STATE_MESSAGES } from '@/shared/components/EmptyState';

export default function DashboardPage() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoadingInsights, setLoadingInsights] = useState(true);

  const achievements = useLatestAchievements(3);
  const books = useBooks('reading');
  const todayMoods = useTodayMoods();

  // Load insights
  useEffect(() => {
    const loadInsights = async () => {
      setLoadingInsights(true);
      try {
        const data = await insightService.generateInsights();
        setInsights(data);
      } catch (error) {
        console.error('Failed to load insights:', error);
      } finally {
        setLoadingInsights(false);
      }
    };

    loadInsights();
  }, []);

  const hasLoggedMoodToday = (todayMoods?.length ?? 0) > 0;

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <WelcomeHeader />

      {/* Quick mood log if not logged today */}
      {!hasLoggedMoodToday && (
        <Card padding="lg">
          <CardHeader title="How are you feeling?" subtitle="Take a moment to check in" />
          <QuickMoodLog compact />
        </Card>
      )}

      {/* Insights */}
      {(insights.length > 0 || isLoadingInsights) && (
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
            Insights
          </h2>
          <div className="space-y-3">
            {isLoadingInsights ? (
              <>
                <InsightCardSkeleton />
                <InsightCardSkeleton />
              </>
            ) : (
              insights.map((insight) => (
                <InsightCard key={insight.id} insight={insight} />
              ))
            )}
          </div>
        </section>
      )}

      {/* Charts grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Mood trend */}
        <Card padding="lg">
          <CardHeader
            title="Mood Trend"
            action={
              <Link to="/mood" className="text-sm text-calm-500 hover:text-calm-600">
                View all
              </Link>
            }
          />
          <MoodTrendChart />
        </Card>

        {/* Reading habits */}
        <Card padding="lg">
          <CardHeader
            title="Reading Habits"
            action={
              <Link to="/reading" className="text-sm text-calm-500 hover:text-calm-600">
                View all
              </Link>
            }
          />
          <ReadingHabitChart />
        </Card>
      </div>

      {/* Currently reading */}
      {books && books.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Currently Reading
            </h2>
            <Link to="/reading" className="text-sm text-calm-500 hover:text-calm-600">
              View library
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {books.slice(0, 3).map((book) => (
              <Link key={book.id} to={`/reading/${book.id}`}>
                <Card hoverable clickable padding="sm">
                  <div className="flex gap-3">
                    {book.coverUrl ? (
                      <img
                        src={book.coverUrl}
                        alt={book.title}
                        className="w-12 h-16 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-16 bg-neutral-200 dark:bg-neutral-700 rounded flex items-center justify-center">
                        <svg className="w-6 h-6 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 truncate">
                        {book.title}
                      </h3>
                      <p className="text-sm text-neutral-500 truncate">{book.author}</p>
                      {book.totalPages && (
                        <p className="text-xs text-neutral-400 mt-1">
                          {book.currentPage} / {book.totalPages} pages
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Recent achievements */}
      {achievements && achievements.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              Recent Achievements
            </h2>
            <Link to="/goals" className="text-sm text-calm-500 hover:text-calm-600">
              View all
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <AchievementCard key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </section>
      )}

      {/* Empty state for new users */}
      {!books?.length && !achievements?.length && !insights.length && (
        <Card padding="lg">
          <EmptyState
            icon={EmptyStateIcons.achievement}
            title="Welcome to Mindleaf"
            description="Start tracking your reading, journaling, and mood to see insights here"
            action={{
              label: 'Add Your First Book',
              onClick: () => window.location.href = '/reading'
            }}
          />
        </Card>
      )}
    </div>
  );
}
