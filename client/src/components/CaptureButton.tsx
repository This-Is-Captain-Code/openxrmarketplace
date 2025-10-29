import { Camera } from 'lucide-react';
import { Button } from './ui/button';

interface CaptureButtonProps {
  onCapture: () => void;
  disabled?: boolean;
}

export default function CaptureButton({ onCapture, disabled = false }: CaptureButtonProps) {
  const handleCapture = () => {
    if (!disabled) {
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onCapture();
    }
  };

  return (
    <button
      data-testid="button-capture"
      onClick={handleCapture}
      disabled={disabled}
      className="relative flex items-center justify-center w-18 h-18 rounded-full bg-background border-4 border-foreground transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
      aria-label="Capture photo"
    >
      <div className="w-14 h-14 rounded-full bg-foreground flex items-center justify-center">
        <Camera className="w-6 h-6 text-background" />
      </div>
    </button>
  );
}
