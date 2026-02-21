/**
 * Main App Component — all branding from brand.ts
 */

import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Plus, LogOut, User, Sparkles, Menu, X, Lock,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

import { useAuthStore } from '@/store/authStore';
import { authApi } from '@/lib/api';
import Dashboard from '@/sections/Dashboard';
import AuthPage from '@/sections/AuthPage';
import BRAND, { getFooterText } from '@/config/brand';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000, retry: 2, refetchOnWindowFocus: false } },
});

function App() {
  const { isAuthenticated, isLoading, user, logout, setUser, setLoading } = useAuthStore();
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  const hasActiveSub = user?.subscriptionStatus === 'active' && user?.tier === 'starter';

  // Set document title from brand config
  useEffect(() => {
    document.title = `${BRAND.name} — ${BRAND.tagline}`;
  }, []);

  // Set page title from brand config
  useEffect(() => { document.title = `${BRAND.name} — ${BRAND.tagline}`; }, []);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setLoading(false); return; }
      try { const userData = await authApi.me(); setUser(userData); }
      catch { localStorage.removeItem('token'); setUser(null); }
      finally { setLoading(false); }
    };
    checkAuth();
  }, [setUser, setLoading]);

  const handleLogout = () => { logout(); toast.success('Logged out successfully'); };

  const tierLabel = hasActiveSub ? BRAND.plan.name : 'No Plan';

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </motion.div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <AuthPage />
        <Toaster position="top-center" />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-transparent flex flex-col">
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-2xl">
          <div className="container mx-auto px-4 h-16 max-w-6xl flex items-center justify-between">
            <motion.div className="flex items-center gap-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg ring-1 ring-primary/30">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="font-bold text-lg hidden sm:inline bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">{BRAND.name}</span>
            </motion.div>

            <motion.nav className="hidden md:flex items-center gap-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
              <Button
                onClick={() => {
                  if (!hasActiveSub) { toast(`Subscribe to the ${BRAND.plan.name} plan first.`); return; }
                  setShowCreateForm(!showCreateForm);
                }}
                className="gap-2 bg-primary hover:bg-primary/90 h-10" disabled={!hasActiveSub}>
                {hasActiveSub ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                New Agent
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 h-10">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                        {user?.email.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="max-w-[150px] truncate hidden lg:inline text-sm">{user?.email}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled><User className="w-4 h-4 mr-2" />{user?.email}</DropdownMenuItem>
                  <DropdownMenuItem disabled><LayoutDashboard className="w-4 h-4 mr-2" />Plan: {tierLabel}</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.nav>

            <Sheet>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="h-10"><Menu className="w-5 h-5" /></Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64">
                <div className="flex flex-col gap-4 mt-8">
                  <Button onClick={() => {
                    if (!hasActiveSub) { toast(`Subscribe to the ${BRAND.plan.name} plan first.`); return; }
                    setShowCreateForm(!showCreateForm);
                  }} className="gap-2 bg-primary hover:bg-primary/90" disabled={!hasActiveSub}>
                    {hasActiveSub ? <Plus className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    New Agent
                  </Button>
                  <div className="border-t border-border/40 pt-4">
                    <p className="text-sm text-muted-foreground mb-2">{user?.email}</p>
                    <p className="text-sm text-muted-foreground mb-4">Plan: {tierLabel}</p>
                    <Button variant="outline" onClick={handleLogout} className="w-full gap-2">
                      <LogOut className="w-4 h-4" />Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-6xl flex-1">
          <AnimatePresence mode="wait">
            {showCreateForm ? (
              <motion.div key="create-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Create New Agent</h2>
                  <Button variant="ghost" size="icon" onClick={() => setShowCreateForm(false)} className="h-10"><X className="w-5 h-5" /></Button>
                </div>
                <Dashboard.CreateForm onSuccess={() => setShowCreateForm(false)} />
              </motion.div>
            ) : null}
          </AnimatePresence>
          <Dashboard.DeploymentList />
        </main>

        <footer className="border-t border-border/40 mt-auto py-8 bg-background/40">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>{getFooterText()}</p>
          </div>
        </footer>
      </div>

      <Toaster position="top-center" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
