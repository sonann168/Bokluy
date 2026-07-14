import { useState } from 'react';
import { useListGoals, useCreateGoal, useUpdateGoal, useDeleteGoal, useGetSettings, getListGoalsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Target, Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const goalSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  targetAmount: z.coerce.number().min(1, 'Target amount must be at least 1'),
  currency: z.string().default('USD'),
  isActive: z.boolean().default(false),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function AdminGoals() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data: goals, isLoading } = useListGoals();
  const { data: settings } = useGetSettings();
  
  const createMutation = useCreateGoal({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Goal established successfully' });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        setIsCreateOpen(false);
        form.reset();
      }
    }
  });

  const updateMutation = useUpdateGoal({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Goal parameters updated' });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
        setEditingGoal(null);
      }
    }
  });

  const deleteMutation = useDeleteGoal({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Goal eradicated' });
        queryClient.invalidateQueries({ queryKey: getListGoalsQueryKey() });
      }
    }
  });

  const currency = settings?.currency || 'USD';
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: '',
      description: '',
      targetAmount: 100,
      currency: currency,
      isActive: false,
    },
  });

  const editForm = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
  });

  const onSubmitCreate = (data: GoalFormValues) => {
    createMutation.mutate({ data });
  };

  const onSubmitEdit = (data: GoalFormValues) => {
    if (editingGoal) {
      updateMutation.mutate({ id: editingGoal.id, data });
    }
  };

  const startEdit = (goal: any) => {
    setEditingGoal(goal);
    editForm.reset({
      title: goal.title,
      description: goal.description || '',
      targetAmount: goal.targetAmount,
      currency: goal.currency,
      isActive: goal.isActive,
    });
  };

  const setAsActive = (id: number) => {
    // This implicitly deactivates others if the backend handles it, 
    // or we might need to send a specific request
    updateMutation.mutate({ id, data: { isActive: true } });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-wider">DIRECTIVES & GOALS</h1>
          <p className="text-muted-foreground text-sm">Set targets for your community to rally behind.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 neon-border">
              <Plus className="w-4 h-4 mr-2" />
              New Directive
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-heading tracking-wider text-xl">INITIALIZE NEW GOAL</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitCreate)} className="space-y-4 pt-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Goal Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. New PC Fund, Charity Stream" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (Optional)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Details about this goal..." {...field} className="bg-background/50 resize-none h-20" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Target Amount ({currency})</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-background/50" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border border-white/10 p-4 bg-background/30">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Set as Active Goal</FormLabel>
                        <div className="text-sm text-muted-foreground">Make this the primary goal on the overlay.</div>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90">
                    {createMutation.isPending ? 'Processing...' : 'Deploy Goal'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} className="glass-card animate-pulse h-64"></Card>
          ))
        ) : goals?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground glass-card rounded-xl border border-white/5">
            <Target className="w-12 h-12 opacity-20 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No active directives</h3>
            <p>Create a goal to give your supporters something to aim for.</p>
          </div>
        ) : (
          goals?.map((goal) => (
            <Card key={goal.id} className={`glass-card relative overflow-hidden transition-all duration-300 ${goal.isActive ? 'neon-border scale-[1.02]' : 'border-white/5 hover:border-white/20'}`}>
              {goal.isActive && (
                <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> ACTIVE
                </div>
              )}
              
              <CardHeader className="pb-2">
                <CardTitle className="font-heading tracking-wider flex justify-between items-start pr-12">
                  <span className="truncate" title={goal.title}>{goal.title}</span>
                </CardTitle>
                {goal.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{goal.description}</p>}
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex justify-between items-end mt-4">
                  <div className="text-2xl font-heading font-bold text-highlight">
                    {formatMoney(goal.currentAmount)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    / {formatMoney(goal.targetAmount)}
                  </div>
                </div>
                
                <div className="relative">
                  <Progress 
                    value={Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)} 
                    className={`h-3 bg-background/50 border border-white/10 ${goal.isActive ? '[&>div]:bg-primary' : '[&>div]:bg-muted-foreground'}`}
                  />
                </div>
                
                <div className="text-xs text-right text-muted-foreground font-medium">
                  {Math.round((goal.currentAmount / goal.targetAmount) * 100)}% Complete
                </div>
              </CardContent>
              
              <CardFooter className="flex justify-between pt-4 border-t border-white/5 bg-white/5">
                {!goal.isActive ? (
                  <Button variant="outline" size="sm" className="text-xs border-white/10 hover:border-primary/50 hover:text-primary" onClick={() => setAsActive(goal.id)}>
                    Set Active
                  </Button>
                ) : (
                  <div className="text-xs text-primary font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span> Broadcasting to overlay
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Dialog open={editingGoal?.id === goal.id} onOpenChange={(open) => !open && setEditingGoal(null)}>
                    <DialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10" onClick={() => startEdit(goal)}>
                        <Pencil className="w-4 h-4 text-muted-foreground hover:text-white" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle className="font-heading tracking-wider text-xl">MODIFY GOAL</DialogTitle>
                      </DialogHeader>
                      <Form {...editForm}>
                        <form onSubmit={editForm.handleSubmit(onSubmitEdit)} className="space-y-4 pt-4">
                          <FormField control={editForm.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Goal Title</FormLabel><FormControl><Input {...field} className="bg-background/50" /></FormControl></FormItem>
                          )}/>
                          <FormField control={editForm.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} className="bg-background/50 resize-none h-20" /></FormControl></FormItem>
                          )}/>
                          <FormField control={editForm.control} name="targetAmount" render={({ field }) => (
                            <FormItem><FormLabel>Target Amount</FormLabel><FormControl><Input type="number" {...field} className="bg-background/50" /></FormControl></FormItem>
                          )}/>
                          <DialogFooter>
                            <Button type="submit" disabled={updateMutation.isPending}>Save Changes</Button>
                          </DialogFooter>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                  
                  <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-destructive/20 hover:text-destructive" 
                    onClick={() => {
                      if(confirm('Are you sure you want to delete this goal?')) {
                        deleteMutation.mutate({ id: goal.id });
                      }
                    }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
