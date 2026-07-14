import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { useEffect } from 'react';
import { setAuthTokenGetter } from '@workspace/api-client-react';

import LandingPage from '@/pages/public/landing';
import DonatePage from '@/pages/public/donate';
import DonateSuccess from '@/pages/public/donate-success';
import DonateFailed from '@/pages/public/donate-failed';
import DonatePending from '@/pages/public/donate-pending';
import AboutPage from '@/pages/public/about';
import TermsPage from '@/pages/public/terms';
import PrivacyPage from '@/pages/public/privacy';

import AdminLogin from '@/pages/admin/login';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminDonations from '@/pages/admin/donations';
import AdminAnalytics from '@/pages/admin/analytics';
import AdminGoals from '@/pages/admin/goals';
import AdminOverlaySettings from '@/pages/admin/overlay-settings';
import AdminSettings from '@/pages/admin/settings';
import AdminSounds from '@/pages/admin/sounds';
import AdminNotifications from '@/pages/admin/notifications';
import AdminActivityLogs from '@/pages/admin/activity-logs';

import Overlay from '@/pages/overlay';
import AdminLayout from '@/components/admin-layout';
import PublicLayout from '@/components/public-layout';

const queryClient = new QueryClient();

// Set auth token getter for all API calls
setAuthTokenGetter(() => localStorage.getItem('admin_token'));

function AdminRoute({ component: Component, ...rest }: any) {
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin/login');
    }
  }, [location, setLocation]);

  return (
    <AdminLayout>
      <Component {...rest} />
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

      {/* Admin Pages */}
      <Route path="/admin" component={() => <AdminRoute component={AdminDashboard} />} />
      <Route path="/admin/donations" component={() => <AdminRoute component={AdminDonations} />} />
      <Route path="/admin/analytics" component={() => <AdminRoute component={AdminAnalytics} />} />
      <Route path="/admin/goals" component={() => <AdminRoute component={AdminGoals} />} />
      <Route path="/admin/overlay" component={() => <AdminRoute component={AdminOverlaySettings} />} />
      <Route path="/admin/settings" component={() => <AdminRoute component={AdminSettings} />} />
      <Route path="/admin/sounds" component={() => <AdminRoute component={AdminSounds} />} />
      <Route path="/admin/notifications" component={() => <AdminRoute component={AdminNotifications} />} />
      <Route path="/admin/activity-logs" component={() => <AdminRoute component={AdminActivityLogs} />} />

      {/* 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
