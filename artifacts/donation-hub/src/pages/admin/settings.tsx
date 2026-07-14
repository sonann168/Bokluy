import { useEffect, useState } from 'react';
import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Settings, User, Wallet } from 'lucide-react';

const settingsSchema = z.object({
  streamerName: z.string().min(1, 'Name is required'),
  streamerBio: z.string().optional(),
  currency: z.string().min(1, 'Currency is required'),
  minDonationAmount: z.coerce.number().min(0.01, 'Must be greater than 0'),
  theme: z.string(),
});

type SettingsFormValues = z.infer<typeof settingsSchema>;

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar ($)' },
  { code: 'EUR', name: 'Euro (€)' },
  { code: 'GBP', name: 'British Pound (£)' },
  { code: 'KHR', name: 'Cambodian Riel (៛)' },
];

export default function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateMutation = useUpdateSettings();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      streamerName: '',
      streamerBio: '',
      currency: 'USD',
      minDonationAmount: 1,
      theme: 'dark',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        streamerName: settings.streamerName,
        streamerBio: settings.streamerBio || '',
        currency: settings.currency,
        minDonationAmount: settings.minDonationAmount,
        theme: settings.theme || 'dark',
      });
    }
  }, [settings, form]);

  const onSubmit = (data: SettingsFormValues) => {
    updateMutation.mutate(
      { data },
      {
        onSuccess: () => {
          toast({ title: 'Platform settings synchronized' });
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        },
        onError: (error: any) => {
          toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
        }
      }
    );
  };

  if (isLoading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-10 w-64 bg-white/10 rounded"></div>
      <div className="h-[400px] w-full bg-white/5 rounded-xl"></div>
    </div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-wider">PLATFORM CONFIGURATION</h1>
        <p className="text-muted-foreground text-sm">Manage your brand identity and payment parameters.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 md:col-span-2">
            
            <Card className="glass-card">
              <CardHeader className="border-b border-white/5 bg-white/5">
                <CardTitle className="font-heading tracking-wider flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  BROADCASTER IDENTITY
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  control={form.control}
                  name="streamerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Broadcaster Alias</FormLabel>
                      <FormControl>
                        <Input {...field} className="bg-background/50 border-white/10 focus-visible:border-primary" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="streamerBio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Public Transmission Bio</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          placeholder="Welcome to the hub! Leave a message..."
                          className="bg-background/50 border-white/10 h-24 resize-none" 
                        />
                      </FormControl>
                      <p className="text-xs text-muted-foreground mt-1">Displayed on the public donation page.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader className="border-b border-white/5 bg-white/5">
                <CardTitle className="font-heading tracking-wider flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-secondary" />
                  FINANCIAL PARAMETERS
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="currency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Currency</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-background/50 border-white/10">
                              <SelectValue placeholder="Select currency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {CURRENCIES.map(c => (
                              <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="minDonationAmount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Minimum Acceptable Value</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input type="number" step="0.01" {...field} className="bg-background/50 border-white/10 pl-8" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit" disabled={updateMutation.isPending} className="bg-primary hover:bg-primary/90 px-8 neon-border">
                {updateMutation.isPending ? 'Syncing...' : 'Save Configuration'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
