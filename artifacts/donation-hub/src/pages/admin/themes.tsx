import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Check, Zap, Moon, Flame, Snowflake } from 'lucide-react';
import { motion } from 'framer-motion';

interface ThemePreset {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    highlight: string;
    bg: string;
  };
  isActive?: boolean;
}

const THEME_PRESETS: ThemePreset[] = [
  {
    id: 'cosmic-purple',
    name: 'Cosmic Purple',
    description: 'Default dark esports theme with neon purple accents',
    icon: Zap,
    colors: { primary: '#7B2EFF', secondary: '#FFB100', accent: '#FF5A36', highlight: '#45B7FF', bg: '#0D0118' },
    isActive: true,
  },
  {
    id: 'midnight-ocean',
    name: 'Midnight Ocean',
    description: 'Deep ocean blues with cyan highlights',
    icon: Snowflake,
    colors: { primary: '#0EA5E9', secondary: '#22D3EE', accent: '#6366F1', highlight: '#38BDF8', bg: '#020617' },
  },
  {
    id: 'ember-forge',
    name: 'Ember Forge',
    description: 'Fiery reds and oranges for aggressive streamers',
    icon: Flame,
    colors: { primary: '#EF4444', secondary: '#F97316', accent: '#FBBF24', highlight: '#FCD34D', bg: '#0C0505' },
  },
  {
    id: 'dark-minimal',
    name: 'Dark Minimal',
    description: 'Clean monochromatic dark theme with crisp whites',
    icon: Moon,
    colors: { primary: '#FFFFFF', secondary: '#A3A3A3', accent: '#737373', highlight: '#E5E5E5', bg: '#0A0A0A' },
  },
];

export default function AdminThemes() {
  const { toast } = useToast();
  const [activeTheme, setActiveTheme] = useState('cosmic-purple');
  const [applying, setApplying] = useState<string | null>(null);

  const handleApplyTheme = async (themeId: string) => {
    setApplying(themeId);
    await new Promise(r => setTimeout(r, 800));
    setActiveTheme(themeId);
    setApplying(null);
    toast({
      title: 'Theme Applied',
      description: `${THEME_PRESETS.find(t => t.id === themeId)?.name} is now active.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-wide">Themes</h1>
          <p className="text-muted-foreground mt-1">Customize the visual appearance of your donation hub</p>
        </div>
        <Badge variant="outline" className="border-primary/40 text-primary gap-1.5 px-3 py-1.5">
          <Palette className="w-3.5 h-3.5" />
          {THEME_PRESETS.find(t => t.id === activeTheme)?.name}
        </Badge>
      </div>

      {/* Theme presets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {THEME_PRESETS.map((theme, i) => {
          const Icon = theme.icon;
          const isActive = theme.id === activeTheme;
          return (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card className={`glass-card border transition-all duration-300 cursor-pointer ${isActive ? 'border-primary shadow-[0_0_20px_rgba(123,46,255,0.25)]' : 'border-border/40 hover:border-primary/30'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: theme.colors.primary + '22', border: `1px solid ${theme.colors.primary}44` }}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <CardTitle className="text-base font-heading">{theme.name}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">{theme.description}</CardDescription>
                      </div>
                    </div>
                    {isActive && (
                      <Badge className="bg-primary/20 text-primary border-primary/40 text-xs gap-1">
                        <Check className="w-3 h-3" /> Active
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Color swatches */}
                  <div className="flex gap-2">
                    {Object.entries(theme.colors).filter(([k]) => k !== 'bg').map(([key, color]) => (
                      <div key={key} className="flex flex-col items-center gap-1">
                        <div className="w-8 h-8 rounded-md border border-white/10" style={{ background: color }} title={key} />
                        <span className="text-[10px] text-muted-foreground capitalize">{key}</span>
                      </div>
                    ))}
                    <div className="flex flex-col items-center gap-1">
                      <div className="w-8 h-8 rounded-md border border-white/10" style={{ background: theme.colors.bg }} title="bg" />
                      <span className="text-[10px] text-muted-foreground">bg</span>
                    </div>
                  </div>

                  {/* Preview bar */}
                  <div className="h-10 rounded-md flex items-center px-3 gap-2 overflow-hidden" style={{ background: theme.colors.bg, border: `1px solid ${theme.colors.primary}33` }}>
                    <div className="w-3 h-3 rounded-full" style={{ background: theme.colors.primary }} />
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: theme.colors.primary + '44' }}>
                      <div className="h-full w-3/5 rounded-full" style={{ background: theme.colors.primary }} />
                    </div>
                    <div className="text-[10px] font-mono" style={{ color: theme.colors.highlight }}>LIVE</div>
                  </div>

                  <Button
                    className="w-full"
                    variant={isActive ? 'outline' : 'default'}
                    disabled={isActive || applying === theme.id}
                    onClick={() => handleApplyTheme(theme.id)}
                    style={!isActive ? { background: theme.colors.primary } : undefined}
                  >
                    {applying === theme.id ? (
                      <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Applying…</span>
                    ) : isActive ? (
                      <span className="flex items-center gap-2"><Check className="w-4 h-4" /> Currently Active</span>
                    ) : (
                      'Apply Theme'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Custom theme note */}
      <Card className="glass-card border border-border/40">
        <CardContent className="p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center flex-shrink-0">
            <Palette className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-heading font-semibold text-sm text-foreground">Custom Themes</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Custom theme builder with full color pickers, custom CSS injection, and live preview is coming in a future update. Contact support to request a bespoke theme.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
