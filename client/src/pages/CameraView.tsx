import { useRef, useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useCameraKit } from '@/hooks/useCameraKit';
import { usePrivy } from '@privy-io/react-auth';
import CameraControls from '@/components/CameraControls';
import PermissionScreen from '@/components/PermissionScreen';
import PhotoPreview from '@/components/PhotoPreview';
import AuthGuard from '@/components/AuthGuard';
import { mockLenses } from '@/pages/Marketplace';
import { Loader2, LogOut, SwitchCamera, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

function CameraViewContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { lensId } = useParams<{ lensId?: string }>();
  const [, setLocation] = useLocation();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const [lensApplied, setLensApplied] = useState(false);
  const { logout } = usePrivy();
  const { toast } = useToast();

  const {
    status,
    error,
    requestPermission,
    applyLens,
    capturePhoto,
    toggleCamera,
    isFrontCamera
  } = useCameraKit(containerRef, canvasRef);

  useEffect(() => {
    if (status === 'ready' && lensId && !lensApplied) {
      const selectedLens = mockLenses.find(lens => lens.id === lensId);
      
      if (selectedLens) {
        console.log('Auto-applying lens:', selectedLens.name, 'ID:', selectedLens.id);
        
        applyLens(selectedLens.id, selectedLens.groupId || null)
          .then(() => {
            setLensApplied(true);
            toast({
              title: 'Lens applied',
              description: `${selectedLens.name} is ready`,
            });
          })
          .catch((lensErr: any) => {
            console.error('Lens application failed:', lensErr);
            toast({
              title: 'Lens application failed',
              description: lensErr.message || 'Unable to apply lens',
              variant: 'destructive',
            });
          });
      }
    }
  }, [status, lensId, lensApplied, applyLens, toast]);

  const handleCapture = async () => {
    console.log('Capturing photo...');
    const photoDataUrl = await capturePhoto();
    if (photoDataUrl) {
      setCapturedPhoto(photoDataUrl);
      if ('vibrate' in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    }
  };

  const handleRetake = () => {
    setCapturedPhoto(null);
  };

  if (status === 'permission_needed') {
    return <PermissionScreen onRequestPermission={requestPermission} error={error} />;
  }

  if (capturedPhoto) {
    return (
      <PhotoPreview
        imageDataUrl={capturedPhoto}
        onClose={handleRetake}
        onRetake={handleRetake}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="relative w-full h-full max-w-2xl max-h-[100vh] md:max-h-[90vh] md:rounded-2xl overflow-hidden bg-black" ref={containerRef}>
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
          data-testid="canvas-camera"
        />

        <div 
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" 
          aria-hidden="true"
        />

        <div className="absolute inset-x-0 top-0 z-30 p-3 md:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setLocation('/')}
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10 h-9 w-9 md:h-10 md:w-10"
                data-testid="button-back"
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <div className="text-white text-2xl md:text-3xl font-bold" style={{ fontFamily: 'Lexlox, sans-serif', color: '#ffffff' }}>
                o7
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:block text-white/70 text-xs uppercase tracking-widest">
                {status === 'loading' ? 'Initializing...' : status === 'ready' ? 'Ready' : 'Error'}
              </div>
              <Button
                onClick={logout}
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10 h-9 w-9 md:h-10 md:w-10"
                data-testid="button-logout"
              >
                <LogOut className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </div>
        </div>

        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-10 h-10 md:w-12 md:h-12 text-white animate-spin" />
              <p className="text-white text-sm">Loading camera...</p>
            </div>
          </div>
        )}

        {status === 'ready' && (
          <>
            <div className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-30">
              <Button
                onClick={toggleCamera}
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10 rounded-full h-10 w-10 md:h-12 md:w-12"
                data-testid="button-switch-camera"
              >
                <SwitchCamera className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </div>

            <CameraControls
              onCapture={handleCapture}
              disabled={status !== 'ready'}
            />
          </>
        )}

        {status === 'error' && error && (
          <div className="absolute bottom-32 left-0 right-0 z-30 px-4 md:px-6">
            <div className="bg-destructive/90 backdrop-blur-lg text-destructive-foreground p-4 rounded-2xl text-center">
              <p className="text-sm font-medium">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CameraView() {
  return (
    <AuthGuard>
      <CameraViewContent />
    </AuthGuard>
  );
}
