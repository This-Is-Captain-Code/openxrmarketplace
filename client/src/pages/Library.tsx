import { useState, useCallback, useEffect } from 'react';
import { useLocation } from 'wouter';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogOut, ArrowLeft } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { mockLenses } from '@/pages/Marketplace';
import { Lens } from '@/types/lens';

// Component to check individual lens ownership
function LensOwnershipChecker({ lens, onOwned }: { lens: Lens; onOwned: (lens: Lens) => void }) {
  const { hasLicense, loading } = useLicense(lens.id);
  
  useEffect(() => {
    if (!loading && hasLicense) {
      onOwned(lens);
    }
  }, [hasLicense, loading, lens, onOwned]);
  
  return null;
}

function LibraryContent() {
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();
  const [ownedLenses, setOwnedLenses] = useState<Lens[]>([]);
  const [checkComplete, setCheckComplete] = useState(false);
  
  // Track which lenses are owned
  const handleLensOwned = useCallback((lens: Lens) => {
    setOwnedLenses(prev => {
      if (prev.find(l => l.id === lens.id)) return prev;
      return [...prev, lens];
    });
  }, []);
  
  useEffect(() => {
    // Mark check as complete after a short delay
    const timer = setTimeout(() => setCheckComplete(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background dark">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 dark:supports-[backdrop-filter]:dark:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation('/')}
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/20"
              data-testid="button-back"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="text-2xl font-bold" style={{ fontFamily: 'Lexlox, sans-serif', color: '#C1FF72' }}>
              Your Library
            </div>
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
        {/* Hidden ownership checkers */}
        {mockLenses.map(lens => (
          <LensOwnershipChecker key={lens.id} lens={lens} onOwned={handleLensOwned} />
        ))}
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">My AR Filters</h1>
          <p className="text-muted-foreground">
            {checkComplete ? (
              `${ownedLenses.length} filter${ownedLenses.length !== 1 ? 's' : ''} in your collection`
            ) : (
              'Loading your filters...'
            )}
          </p>
        </div>

        {checkComplete && ownedLenses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-gray-400 text-lg mb-6">No filters owned yet</p>
            <Button
              onClick={() => setLocation('/')}
              style={{ backgroundColor: '#C1FF72', color: '#000' }}
              className="font-semibold"
            >
              Browse Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {ownedLenses.map((lens) => (
              <div 
                key={lens.id} 
                className="group cursor-pointer bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:scale-105"
                data-testid={`card-library-${lens.id}`}
                onClick={() => setLocation(`/camera/${lens.id}`)}
              >
                {/* Image Section */}
                <div className="relative h-56 overflow-hidden rounded-t-2xl">
                  <img
                    src={lens.coverImage}
                    alt={lens.displayName}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Hover Overlay with Button */}
                  <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <Button
                      className="font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(`/camera/${lens.id}`);
                      }}
                      style={{ backgroundColor: '#C1FF72', color: '#000' }}
                      data-testid={`button-library-use-${lens.id}`}
                    >
                      Use Filter
                    </Button>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-5 space-y-4">
                  {/* Title */}
                  <h3 
                    className="text-xl font-bold text-white leading-tight" 
                    data-testid={`text-library-name-${lens.id}`}
                  >
                    {lens.displayName}
                  </h3>

                  {/* Filter Type with Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">AR Filter</span>
                    <div className="h-8 w-8 rounded-full border-2 border-gray-600 flex items-center justify-center" style={{ borderColor: '#C1FF72' }}>
                      <span className="text-xs font-bold" style={{ color: '#C1FF72' }}>
                        ✓
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-800"></div>

                  {/* Price Section */}
                  <div className="space-y-2">
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block">Status</span>
                    <span className="text-base font-bold" style={{ color: '#C1FF72' }}>
                      ✓ Owned
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default function Library() {
  return (
    <AuthGuard>
      <LibraryContent />
    </AuthGuard>
  );
}
