import { useGetDashboardSummary, useGetSettings } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Coins, TrendingUp, Users, Activity, Crown, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminDashboard() {
  const { data: dashboard, isLoading: isLoadingDashboard } = useGetDashboardSummary();
  const { data: settings } = useGetSettings();

  if (isLoadingDashboard || !dashboard) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-heading font-bold tracking-wider">Command Center</h1>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="glass-card animate-pulse">
              <CardHeader className="h-24"></CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const { analytics, recentDonations, topDonors, activeGoal } = dashboard;
  const currency = settings?.currency || 'USD';
  
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">
            COMMAND CENTER
          </h1>
          <p className="text-muted-foreground text-sm">System status nominal. Monitoring live donations.</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card border-l-4 border-l-primary relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Coins className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Today's Revenue</CardTitle>
            <Coins className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold neon-text">{formatMoney(analytics.todayRevenue)}</div>
          </CardContent>
        </Card>
        
        <Card className="glass-card border-l-4 border-l-secondary relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <TrendingUp className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Week's Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold neon-text-secondary">{formatMoney(analytics.weekRevenue)}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-highlight relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Users className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Total Supporters</CardTitle>
            <Users className="h-4 w-4 text-highlight" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold text-highlight">{analytics.totalDonations}</div>
          </CardContent>
        </Card>

        <Card className="glass-card border-l-4 border-l-accent relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10">
            <Trophy className="w-16 h-16" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Highest Donation</CardTitle>
            <Trophy className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-heading font-bold neon-text-accent">{formatMoney(analytics.highestDonation)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Active Goal */}
        <Card className="glass-card lg:col-span-2 flex flex-col">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              <CardTitle className="font-heading tracking-wider">ACTIVE DIRECTIVE (GOAL)</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1 flex flex-col justify-center">
            {activeGoal ? (
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-bold">{activeGoal.title}</h3>
                    {activeGoal.description && (
                      <p className="text-sm text-muted-foreground mt-1">{activeGoal.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-heading font-bold text-primary">
                      {formatMoney(activeGoal.currentAmount)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      of {formatMoney(activeGoal.targetAmount)}
                    </div>
                  </div>
                </div>
                
                <div className="relative pt-2">
                  <Progress 
                    value={Math.min(100, (activeGoal.currentAmount / activeGoal.targetAmount) * 100)} 
                    className="h-4 bg-background/50 border border-white/10"
                  />
                  <div className="absolute right-0 -top-4 text-xs font-bold text-primary">
                    {Math.round((activeGoal.currentAmount / activeGoal.targetAmount) * 100)}%
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                <Target className="w-12 h-12 opacity-20 mb-3" />
                <p>No active goal set.</p>
                <p className="text-sm">Configure a goal in the Goals tab to track progress.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Donors */}
        <Card className="glass-card flex flex-col">
          <CardHeader className="border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-secondary" />
              <CardTitle className="font-heading tracking-wider">ELITE SUPPORTERS</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-6 flex-1">
            {topDonors.length > 0 ? (
              <div className="space-y-4">
                {topDonors.map((donor, i) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-background/40 border border-white/5 hover:border-secondary/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                        ${i === 0 ? 'bg-secondary/20 text-secondary border border-secondary/50 shadow-[0_0_10px_rgba(255,177,0,0.3)]' : 
                          i === 1 ? 'bg-zinc-300/20 text-zinc-300 border border-zinc-300/50' : 
                          i === 2 ? 'bg-orange-400/20 text-orange-400 border border-orange-400/50' : 
                          'bg-muted text-muted-foreground border border-border'}
                      `}>
                        {i + 1}
                      </div>
                      <div className="font-medium truncate max-w-[120px]">{donor.donorName}</div>
                    </div>
                    <div className="font-heading font-bold text-secondary">
                      {formatMoney(donor.totalAmount)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No supporters yet.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="glass-card">
        <CardHeader className="border-b border-white/5 bg-white/5">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-highlight" />
            <CardTitle className="font-heading tracking-wider">RECENT TRANSMISSIONS</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-0 p-0">
          {recentDonations.length > 0 ? (
            <div className="divide-y divide-white/5">
              {recentDonations.map((donation) => (
                <div key={donation.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
                      <Coins className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">{donation.donorName}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
                          {formatMoney(donation.amount)}
                        </span>
                      </div>
                      {donation.message && (
                        <p className="text-sm text-muted-foreground mt-1 italic">"{donation.message}"</p>
                      )}
                      <p className="text-xs text-muted-foreground/60 mt-2">
                        {formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className={`text-xs px-2 py-1 rounded-md uppercase tracking-wider font-semibold border
                      ${donation.status === 'paid' ? 'bg-green-500/10 text-green-500 border-green-500/30' : 
                        donation.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 
                        'bg-red-500/10 text-red-500 border-red-500/30'}
                    `}>
                      {donation.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Activity className="w-12 h-12 opacity-20 mx-auto mb-3" />
              <p>No recent activity.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
