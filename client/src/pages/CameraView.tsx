import { useRef, useState } from 'react';
import { useCameraKit } from '@/hooks/useCameraKit';
import { usePrivy } from '@privy-io/react-auth';
import { usePayment } from '@/hooks/usePayment';
import CameraControls from '@/components/CameraControls';
import LensCarousel, { Lens } from '@/components/LensCarousel';
import PermissionScreen from '@/components/PermissionScreen';
import PhotoPreview from '@/components/PhotoPreview';
import AuthGuard from '@/components/AuthGuard';
import { Loader2, LogOut, SwitchCamera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const mockLenses: Lens[] = [
  { id: '887d80da-f4ba-4a40-a0d6-4e4d0cfb31b1', name: 'Lens 1', groupId: 'b5551368-7881-4a23-a034-a0e757ec85a7' },
  { id: '43276710876', name: 'Lens 2', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43276930875', name: 'Lens 3', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43281170875', name: 'Lens 4', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43288720877', name: 'Lens 5', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43288930875', name: 'Lens 6', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43290810875', name: 'Lens 7', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43290830875', name: 'Lens 8', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43293650876', name: 'Lens 9', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43294710875', name: 'Lens 10', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43296870875', name: 'Lens 11', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43296900875', name: 'Lens 12', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
];

function CameraViewContent() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLensId, setSelectedLensId] = useState<string | undefined>();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const { logout, user } = usePrivy();
  const { toast } = useToast();
  const { processPayment, loading: paymentLoading } = usePayment();

  const {
    status,
    error,
    requestPermission,
    applyLens,
    capturePhoto,
    toggleCamera,
    isFrontCamera
  } = useCameraKit(containerRef, canvasRef);

  const handleLensSelect = async (lens: Lens) => {
    console.log('Selecting lens:', lens.name, 'ID:', lens.id, 'Group ID:', lens.groupId);
    
    try {
      toast({
        title: 'Processing payment',
        description: 'Sending micropayment for lens access...',
      });

      await processPayment();

      toast({
        title: 'Payment successful',
        description: 'Applying lens...',
      });

      setSelectedLensId(lens.id);
      
      try {
        await applyLens(lens.id, lens.groupId || null);
        toast({
          title: 'Lens applied',
          description: `Successfully applied ${lens.name}`,
        });
      } catch (lensErr: any) {
        console.error('Lens application failed:', lensErr);
        toast({
          title: 'Lens application failed',
          description: lensErr.message || 'Unable to apply lens. Check console for details.',
          variant: 'destructive',
        });
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      toast({
        title: 'Payment failed',
        description: err.message || 'Unable to process payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
    <div className="fixed inset-0 bg-black overflow-hidden" ref={containerRef}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        data-testid="canvas-camera"
      />

      <div 
        className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" 
        aria-hidden="true"
      />

      <div className="absolute inset-x-0 top-0 z-30 p-4">
        <div className="flex items-center justify-between">
          <div className="text-white text-3xl font-bold" style={{ fontFamily: 'Lexlox, sans-serif', color: '#ffffff' }}>
            o7
          </div>
          <div className="flex items-center gap-3">
            <div className="text-white/70 text-xs uppercase tracking-widest">
              {status === 'loading' ? 'Initializing...' : status === 'ready' ? 'Ready' : 'Error'}
            </div>
            <Button
              onClick={logout}
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10"
              data-testid="button-logout"
            >
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white text-sm">Loading camera...</p>
          </div>
        </div>
      )}

      {status === 'ready' && (
        <>
          <div className="absolute bottom-24 left-0 right-0 z-30">
            <LensCarousel
              lenses={mockLenses}
              onLensSelect={handleLensSelect}
              selectedLensId={selectedLensId}
            />
          </div>

          <div className="absolute right-6 top-1/2 -translate-y-1/2 z-30">
            <Button
              onClick={toggleCamera}
              size="icon"
              variant="ghost"
              className="text-white hover:bg-white/10 rounded-full h-12 w-12"
              data-testid="button-switch-camera"
            >
              <SwitchCamera className="w-6 h-6" />
            </Button>
          </div>

          <CameraControls
            onCapture={handleCapture}
            disabled={status !== 'ready' || paymentLoading}
          />
        </>
      )}

      {paymentLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-white animate-spin" />
            <p className="text-white text-sm">Processing payment...</p>
          </div>
        </div>
      )}

      {status === 'error' && error && (
        <div className="absolute bottom-32 left-0 right-0 z-30 px-6">
          <div className="bg-destructive/90 backdrop-blur-lg text-destructive-foreground p-4 rounded-2xl text-center">
            <p className="text-sm font-medium">{error}</p>
          </div>
        </div>
      )}
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
