import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/ui/theme-provider";
import HomePage from "@/pages/home-page";
import ItineraryPage from "@/pages/itinerary-page";
import AuthPage from "@/pages/auth-page";
import DashboardPage from "@/pages/dashboard-page";
import TripInputPage from "@/pages/trip-input-page";
import PricingPage from "@/pages/pricing-page";
import SubscribePage from "@/pages/subscribe-page";
import PaymentSuccessPage from "@/pages/payment-success-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

// Explicit type for components to fix TS error
type ComponentWithJSX = () => JSX.Element;

// Explicit return type to fix TS error
function Router(): JSX.Element {
  return (
    <main className="min-h-screen">
      <Switch>
        <Route path="/" component={HomePage as ComponentWithJSX} />
        <Route path="/auth" component={AuthPage as ComponentWithJSX} />
        <Route path="/pricing" component={PricingPage as ComponentWithJSX} />
        <Route path="/subscribe" component={SubscribePage as ComponentWithJSX} />
        <Route path="/payment-success" component={PaymentSuccessPage as ComponentWithJSX} />
        <ProtectedRoute path="/dashboard" component={DashboardPage as ComponentWithJSX} />
        <ProtectedRoute path="/trip-input" component={TripInputPage as ComponentWithJSX} />
        <Route path="/itinerary/:id" component={ItineraryPage as ComponentWithJSX} />
        <Route component={NotFound as ComponentWithJSX} />
      </Switch>
    </main>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
