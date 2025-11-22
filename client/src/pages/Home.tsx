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
              <div key={lens.id} className="flex flex-col gap-4">
                {/* Image Card */}
                <Card
                  className="hover-elevate active-elevate-2 cursor-pointer overflow-hidden border-0 flex-1"
                  onClick={() => handleLensClick(lens.id)}
                  data-testid={`card-lens-${lens.id}`}
                >
                  <CardContent className="p-0">
                    <div className="aspect-[3/4] relative rounded-lg overflow-hidden">
                      <img
                        src={lens.coverImage}
                        alt={lens.displayName}
                        className="w-full h-full object-cover"
                      />
                      {/* Badge positioned in top right */}
                      <div className="absolute top-3 right-3">
                        <Badge className="font-bold text-xs" style={{ backgroundColor: '#C1FF72', color: '#000' }}>
                          {lens.name}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Section Below Card */}
                <div className="space-y-3">
                  {/* Title */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 
                      className="text-lg font-bold text-white leading-tight flex-1" 
                      data-testid={`text-lens-name-${lens.id}`}
                    >
                      {lens.displayName}
                    </h3>
                    {!hasLicense && (
                      <Lock className="w-4 h-4 text-white/50 flex-shrink-0 mt-1" />
                    )}
                  </div>

                  {/* Price Info */}
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">Price</span>
                    <span className="text-sm font-bold" style={{ color: '#C1FF72' }}>
                      {hasLicense ? '✓ Owned' : `${lens.price} XRT`}
                    </span>
                  </div>

                  {/* Purchase Button */}
                  <Button
                    className="w-full"
                    onClick={() => handleLensClick(lens.id)}
                    style={{ backgroundColor: '#C1FF72', color: '#000' }}
                    data-testid={`button-lens-${lens.id}`}
                  >
                    {hasLicense ? 'Use Filter' : 'Purchase'}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {selectedLensForPurchase && (
        <LicensePurchaseModal
          open={showPurchaseModal}
          onOpenChange={setShowPurchaseModal}
          lensId={selectedLensForPurchase}
          price={mockLenses.find(l => l.id === selectedLensForPurchase)?.price || 0}
          title={mockLenses.find(l => l.id === selectedLensForPurchase)?.displayName || 'AR Filter'}
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
