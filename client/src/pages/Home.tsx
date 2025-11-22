import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogOut, Lock } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { GAME_LICENSING_CONFIG } from '@/lib/sagaChain';
import lenzLogo from '@assets/generated_images/lenz.dev_circular_lens_icon_-_no_text.png';
import lenzBackground from '@assets/generated_images/ar_camera_lens_product_background_-_abstract_modern.png';

interface XRApp {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  price?: string;
  logo?: string;
}

const xrApps: XRApp[] = [
  {
    id: 'lenses',
    name: 'Lenz.dev',
    description: 'Transform your camera with stunning AR effects',
    coverImage: `url(${lenzBackground})`,
    price: GAME_LICENSING_CONFIG.arLensesPrice,
    logo: lenzLogo,
  },
];

function HomeContent() {
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();
  const { hasLicense } = useLicense();

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
                <div className="absolute inset-0" style={{
                  background: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0) 100%)'
                }} />
                <div className="absolute inset-0 flex flex-col justify-between p-6 text-white">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 justify-between">
                      <h3 className="text-2xl font-bold drop-shadow-2xl" data-testid={`text-app-name-${app.id}`}>
                        {app.name}
                      </h3>
                      {app.price && (
                        <Badge variant="secondary" className="bg-primary text-black font-bold">
                          {hasLicense ? '✓ Owned' : `${app.price} XRT`}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm opacity-80 font-medium">
                      {app.description}
                    </p>
                    {app.price && !hasLicense && (
                      <p className="text-xs opacity-70 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Premium Feature
                      </p>
                    )}
                  </div>
                  {app.logo && (
                    <div className="flex justify-start pt-4">
                      <img 
                        src={app.logo} 
                        alt={app.name} 
                        className="w-12 h-12 rounded-full object-cover"
                        data-testid={`logo-app-${app.id}`}
                      />
                    </div>
                  )}
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
