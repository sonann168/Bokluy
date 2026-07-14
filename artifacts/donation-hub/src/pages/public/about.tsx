import { Card, CardContent } from '@/components/ui/card';
import { Target } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16 min-h-[calc(100vh-130px)]">
      <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        <div className="text-center space-y-4 mb-12">
          <div className="w-20 h-20 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto border border-primary/40 neon-border shadow-lg">
            <Target className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-widest uppercase">
            ABOUT <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-highlight">IMUZAKI</span>
          </h1>
        </div>

        <Card className="glass-card border-white/10 overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-primary/20 via-background to-secondary/20 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20"></div>
          </div>
          <CardContent className="p-8 -mt-12 relative z-10 bg-background/80 backdrop-blur-xl">
            <div className="space-y-6 text-muted-foreground leading-relaxed">
              <p className="text-xl text-white font-medium">
                Welcome to the official transmission hub.
              </p>
              <p>
                IMUZAKI is a dedicated broadcast channel focused on high-tier gameplay, community interaction, and pushing the limits of interactive streaming. What started as a small operation has grown into a highly synchronized network of supporters and viewers.
              </p>
              <p>
                This donation hub serves as the primary conduit for direct support. By bypassing third-party platforms, 100% of your contributions go directly toward upgrading the broadcast infrastructure, securing new games, and funding special events.
              </p>
              
              <div className="pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h3 className="text-white font-bold mb-2 font-heading tracking-wider">SCHEDULE</h3>
                  <p className="text-sm">Monday - Friday<br/>18:00 - 23:00 EST</p>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2 font-heading tracking-wider">HARDWARE</h3>
                  <p className="text-sm">Dual PC Setup<br/>RTX 4090 / i9-13900K</p>
                </div>
                <div>
                  <h3 className="text-white font-bold mb-2 font-heading tracking-wider">CONTACT</h3>
                  <p className="text-sm">business@imuzaki.net</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
