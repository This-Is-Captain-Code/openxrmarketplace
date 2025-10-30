import { usePrivy } from "@privy-io/react-auth";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { ready, authenticated, login, user } = usePrivy();
  const { toast } = useToast();

  useEffect(() => {
    if (ready && authenticated && user) {
      fetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          privyId: user.id,
          walletAddress: user.wallet?.address,
          email: user.email?.address,
          phoneNumber: user.phone?.number,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then(res => res.json())
        .catch((error) => {
          console.error("Failed to sync user:", error);
          toast({
            variant: "destructive",
            title: "Sync Error",
            description: "Failed to sync user data",
          });
        });
    }
  }, [ready, authenticated, user, toast]);

  if (!ready) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-white animate-spin" />
          <p className="text-white text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="fixed inset-0 bg-black flex flex-col items-center justify-center p-6">
        <div className="flex flex-col items-center gap-6 max-w-md text-center">
          <div className="text-white text-6xl mb-4" style={{ fontFamily: 'Lexlox, sans-serif' }}>
            o7
          </div>
          <h1 className="text-white text-2xl font-bold">Welcome to o7.xr</h1>
          <p className="text-white/70 text-sm">
            Sign in to capture and share AR photos with your friends
          </p>
          <Button
            onClick={login}
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 mt-4"
            data-testid="button-login"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
