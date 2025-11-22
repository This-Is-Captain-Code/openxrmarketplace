import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogOut, Lock } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { mockLenses } from '@/pages/Marketplace';
import { useState } from 'react';
import LicensePurchaseModal from '@/components/LicensePurchaseModal';

function HomeContent() {
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();
  const [selectedLensForPurchase, setSelectedLensForPurchase] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);

  const handleLensClick = (lensId: string) => {
    // Check if user has license for this lens
    const useLicenseHook = useLicense(lensId);
    if (useLicenseHook.hasLicense) {
      // Go directly to camera with the lens
      setLocation(`/camera/${lensId}`);
    } else {
      // Show purchase modal
      setSelectedLensForPurchase(lensId);
      setShowPurchaseModal(true);
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
          <h1 className="text-3xl font-bold mb-2 text-white">AR Filters</h1>
          <p className="text-muted-foreground">
            Unlock stunning AR effects with individual purchases
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {mockLenses.map((lens) => {
            // Use hook to check license for each lens
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { hasLicense } = useLicense(lens.id);
            
            return (
              <Card
                key={lens.id}
                className="hover-elevate active-elevate-2 cursor-pointer overflow-hidden border-0 h-full flex flex-col"
                data-testid={`card-lens-${lens.id}`}
              >
                <CardContent className="p-0 relative flex-1">
                  <div className="aspect-video relative">
                    <img
                      src={lens.coverImage}
                      alt={lens.displayName}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                    <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
                      <div>
                        <span className="text-xs font-bold tracking-wider bg-primary/90 backdrop-blur-sm px-2 py-1 rounded-md inline-block">
                          {lens.name}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2 drop-shadow-2xl" data-testid={`text-lens-name-${lens.id}`}>
                          {lens.displayName}
                        </h3>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="font-bold" style={{ backgroundColor: '#C1FF72', color: '#000' }}>
                            {hasLicense ? '✓ Owned' : `${lens.price} XRT`}
                          </Badge>
                          {!hasLicense && (
                            <Lock className="w-4 h-4 text-white/70" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <div className="px-4 py-3 border-t border-white/10">
                  <Button
                    className="w-full"
                    onClick={() => handleLensClick(lens.id)}
                    data-testid={`button-lens-${lens.id}`}
                  >
                    {hasLicense ? 'Use Filter' : 'Purchase'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </main>

      {selectedLensForPurchase && (
        <LicensePurchaseModal
          open={showPurchaseModal}
          onOpenChange={setShowPurchaseModal}
          lensId={selectedLensForPurchase}
          onPurchaseSuccess={() => {
            setShowPurchaseModal(false);
            setSelectedLensForPurchase(null);
            // User can click to use filter after purchase
          }}
        />
      )}
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
