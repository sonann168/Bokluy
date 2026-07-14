import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useGetPaymentStatus, getGetPaymentStatusQueryKey } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';

export default function DonatePending() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(window.location.search);
  const idStr = searchParams.get('id');
  const donationId = idStr ? parseInt(idStr, 10) : null;

  const { data: statusData, refetch, isFetching } = useGetPaymentStatus(
    donationId as number,
    {
      query: {
        queryKey: getGetPaymentStatusQueryKey(donationId as number),
        enabled: !!donationId,
        refetchInterval: (query) => {
          const d = query.state.data;
          if (!d) return 3000;
          if (d.status === 'pending') return 3000;
          return false;
        },
      },
    }
  );

  useEffect(() => {
    if (statusData?.status === 'paid') {
      setLocation('/donate/success');
    } else if (statusData?.status === 'failed' || statusData?.status === 'cancelled') {
      setLocation('/donate/failed');
    }
  }, [statusData, setLocation]);

  return (
    <div className="min-h-[calc(100vh-130px)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="glass-card border-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.05)] text-center">
          <CardContent className="pt-10 pb-8 px-6 space-y-6">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto relative">
              <div className="absolute inset-0 border-4 border-yellow-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
              <Loader2 className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-3xl font-heading font-bold tracking-wider text-yellow-500">PROCESSING...</h1>
              <p className="text-muted-foreground">
                Waiting for ABA PayWay confirmation. This page will automatically update.
              </p>
            </div>
            
            <div className="pt-4 flex flex-col gap-3">
              <Button 
                variant="outline" 
                className="w-full border-yellow-500/30 text-yellow-500 hover:bg-yellow-500/10"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> 
                Refresh Status
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
