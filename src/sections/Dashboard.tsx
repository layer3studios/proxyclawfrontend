/**
 * Dashboard Section
 * Main dashboard with deployment list, create form, and pricing toggle.
 * Gates agent creation behind active subscription.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  RefreshCw,
  AlertCircle,
  CreditCard,
  List,
  Lock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

import { deploymentsApi } from '@/lib/api';
import type { CreateDeploymentRequest } from '@/types';
import { DeploymentCard } from '@/components/DeploymentCard';
import { CreateDeploymentForm } from '@/components/CreateDeploymentForm';
import { Pricing } from '@/sections/Pricing';
import BRAND from '@/config/brand';
import { useAuthStore } from '@/store/authStore';

// ============================================================================
// Internal Component: Agent List
// ============================================================================

function AgentList() {
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['deployments'],
    queryFn: () => deploymentsApi.list(1, 50),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'start' | 'stop' | 'restart' | 'remove' }) =>
      deploymentsApi.action(id, action),
    onSuccess: (_, variables) => {
      toast.success(`Agent ${variables.action}ed successfully`);
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
    },
    onError: (error) => {
      toast.error(`Action failed: ${(error as Error).message}`);
    },
  });

  const handleAction = (id: string, action: 'start' | 'stop' | 'restart' | 'remove') => {
    actionMutation.mutate({ id, action });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="h-48">
              <CardHeader>
                <Skeleton className="w-32 h-6" />
                <Skeleton className="w-20 h-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/50">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center py-8">
            <AlertCircle className="w-12 h-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">Failed to load agents</h3>
              <p className="text-muted-foreground">{(error as Error).message}</p>
            </div>
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const deployments = data?.deployments || [];

  if (deployments.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12">
            <div className="flex flex-col items-center gap-4 text-center">
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="p-4 bg-primary/10 rounded-full"
              >
                <Bot className="w-12 h-12 text-primary" />
              </motion.div>
              <div>
                <h3 className="text-xl font-semibold mb-2">No agents yet</h3>
                <p className="text-muted-foreground max-w-md">
                  Deploy your first AI agent to get started. It only takes a few seconds!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          {deployments.length} {deployments.length === 1 ? 'agent' : 'agents'} deployed
        </p>
        <Button variant="outline" size="icon" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" layout>
        <AnimatePresence mode="popLayout">
          {deployments.map((deployment, index) => (
            <motion.div
              key={deployment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
            >
              <DeploymentCard
                deployment={deployment}
                onAction={handleAction}
                isLoading={actionMutation.isPending}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ============================================================================
// Main Component: Deployment List Wrapper (Handles Switching)
// ============================================================================

function DeploymentList() {
  const { user } = useAuthStore();

  const hasActiveSub = user?.subscriptionStatus === 'active' && user?.tier === 'starter';

  // Default to pricing if no subscription
  const [view, setView] = useState<'list' | 'pricing'>(hasActiveSub ? 'list' : 'pricing');

  return (
    <div className="space-y-6">
      {/* Header with Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Dashboard</h2>
          <p className="text-muted-foreground">Manage your autonomous agents</p>
        </div>

        <div className="flex p-1 bg-muted rounded-lg">
          <Button
            variant={view === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => hasActiveSub && setView('list')}
            className="gap-2"
            disabled={!hasActiveSub}
          >
            {!hasActiveSub && <Lock className="w-3 h-3" />}
            <List className="w-4 h-4" />
            Agents
          </Button>
          <Button
            variant={view === 'pricing' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('pricing')}
            className="gap-2"
          >
            <CreditCard className="w-4 h-4" />
            Plans
          </Button>
        </div>
      </div>

      {/* Content Switching */}
      <AnimatePresence mode="wait">
        {view === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
          >
            <AgentList />
          </motion.div>
        ) : (
          <motion.div
            key="pricing"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <Pricing />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================================
// Create Form Wrapper
// ============================================================================

interface CreateFormProps {
  onSuccess: () => void;
}

function CreateForm({ onSuccess }: CreateFormProps) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const hasActiveSub = user?.subscriptionStatus === 'active' && user?.tier === 'starter';

  const createMutation = useMutation({
    mutationFn: (data: CreateDeploymentRequest) => deploymentsApi.create(data),
    onSuccess: () => {
      toast.success('Agent deployment started!');
      queryClient.invalidateQueries({ queryKey: ['deployments'] });
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Deployment failed: ${(error as Error).message}`);
    },
  });

  const handleSubmit = (data: CreateDeploymentRequest) => {
    createMutation.mutate(data);
  };

  // Block create if no subscription
  if (!hasActiveSub) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-12">
          <div className="flex flex-col items-center gap-3 text-center">
            <Lock className="w-10 h-10 text-muted-foreground" />
            <h3 className="text-lg font-semibold">Subscription Required</h3>
            <p className="text-muted-foreground max-w-sm">
              Subscribe to the {BRAND.plan.name} plan to deploy your first agent.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <CreateDeploymentForm
      onSubmit={handleSubmit}
      isLoading={createMutation.isPending}
    />
  );
}

// ============================================================================
// Dashboard Export
// ============================================================================

const Dashboard = {
  DeploymentList,
  CreateForm,
};

export default Dashboard;
