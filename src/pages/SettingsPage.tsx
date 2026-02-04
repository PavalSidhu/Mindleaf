import { useState } from 'react';
import { useUIStore } from '@/store/uiStore';
import { clearAllData } from '@/db/database';
import {
  exportJSON,
  exportMoodsCSV,
  exportSessionsCSV,
  exportJournalPDF,
  downloadFile
} from '@/features/settings/services/exportService';
import { Card, CardHeader } from '@/shared/components/Card';
import { Button } from '@/shared/components/Button';
import { cn } from '@/shared/utils/cn';
import { format } from 'date-fns';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const prefersReducedMotion = useUIStore((state) => state.prefersReducedMotion);
  const addToast = useUIStore((state) => state.addToast);

  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isClearing, setIsClearing] = useState(false);

  const handleExportJSON = async () => {
    setIsExporting('json');
    try {
      const data = await exportJSON();
      downloadFile(
        data,
        `mindleaf-backup-${format(new Date(), 'yyyy-MM-dd')}.json`,
        'application/json'
      );
      addToast({ type: 'success', message: 'Backup exported successfully' });
    } catch {
      addToast({ type: 'error', message: 'Failed to export backup' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportMoodsCSV = async () => {
    setIsExporting('moods');
    try {
      const data = await exportMoodsCSV();
      downloadFile(
        data,
        `mindleaf-moods-${format(new Date(), 'yyyy-MM-dd')}.csv`,
        'text/csv'
      );
      addToast({ type: 'success', message: 'Mood data exported' });
    } catch {
      addToast({ type: 'error', message: 'Failed to export mood data' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportSessionsCSV = async () => {
    setIsExporting('sessions');
    try {
      const data = await exportSessionsCSV();
      downloadFile(
        data,
        `mindleaf-reading-${format(new Date(), 'yyyy-MM-dd')}.csv`,
        'text/csv'
      );
      addToast({ type: 'success', message: 'Reading data exported' });
    } catch {
      addToast({ type: 'error', message: 'Failed to export reading data' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportJournalPDF = async () => {
    setIsExporting('journal');
    try {
      await exportJournalPDF();
      addToast({ type: 'success', message: 'Journal exported as PDF' });
    } catch {
      addToast({ type: 'error', message: 'Failed to export journal' });
    } finally {
      setIsExporting(null);
    }
  };

  const handleClearData = async () => {
    if (
      confirm(
        'Are you sure you want to delete ALL your data? This action cannot be undone.'
      )
    ) {
      if (
        confirm(
          'This will permanently delete all your books, journal entries, mood logs, and goals. Are you absolutely sure?'
        )
      ) {
        setIsClearing(true);
        try {
          await clearAllData();
          addToast({ type: 'success', message: 'All data has been deleted' });
        } catch {
          addToast({ type: 'error', message: 'Failed to clear data' });
        } finally {
          setIsClearing(false);
        }
      }
    }
  };

  const themes: { value: Theme; label: string; icon: React.ReactNode }[] = [
    {
      value: 'light',
      label: 'Light',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      value: 'dark',
      label: 'Dark',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )
    },
    {
      value: 'system',
      label: 'System',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    }
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-neutral-500 dark:text-neutral-400">
          Customize your experience
        </p>
      </div>

      {/* Theme */}
      <Card padding="lg">
        <CardHeader title="Appearance" subtitle="Choose your preferred theme" />
        <div className="flex gap-3">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={cn(
                'flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-colors',
                theme === t.value
                  ? 'border-calm-500 bg-calm-50 dark:bg-calm-900/30'
                  : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
              )}
            >
              <span className="text-neutral-600 dark:text-neutral-400">{t.icon}</span>
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Accessibility */}
      <Card padding="lg">
        <CardHeader title="Accessibility" subtitle="Motion and animation preferences" />
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-neutral-900 dark:text-neutral-100">
              Reduced Motion
            </p>
            <p className="text-sm text-neutral-500">
              {prefersReducedMotion
                ? 'Your system prefers reduced motion'
                : 'Animations are enabled'}
            </p>
          </div>
          <span
            className={cn(
              'px-3 py-1 rounded-full text-sm',
              prefersReducedMotion
                ? 'bg-positive-100 text-positive-700 dark:bg-positive-900 dark:text-positive-300'
                : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-700 dark:text-neutral-300'
            )}
          >
            {prefersReducedMotion ? 'On' : 'Off'}
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-2">
          This setting follows your system preference
        </p>
      </Card>

      {/* Data Export */}
      <Card padding="lg">
        <CardHeader title="Export Data" subtitle="Download your data for backup or analysis" />
        <div className="space-y-3">
          <Button
            variant="secondary"
            onClick={handleExportJSON}
            isLoading={isExporting === 'json'}
            className="w-full justify-start"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            }
          >
            Export Full Backup (JSON)
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportMoodsCSV}
            isLoading={isExporting === 'moods'}
            className="w-full justify-start"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            }
          >
            Export Mood Data (CSV)
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportSessionsCSV}
            isLoading={isExporting === 'sessions'}
            className="w-full justify-start"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            }
          >
            Export Reading Sessions (CSV)
          </Button>

          <Button
            variant="secondary"
            onClick={handleExportJournalPDF}
            isLoading={isExporting === 'journal'}
            className="w-full justify-start"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            }
          >
            Export Journal (PDF)
          </Button>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card padding="lg" className="border-tense-200 dark:border-tense-800">
        <CardHeader title="Danger Zone" subtitle="Irreversible actions" />
        <Button
          variant="danger"
          onClick={handleClearData}
          isLoading={isClearing}
          className="w-full"
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
        >
          Delete All Data
        </Button>
        <p className="text-xs text-neutral-500 mt-2">
          This will permanently delete all your books, journal entries, mood logs, goals, and achievements.
        </p>
      </Card>

      {/* About */}
      <Card padding="lg">
        <CardHeader title="About Mindleaf" />
        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
          <p>Version 1.0.0</p>
          <p>
            A compassionate reading and journal tracker for mental wellness.
          </p>
          <p className="pt-2">
            All your data is stored locally on your device. Nothing is sent to external servers.
          </p>
        </div>
      </Card>
    </div>
  );
}
