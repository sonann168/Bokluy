import { useListDonations, getListDonationsQueryKey } from '@workspace/api-client-react';
import { keepPreviousData } from '@tanstack/react-query';
import type { Donation } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CreditCard, Search, RefreshCw, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; className: string }> = {
  paid:      { label: 'Paid',      icon: CheckCircle,  className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pending:   { label: 'Pending',   icon: Clock,        className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  failed:    { label: 'Failed',    icon: XCircle,      className: 'bg-red-500/20 text-red-400 border-red-500/30' },
  cancelled: { label: 'Cancelled', icon: AlertCircle,  className: 'bg-muted/40 text-muted-foreground border-border/40' },
  refunded:  { label: 'Refunded',  icon: RefreshCw,    className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
};

export default function AdminPayments() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(1);
  const limit = 20;

  const queryParams = {
    page,
    limit,
    ...(status !== 'all' && { status: status as 'paid' | 'pending' | 'failed' | 'cancelled' | 'refunded' }),
    ...(search && { search }),
  };

  const { data, isLoading, refetch } = useListDonations(queryParams, {
    query: { queryKey: getListDonationsQueryKey(queryParams), placeholderData: keepPreviousData },
  });

  const donations = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  const summary = {
    total: data?.total ?? 0,
    paid: donations.filter((d: Donation) => d.status === 'paid').length,
    pending: donations.filter((d: Donation) => d.status === 'pending').length,
    failed: donations.filter((d: Donation) => d.status === 'failed').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground tracking-wide">Payments</h1>
          <p className="text-muted-foreground mt-1">Track all payment transactions via ABA PayWay</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2 border-border/50">
          <RefreshCw className="w-4 h-4" /> Refresh
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Txns', value: total, color: 'text-foreground' },
          { label: 'Successful', value: summary.paid, color: 'text-green-400' },
          { label: 'Pending', value: summary.pending, color: 'text-yellow-400' },
          { label: 'Failed', value: summary.failed, color: 'text-red-400' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card className="glass-card border border-border/40">
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <p className={`text-2xl font-heading font-bold mt-1 ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by donor name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 bg-muted/20 border-border/40"
          />
        </div>
        <Select value={status} onValueChange={v => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="w-36 bg-muted/20 border-border/40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments table */}
      <Card className="glass-card border border-border/40 overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/30">
          <CardTitle className="flex items-center gap-2 text-base font-heading">
            <CreditCard className="w-4 h-4 text-primary" /> Payment Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : donations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 gap-3 text-muted-foreground">
              <CreditCard className="w-10 h-10 opacity-20" />
              <p className="text-sm">No payment transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/30 hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">TXN ID</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Donor</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Amount</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Method</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Status</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                    <TableHead className="text-muted-foreground text-xs">Paid At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {donations.map((d: Donation) => {
                    const cfg = STATUS_CONFIG[d.status] ?? STATUS_CONFIG.failed;
                    const Icon = cfg.icon;
                    return (
                      <TableRow key={d.id} className="border-border/20 hover:bg-primary/5 transition-colors">
                        <TableCell className="font-mono text-xs text-muted-foreground max-w-[140px] truncate">
                          {d.transactionId ?? `#${d.id}`}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {d.isAnonymous ? (
                            <span className="text-muted-foreground italic">Anonymous</span>
                          ) : d.donorName}
                        </TableCell>
                        <TableCell className="font-heading font-bold text-secondary">
                          {d.currency} {Number(d.amount).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-border/40 text-xs text-muted-foreground font-mono">
                            {d.paymentMethod ?? 'aba_payway'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`text-xs gap-1 border ${cfg.className}`}>
                            <Icon className="w-3 h-3" /> {cfg.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {d.status === 'paid' && d.updatedAt ? new Date(d.updatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {page} of {totalPages} · {total} transactions
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="border-border/40">
              Previous
            </Button>
            <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="border-border/40">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
