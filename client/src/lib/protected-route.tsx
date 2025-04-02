import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType<any>;
}): JSX.Element {
  const { user, isLoading } = useAuth();

  // Create a wrapper component that handles auth logic
  const ProtectedComponent = (): JSX.Element => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-border" />
        </div>
      );
    }

    if (!user) {
      return <Redirect to="/auth" />;
    }

    return <Component />;
  };

  // Return the route with our wrapper component
  return <Route path={path} component={ProtectedComponent} />;
}
