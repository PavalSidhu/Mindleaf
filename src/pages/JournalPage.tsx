import { useNavigate } from 'react-router-dom';
import { JournalList } from '@/features/journal/components';
import { Button } from '@/shared/components/Button';

export default function JournalPage() {
  const navigate = useNavigate();

  const handleNewEntry = () => {
    navigate('/journal/new');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Journal
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400">
            Reflect on your thoughts and feelings
          </p>
        </div>
        <Button
          onClick={handleNewEntry}
          leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }
        >
          New Entry
        </Button>
      </div>

      {/* Journal list */}
      <JournalList onNewEntry={handleNewEntry} />
    </div>
  );
}
