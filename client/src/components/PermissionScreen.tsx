import { Camera, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

interface PermissionScreenProps {
  onRequestPermission: () => void;
  error?: string | null;
}

export default function PermissionScreen({ onRequestPermission, error }: PermissionScreenProps) {
  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center p-6 z-50">
      <div className="max-w-sm w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Camera className="w-10 h-10 text-primary" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Camera Access Required
          </h1>
          <p className="text-muted-foreground">
            NeoSaga needs access to your camera to apply AR lenses and capture photos.
          </p>
        </div>

        {error && (
          <div 
            className="flex items-start gap-2 p-4 rounded-2xl bg-destructive/10 text-destructive text-sm"
            data-testid="text-permission-error"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="text-left">{error}</p>
          </div>
        )}

        <Button
          data-testid="button-request-permission"
          onClick={onRequestPermission}
          size="lg"
          className="w-full"
        >
          Enable Camera
        </Button>

        <p className="text-xs text-muted-foreground">
          You can change this permission anytime in your browser settings.
        </p>
      </div>
    </div>
  );
}
