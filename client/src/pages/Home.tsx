import { useLocation } from 'wouter';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogOut } from 'lucide-react';
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
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation('/library')}
              variant="ghost"
              className="text-white hover:bg-white/20"
              size="sm"
              data-testid="button-library"
            >
              Your Library
            </Button>
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
        </div>
      </header>

      <main className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">AR Filters</h1>
          <p className="text-muted-foreground">
            Unlock stunning AR effects with individual purchases
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockLenses.map((lens) => {
            // Use hook to check license for each lens
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { hasLicense } = useLicense(lens.id);
            
            return (
              <div 
                key={lens.id} 
                className="group cursor-pointer bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:scale-105"
                data-testid={`card-lens-${lens.id}`}
                onClick={() => hasLicense && setLocation(`/camera/${lens.id}`)}
              >
                {/* Image Section */}
                <div className="relative h-80 overflow-hidden rounded-t-2xl">
                  <img
                    src={lens.coverImage}
                    alt={lens.displayName}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay with Button */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    {hasLicense ? (
                      <Button
                        className="font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLocation(`/camera/${lens.id}`);
                        }}
                        style={{ backgroundColor: '#C1FF72', color: '#000' }}
                        data-testid={`button-lens-use-${lens.id}`}
                      >
                        Use Filter
                      </Button>
                    ) : (
                      <Button
                        className="font-semibold"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLensForPurchase(lens.id);
                          setShowPurchaseModal(true);
                        }}
                        style={{ backgroundColor: '#C1FF72', color: '#000' }}
                        data-testid={`button-lens-purchase-${lens.id}`}
                      >
                        Purchase
                      </Button>
                    )}
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-4">
                  {/* Title */}
                  <h3 
                    className="text-xl font-bold text-white leading-tight" 
                    data-testid={`text-lens-name-${lens.id}`}
                  >
                    {lens.displayName}
                  </h3>

                  {/* Filter Type with Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">AR Filter</span>
                    <div className="h-8 w-8 rounded-full border-2 border-gray-600 flex items-center justify-center" style={{ borderColor: hasLicense ? '#C1FF72' : '#4b5563' }}>
                      <span className="text-xs font-bold" style={{ color: hasLicense ? '#C1FF72' : '#9ca3af' }}>
                        {hasLicense ? '✓' : lens.name.slice(0, 1)}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-800"></div>

                  {/* Price Section */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block">Price</span>
                    <span className="text-base font-bold" style={{ color: '#C1FF72' }}>
                      {hasLicense ? '✓ Owned' : `${lens.price} XRT`}
                    </span>
                  </div>
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
