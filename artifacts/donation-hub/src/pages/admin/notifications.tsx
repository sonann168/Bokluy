import { useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getListNotificationsQueryKey } from '@workspace/api-client-react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function AdminNotifications() {
  const { data: notifications, isLoading } = useListNotifications({});
  const queryClient = useQueryClient();
  
  const markReadMutation = useMarkNotificationRead({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    }
  });

  const markAllReadMutation = useMarkAllNotificationsRead({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() })
    }
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const getIcon = (type: string) => {
    switch (type) {
      case 'donation': return <AlertCircle className="w-5 h-5 text-primary" />;
      case 'system': return <Info className="w-5 h-5 text-secondary" />;
      default: return <Bell className="w-5 h-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-wider">COMMS TERMINAL</h1>
          <p className="text-muted-foreground text-sm">System alerts and incoming notifications.</p>
        </div>
        
        {unreadCount > 0 && (
          <Button 
            variant="outline" 
            className="border-white/10"
            onClick={() => markAllReadMutation.mutate()}
            disabled={markAllReadMutation.isPending}
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Card className="glass-card">
        <CardHeader className="border-b border-white/5 bg-white/5 flex flex-row justify-between items-center">
          <CardTitle className="font-heading tracking-wider text-lg">
            INBOX <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs ml-2">{unreadCount} UNREAD</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1,2,3].map(i => <div key={i} className="h-16 bg-white/5 animate-pulse rounded-lg"></div>)}
            </div>
          ) : notifications?.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Bell className="w-12 h-12 opacity-20 mx-auto mb-4" />
              <p>Inbox is empty.</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {notifications?.map((notification) => (
                <div key={notification.id} className={`p-4 flex gap-4 transition-colors hover:bg-white/5 ${!notification.isRead ? 'bg-primary/5' : ''}`}>
                  <div className="shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between items-start">
                      <h4 className={`font-semibold ${!notification.isRead ? 'text-white' : 'text-muted-foreground'}`}>
                        {notification.title}
                      </h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground/80">{notification.message}</p>
                  </div>
                  {!notification.isRead && (
                    <div className="shrink-0 flex items-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/20"
                        onClick={() => markReadMutation.mutate({ id: notification.id })}
                        title="Mark as read"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
