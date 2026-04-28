import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";

interface ProtectedAdminRouteProps {
  children: React.ReactNode;
}

export function ProtectedAdminRoute({ children }: ProtectedAdminRouteProps) {
  const [, setLocation] = useLocation();
  const sessionQuery = trpc.admin.checkSession.useQuery();

  useEffect(() => {
    if (sessionQuery.data && !sessionQuery.data.authenticated) {
      setLocation("/admin");
    }
  }, [sessionQuery.data, setLocation]);

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
          <p className="text-white">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (sessionQuery.data && !sessionQuery.data.authenticated) {
    return null;
  }

  return <>{children}</>;
}
