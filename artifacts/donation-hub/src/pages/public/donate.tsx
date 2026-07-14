import { useState } from 'react';
import { useLocation } from 'wouter';
import { useCreateDonation, useGetSettings } from '@workspace/api-client-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Wallet, Shield, Zap, Coffee } from 'lucide-react';
import { motion } from 'framer-motion';

const PRESET_AMOUNTS = [5, 10, 20, 50, 100];

export default function DonatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: settings } = useGetSettings();
  const [customAmount, setCustomAmount] = useState(false);

  const minAmount = settings?.minDonationAmount || 1;
  const currency = settings?.currency || 'USD';

  const donateSchema = z.object({
    donorName: z.string().min(1, 'Name is required').max(50),
    isAnonymous: z.boolean().default(false),
    amount: z.coerce.number().min(minAmount, `Minimum amount is ${minAmount}`),
    message: z.string().max(255, 'Message too long').optional(),
  });

  type DonateFormValues = z.infer<typeof donateSchema>;

  const form = useForm<DonateFormValues>({
    resolver: zodResolver(donateSchema),
    defaultValues: {
      donorName: '',
      isAnonymous: false,
      amount: 5,
      message: '',
    },
  });

  const createDonation = useCreateDonation({
    mutation: {
      onSuccess: (data) => {
        // In a real app, this would redirect to ABA PayWay
        // For this demo, we simulate a successful redirect or test flow
        window.location.href = data.paymentUrl || `/donate/pending?id=${data.donation.id}`;
      },
      onError: (error: any) => {
        toast({
          title: 'Transmission Failed',
          description: error.message || 'Could not initiate donation process.',
          variant: 'destructive',
        });
      }
    }
  });

  const onSubmit = (data: DonateFormValues) => {
    createDonation.mutate({
      data: {
        ...data,
        currency,
      }
    });
  };

  const handlePresetClick = (amount: number) => {
    form.setValue('amount', amount);
    setCustomAmount(false);
  };

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4 py-12">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-wider uppercase mb-2">
            SUPPORT THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-highlight neon-text">STREAM</span>
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            {settings?.streamerBio || "Your support keeps the broadcasts running. Leave a message to trigger an alert on screen!"}
          </p>
        </div>

        <Card className="glass-card border-primary/30 neon-border overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-highlight to-secondary"></div>
          
          <CardContent className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                
                {/* Amount Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg font-heading tracking-wider">SELECT AMOUNT</Label>
                    <span className="text-sm font-bold text-primary px-2 py-1 rounded bg-primary/10 border border-primary/20">
                      {currency}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {PRESET_AMOUNTS.map((amount) => (
                      <Button
                        key={amount}
                        type="button"
                        variant={form.watch('amount') === amount && !customAmount ? 'default' : 'outline'}
                        className={`h-14 font-heading text-xl font-bold ${
                          form.watch('amount') === amount && !customAmount 
                            ? 'bg-primary neon-border hover:bg-primary/90' 
                            : 'bg-background/50 border-white/10 hover:border-primary/50'
                        }`}
                        onClick={() => handlePresetClick(amount)}
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>

                  {customAmount ? (
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="animate-in slide-in-from-top-2">
                          <FormControl>
                            <div className="relative mt-4">
                              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</span>
                              <Input 
                                type="number" 
                                step="1"
                                className="h-16 pl-10 text-2xl font-heading font-bold bg-background/80 border-primary/50 focus-visible:ring-primary"
                                {...field} 
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <Button 
                      type="button" 
                      variant="ghost" 
                      className="w-full text-muted-foreground hover:text-white"
                      onClick={() => setCustomAmount(true)}
                    >
                      Enter custom amount
                    </Button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="donorName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Display Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter your alias" {...field} className="bg-background/50 border-white/10 focus-visible:border-primary h-12" disabled={form.watch('isAnonymous')} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isAnonymous"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4 bg-background/30">
                          <div className="space-y-0.5">
                            <FormLabel className="text-sm">Ghost Protocol (Anonymous)</FormLabel>
                            <p className="text-xs text-muted-foreground">Hide your identity on stream.</p>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={(v) => {
                              field.onChange(v);
                              if (v) form.setValue('donorName', 'Anonymous');
                              else form.setValue('donorName', '');
                            }} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between items-end">
                            <FormLabel className="uppercase text-xs tracking-wider text-muted-foreground">Transmission Message</FormLabel>
                            <span className="text-xs text-muted-foreground">{field.value?.length || 0}/255</span>
                          </div>
                          <FormControl>
                            <Textarea 
                              placeholder="Write a message to be read on stream..." 
                              className="bg-background/50 border-white/10 focus-visible:border-primary h-[126px] resize-none"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                  <Button 
                    type="submit" 
                    className="w-full h-16 text-xl font-heading font-bold tracking-widest bg-primary hover:bg-primary/90 neon-border relative overflow-hidden group"
                    disabled={createDonation.isPending}
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    <span className="relative flex items-center justify-center gap-2">
                      <Wallet className="w-6 h-6" />
                      {createDonation.isPending ? 'INITIATING TRANSFER...' : `DONATE ${form.watch('amount') ? '$' + form.watch('amount') : ''} VIA ABA PAYWAY`}
                    </span>
                  </Button>
                  <div className="flex items-center justify-center gap-2 mt-4 text-xs text-muted-foreground">
                    <Shield className="w-4 h-4" /> Secure transaction processed by ABA PayWay
                  </div>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// Quick inline component to avoid creating another file just for Label
function Label({ className, children }: { className?: string, children: React.ReactNode }) {
  return <label className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className || ''}`}>{children}</label>;
}
