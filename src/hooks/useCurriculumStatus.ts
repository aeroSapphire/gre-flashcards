
import { useState, useEffect, useCallback } from 'react';
import {
  getCurriculumStatus,
  PhaseStatus,
  LearningPhase,
  PHASE_NAMES,
  generateCurriculumNudge
} from '@/services/curriculumOrchestrator';

interface UseCurriculumStatusReturn {
  status: PhaseStatus | null;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  nudgeMessage: string | null;
}

/**
 * React hook for accessing curriculum orchestrator status.
 * Fetches and caches the user's learning phase and recommendations.
 */
export function useCurriculumStatus(): UseCurriculumStatusReturn {
  const [status, setStatus] = useState<PhaseStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const curriculumStatus = await getCurriculumStatus();
      setStatus(curriculumStatus);
    } catch (err) {
      console.error('Failed to fetch curriculum status:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch curriculum status'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  // Generate nudge message from status
  const nudgeMessage = status ? generateCurriculumNudge(status) : null;

  return {
    status,
    loading,
    error,
    refresh: fetchStatus,
    nudgeMessage
  };
}

/**
 * Lightweight hook that only returns the current phase.
 */
export function useCurrentPhase(): {
  phase: LearningPhase | null;
  phaseName: string | null;
  loading: boolean;
} {
  const { status, loading } = useCurriculumStatus();

  return {
    phase: status?.currentPhase ?? null,
    phaseName: status ? PHASE_NAMES[status.currentPhase] : null,
    loading
  };
}
