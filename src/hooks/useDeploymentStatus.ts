/**
 * useDeploymentStatus Hook
 * 
 * Smart polling hook for monitoring deployment status.
 * Polls rapidly during startup, stops when healthy.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { deploymentsApi } from '@/lib/api';
import type { DeploymentStatus, DeploymentStatusResponse } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const POLLING_INTERVAL_ACTIVE = 1000; // 1 second during startup
const POLLING_INTERVAL_HEALTHY = 30000; // 30 seconds when healthy
const POLLING_INTERVAL_ERROR = 5000; // 5 seconds on error

// ============================================================================
// Hook
// ============================================================================

interface UseDeploymentStatusOptions {
  enabled?: boolean;
  onStatusChange?: (status: DeploymentStatus, data: DeploymentStatusResponse) => void;
}

export function useDeploymentStatus(
  deploymentId: string | undefined,
  options: UseDeploymentStatusOptions = {}
) {
  const { enabled = true, onStatusChange } = options;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['deployment-status', deploymentId],
    queryFn: async () => {
      if (!deploymentId) throw new Error('Deployment ID required');
      return deploymentsApi.getStatus(deploymentId);
    },
    enabled: !!deploymentId && enabled,
    refetchInterval: (query) => {
      const data = query?.state?.data as DeploymentStatusResponse | undefined;
      if (!data) return POLLING_INTERVAL_ACTIVE;
      
      // Dynamic polling based on status
      switch (data.status) {
        case 'configuring':
        case 'provisioning':
        case 'starting':
        case 'restarting':
          return POLLING_INTERVAL_ACTIVE;
        case 'error':
        case 'stopped':
          return POLLING_INTERVAL_ERROR;
        case 'healthy':
        default:
          return POLLING_INTERVAL_HEALTHY;
      }
    },
    staleTime: 500,
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // Invalidate related queries when status changes
  const previousStatus = queryClient.getQueryData<DeploymentStatusResponse>(
    ['deployment-status', deploymentId]
  )?.status;

  if (query.data && query.data.status !== previousStatus) {
    onStatusChange?.(query.data.status, query.data);
    
    // Invalidate the main deployment query to refresh full data
    queryClient.invalidateQueries({
      queryKey: ['deployment', deploymentId],
    });
    
    // Invalidate deployments list
    queryClient.invalidateQueries({
      queryKey: ['deployments'],
    });
  }

  return {
    ...query,
    isDeploying: query.data 
      ? ['configuring', 'provisioning', 'starting', 'restarting'].includes(query.data.status)
      : false,
    isHealthy: query.data?.status === 'healthy',
    isError: query.data?.status === 'error',
    isStopped: query.data?.status === 'stopped',
  };
}

export default useDeploymentStatus;
