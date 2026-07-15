import { lazy, Suspense, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/components/theme-provider';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { setAuthTokenGetter } from '@workspace/api-client-react';
import AdminLayout from '@/components/admin-layout';
import PublicLayout from '@/components/public-layout';

// Public pages – small, eagerly loaded
import LandingPage from '@/pages/public/landing';
import DonatePage from '@/pages/public/donate';
import DonateSuccess from '@/pages/public/donate-success';
import DonateFailed from '@/pages/public/donate-failed';
import DonatePending from '@/pages/public/donate-pending';
import AboutPage from '@/pages/public/about';
import TermsPage from '@/pages/public/terms';
import PrivacyPage from '@/pages/public/privacy';
import Overlay from '@/pages/overlay';
import AdminLogin from '@/pages/admin/login';

// Admin pages – lazy loaded (heavy: charts, tables, socket.io)
const AdminDashboard       = lazy(() => import('@/pages/admin/dashboard'));
const AdminDonations       = lazy(() => import('@/pages/admin/donations'));
const AdminAnalytics       = lazy(() => import('@/pages/admin/analytics'));
const AdminGoals           = lazy(() => import('@/pages/admin/goals'));
const AdminOverlaySettings = lazy(() => import('@/pages/admin/overlay-settings'));
const AdminSettings        = lazy(() => import('@/pages/admin/settings'));
const AdminSounds          = lazy(() => import('@/pages/admin/sounds'));
const AdminNotifications   = lazy(() => import('@/pages/admin/notifications'));
const AdminActivityLogs    = lazy(() => import('@/pages/admin/activity-logs'));
const AdminThemes          = lazy(() => import('@/pages/admin/themes'));
const AdminProfile         = lazy(() => import('@/pages/admin/profile'));
const AdminPayments        = lazy(() => import('@/pages/admin/payments'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

setAuthTokenGetter(() => localStorage.getItem('admin_token'));

function PageLoader() {
  return (
    <div className="flex h-full min-h-[400px] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

interface AdminRouteProps {
  component: React.ComponentType;
  [key: string]: unknown;
}

function AdminRoute({ component: Component, ...rest }: AdminRouteProps) {
  const [location, setLocation] = useLocation();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
    }
  }, [location, setLocation]);

  return (
    <AdminLayout>
      <Suspense fallback={<PageLoader />}>
        <Component {...rest} />
      </Suspense>
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={() => <PublicLayout><LandingPage /></PublicLayout>} />
      <Route path="/donate" component={() => <PublicLayout><DonatePage /></PublicLayout>} />
      <Route path="/donate/success" component={() => <PublicLayout><DonateSuccess /></PublicLayout>} />
      <Route path="/donate/failed" component={() => <PublicLayout><DonateFailed /></PublicLayout>} />
      <Route path="/donate/pending" component={() => <PublicLayout><DonatePending /></PublicLayout>} />
      <Route path="/about" component={() => <PublicLayout><AboutPage /></PublicLayout>} />
      <Route path="/terms" component={() => <PublicLayout><TermsPage /></PublicLayout>} />
      <Route path="/privacy" component={() => <PublicLayout><PrivacyPage /></PublicLayout>} />

      {/* Overlay Page */}
      <Route path="/overlay" component={Overlay} />

      {/* Admin Login */}
      <Route path="/admin/login" component={AdminLogin} />

      {/* Admin Pages – lazy loaded */}
      <Route path="/admin"              component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/donations"    component={() => <AdminRoute component={AdminDonations} />} />
      <Route path="/admin/analytics"    component={() => <AdminRoute component={AdminAnalytics} />} />
      <Route path="/admin/goals"        component={() => <AdminRoute component={AdminGoals} />} />
      <Route path="/admin/overlay"      component={() => <AdminRoute component={AdminOverlaySettings} />} />
      <Route path="/admin/settings"     component={() => <AdminRoute component={AdminSettings} />} />
      <Route path="/admin/sounds"       component={() => <AdminRoute component={AdminSounds} />} />
      <Route path="/admin/notifications" component={() => <AdminRoute component={AdminNotifications} />} />
      <Route path="/admin/activity-logs" component={() => <AdminRoute component={AdminActivityLogs} />} />
      <Route path="/admin/themes"       component={() => <AdminRoute component={AdminThemes} />} />
      <Route path="/admin/profile"      component={() => <AdminRoute component={AdminProfile} />} />
      <Route path="/admin/payments"     component={() => <AdminRoute component={AdminPayments} />} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
