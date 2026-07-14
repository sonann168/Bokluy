import { Link, useLocation } from 'wouter';
import { ReactNode, useEffect } from 'react';
import { useGetAuthUser, useAdminLogout, getGetAuthUserQueryKey } from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  Coins, 
  BarChart3, 
  Target, 
  MonitorPlay, 
  Settings, 
  Volume2, 
  Bell, 
  ActivitySquare,
  LogOut,
  CreditCard,
  Palette,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

interface AdminLayoutProps {
  children: ReactNode;
}

const navItems = [
  { title: "Dashboard",     url: "/admin",                icon: LayoutDashboard },
  { title: "Donations",     url: "/admin/donations",      icon: Coins },
  { title: "Payments",      url: "/admin/payments",       icon: CreditCard },
  { title: "Analytics",     url: "/admin/analytics",      icon: BarChart3 },
  { title: "Goals",         url: "/admin/goals",          icon: Target },
  { title: "Overlay",       url: "/admin/overlay",        icon: MonitorPlay },
  { title: "Notifications", url: "/admin/notifications",  icon: Bell },
  { title: "Sounds",        url: "/admin/sounds",         icon: Volume2 },
  { title: "Themes",        url: "/admin/themes",         icon: Palette },
  { title: "Settings",      url: "/admin/settings",       icon: Settings },
  { title: "Activity Logs", url: "/admin/activity-logs",  icon: ActivitySquare },
  { title: "Profile",       url: "/admin/profile",        icon: User },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [location, setLocation] = useLocation();
  const { toast } = useToast();
  const { data: user, isLoading, isError } = useGetAuthUser({
    query: {
      queryKey: getGetAuthUserQueryKey(),
      retry: false,
    },
  });

  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        localStorage.removeItem('admin_token');
        setLocation('/admin/login');
      }
    }
  });

  useEffect(() => {
    if (isError) {
      localStorage.removeItem('admin_token');
      setLocation('/admin/login');
    }
  }, [isError, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background overflow-hidden selection:bg-primary/30">
        <Sidebar className="border-r border-border/50 bg-sidebar/50 backdrop-blur-xl">
          <SidebarHeader className="py-6 px-4">
            <Link href="/" className="flex items-center gap-2 px-2 group">
              <div className="w-8 h-8 rounded-md bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors border border-primary/30">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <span className="font-heading font-bold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-primary to-highlight">
                IMUZAKI
              </span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location === item.url || (item.url !== '/admin' && location.startsWith(item.url))}
                    tooltip={item.title}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border/50">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                  <span className="font-bold text-sm text-muted-foreground">{user.username.charAt(0).toUpperCase()}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium leading-none">{user.username}</span>
                  <span className="text-xs text-muted-foreground">Admin</span>
                </div>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full justify-start gap-2 border-border/50 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                onClick={() => logoutMutation.mutate()}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
          {/* Subtle background glow for main content */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10"></div>
          
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-10">
            <SidebarTrigger className="hover:bg-primary/20 hover:text-primary transition-colors" />
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" asChild className="hidden sm:flex border-border/50 hover:border-primary/50 hover:text-primary">
                <Link href="/overlay" target="_blank">View Overlay</Link>
              </Button>
            </div>
          </header>
          
          <div className="flex-1 overflow-auto p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-6">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
