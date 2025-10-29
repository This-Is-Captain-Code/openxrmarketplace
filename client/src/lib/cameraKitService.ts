import { SNAP_API_TOKEN, SNAP_GROUP_ID } from './config';

let cameraKit: any = null;
let session: any = null;
let currentLensId: string | null = null;

interface InitOptions {
  canvas: HTMLCanvasElement;
  facingMode: 'user' | 'environment';
}

export const initializeCamera = async ({ canvas, facingMode }: InitOptions): Promise<MediaStream> => {
  if (typeof window === 'undefined') {
    throw new Error('Camera Kit can only be initialized on the client side');
  }

  try {
    console.log('Initializing Camera Kit...');
    
    const { bootstrapCameraKit } = await import('@snap/camera-kit');
    
    const apiToken = (window as any).SNAP_CUSTOM_API_KEY || SNAP_API_TOKEN;
    
    cameraKit = await bootstrapCameraKit({
      apiToken
    });
    console.log('CameraKit initialized successfully');
    
    session = await cameraKit.createSession({ liveRenderTarget: canvas });
    console.log('Session created successfully');
    
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      }
    });
    console.log('Got media stream successfully');
    
    await session.setSource(mediaStream);
    console.log('Set source successfully');
    
    await session.play();
    console.log('Session playing successfully');
    
    return mediaStream;
  } catch (error) {
    console.error('Snap Camera Kit initialization failed:', error);
    throw error;
  }
};

export const applyLensToCanvas = async (
  canvas: HTMLCanvasElement,
  lensId: string,
  groupId: string | null
): Promise<void> => {
  if (!cameraKit || !session) {
    console.error('Camera Kit not initialized');
    throw new Error('Camera Kit not initialized');
  }
  
  try {
    console.log(`Applying lens ${lensId} from group ${groupId}`);
    
    if (currentLensId === lensId) {
      console.log('Lens already applied, skipping');
      return;
    }
    
    const effectiveGroupId = groupId || SNAP_GROUP_ID;
    const lens = await cameraKit.lensRepository.loadLens(lensId, effectiveGroupId);
    
    if (!lens) {
      throw new Error(`Lens ${lensId} not found`);
    }
    
    await session.applyLens(lens);
    currentLensId = lensId;
    console.log(`Successfully applied lens: ${lensId}`);
    
  } catch (error) {
    console.error('Failed to apply lens:', error);
    throw error;
  }
};

export const captureCanvas = async (
  canvas: HTMLCanvasElement, 
  facingMode: 'user' | 'environment' = 'user'
): Promise<string> => {
  try {
    console.log('Capturing photo from canvas...');
    
    const captureCanvas = document.createElement('canvas');
    const ctx = captureCanvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }
    
    const targetWidth = 1080;
    const targetHeight = 1920;
    captureCanvas.width = targetWidth;
    captureCanvas.height = targetHeight;
    
    const sourceWidth = canvas.width;
    const sourceHeight = canvas.height;
    
    const scaleX = targetWidth / sourceWidth;
    const scaleY = targetHeight / sourceHeight;
    const scale = Math.max(scaleX, scaleY);
    
    const scaledSourceWidth = targetWidth / scale;
    const scaledSourceHeight = targetHeight / scale;
    const sourceX = (sourceWidth - scaledSourceWidth) / 2;
    const sourceY = (sourceHeight - scaledSourceHeight) / 2;
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, targetWidth, targetHeight);
    
    ctx.drawImage(
      canvas,
      sourceX, sourceY, scaledSourceWidth, scaledSourceHeight,
      0, 0, targetWidth, targetHeight
    );
    
    const dataUrl = captureCanvas.toDataURL('image/png', 1.0);
    console.log('Photo captured successfully');
    
    return dataUrl;
  } catch (error) {
    console.error('Failed to capture photo:', error);
    throw error;
  }
};

export const cleanupCamera = async (): Promise<void> => {
  try {
    if (session) {
      await session.destroy();
      session = null;
    }
    
    cameraKit = null;
    currentLensId = null;
    console.log('Camera Kit cleaned up successfully');
  } catch (error) {
    console.error('Failed to cleanup Camera Kit:', error);
  }
};
