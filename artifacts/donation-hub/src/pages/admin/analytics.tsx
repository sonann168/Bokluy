import { useState } from 'react';
import { useGetRevenueAnalytics, useGetSettings } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export default function AdminAnalytics() {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const { data: settings } = useGetSettings();
  const { data: analyticsData, isLoading } = useGetRevenueAnalytics({ period });

  const currency = settings?.currency || 'USD';
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/10 rounded-lg shadow-xl">
          <p className="font-medium text-sm mb-1">{label}</p>
          <p className="text-primary font-heading font-bold text-lg neon-text">
            {formatMoney(payload[0].value)}
          </p>
          {payload[1] && (
            <p className="text-xs text-muted-foreground mt-1">
              {payload[1].value} donations
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-wider">ANALYTICS CORE</h1>
        <p className="text-muted-foreground text-sm">Revenue trends and performance metrics.</p>
      </div>

      <Card className="glass-card overflow-hidden">
        <CardHeader className="border-b border-white/5 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="font-heading tracking-wider">REVENUE CHART</CardTitle>
            <CardDescription>Visualize incoming funds over time</CardDescription>
          </div>
          
          <Tabs value={period} onValueChange={(v: any) => setPeriod(v)} className="w-[400px]">
            <TabsList className="grid w-full grid-cols-4 bg-background/50 border border-white/10">
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">Yearly</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="h-[400px] w-full">
            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="flex gap-2 items-center">
                  <div className="w-2 h-8 bg-primary/40 animate-pulse rounded"></div>
                  <div className="w-2 h-16 bg-primary/60 animate-pulse rounded delay-75"></div>
                  <div className="w-2 h-12 bg-primary/40 animate-pulse rounded delay-150"></div>
                  <div className="w-2 h-24 bg-primary animate-pulse rounded delay-300"></div>
                </div>
              </div>
            ) : analyticsData && analyticsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analyticsData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }} 
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                    dx={-10}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                  <Bar 
                    dataKey="revenue" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    maxBarSize={50}
                  />
                  <Bar dataKey="count" fill="transparent" /> {/* Hidden bar just to pass data to tooltip */}
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                No data available for this period.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
