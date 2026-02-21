/**
 * DeploymentCard Component
 * 
 * Animated card showing deployment status with morphing transitions.
 * Implements the "hatching" animation concept.
 */

import  React,{ useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Square,
  RefreshCw,
  Trash2,
  ExternalLink,
  Terminal,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Egg
} from 'lucide-react';
import type { Deployment, DeploymentStatus } from '@/types';
import { useDeploymentStatus } from '@/hooks/useDeploymentStatus';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

// ============================================================================
// Types
// ============================================================================

interface DeploymentCardProps {
  deployment: Deployment;
  onAction: (id: string, action: 'start' | 'stop' | 'restart' | 'remove') => void;
  isLoading?: boolean;
}

// ============================================================================
// Status Configuration
// ============================================================================

const STATUS_CONFIG: Record<DeploymentStatus, {
  label: string;
  color: string;
  bgColor: string;
  icon: React.ReactNode;
  progress?: number;
}> = {
  idle: {
    label: 'Idle',
    color: 'text-gray-500',
    bgColor: 'bg-gray-500/10',
    icon: <Egg className="w-4 h-4" />,
  },
  configuring: {
    label: 'Configuring',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    progress: 20,
  },
  provisioning: {
    label: 'Provisioning',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    progress: 40,
  },
  starting: {
    label: 'Starting',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
    progress: 70,
  },
  healthy: {
    label: 'Running',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    icon: <CheckCircle2 className="w-4 h-4" />,
    progress: 100,
  },
  stopped: {
    label: 'Stopped',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    icon: <Square className="w-4 h-4" />,
  },
  error: {
    label: 'Error',
    color: 'text-red-500',
    bgColor: 'bg-red-500/10',
    icon: <AlertCircle className="w-4 h-4" />,
  },
  restarting: {
    label: 'Restarting',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    icon: <RefreshCw className="w-4 h-4 animate-spin" />,
    progress: 50,
  },
};

// ============================================================================
// Component
// ============================================================================

export function DeploymentCard({ deployment, onAction, isLoading }: DeploymentCardProps) {
  const [showLogs, setShowLogs] = useState(false);

  // Use smart polling for status updates
  const {
    data: statusData,
    isDeploying,
    isHealthy
  } = useDeploymentStatus(deployment.id, {
    enabled: deployment.status !== 'stopped' && deployment.status !== 'error',
  });

  const currentStatus = statusData?.status || deployment.status;
  const statusConfig = STATUS_CONFIG[currentStatus];
  const progress = statusConfig.progress || 0;

  // const handleOpenAgent = () => {
  //   if (deployment.autoLoginUrl) {
  //     window.open(deployment.autoLoginUrl, '_blank');
  //   } else if (deployment.url) {
  //     window.open(deployment.url, '_blank');
  //   }
  // };

  return (
    <motion.div
      layout
      layoutId={`deployment-card-${deployment.id}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <Card className="overflow-hidden border border-border/50 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <motion.div
                className={`p-2.5 rounded-lg ${statusConfig.bgColor} group-hover:scale-110 transition-transform duration-300`}
                animate={isDeploying ? { scale: [1, 1.1, 1] } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {statusConfig.icon}
              </motion.div>
              <div>
                <h3 className="font-semibold text-base">{deployment.subdomain}</h3>
                <p className="text-xs text-muted-foreground">
                  Created {new Date(deployment.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <Badge variant="secondary" className={`${statusConfig.color} ${statusConfig.bgColor} px-3 py-1`}>
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Progress Bar for Deploying States */}
          <AnimatePresence>
            {isDeploying && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">
                  {statusData?.provisioningStep || deployment.provisioningStep || 'Initializing...'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {currentStatus === 'error' && (statusData?.errorMessage || deployment.errorMessage) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg"
              >
                <p className="text-sm text-red-600">
                  {statusData?.errorMessage || deployment.errorMessage}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            {isHealthy && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <Button
                  className="gap-2 bg-primary hover:bg-primary/90 h-9 text-sm"
                  onClick={() => {
                    if (deployment.url) {
                      window.open(deployment.url, '_blank');
                    }
                  }}
                  disabled={deployment.status !== 'healthy'}
                >
                  <ExternalLink className="w-4 h-4" />
                  Open Agent
                </Button>
              </motion.div>
            )}

            {(currentStatus === 'stopped' || currentStatus === 'error') && (
              <Button
                onClick={() => onAction(deployment.id, 'start')}
                disabled={isLoading}
                variant="outline"
                className="gap-2 h-9 text-sm"
              >
                <Play className="w-4 h-4" />
                Start
              </Button>
            )}

            {isHealthy && (
              <>
                <Button
                  onClick={() => onAction(deployment.id, 'stop')}
                  disabled={isLoading}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                >
                  <Square className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => onAction(deployment.id, 'restart')}
                  disabled={isLoading}
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                >
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </>
            )}

            <Button
              onClick={() => setShowLogs(!showLogs)}
              variant="outline"
              size="icon"
              className="h-9 w-9"
            >
              <Terminal className="w-4 h-4" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Deployment?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the agent &quot;{deployment.subdomain}&quot; and all its data.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onAction(deployment.id, 'remove')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Logs Panel */}
          <AnimatePresence>
            {showLogs && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <DeploymentLogs deploymentId={deployment.id} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ============================================================================
// Deployment Logs Sub-component
// ============================================================================

function DeploymentLogs({ deploymentId }: { deploymentId: string }) {
  const [logs, setLogs] = React.useState<string>('');
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchLogs = async () => {
      try {
        const { deploymentsApi } = await import('@/lib/api');
        const data = await deploymentsApi.getLogs(deploymentId, 50);
        setLogs(data.logs);
      } catch (error) {
        setLogs('Failed to load logs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [deploymentId]);

  return (
    <div className="bg-black rounded-lg p-4 font-mono text-sm text-green-400 overflow-auto max-h-48">
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading logs...
        </div>
      ) : (
        <pre className="whitespace-pre-wrap break-all">{logs || 'No logs available'}</pre>
      )}
    </div>
  );
}

export default DeploymentCard;
