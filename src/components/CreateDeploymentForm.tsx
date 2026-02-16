import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Rocket, Bot, MessageCircle, ChevronRight, ChevronLeft, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { CreateDeploymentRequest } from '@/types';

// Updated Validation Schema
const formSchema = z.object({
  name: z.string().min(3).max(63).regex(/^[a-z0-9][a-z0-9-_]*[a-z0-9]$/, 'Alphanumeric only'),
  model: z.string(),
  openaiApiKey: z.string().optional(),
  anthropicApiKey: z.string().optional(),
  googleApiKey: z.string().optional(), // Added
  telegramBotToken: z.string().optional(),
}).refine(data => data.openaiApiKey || data.anthropicApiKey || data.googleApiKey, {
  message: "Please provide at least one API key",
  path: ["googleApiKey"],
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  onSubmit: (data: CreateDeploymentRequest) => void;
  isLoading?: boolean;
}

type Step = 'basics' | 'keys' | 'channels' | 'confirm';

export function CreateDeploymentForm({ onSubmit, isLoading }: Props) {
  const [step, setStep] = useState<Step>('basics');
  const [direction, setDirection] = useState(1);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      model: 'google/gemini-1.5-flash', // Default to free/fast model
      openaiApiKey: '',
      anthropicApiKey: '',
      googleApiKey: '',
      telegramBotToken: '',
    },
  });

  const next = async (target: Step) => {
    let valid = false;
    if (step === 'basics') valid = await form.trigger(['name', 'model']);
    if (step === 'keys') valid = await form.trigger(['openaiApiKey', 'anthropicApiKey', 'googleApiKey']);
    if (step === 'channels') valid = true;

    if (valid) {
      setDirection(1);
      setStep(target);
    }
  };

  const back = (target: Step) => {
    setDirection(-1);
    setStep(target);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 50 : -50, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir < 0 ? 50 : -50, opacity: 0 }),
  };

  const handleFormSubmit = (data: FormData) => {
    const requestData: CreateDeploymentRequest = {
      name: data.name,
      model: data.model,
      openaiApiKey: data.openaiApiKey || undefined, 
      anthropicApiKey: data.anthropicApiKey || undefined,
      googleApiKey: data.googleApiKey || undefined, // Added
      telegramBotToken: data.telegramBotToken || undefined,
    };
    onSubmit(requestData);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle>Deploy Agent</CardTitle>
            <CardDescription>Setup your autonomous AI assistant</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <AnimatePresence mode="wait" custom={direction}>
              
              {/* STEP 1: BASICS */}
              {step === 'basics' && (
                <motion.div key="basics" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Agent Name (Subdomain)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Bot className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                          <Input {...field} className="pl-10" placeholder="my-agent" autoFocus />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="model" render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI Model</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="google/gemini-1.5-flash">Gemini 1.5 Flash (Fastest)</SelectItem>
                          <SelectItem value="google/gemini-1.5-pro">Gemini 1.5 Pro (Reasoning)</SelectItem>
                          <SelectItem value="anthropic/claude-3-5-sonnet">Claude 3.5 Sonnet</SelectItem>
                          <SelectItem value="openai/gpt-4o">GPT-4o</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>The brain of your agent.</FormDescription>
                    </FormItem>
                  )} />
                </motion.div>
              )}

              {/* STEP 2: KEYS */}
              {step === 'keys' && (
                <motion.div key="keys" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  <Tabs defaultValue="google">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="google">Google</TabsTrigger>
                      <TabsTrigger value="anthropic">Anthropic</TabsTrigger>
                      <TabsTrigger value="openai">OpenAI</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="google">
                      <FormField control={form.control} name="googleApiKey" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Gemini API Key</FormLabel>
                          <FormControl><Input {...field} type="password" placeholder="AIza..." /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>

                    <TabsContent value="anthropic">
                      <FormField control={form.control} name="anthropicApiKey" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Anthropic API Key</FormLabel>
                          <FormControl><Input {...field} type="password" placeholder="sk-ant-..." /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>

                    <TabsContent value="openai">
                      <FormField control={form.control} name="openaiApiKey" render={({ field }) => (
                        <FormItem>
                          <FormLabel>OpenAI API Key</FormLabel>
                          <FormControl><Input {...field} type="password" placeholder="sk-..." /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </TabsContent>
                  </Tabs>
                </motion.div>
              )}

              {/* STEP 3: CHANNELS */}
              {step === 'channels' && (
                <motion.div key="channels" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  <div className="bg-blue-500/10 p-4 rounded-md flex gap-3 text-blue-600 mb-4">
                    <MessageCircle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">Connect your agent to messaging apps. (Optional)</p>
                  </div>
                  <FormField control={form.control} name="telegramBotToken" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram Bot Token</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11" />
                      </FormControl>
                      <FormDescription>From @BotFather on Telegram</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )} />
                </motion.div>
              )}

              {/* STEP 4: CONFIRM */}
              {step === 'confirm' && (
                <motion.div key="confirm" custom={direction} variants={slideVariants} initial="enter" animate="center" exit="exit" className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between"><span>Name</span><span className="font-medium">{form.watch('name')}</span></div>
                    <div className="flex justify-between"><span>Model</span><span className="font-medium">{form.watch('model')}</span></div>
                    <div className="flex justify-between"><span>Telegram</span><span className="font-medium">{form.watch('telegramBotToken') ? 'Connected' : 'None'}</span></div>
                  </div>
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-md">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm font-medium">Ready to launch!</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex justify-between pt-2">
              {step === 'basics' ? <div /> : (
                <Button type="button" variant="outline" onClick={() => back(step === 'keys' ? 'basics' : step === 'channels' ? 'keys' : 'channels')}>
                  <ChevronLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}
              
              {step === 'basics' && <Button type="button" onClick={() => next('keys')}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>}
              {step === 'keys' && <Button type="button" onClick={() => next('channels')}>Next <ChevronRight className="w-4 h-4 ml-2" /></Button>}
              {step === 'channels' && <Button type="button" onClick={() => next('confirm')}>Review <ChevronRight className="w-4 h-4 ml-2" /></Button>}
              {step === 'confirm' && (
                <Button type="submit" disabled={isLoading} className="gap-2">
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  Deploy Agent
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}