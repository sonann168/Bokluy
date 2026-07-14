import { Link } from 'wouter';
import { useGetRecentDonations, useListGoals } from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, ArrowRight, Gamepad2, Coins } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LandingPage() {
  const { data: recentDonations } = useGetRecentDonations({ limit: 5 });
  const { data: goals } = useListGoals();
  
  const activeGoal = goals?.find(g => g.isActive);

  return (
    <div className="min-h-[calc(100vh-130px)] flex flex-col items-center justify-center p-6 lg:p-12">
      {/* Particle container - using simple CSS approach instead of heavy canvas for performance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[-1]">
        {Array(20).fill(0).map((_, i) => (
          <div 
            key={i}
            className="absolute rounded-full bg-primary/20 animate-pulse"
            style={{
              width: Math.random() * 6 + 2 + 'px',
              height: Math.random() * 6 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: Math.random() * 3 + 2 + 's',
              animationDelay: Math.random() * 2 + 's'
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Column: Hero Content */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-8 text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-sm font-semibold tracking-wider mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            STREAM LIVE NOW
          </div>
          
          <h1 className="text-5xl md:text-7xl font-heading font-bold tracking-tight uppercase leading-[1.1]">
            Empower Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-highlight to-secondary neon-text">
              Favorite Creator
            </span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-xl mx-auto lg:mx-0">
            Welcome to the official transmission hub. Drop a donation, trigger a live alert on stream, and leave a message for the broadcast.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Button asChild size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-bold tracking-widest bg-primary hover:bg-primary/90 text-white neon-border group">
              <Link href="/donate">
                INITIATE SUPPORT 
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full sm:w-auto h-14 px-8 border-white/20 hover:bg-white/5">
              <Link href="/about">View Profile</Link>
            </Button>
          </div>
        </motion.div>

        {/* Right Column: Dynamic Stats */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-6"
        >
          {/* Active Goal Widget */}
          <Card className="glass-card neon-border overflow-hidden relative">
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Target className="w-24 h-24" />
            </div>
            <CardHeader className="pb-2 border-b border-white/5 bg-black/20">
              <div className="flex items-center gap-2 text-primary font-bold text-sm tracking-widest uppercase">
                <Gamepad2 className="w-4 h-4" /> CURRENT DIRECTIVE
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {activeGoal ? (
                <div className="space-y-4">
                  <h3 className="text-2xl font-heading font-bold">{activeGoal.title}</h3>
                  <div className="flex justify-between items-end">
                    <span className="text-3xl font-bold text-highlight neon-text">
                      ${activeGoal.currentAmount.toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      / ${activeGoal.targetAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className="relative pt-1">
                    <Progress 
                      value={Math.min(100, (activeGoal.currentAmount / activeGoal.targetAmount) * 100)} 
                      className="h-3 bg-background/80 border border-white/10" 
                    />
                  </div>
                </div>
              ) : (
                <div className="py-6 text-center text-muted-foreground">
                  <Target className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>Awaiting new directive from command.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transmissions */}
          <Card className="glass-card border-white/10">
            <CardHeader className="pb-2 border-b border-white/5">
              <div className="flex items-center gap-2 text-secondary font-bold text-sm tracking-widest uppercase">
                <Coins className="w-4 h-4" /> RECENT TRANSMISSIONS
              </div>
            </CardHeader>
            <CardContent className="pt-4 p-0">
              {recentDonations && recentDonations.length > 0 ? (
                <div className="divide-y divide-white/5 max-h-[200px] overflow-y-auto custom-scrollbar">
                  {recentDonations.map((donation, i) => (
                    <motion.div 
                      key={donation.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + (i * 0.1) }}
                      className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
                    >
                      <div>
                        <div className="font-bold text-white flex items-center gap-2">
                          {donation.isAnonymous ? 'Anonymous' : donation.donorName}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-1 max-w-[200px] italic">
                          {donation.message || 'No message provided.'}
                        </div>
                      </div>
                      <div className="font-heading font-bold text-lg text-primary">
                        ${donation.amount.toLocaleString()}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground text-sm">
                  No recent signals detected. Be the first!
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

      </div>
    </div>
  );
}
