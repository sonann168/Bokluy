import { Link } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, RefreshCw, Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DonateFailed() {
  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <Card className="glass-card border-destructive/50 shadow-[0_0_30px_rgba(239,68,68,0.1)] text-center">
          <CardContent className="pt-10 pb-8 px-6 space-y-6">
            <div className="w-24 h-24 bg-destructive/20 rounded-full flex items-center justify-center mx-auto border border-destructive/50">
              <XCircle className="w-12 h-12 text-destructive" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-bold tracking-wider text-destructive">TRANSMISSION FAILED</h1>
              <p className="text-muted-foreground">
                The payment could not be processed. Your account has not been charged.
              </p>
            </div>
            
            <div className="pt-4 flex flex-col gap-3">
              <Button asChild className="w-full bg-destructive hover:bg-destructive/90 text-white shadow-[0_0_10px_rgba(239,68,68,0.5)]">
                <Link href="/donate">
                  <RefreshCw className="w-4 h-4 mr-2" /> Try Again
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full border-white/10 hover:bg-white/5">
                <Link href="/">
                  <Home className="w-4 h-4 mr-2" /> Return to Hub
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
