import { useState } from 'react';
import { useListActivityLogs, getListActivityLogsQueryKey } from '@workspace/api-client-react';
import { keepPreviousData } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Terminal, ActivitySquare } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminActivityLogs() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useListActivityLogs({ page, limit: 15 }, {
    query: { queryKey: getListActivityLogsQueryKey({ page, limit: 15 }), placeholderData: keepPreviousData },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-heading font-bold tracking-wider">SYSTEM LOGS</h1>
        <p className="text-muted-foreground text-sm">Audit trail of all administrative actions.</p>
      </div>

      <Card className="glass-card border-white/10 bg-[#0A0214]">
        <CardHeader className="border-b border-white/5 flex flex-row items-center gap-2">
          <Terminal className="w-5 h-5 text-primary" />
          <CardTitle className="font-mono text-sm tracking-widest text-primary">/var/log/admin.log</CardTitle>
        </CardHeader>
        <CardContent className="p-0 font-mono text-sm">
          <Table>
            <TableHeader className="bg-white/5 border-b-white/10">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[180px] text-muted-foreground">TIMESTAMP</TableHead>
                <TableHead className="w-[150px] text-muted-foreground">ACTION</TableHead>
                <TableHead className="text-muted-foreground">DESCRIPTION</TableHead>
                <TableHead className="text-right text-muted-foreground">IP ADDRESS</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <TableRow key={i} className="border-white/5">
                    <TableCell colSpan={4} className="h-12 animate-pulse bg-white/5"></TableCell>
                  </TableRow>
                ))
              ) : data?.data.length === 0 ? (
                <TableRow className="border-white/5">
                  <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                    <ActivitySquare className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((log) => (
                  <TableRow key={log.id} className="border-white/5 hover:bg-white/5 text-muted-foreground">
                    <TableCell className="text-primary/70">
                      {format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss')}
                    </TableCell>
                    <TableCell className="text-highlight/80 font-bold uppercase">
                      {log.action}
                    </TableCell>
                    <TableCell className="text-white/80">
                      {log.description}
                    </TableCell>
                    <TableCell className="text-right opacity-50">
                      {log.ipAddress || 'UNKNOWN'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {data && data.total > data.limit && (
            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/40">
              <div className="text-xs text-muted-foreground">
                Displaying entries {(page - 1) * data.limit + 1} - {Math.min(page * data.limit, data.total)} of {data.total}
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-white/10 font-mono text-xs"
                >
                  &lt; PREV
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => p + 1)}
                  disabled={page * data.limit >= data.total}
                  className="border-white/10 font-mono text-xs"
                >
                  NEXT &gt;
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
