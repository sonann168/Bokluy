import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminLogin } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Target, Shield, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const loginMutation = useAdminLogin({
    mutation: {
      onSuccess: (data) => {
        localStorage.setItem('admin_token', data.token);
        toast({
          title: 'Welcome back, Commander',
          description: 'Access granted to mainframe.',
        });
        setLocation('/admin');
      },
      onError: (error) => {
        toast({
          title: 'Access Denied',
          description: error.message || 'Invalid credentials.',
          variant: 'destructive',
        });
      }
    }
  });

  function onSubmit(data: LoginFormValues) {
    loginMutation.mutate({ data });
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden selection:bg-primary/30">
      {/* Background Effects */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex items-center justify-center gap-3 mb-8 group">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40 group-hover:bg-primary/30 transition-all duration-300">
            <Target className="w-6 h-6 text-primary" />
          </div>
          <span className="font-heading font-bold text-3xl tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-primary via-highlight to-secondary">
            IMUZAKI
          </span>
        </Link>

        <div className="glass-card rounded-xl p-8 neon-border relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-highlight to-primary"></div>
          
          <div className="flex flex-col items-center mb-8">
            <div className="w-12 h-12 rounded-full bg-background border border-primary/30 flex items-center justify-center mb-4 neon-border">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold tracking-wider">SECURE ACCESS</h1>
            <p className="text-muted-foreground text-sm mt-1">Identify yourself to continue</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Admin ID" 
                          {...field} 
                          className="bg-background/50 border-white/10 focus-visible:ring-primary h-12 pl-10"
                        />
                        <Shield className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-muted-foreground uppercase text-xs tracking-wider">Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="password" 
                          placeholder="••••••••" 
                          {...field} 
                          className="bg-background/50 border-white/10 focus-visible:ring-primary h-12 pl-10"
                        />
                        <Lock className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-bold tracking-wider neon-border"
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'AUTHENTICATING...' : 'INITIALIZE LOGIN'}
              </Button>
            </form>
          </Form>
        </div>
        
        <div className="text-center mt-6">
          <Link href="/" className="text-xs text-muted-foreground hover:text-primary transition-colors">
            &larr; Return to public hub
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
