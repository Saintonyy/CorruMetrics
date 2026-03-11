import { Switch, Route, Router, Redirect } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";

import LoginPage from "@/pages/login";
import DashboardPage from "@/pages/dashboard";
import ProductionPage from "@/pages/production";
import ProductionNewPage from "@/pages/production-new";
import DowntimePage from "@/pages/downtime";
import EmployeesPage from "@/pages/employees";
import ReportsPage from "@/pages/reports";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarStyle = {
    "--sidebar-width": "15rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={sidebarStyle as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <main className="flex-1 overflow-hidden">
            {children}
          </main>
          <PerplexityAttribution />
        </div>
      </div>
    </SidebarProvider>
  );
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Redirect to="/login" />;
  return <AppShell><Component /></AppShell>;
}

function AppRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/app/dashboard">{() => <AuthRoute component={DashboardPage} />}</Route>
      <Route path="/app/production/new">{() => <AuthRoute component={ProductionNewPage} />}</Route>
      <Route path="/app/production">{() => <AuthRoute component={ProductionPage} />}</Route>
      <Route path="/app/downtime">{() => <AuthRoute component={DowntimePage} />}</Route>
      <Route path="/app/employees">{() => <AuthRoute component={EmployeesPage} />}</Route>
      <Route path="/app/reports">{() => <AuthRoute component={ReportsPage} />}</Route>
      <Route path="/app/settings">{() => <AuthRoute component={SettingsPage} />}</Route>
      <Route path="/app">
        {isAuthenticated ? <Redirect to="/app/dashboard" /> : <Redirect to="/login" />}
      </Route>
      <Route>
        {isAuthenticated ? <Redirect to="/app/dashboard" /> : <Redirect to="/login" />}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Router hook={useHashLocation}>
            <AppRouter />
          </Router>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
