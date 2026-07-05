import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";

import { AuthProvider, useAuth } from "@/lib/auth";

import NotFound from "@/pages/not-found";
import LandingPage from "@/pages/landing";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import DashboardLayout from "@/components/layout/dashboard-layout";
import DashboardPage from "@/pages/dashboard";
import UploadPage from "@/pages/upload";
import TransactionsPage from "@/pages/transactions";
import TaxPage from "@/pages/tax";
import ChatPage from "@/pages/chat";
import PaymentPage from "@/pages/payment";
import FilingPage from "@/pages/filing";

const queryClient = new QueryClient();

// Route wrapper that enforces authentication
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      setLocation("/login");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <DashboardLayout>
      <Component {...rest} />
    </DashboardLayout>
  );
}

// Route wrapper that redirects logged-in users away from auth pages
function AuthRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/dashboard");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAuthenticated) return null;

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      
      <Route path="/login">
        {() => <AuthRoute component={LoginPage} />}
      </Route>
      <Route path="/register">
        {() => <AuthRoute component={RegisterPage} />}
      </Route>

      <Route path="/dashboard">
        {() => <ProtectedRoute component={DashboardPage} />}
      </Route>
      <Route path="/upload">
        {() => <ProtectedRoute component={UploadPage} />}
      </Route>
      <Route path="/transactions">
        {() => <ProtectedRoute component={TransactionsPage} />}
      </Route>
      <Route path="/tax">
        {() => <ProtectedRoute component={TaxPage} />}
      </Route>
      <Route path="/chat">
        {() => <ProtectedRoute component={ChatPage} />}
      </Route>
      <Route path="/payment">
        {() => <ProtectedRoute component={PaymentPage} />}
      </Route>
      <Route path="/filing">
        {() => <ProtectedRoute component={FilingPage} />}
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <Router />
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
