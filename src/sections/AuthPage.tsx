/**
 * Auth Page — Email + Google Sign-In, all text from brand config
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Sparkles, Mail, Lock, Loader2, ArrowRight, Bot, Shield, Zap, Server } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import BRAND from '@/config/brand';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Password is required'),
});
const registerSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(8, 'Min 8 characters').regex(/[A-Z]/, 'Need an uppercase').regex(/[a-z]/, 'Need a lowercase').regex(/[0-9]/, 'Need a number'),
});
type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

const featureIcons = [
  <Bot className="w-5 h-5" />,
  <Shield className="w-5 h-5" />,
  <Zap className="w-5 h-5" />,
  <Server className="w-5 h-5" />,
];

export function AuthPage() {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const { login, register, googleLogin } = useAuthStore();
  const [googleLoading, setGoogleLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({ resolver: zodResolver(loginSchema), defaultValues: { email: '', password: '' } });
  const registerForm = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema), defaultValues: { email: '', password: '' } });

  const onLogin = async (data: LoginFormData) => {
    try { await login(data.email, data.password); toast.success('Welcome back!'); }
    catch (error) { toast.error((error as Error).message); }
  };
  const onRegister = async (data: RegisterFormData) => {
    try { await register(data.email, data.password); toast.success('Account created!'); }
    catch (error) { toast.error((error as Error).message); }
  };
  const onGoogleSuccess = async (resp: any) => {
    if (!resp?.credential) { toast.error('Google sign-in failed'); return; }
    try { setGoogleLoading(true); await googleLogin(resp.credential); toast.success('Signed in with Google!'); }
    catch (error) { toast.error((error as Error).message); }
    finally { setGoogleLoading(false); }
  };

  const googleSection = GOOGLE_CLIENT_ID ? (
    <div className="space-y-4 mt-4">
      <div className="relative">
        <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <div className="flex justify-center">
        {googleLoading ? (
          <Button variant="outline" disabled className="w-full gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</Button>
        ) : (
          <GoogleLogin onSuccess={onGoogleSuccess} onError={() => toast.error('Google sign-in failed')}
            width="100%" size="large" theme="outline" text="continue_with" shape="rectangular" />
        )}
      </div>
    </div>
  ) : null;

  const authContent = (
    <Card className="border-2">
      <CardHeader className="text-center">
        <motion.div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"
          animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 4 }}>
          <Sparkles className="w-6 h-6 text-primary" />
        </motion.div>
        <CardTitle className="text-2xl">Welcome to {BRAND.name}</CardTitle>
        <CardDescription>Sign in to manage your AI agents</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Sign Up</TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <TabsContent value="login" className="mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Form {...loginForm}>
                  <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                    <FormField control={loginForm.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl>
                        <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="you@example.com" className="pl-10" /></div>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={loginForm.control} name="password" render={({ field }) => (
                      <FormItem><FormLabel>Password</FormLabel><FormControl>
                        <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="password" placeholder="••••••••" className="pl-10" /></div>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full gap-2" disabled={loginForm.formState.isSubmitting}>
                      {loginForm.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>}
                    </Button>
                  </form>
                </Form>
                {googleSection}
              </motion.div>
            </TabsContent>
            <TabsContent value="register" className="mt-0">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                <Form {...registerForm}>
                  <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                    <FormField control={registerForm.control} name="email" render={({ field }) => (
                      <FormItem><FormLabel>Email</FormLabel><FormControl>
                        <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="email" placeholder="you@example.com" className="pl-10" /></div>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                    <FormField control={registerForm.control} name="password" render={({ field }) => (
                      <FormItem><FormLabel>Password</FormLabel><FormControl>
                        <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input {...field} type="password" placeholder="••••••••" className="pl-10" /></div>
                      </FormControl><FormMessage /></FormItem>
                    )} />
                    <Button type="submit" className="w-full gap-2" disabled={registerForm.formState.isSubmitting}>
                      {registerForm.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating...</> : <><span>Create Account</span><ArrowRight className="w-4 h-4" /></>}
                    </Button>
                  </form>
                </Form>
                {googleSection}
              </motion.div>
            </TabsContent>
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  );

  const page = (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }} className="hidden lg:block">
          <div className="mb-8">
            <motion.div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6"
              animate={{ scale: [1, 1.02, 1] }} transition={{ repeat: Infinity, duration: 3 }}>
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">{BRAND.name}</span>
            </motion.div>
            <h1 className="text-4xl font-bold mb-4">
              {BRAND.tagline}
            </h1>
            <p className="text-lg text-muted-foreground">
              {BRAND.name} {BRAND.description}
            </p>
          </div>
          <div className="grid gap-4">
            {BRAND.features.map((feature, i) => (
              <motion.div key={feature.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 + 0.3 }} className="flex items-start gap-4 p-4 rounded-lg bg-card/50 border">
                <div className="p-2 bg-primary/10 rounded-lg text-primary">{featureIcons[i]}</div>
                <div>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          {authContent}
        </motion.div>
      </div>
    </div>
  );

  if (GOOGLE_CLIENT_ID) {
    return <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>{page}</GoogleOAuthProvider>;
  }
  return page;
}

export default AuthPage;
