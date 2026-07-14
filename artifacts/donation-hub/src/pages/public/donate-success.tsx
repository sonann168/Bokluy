import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

export default function DonateSuccess() {
  const [particles, setParticles] = useState<{x: number, y: number, color: string}[]>([]);

  useEffect(() => {
    // Generate confetti particles
    const colors = ['#7B2EFF', '#FFB100', '#FF5A36', '#45B7FF', '#FFFFFF'];
    const newParticles = Array.from({ length: 50 }).map(() => ({
      x: Math.random() * 100,
      y: -20 - Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Confetti animation */}
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute w-3 h-3 rounded-sm z-0"
          style={{ backgroundColor: p.color, left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            y: ['0vh', '120vh'],
            rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
            x: [`${p.x}%`, `${p.x + (Math.random() * 20 - 10)}%`]
          }}
          transition={{
            duration: Math.random() * 2 + 2,
            ease: 'linear',
            repeat: Infinity,
            delay: Math.random() * 2
          }}
        />
      ))}

      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="glass-card border-green-500/30 shadow-[0_0_30px_rgba(34,197,94,0.1)] text-center">
          <CardContent className="pt-10 pb-8 px-6 space-y-6">
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
              className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/50"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-bold tracking-wider text-green-400">TRANSMISSION SUCCESSFUL</h1>
              <p className="text-muted-foreground">
                Your support has been received. Watch the stream for your alert!
              </p>
            </div>
            
            <div className="pt-4 flex flex-col gap-3">
              <Button asChild className="w-full bg-primary hover:bg-primary/90 neon-border">
                <Link href="/">Return to Hub</Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5">
                <Link href="/donate">Send Another <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
