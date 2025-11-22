import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogOut } from 'lucide-react';

interface XRApp {
  id: string;
  name: string;
  description: string;
  coverImage: string;
}

const xrApps: XRApp[] = [
  {
    id: 'lenses',
    name: 'AR Lenses',
    description: 'Transform your camera with stunning AR effects',
    coverImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
];

function HomeContent() {
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();

  const handleAppClick = (appId: string) => {
    if (appId === 'lenses') {
      setLocation('/camera');
    } else {
      setLocation(`/app/${appId}`);
    }
  };

  return (
    <div className="min-h-screen bg-background dark">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 dark:supports-[backdrop-filter]:dark:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          <div className="text-2xl font-bold" style={{ fontFamily: 'Lexlox, sans-serif', color: '#C1FF72' }}>
            o7.xr
          </div>
          <Button
            onClick={logout}
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            data-testid="button-logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">XR Applications</h1>
          <p className="text-muted-foreground">
            Explore immersive experiences powered by Snap Camera Kit
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {xrApps.map((app) => (
            <Card
              key={app.id}
              className="hover-elevate active-elevate-2 cursor-pointer overflow-hidden border-0 h-full"
              onClick={() => handleAppClick(app.id)}
              data-testid={`card-app-${app.id}`}
            >
              <CardContent className="p-0 relative h-96">
                <div
                  className="absolute inset-0 w-full h-full"
                  style={{
                    background: app.coverImage,
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-2xl" data-testid={`text-app-name-${app.id}`}>
                    {app.name}
                  </h3>
                  <p className="text-sm opacity-80 font-medium">
                    {app.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}
