import { useLocation } from 'wouter';
import { Gamepad2, LogOut, Check, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import AuthGuard from '@/components/AuthGuard';
import { useState, useEffect } from 'react';
import LicensePurchaseModal from '@/components/LicensePurchaseModal';
import { Game } from '@/types/game';
import { useLicense } from '@/hooks/useLicense';
import { mockGames } from '@/lib/gameData';

// Component to handle individual game card with license checking
function GameCard({ 
  game, 
  onPurchase,
  refreshKey 
}: { 
  game: Game; 
  onPurchase: (gameId: string) => void;
  refreshKey: number;
}) {
  const [, setLocation] = useLocation();
  const { hasLicense, loading, refetch } = useLicense(game.id);
  
  // Refetch license status when refreshKey changes
  useEffect(() => {
    if (refreshKey > 0) {
      refetch();
    }
  }, [refreshKey, refetch]);

  // Check if user is on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const handleClick = () => {
    if (loading) return;
    
    // For mobile-only games, check device
    if (game.isMobileOnly && !isMobile) {
      return; // Don't do anything on desktop
    }
    
    if (hasLicense) {
      setLocation(`/game/${game.id}`);
    } else {
      onPurchase(game.id);
    }
  };

  return (
    <div 
      className="group cursor-pointer bg-gray-900/50 rounded-2xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-200 hover:scale-105"
      data-testid={`card-game-${game.id}`}
      onClick={handleClick}
    >
      {/* Image Section */}
      <div className="relative h-56 overflow-hidden rounded-t-2xl">
        <img
          src={game.coverImage}
          alt={game.displayName}
          className="w-full h-full object-cover"
        />
        
        {/* Hover Overlay with Button */}
        <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          {game.isMobileOnly && !isMobile ? (
            <div className="text-center px-4">
              <Smartphone className="w-8 h-8 text-white mb-2 mx-auto" />
              <p className="text-white text-sm mb-2">Mobile Only</p>
              <p className="text-gray-300 text-xs">Open on your phone to play</p>
            </div>
          ) : (
            <Button
              className="font-semibold"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
              style={{ backgroundColor: '#C1FF72', color: '#000' }}
              data-testid={`button-game-${game.id}`}
              disabled={loading}
            >
              {loading ? 'Checking...' : hasLicense ? 'Play Game' : 'Purchase'}
            </Button>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 space-y-4">
        {/* Title */}
        <h3 
          className="text-xl font-bold text-white leading-tight" 
          data-testid={`text-game-name-${game.id}`}
        >
          {game.displayName}
        </h3>

        {/* Game Type Badge */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400 flex items-center gap-1">
            {game.isMobileOnly && <Smartphone className="w-4 h-4" />}
            {game.isMobileOnly ? 'Mobile AR Game' : 'AR Game'}
          </span>
          <div className="h-8 w-8 rounded-full border-2 flex items-center justify-center" style={{ borderColor: hasLicense ? '#C1FF72' : '#4b5563' }}>
            {hasLicense ? (
              <Check className="w-4 h-4" style={{ color: '#C1FF72' }} />
            ) : (
              <Gamepad2 className="w-4 h-4" style={{ color: '#9ca3af' }} />
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
              {hasLicense ? 'Owned' : `${game.price} XRT`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function GamesContent() {
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();
  const [selectedGameForPurchase, setSelectedGameForPurchase] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePurchase = (gameId: string) => {
    setSelectedGameForPurchase(gameId);
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = () => {
    setShowPurchaseModal(false);
    setSelectedGameForPurchase(null);
    // Trigger refresh of all license statuses
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-background dark">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:bg-background/95 dark:supports-[backdrop-filter]:dark:bg-background/60">
        <div className="flex h-16 items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-6 h-6" style={{ color: '#C1FF72' }} />
            <div className="text-2xl font-bold" style={{ fontFamily: 'Lexlox, sans-serif', color: '#C1FF72' }}>
              Games
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setLocation('/')}
              variant="ghost"
              className="text-white hover:bg-white/20"
              size="sm"
              data-testid="button-back-home"
            >
              Back
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
          <h1 className="text-3xl font-bold mb-2 text-white">AR Games</h1>
          <p className="text-muted-foreground">
            Unlock immersive AR gaming experiences with individual purchases
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {mockGames.map((game) => (
            <GameCard key={game.id} game={game} onPurchase={handlePurchase} refreshKey={refreshKey} />
          ))}
        </div>
      </main>

      {selectedGameForPurchase && (
        <LicensePurchaseModal
          open={showPurchaseModal}
          onOpenChange={setShowPurchaseModal}
          lensId={selectedGameForPurchase}
          price={mockGames.find(g => g.id === selectedGameForPurchase)?.price || 0}
          title={mockGames.find(g => g.id === selectedGameForPurchase)?.displayName || 'AR Game'}
          onPurchaseSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
}

export default function Games() {
  return (
    <AuthGuard>
      <GamesContent />
    </AuthGuard>
  );
}
