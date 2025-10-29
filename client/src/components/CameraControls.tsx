import { User } from 'lucide-react';
import { Button } from './ui/button';

interface CameraControlsProps {
  onCapture: () => void;
  disabled?: boolean;
}

export default function CameraControls({
  onCapture,
  disabled = false
}: CameraControlsProps) {
  const handleCapture = () => {
    if (!disabled) {
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
      onCapture();
    }
  };

  return (
    <div className="fixed bottom-8 left-0 right-0 z-40 px-4">
      <div className="max-w-md mx-auto flex items-center justify-between">
        <Button
          data-testid="button-user-profile"
          size="icon"
          variant="ghost"
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex-shrink-0"
          aria-label="User profile"
        >
          <User className="w-5 h-5" />
        </Button>

        <button
          data-testid="button-capture"
          onClick={handleCapture}
          disabled={disabled}
          className="w-20 h-20 rounded-full bg-white/90 backdrop-blur-sm transition-transform active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center flex-shrink-0"
          aria-label="Capture photo"
        >
          <div className="w-16 h-16 rounded-full bg-white" />
        </button>

        <Button
          data-testid="button-help"
          size="icon"
          variant="ghost"
          className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 flex-shrink-0"
          aria-label="Help"
        >
          <span className="text-xl">?</span>
        </Button>
      </div>
    </div>
  );
}
