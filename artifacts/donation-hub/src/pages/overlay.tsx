import { useEffect, useState } from 'react';
import { useGetOverlayData } from '@workspace/api-client-react';
import { io, Socket } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Overlay() {
  const { data: initialData } = useGetOverlayData();
  const [alerts, setAlerts] = useState<any[]>([]);
  const [currentAlert, setCurrentAlert] = useState<any | null>(null);
  const [goal, setGoal] = useState<any>(null);
  const [latestDonation, setLatestDonation] = useState<any>(null);
  const [topDonation, setTopDonation] = useState<any>(null);

  useEffect(() => {
    // Make body transparent for OBS
    document.body.style.backgroundColor = 'transparent';
    document.body.style.overflow = 'hidden';
    
    return () => {
      document.body.style.backgroundColor = '';
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    if (initialData) {
      if (initialData.activeGoal) setGoal(initialData.activeGoal);
      if (initialData.latestDonation) setLatestDonation(initialData.latestDonation);
      if (initialData.topDonation) setTopDonation(initialData.topDonation);
    }
  }, [initialData]);

  useEffect(() => {
    const socket: Socket = io({ path: '/socket.io' });

    socket.on('new_donation', (donation) => {
      // Add to queue
      setAlerts(prev => [...prev, donation]);
      setLatestDonation(donation);
      
      // Update top donation if needed
      if (!topDonation || donation.amount > topDonation.amount) {
        setTopDonation(donation);
      }
    });

    socket.on('goal_update', (updatedGoal) => {
      setGoal(updatedGoal);
    });

    socket.on('test_alert', (data) => {
      setAlerts(prev => [...prev, data.donation]);
    });

    return () => {
      socket.disconnect();
    };
  }, [topDonation]);

  // Alert Queue processor
  useEffect(() => {
    if (alerts.length > 0 && !currentAlert) {
      const nextAlert = alerts[0];
      setCurrentAlert(nextAlert);
      setAlerts(prev => prev.slice(1));
      
      // Play sound if enabled
      if (initialData?.settings?.soundEnabled && nextAlert.soundUrl) {
        const audio = new Audio(nextAlert.soundUrl);
        audio.volume = 0.5;
        audio.play().catch(() => {});
      }

      // Dismiss after duration
      const duration = (initialData?.settings?.alertDuration || 5) * 1000;
      const timer = setTimeout(() => {
        setCurrentAlert(null);
      }, duration);

      return () => clearTimeout(timer);
    }
    return undefined;
  }, [alerts, currentAlert, initialData]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

  return (
    <div className="w-screen h-screen relative overflow-hidden selection:bg-transparent">
      
      {/* Dynamic Alert Popup */}
      <AnimatePresence>
        {currentAlert && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="absolute top-[20%] left-1/2 -translate-x-1/2 z-50 flex flex-col items-center text-center"
          >
            {/* Visual effect behind alert */}
            <div className="absolute inset-0 w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 bg-primary/20 blur-[100px] rounded-full animate-pulse z-[-1]" />
            
            <div className="relative">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-20px] rounded-full border-2 border-dashed border-primary/50"
              />
              <div className="w-32 h-32 rounded-full bg-background border-4 border-primary shadow-[0_0_30px_rgba(123,46,255,0.8)] flex items-center justify-center overflow-hidden mb-6 mx-auto relative z-10">
                <div className="text-5xl font-bold text-primary">!</div>
              </div>
            </div>

            <div className="bg-background/90 backdrop-blur-md border-2 border-primary px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(123,46,255,0.4)]">
              <h2 className="text-4xl font-heading font-bold text-white uppercase tracking-wider drop-shadow-lg">
                <span className="text-primary neon-text">{currentAlert.donorName}</span> DONATED <span className="text-highlight neon-text">{formatMoney(currentAlert.amount)}</span>!
              </h2>
            </div>
            
            {currentAlert.message && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 bg-card/90 backdrop-blur-md border border-white/20 px-6 py-3 rounded-lg max-w-xl shadow-xl"
              >
                <p className="text-2xl font-medium italic text-white/90">"{currentAlert.message}"</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goal Bar (Bottom Center) */}
      {goal && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[600px] bg-background/80 backdrop-blur-md border-2 border-primary/50 rounded-xl p-4 shadow-[0_0_20px_rgba(123,46,255,0.3)]">
          <div className="flex justify-between items-end mb-2">
            <h3 className="font-heading font-bold text-xl uppercase tracking-wider text-white drop-shadow-md">
              {goal.title}
            </h3>
            <div className="font-heading font-bold text-lg">
              <span className="text-highlight neon-text">{formatMoney(goal.currentAmount)}</span>
              <span className="text-white/60"> / {formatMoney(goal.targetAmount)}</span>
            </div>
          </div>
          <div className="h-6 bg-black/50 rounded-full overflow-hidden border border-white/10 p-0.5">
            <motion.div 
              className="h-full bg-gradient-to-r from-primary to-highlight rounded-full relative"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)}%` }}
              transition={{ duration: 1, type: "spring" }}
            >
              <div className="absolute inset-0 bg-white/20 w-full animate-[shimmer_2s_infinite]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }} />
            </motion.div>
          </div>
        </div>
      )}

      {/* Persistent Widgets (Top Corners) */}
      <div className="absolute top-8 left-8 flex flex-col gap-4">
        {latestDonation && (
          <div className="bg-background/80 backdrop-blur-md border border-primary/30 rounded-lg p-3 shadow-lg flex items-center gap-3">
            <div className="bg-primary/20 text-primary p-2 rounded text-xs font-bold uppercase tracking-wider">Latest</div>
            <div className="font-bold text-white">
              {latestDonation.donorName} <span className="text-highlight ml-1">{formatMoney(latestDonation.amount)}</span>
            </div>
          </div>
        )}
      </div>

      <div className="absolute top-8 right-8 flex flex-col gap-4">
        {topDonation && (
          <div className="bg-background/80 backdrop-blur-md border border-secondary/30 rounded-lg p-3 shadow-lg flex items-center gap-3">
            <div className="font-bold text-white text-right">
              {topDonation.donorName} <span className="text-secondary ml-1">{formatMoney(topDonation.amount)}</span>
            </div>
            <div className="bg-secondary/20 text-secondary p-2 rounded text-xs font-bold uppercase tracking-wider">Top</div>
          </div>
        )}
      </div>

    </div>
  );
}
