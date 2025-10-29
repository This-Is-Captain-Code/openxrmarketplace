import { useRef, useState } from 'react';
import { useCameraKit } from '@/hooks/useCameraKit';
import CameraControls from '@/components/CameraControls';
import LensCarousel, { Lens } from '@/components/LensCarousel';
import PermissionScreen from '@/components/PermissionScreen';
import PhotoPreview from '@/components/PhotoPreview';
import { Loader2 } from 'lucide-react';

const mockLenses: Lens[] = [
  { id: '40369030925', name: 'Lens 1', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43276710876', name: 'Lens 2', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43276930875', name: 'Lens 3', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43281170875', name: 'Lens 4', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
  { id: '43288720877', name: 'Lens 5', groupId: '2a385df2-4591-47df-9594-b273b456c862' },
];

export default function CameraView() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLensId, setSelectedLensId] = useState<string | undefined>();
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);

  const {
    status,
    error,
    requestPermission,
    applyLens,
    capturePhoto
  } = useCameraKit(containerRef, canvasRef);

  const handleLensSelect = (lens: Lens) => {
    console.log('Applying lens:', lens.name);
    setSelectedLensId(lens.id);
    applyLens(lens.id, lens.groupId || null);
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
          <div className="text-white text-3xl" style={{ fontFamily: 'Lexlox, sans-serif' }}>
            o7
          </div>
          <div className="text-white/70 text-xs uppercase tracking-widest">
            {status === 'loading' ? 'Initializing...' : status === 'ready' ? 'Ready' : 'Error'}
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
          <div className="absolute bottom-44 left-0 right-0 z-30">
            <LensCarousel
              lenses={mockLenses}
              onLensSelect={handleLensSelect}
              selectedLensId={selectedLensId}
            />
          </div>

          <CameraControls
            onCapture={handleCapture}
            disabled={status !== 'ready'}
          />
        </>
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
