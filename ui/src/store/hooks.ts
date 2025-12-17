import { useEffect } from 'react';
import { useAppStore } from './state';

/**
 * Hook to load initial data on mount
 */
export function useInitialData() {
  const loadData = useAppStore((state) => state.loadData);

  useEffect(() => {
    loadData();
  }, [loadData]);
}

/**
 * Hook to sync filters with URL query params
 */
export function useSyncFiltersWithURL() {
  const filters = useAppStore((state) => state.filters);
  const setFilters = useAppStore((state) => state.setFilters);

  useEffect(() => {
    // Read from URL on mount
    const params = new URLSearchParams(window.location.search);
    const group = params.getAll('group');
    const country = params.getAll('country');
    const deviceType = params.getAll('deviceType');
    const compliance = params.getAll('compliance');

    if (group.length || country.length || deviceType.length || compliance.length) {
      setFilters({ group, country, deviceType, compliance });
    }
  }, [setFilters]);

  useEffect(() => {
    // Write to URL when filters change
    const params = new URLSearchParams();

    filters.group.forEach((g) => params.append('group', g));
    filters.country.forEach((c) => params.append('country', c));
    filters.deviceType.forEach((dt) => params.append('deviceType', dt));
    filters.compliance.forEach((c) => params.append('compliance', c));

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    window.history.replaceState({}, '', newUrl);
  }, [filters]);
}

/**
 * Hook to handle online/offline status
 */
export function useOnlineStatus() {
  const setError = useAppStore((state) => state.setError);

  useEffect(() => {
    const handleOnline = () => {
      setError(null);
    };

    const handleOffline = () => {
      setError('You are currently offline. Some features may not be available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check initial status
    if (!navigator.onLine) {
      handleOffline();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setError]);
}

