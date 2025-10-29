import CaptureButton from '../CaptureButton';

export default function CaptureButtonExample() {
  return (
    <div className="flex items-center justify-center h-40 bg-background">
      <CaptureButton onCapture={() => console.log('Capture triggered')} />
    </div>
  );
}
