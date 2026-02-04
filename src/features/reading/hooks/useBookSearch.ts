import { useState, useEffect } from 'react';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { openLibraryService, type BookSearchResult } from '../services/openLibraryService';

interface UseBookSearchResult {
  results: BookSearchResult[];
  isLoading: boolean;
  error: string | null;
  search: (query: string) => void;
  clearResults: () => void;
}

export function useBookSearch(debounceMs: number = 300): UseBookSearchResult {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<BookSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const performSearch = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const searchResults = await openLibraryService.search(debouncedQuery);
        if (!cancelled) {
          setResults(searchResults);
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to search books. Please try again.');
          setResults([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    performSearch();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const search = (newQuery: string) => {
    setQuery(newQuery);
  };

  const clearResults = () => {
    setQuery('');
    setResults([]);
    setError(null);
  };

  return {
    results,
    isLoading,
    error,
    search,
    clearResults
  };
}
