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

        <div className="flex flex-wrap gap-6 justify-start">
          {mockLenses.map((lens) => {
            // Use hook to check license for each lens
            // eslint-disable-next-line react-hooks/rules-of-hooks
            const { hasLicense } = useLicense(lens.id);
            
            return (
              <div key={lens.id} className="flex flex-col items-center">
                {/* Gray background container with padding */}
                <div className="bg-gray-800/50 rounded-2xl p-3 mb-3 group cursor-pointer transition-all duration-200 hover:scale-105" onClick={() => hasLicense && setLocation(`/camera/${lens.id}`)}>
                  {/* Compact Image Card */}
                  <div
                    className="overflow-hidden rounded-xl relative"
                    style={{ width: '150px', height: '150px' }}
                    data-testid={`card-lens-${lens.id}`}
                  >
                    <img
                      src={lens.coverImage}
                      alt={lens.displayName}
                      className="w-full h-full object-cover"
                    />
                    {/* Badge positioned on image - top right */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className="inline-block font-bold text-xs px-2 py-0.5 rounded" style={{ backgroundColor: '#C1FF72', color: '#000' }}>
                        {lens.name.split(' ')[1] || lens.name}
                      </span>
                    </div>

                    {/* Hover Overlay with Button */}
                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-2">
                      {hasLicense ? (
                        <Button
                          className="w-full text-xs h-7 font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setLocation(`/camera/${lens.id}`);
                          }}
                          style={{ backgroundColor: '#C1FF72', color: '#000' }}
                          data-testid={`button-lens-use-${lens.id}`}
                        >
                          Use
                        </Button>
                      ) : (
                        <Button
                          className="w-full text-xs h-7 font-semibold"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLensForPurchase(lens.id);
                            setShowPurchaseModal(true);
                          }}
                          style={{ backgroundColor: '#C1FF72', color: '#000' }}
                          data-testid={`button-lens-purchase-${lens.id}`}
                        >
                          {lens.price} XRT
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Title Below Card */}
                <h4 
                  className="text-xs font-semibold text-white truncate text-center" 
                  data-testid={`text-lens-name-${lens.id}`}
                  style={{ width: '150px' }}
                >
                  {lens.displayName}
                </h4>
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
