import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PrivyProvider } from "@privy-io/react-auth";
import CameraView from "@/pages/CameraView";
import Marketplace from "@/pages/Marketplace";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Marketplace} />
      <Route path="/camera/:lensId" component={CameraView} />
      <Route path="/camera" component={CameraView} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const appId = import.meta.env.VITE_PRIVY_APP_ID;
  
  if (!appId) {
    throw new Error("Missing VITE_PRIVY_APP_ID environment variable");
  }

  return (
    <PrivyProvider
      appId={appId}
      config={{
        appearance: {
          theme: "dark",
          accentColor: "#C1FF72",
        },
        loginMethods: ["email", "wallet", "google"],
        embeddedWallets: {
          ethereum: {
            createOnLogin: "all-users",
          },
        },
      }}
    >
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </PrivyProvider>
  );
}

export default App;
