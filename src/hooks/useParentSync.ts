/**
 * useParentSync Hook - Real-time sync for parent health data
 * Now uses the updated FamilyService with proper link code matching
 */

import { useState, useEffect, useCallback } from 'react';
import FamilyService, { ParentHealthSummary } from '@/lib/family-service';

interface UseParentSyncReturn {
    parents: ParentHealthSummary[];
    loading: boolean;
    error: string | null;
    lastUpdated: Date | null;
    refresh: () => void;
}

const SYNC_INTERVAL = 30000; // 30 seconds

export function useParentSync(childUserId: string): UseParentSyncReturn {
    const [parents, setParents] = useState<ParentHealthSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

    const fetchParentData = useCallback(() => {
        try {
            const familyService = FamilyService.getInstance();
            const summaries = familyService.getLinkedParentsSummaries(childUserId);

            setParents(summaries);
            setLastUpdated(new Date());
            setError(null);
        } catch (err) {
            setError('Failed to fetch parent health data');
            console.error('Parent sync error:', err);
        } finally {
            setLoading(false);
        }
    }, [childUserId]);

    const refresh = useCallback(() => {
        setLoading(true);
        fetchParentData();
    }, [fetchParentData]);

    // Initial fetch and polling
    useEffect(() => {
        fetchParentData();

        // Set up polling
        const intervalId = setInterval(fetchParentData, SYNC_INTERVAL);

        // Cleanup
        return () => clearInterval(intervalId);
    }, [fetchParentData]);

    // Refresh when tab becomes visible
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                fetchParentData();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [fetchParentData]);

    return { parents, loading, error, lastUpdated, refresh };
}

export default useParentSync;
