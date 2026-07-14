import { useState } from 'react';
import { useListSounds, useCreateSound, useUpdateSound, useDeleteSound, getListSoundsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Volume2, Play, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const soundSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  url: z.string().url('Must be a valid URL'),
  volume: z.number().min(0).max(100).default(50),
  isActive: z.boolean().default(false),
});

export default function AdminSounds() {
  const { data: sounds, isLoading } = useListSounds();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [playingId, setPlayingId] = useState<number | null>(null);

  const createMutation = useCreateSound({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Audio asset registered' });
        queryClient.invalidateQueries({ queryKey: getListSoundsQueryKey() });
        setIsCreateOpen(false);
        form.reset();
      }
    }
  });

  const updateMutation = useUpdateSound({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSoundsQueryKey() });
      }
    }
  });

  const deleteMutation = useDeleteSound({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Audio asset removed' });
        queryClient.invalidateQueries({ queryKey: getListSoundsQueryKey() });
      }
    }
  });

  const form = useForm<z.infer<typeof soundSchema>>({
    resolver: zodResolver(soundSchema),
    defaultValues: {
      name: '',
      url: '',
      volume: 50,
      isActive: false,
    },
  });

  const handleVolumeChange = (id: number, volume: number) => {
    updateMutation.mutate({ id, data: { volume } });
  };

  const handleActiveToggle = (id: number, isActive: boolean) => {
    updateMutation.mutate({ id, data: { isActive } });
  };

  const playSound = (id: number, url: string, volume: number) => {
    setPlayingId(id);
    const audio = new Audio(url);
    audio.volume = volume / 100;
    audio.play()
      .catch(e => toast({ title: 'Playback failed', description: 'URL might be invalid or restricted', variant: 'destructive'}))
      .finally(() => {
        audio.onended = () => setPlayingId(null);
      });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-wider">AUDIO ASSETS</h1>
          <p className="text-muted-foreground text-sm">Manage sound effects for overlay alerts.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 neon-border">
              <Plus className="w-4 h-4 mr-2" />
              Add Sound
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-card border-white/10 sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-heading tracking-wider text-xl">REGISTER AUDIO ASSET</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(data => createMutation.mutate({ data }))} className="space-y-4 pt-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem><FormLabel>Alias</FormLabel><FormControl><Input placeholder="e.g. Level Up" {...field} className="bg-background/50" /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="url" render={({ field }) => (
                  <FormItem><FormLabel>File URL (.mp3, .wav)</FormLabel><FormControl><Input placeholder="https://..." {...field} className="bg-background/50" /></FormControl><FormMessage/></FormItem>
                )}/>
                <FormField control={form.control} name="volume" render={({ field }) => (
                  <FormItem>
                    <div className="flex justify-between"><FormLabel>Default Volume</FormLabel><span>{field.value}%</span></div>
                    <FormControl><Slider value={[field.value]} onValueChange={v => field.onChange(v[0])} max={100} step={1} /></FormControl>
                  </FormItem>
                )}/>
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={createMutation.isPending} className="w-full bg-primary hover:bg-primary/90">Deploy Asset</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <Card key={i} className="glass-card animate-pulse h-48"></Card>)
        ) : sounds?.length === 0 ? (
          <div className="col-span-full py-12 text-center text-muted-foreground glass-card rounded-xl border border-white/5">
            <Volume2 className="w-12 h-12 opacity-20 mx-auto mb-4" />
            <p>No audio assets found in database.</p>
          </div>
        ) : (
          sounds?.map((sound) => (
            <Card key={sound.id} className={`glass-card transition-all ${sound.isActive ? 'border-primary/50 bg-primary/5' : ''}`}>
              <CardHeader className="pb-3 border-b border-white/5 flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-heading tracking-wider truncate flex items-center gap-2">
                  {sound.isActive && <CheckCircle2 className="w-4 h-4 text-primary" />}
                  {sound.name}
                </CardTitle>
                <Switch 
                  checked={sound.isActive} 
                  onCheckedChange={(c) => handleActiveToggle(sound.id, c)}
                  title="Set as active alert sound" 
                />
              </CardHeader>
              <CardContent className="pt-4 pb-2 space-y-4">
                <div className="text-xs text-muted-foreground truncate font-mono bg-background/50 p-1.5 rounded border border-white/5" title={sound.url}>
                  {sound.url}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="flex items-center gap-1"><Volume2 className="w-3 h-3"/> Volume</span>
                    <span>{sound.volume}%</span>
                  </div>
                  <Slider 
                    defaultValue={[sound.volume]} 
                    onValueCommit={(v) => handleVolumeChange(sound.id, v[0])}
                    max={100} step={1}
                    className="[&_[role=slider]]:h-3 [&_[role=slider]]:w-3"
                  />
                </div>
              </CardContent>
              <CardFooter className="pt-2 flex justify-between">
                <Button 
                  variant="ghost" size="sm" 
                  className={playingId === sound.id ? "text-primary" : "text-muted-foreground"}
                  onClick={() => playSound(sound.id, sound.url, sound.volume)}
                >
                  <Play className={`w-4 h-4 mr-2 ${playingId === sound.id ? 'animate-pulse' : ''}`} />
                  Test
                </Button>
                <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    if(confirm('Delete this audio asset?')) deleteMutation.mutate({ id: sound.id });
                  }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
