import { useState } from 'react';
import CameraControls from '../CameraControls';

export default function CameraControlsExample() {
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(true);

  return (
    <div className="relative h-96 bg-muted">
      <CameraControls
        onCapture={() => console.log('Capture triggered')}
        onToggleCamera={() => {
          console.log('Toggle camera');
          setIsFrontCamera(!isFrontCamera);
        }}
        onToggleFlash={() => {
          console.log('Toggle flash');
          setIsFlashEnabled(!isFlashEnabled);
        }}
        isFlashEnabled={isFlashEnabled}
        isFrontCamera={isFrontCamera}
      />
    </div>
  );
}
