import { useState } from 'react';
import { useListDonations, useUpdateDonation, useGetSettings, getListDonationsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreVertical, Coins, CheckCircle, XCircle, Clock, RotateCcw } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/use-debounce'; // Will need to create this or just implement inline

// Simple debounce function for inline use if hook is missing
function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  
  useState(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  });
  
  return debouncedValue;
}

export default function AdminDonations() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [search, setSearch] = useState('');
  // Use a simple local debounce for search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings } = useGetSettings();

  const queryParams: any = {
    page,
    limit: 10,
    ...(status !== 'all' && { status }),
    ...(debouncedSearch && { search: debouncedSearch })
  };

  const { data, isLoading } = useListDonations(queryParams, {
    query: { keepPreviousData: true }
  });

  const updateMutation = useUpdateDonation({
    mutation: {
      onSuccess: () => {
        toast({ title: 'Status updated successfully' });
        queryClient.invalidateQueries({ queryKey: getListDonationsQueryKey() });
      },
      onError: (error: any) => {
        toast({ title: 'Update failed', description: error.message, variant: 'destructive' });
      }
    }
  });

  const handleStatusChange = (id: number, newStatus: 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled') => {
    updateMutation.mutate({ id, data: { status: newStatus } });
  };

  const currency = settings?.currency || 'USD';
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'refunded': return <RotateCcw className="w-4 h-4 text-orange-500" />;
      default: return <XCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-wider">DONATION LOGS</h1>
          <p className="text-muted-foreground text-sm">View and manage all incoming transmissions.</p>
        </div>
      </div>

      <Card className="glass-card">
        <CardHeader className="border-b border-white/5 bg-white/5 pb-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search donor name or message..." 
                className="pl-9 bg-background/50 border-white/10"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  // Quick inline debounce
                  setTimeout(() => setDebouncedSearch(e.target.value), 500);
                }}
              />
            </div>
            
            <div className="w-full md:w-48">
              <Select value={status} onValueChange={(val) => { setStatus(val); setPage(1); }}>
                <SelectTrigger className="bg-background/50 border-white/10">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10 hover:bg-transparent">
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={6} className="h-16 animate-pulse bg-white/5"></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow className="border-white/5">
                  <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                    <Coins className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No donations found matching criteria.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((donation) => (
                  <TableRow key={donation.id} className="border-white/5 hover:bg-white/5">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {donation.isAnonymous && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Anon</span>}
                        {donation.donorName}
                      </div>
                    </TableCell>
                    <TableCell className="font-heading font-bold text-primary">
                      {formatMoney(donation.amount)}
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {donation.message || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(donation.createdAt), 'MMM d, yyyy HH:mm')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <StatusIcon status={donation.status} />
                        <span className="capitalize text-xs font-semibold">{donation.status}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-white/10">
                          <DropdownMenuItem onClick={() => handleStatusChange(donation.id, 'paid')}>
                            Mark as Paid
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(donation.id, 'refunded')}>
                            Mark as Refunded
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatusChange(donation.id, 'failed')} className="text-destructive">
                            Mark as Failed
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && data.total > data.limit && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Showing {(page - 1) * data.limit + 1} to Math.min(page * data.limit, data.total) of {data.total}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-white/10"
                >
                  Previous
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * data.limit >= data.total}
                  className="border-white/10"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
