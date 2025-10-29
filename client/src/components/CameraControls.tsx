import { Zap, ZapOff, SwitchCamera } from 'lucide-react';
import { Button } from './ui/button';
import CaptureButton from './CaptureButton';

interface CameraControlsProps {
  onCapture: () => void;
  onToggleCamera: () => void;
  onToggleFlash: () => void;
  isFlashEnabled: boolean;
  isFrontCamera: boolean;
  disabled?: boolean;
}

export default function CameraControls({
  onCapture,
  onToggleCamera,
  onToggleFlash,
  isFlashEnabled,
  isFrontCamera,
  disabled = false
}: CameraControlsProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-background/80 backdrop-blur-lg border-t border-border/50 rounded-t-3xl px-6 py-6 pb-8">
        <div className="flex items-center justify-between max-w-md mx-auto">
          <Button
            data-testid="button-flash-toggle"
            size="icon"
            variant="ghost"
            onClick={onToggleFlash}
            disabled={disabled || isFrontCamera}
            className="w-12 h-12 rounded-full"
            aria-label={isFlashEnabled ? 'Disable flash' : 'Enable flash'}
          >
            {isFlashEnabled ? (
              <Zap className="w-5 h-5" />
            ) : (
              <ZapOff className="w-5 h-5" />
            )}
          </Button>

          <CaptureButton onCapture={onCapture} disabled={disabled} />

          <Button
            data-testid="button-camera-toggle"
            size="icon"
            variant="ghost"
            onClick={onToggleCamera}
            disabled={disabled}
            className="w-12 h-12 rounded-full"
            aria-label="Switch camera"
          >
            <SwitchCamera className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
