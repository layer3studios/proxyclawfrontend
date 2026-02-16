export type SubscriptionStatus = 'inactive' | 'active' | 'expired' | 'canceled';
export type UserTier = 'starter' | null;
export type AuthProvider = 'email' | 'google';

export interface User {
  id: string;
  email: string;
  tier: UserTier;
  subscriptionStatus: SubscriptionStatus;
  subscriptionExpiresAt?: string;     // ISO date string
  maxAgents: number;
  authProvider?: AuthProvider;
  createdAt?: string;
}

export type DeploymentStatus =
  | 'idle' | 'configuring' | 'provisioning' | 'starting'
  | 'healthy' | 'stopped' | 'error' | 'restarting';

export interface Deployment {
  id: string;
  subdomain: string;
  status: DeploymentStatus;
  url?: string;
  autoLoginUrl?: string;
  provisioningStep?: string;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  lastHeartbeat?: string;
  config?: Record<string, unknown>;
}

export interface DeploymentStatusResponse {
  id: string; status: DeploymentStatus; provisioningStep?: string;
  errorMessage?: string; url?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: { page?: number; limit?: number; total?: number; pages?: number };
}

export interface LoginRequest { email: string; password: string; }
export interface RegisterRequest { email: string; password: string; }
export interface CreateDeploymentRequest {
  name: string; model?: string; openaiApiKey?: string;
  anthropicApiKey?: string; googleApiKey?: string; telegramBotToken?: string;
}
export interface DeploymentActionRequest { action: 'start' | 'stop' | 'restart' | 'remove'; }

export interface CapacityInfo { maxSignups: number; usedSignups: number; seatsLeft: number; }

export interface AuthState {
  user: User | null; token: string | null;
  isAuthenticated: boolean; isLoading: boolean;
}
export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<void>;
  logout: () => void; refreshToken: () => Promise<void>;
}
export interface DeploymentCardProps {
  deployment: Deployment;
  onAction: (id: string, action: DeploymentActionRequest['action']) => void;
  isLoading?: boolean;
}
export interface CreateDeploymentFormProps {
  onSubmit: (data: CreateDeploymentRequest) => void; isLoading?: boolean;
}
export interface AnimatedCardProps { children: React.ReactNode; className?: string; layoutId?: string; }
