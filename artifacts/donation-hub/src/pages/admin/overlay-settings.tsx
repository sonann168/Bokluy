import { useState, useEffect } from 'react';
import { useGetSettings, useUpdateSettings, useSendTestAlert, getGetSettingsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { MonitorPlay, Copy, ExternalLink, PlayCircle, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { io } from 'socket.io-client';

export default function AdminOverlaySettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const testAlert = useSendTestAlert();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [socketStatus, setSocketStatus] = useState<'connecting' | 'connected' | 'error'>('connecting');
  const [copied, setCopied] = useState(false);

  // Local state for instant UI feedback before saving
  const [alertDuration, setAlertDuration] = useState(5);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    if (settings) {
      setAlertDuration(settings.alertDuration || 5);
      setOverlayEnabled(settings.overlayAlertEnabled !== false);
      setSoundEnabled(settings.soundEnabled !== false);
    }
  }, [settings]);

  useEffect(() => {
    // Check socket connection status
    const socket = io({ path: '/socket.io' });
    
    socket.on('connect', () => setSocketStatus('connected'));
    socket.on('connect_error', () => setSocketStatus('error'));
    
    return () => {
      socket.disconnect();
    };
  }, []);

  const handleSave = () => {
    updateSettings.mutate(
      { 
        data: { 
          alertDuration,
          overlayAlertEnabled: overlayEnabled,
          soundEnabled
        } 
      },
      {
        onSuccess: () => {
          toast({ title: 'Overlay parameters updated' });
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        }
      }
    );
  };

  const handleTestAlert = () => {
    testAlert.mutate(undefined, {
      onSuccess: () => {
        toast({ title: 'Test transmission sent to overlay' });
      }
    });
  };

  const overlayUrl = `${window.location.origin}/overlay`;

  const copyUrl = () => {
    navigator.clipboard.writeText(overlayUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast({ title: 'Overlay URL copied to clipboard' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-wider">OVERLAY CONTROL</h1>
        <p className="text-muted-foreground text-sm">Configure OBS browser source settings and test alerts.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="glass-card">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="font-heading tracking-wider flex items-center gap-2">
                <MonitorPlay className="w-5 h-5 text-primary" />
                OBS BROWSER SOURCE
              </CardTitle>
              <CardDescription>Add this URL as a Browser Source in OBS or Streamlabs.</CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="flex gap-2">
                <Input value={overlayUrl} readOnly className="bg-background/80 font-mono text-sm border-white/20 text-muted-foreground" />
                <Button variant="outline" onClick={copyUrl} className="shrink-0 border-primary/50 hover:bg-primary/20">
                  {copied ? <Zap className="w-4 h-4 text-yellow-500" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button asChild variant="outline" className="shrink-0 border-white/20">
                  <a href={overlayUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              </div>

              <div className="flex items-center gap-4 mt-6 p-4 rounded-lg bg-background/40 border border-white/5">
                <div className="flex-1">
                  <h4 className="font-medium text-sm">Socket.IO Connection</h4>
                  <p className="text-xs text-muted-foreground">Real-time alert delivery system status</p>
                </div>
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border
                  ${socketStatus === 'connected' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                    socketStatus === 'connecting' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                    'bg-red-500/10 text-red-500 border-red-500/30'}
                `}>
                  <span className={`w-2 h-2 rounded-full ${socketStatus === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-current'}`}></span>
                  {socketStatus}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button onClick={handleTestAlert} disabled={testAlert.isPending} className="bg-secondary text-secondary-foreground hover:bg-secondary/90 neon-border-secondary group">
                  <PlayCircle className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Trigger Test Alert
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="border-b border-white/5 bg-white/5">
              <CardTitle className="font-heading tracking-wider">ALERT CONFIGURATION</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable On-Screen Alerts</Label>
                  <p className="text-sm text-muted-foreground">Show visual popups when donations are received</p>
                </div>
                <Switch checked={overlayEnabled} onCheckedChange={setOverlayEnabled} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Enable Alert Sounds</Label>
                  <p className="text-sm text-muted-foreground">Play configured audio with the visual alert</p>
                </div>
                <Switch checked={soundEnabled} onCheckedChange={setSoundEnabled} />
              </div>

              <div className="space-y-4 pt-2">
                <div className="flex justify-between">
                  <Label className="text-base">Alert Display Duration</Label>
                  <span className="text-primary font-bold">{alertDuration} seconds</span>
                </div>
                <Slider 
                  value={[alertDuration]} 
                  onValueChange={(v) => setAlertDuration(v[0])} 
                  min={3} max={15} step={1}
                  className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:border-primary"
                />
                <p className="text-xs text-muted-foreground">How long the alert stays visible before fading out</p>
              </div>

              <div className="pt-6 border-t border-white/10 flex justify-end">
                <Button onClick={handleSave} disabled={updateSettings.isPending || isLoading} className="bg-primary hover:bg-primary/90">
                  {updateSettings.isPending ? 'Saving...' : 'Save Configuration'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-card bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg font-heading tracking-wider text-primary">OBS SETUP GUIDE</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <ol className="list-decimal list-inside space-y-3">
                <li>Open OBS Studio / Streamlabs</li>
                <li>Add a new <strong>Browser Source</strong> to your scene</li>
                <li>Paste the Overlay URL copied from the left</li>
                <li>Set Width to <strong>1920</strong> and Height to <strong>1080</strong> (or match your stream resolution)</li>
                <li>Check <strong>"Control audio via OBS"</strong> if you want to route alert sounds through your OBS audio mixer</li>
                <li>Click OK</li>
                <li>Use the <strong>Trigger Test Alert</strong> button to verify everything works!</li>
              </ol>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
