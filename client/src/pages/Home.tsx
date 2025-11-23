import { useLocation } from 'wouter';
import AuthGuard from '@/components/AuthGuard';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import { LogOut, Check, Gamepad2 } from 'lucide-react';
import { useLicense } from '@/hooks/useLicense';
import { mockLenses } from '@/lib/lensData';
import { mockGames } from '@/lib/gameData';
import { useState, useEffect } from 'react';
import LicensePurchaseModal from '@/components/LicensePurchaseModal';
import { Lens } from '@/types/lens';
import { Game } from '@/types/game';

// Unified game item card for both lenses and WebXR games
function GameItemCard({ 
  item, 
  itemType,
  onPurchase,
  refreshKey 
}: { 
  item: Lens | Game; 
  itemType: 'lens' | 'game';
  onPurchase: (itemId: string) => void;
  refreshKey: number;
}) {
  const [, setLocation] = useLocation();
  const { hasLicense, loading, refetch } = useLicense(item.id);
  
  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  const handleAction = () => {
    if (loading) return;
    
    if (hasLicense) {
      setLocation(itemType === 'lens' ? `/camera/${item.id}` : `/game/${item.id}`);
    } else {
      onPurchase(item.id);
    }
  };

  const typeLabel = itemType === 'lens' ? 'AR Game' : 'WebXR Game';
  const icon = itemType === 'lens' && 'name' in item ? (
    <span className="text-xs font-bold" style={{ color: '#9ca3af' }}>
      {item.name.slice(0, 1)}
    </span>
  ) : (
    <Gamepad2 className="w-4 h-4" style={{ color: '#9ca3af' }} />
  );

  return (
    <div 
      onClick={handleAction}
      className="group cursor-pointer overflow-hidden rounded-lg bg-black border border-gray-800 hover:border-gray-600 transition-all duration-200"
      data-testid={`card-${itemType}-${item.id}`}
    >
      {/* Image Section */}
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={item.coverImage} 
          alt={item.displayName}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 
          className="text-xl font-bold text-white leading-tight" 
          data-testid={`text-${itemType}-name-${item.id}`}
        >
          {item.displayName}
        </h3>

        {/* Game Type with Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">{typeLabel}</span>
          <div className="h-8 w-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: hasLicense ? '#C1FF72' : '#4b5563' }}>
            {hasLicense ? (
              <Check className="w-4 h-4" style={{ color: '#C1FF72' }} />
            ) : (
              icon
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-800"></div>

        {/* Price Section */}
        <div className="space-y-2">
          <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold block">Price</span>
          <div className="flex items-center gap-2">
            {hasLicense && <Check className="w-4 h-4" style={{ color: '#C1FF72' }} />}
            <span className="text-base font-bold" style={{ color: '#C1FF72' }}>
              {hasLicense ? 'Owned' : `${item.price} XRT`}
            </span>
          </div>
        </div>

        {/* Bottom Button - Always visible, more prominent on hover */}
        <div className="pt-2">
          <Button
            className="w-full font-semibold opacity-60 group-hover:opacity-100 transition-opacity duration-200"
            onClick={(e) => {
              e.stopPropagation();
              handleAction();
            }}
            style={{ backgroundColor: '#C1FF72', color: '#000' }}
            data-testid={`button-${itemType}-${item.id}`}
            disabled={loading}
          >
            {loading ? 'Checking...' : hasLicense ? 'Play Game' : 'Purchase'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function HomeContent() {
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();
  const [selectedItemForPurchase, setSelectedItemForPurchase] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePurchase = (itemId: string) => {
    setSelectedItemForPurchase(itemId);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    setSelectedItemForPurchase(null);
    // Trigger refresh of all license statuses
    setRefreshKey(prev => prev + 1);
  };

  const selectedItem = selectedItemForPurchase 
    ? mockLenses.find(l => l.id === selectedItemForPurchase) || mockGames.find(g => g.id === selectedItemForPurchase)
    : null;

  return (
    <div className="min-h-screen bg-background dark">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 dark:supports-[backdrop-filter]:dark:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          <div className="text-2xl font-bold" style={{ fontFamily: 'Lexlox, sans-serif', color: '#C1FF72' }}>
            NeoSaga
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
        {/* Games Section - includes all AR lenses and WebXR games */}
        <section>
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2 text-white">Games</h1>
            <p className="text-muted-foreground">
              Unlock immersive AR experiences and WebXR games
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockLenses.map((lens) => (
              <GameItemCard key={lens.id} item={lens} itemType="lens" onPurchase={handlePurchase} refreshKey={refreshKey} />
            ))}
            {mockGames.map((game) => (
              <GameItemCard key={game.id} item={game} itemType="game" onPurchase={handlePurchase} refreshKey={refreshKey} />
            ))}
          </div>
        </section>
      </main>

      {selectedItemForPurchase && selectedItem && (
        <LicensePurchaseModal
          open={showPurchaseModal}
          onOpenChange={setShowPurchaseModal}
          lensId={selectedItemForPurchase}
          price={selectedItem.price}
          title={selectedItem.displayName}
          onPurchaseSuccess={handlePurchaseSuccess}
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
