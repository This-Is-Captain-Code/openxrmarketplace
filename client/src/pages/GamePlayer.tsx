import { useParams, useLocation } from 'wouter';
import { useEffect, useState } from 'react';
import { ArrowLeft, LogOut, AlertCircle, Smartphone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePrivy } from '@privy-io/react-auth';
import AuthGuard from '@/components/AuthGuard';
import { useLicense } from '@/hooks/useLicense';
import { mockGames } from '@/lib/gameData';
import LicensePurchaseModal from '@/components/LicensePurchaseModal';
import { useToast } from '@/hooks/use-toast';

function GamePlayerContent() {
  const { gameId } = useParams<{ gameId: string }>();
  const [, setLocation] = useLocation();
  const { logout } = usePrivy();
  const { toast } = useToast();
  const [showLicenseModal, setShowLicenseModal] = useState(false);
  const { hasLicense, loading: licenseLoading, refetch } = useLicense(gameId || '');
  
  const game = mockGames.find(g => g.id === gameId);
  
  // Check if user is on mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  useEffect(() => {
    if (!licenseLoading && !hasLicense && gameId) {
      setShowLicenseModal(true);
    }
  }, [hasLicense, licenseLoading, gameId]);

  if (!game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Game Not Found</h1>
          <Button onClick={() => setLocation('/games')} data-testid="button-back-games">
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  // Mobile-only restriction
  if (game.isMobileOnly && !isMobile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto px-4 text-center space-y-6">
          <Smartphone className="w-24 h-24 mx-auto" style={{ color: '#C1FF72' }} />
          <h1 className="text-3xl font-bold text-white">Mobile Only</h1>
          <p className="text-gray-300">
            This AR game is designed for mobile devices. Please open this page on your smartphone to play.
          </p>
          <Button 
            onClick={() => setLocation('/games')} 
            data-testid="button-back-games"
            style={{ backgroundColor: '#C1FF72', color: '#000' }}
          >
            Back to Games
          </Button>
        </div>
      </div>
    );
  }

  // License check - show purchase modal if not owned
  if (!licenseLoading && !hasLicense) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <div className="max-w-sm mx-auto px-4 text-center space-y-6">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">{game.displayName}</h1>
            <p className="text-gray-300 mb-4">Unlock this AR game with a one-time purchase</p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Price:</span>
              <span className="text-2xl font-bold" style={{ color: '#C1FF72' }}>
                {game.price} XRT
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => setShowLicenseModal(true)}
              className="w-full font-semibold"
              size="lg"
              style={{ backgroundColor: '#C1FF72', color: '#000' }}
              data-testid="button-purchase-game"
            >
              Purchase Game
            </Button>
            <Button
              onClick={() => setLocation('/games')}
              variant="ghost"
              className="w-full text-white"
              data-testid="button-back-games"
            >
              Back to Games
            </Button>
          </div>
        </div>

        <LicensePurchaseModal
          open={showLicenseModal}
          onOpenChange={setShowLicenseModal}
          lensId={game.id}
          price={game.price}
          title={game.displayName}
          onPurchaseSuccess={() => {
            setShowLicenseModal(false);
            refetch();
            toast({
              title: 'Game unlocked!',
              description: 'Loading your game...',
            });
          }}
        />
      </div>
    );
  }

  // Loading state
  if (licenseLoading) {
    return (
      <div className="fixed inset-0 bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 mx-auto mb-4" style={{ borderColor: '#C1FF72' }}></div>
          <p className="text-gray-400">Checking access...</p>
        </div>
      </div>
    );
  }

  // Game iframe player (user owns the game)
  return (
    <div className="fixed inset-0 bg-black flex flex-col">
      {/* Header */}
      <header className="flex-shrink-0 bg-background/95 backdrop-blur border-b border-gray-800 z-50">
        <div className="flex h-14 items-center justify-between px-4">
          <Button
            onClick={() => setLocation('/games')}
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/20"
            data-testid="button-back-games"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold text-white">{game.displayName}</h1>
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

      {/* Game iframe */}
      <div className="flex-1 relative">
        <iframe
          src={game.url}
          title={game.displayName}
          className="absolute inset-0 w-full h-full border-0"
          allow="camera;gyroscope;accelerometer;magnetometer;xr-spatial-tracking;microphone;"
          allowFullScreen
          data-testid="iframe-game"
        />
      </div>
    </div>
  );
}

export default function GamePlayer() {
  return (
    <AuthGuard>
      <GamePlayerContent />
    </AuthGuard>
  );
}
