import { X, Download, Share2, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';

interface PhotoPreviewProps {
  imageDataUrl: string;
  onClose: () => void;
  onRetake: () => void;
}

export default function PhotoPreview({ imageDataUrl, onClose, onRetake }: PhotoPreviewProps) {
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageDataUrl;
    link.download = `o7-xr-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log('Photo downloaded');
  };

  const handleShare = async () => {
    try {
      const blob = await (await fetch(imageDataUrl)).blob();
      const file = new File([blob], `o7-xr-${Date.now()}.png`, { type: 'image/png' });
      
      if (navigator.share && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Photo from o7.xr',
        });
        console.log('Photo shared successfully');
      } else {
        console.log('Share not supported, falling back to download');
        handleDownload();
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button
          data-testid="button-close-preview"
          size="icon"
          variant="ghost"
          onClick={onClose}
          aria-label="Close preview"
        >
          <X className="w-5 h-5" />
        </Button>

        <div className="flex items-center gap-2">
          <Button
            data-testid="button-share-photo"
            size="icon"
            variant="ghost"
            onClick={handleShare}
            aria-label="Share photo"
          >
            <Share2 className="w-5 h-5" />
          </Button>
          <Button
            data-testid="button-download-photo"
            size="icon"
            variant="ghost"
            onClick={handleDownload}
            aria-label="Download photo"
          >
            <Download className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4 overflow-hidden">
        <img
          src={imageDataUrl}
          alt="Captured photo"
          className="max-w-full max-h-full object-contain rounded-2xl"
          data-testid="img-preview"
        />
      </div>

      <div className="p-6 pb-8 border-t border-border">
        <Button
          data-testid="button-retake"
          onClick={onRetake}
          variant="outline"
          className="w-full"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retake Photo
        </Button>
      </div>
    </div>
  );
}
