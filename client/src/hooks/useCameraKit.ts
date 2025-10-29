import { useState, useEffect, useRef, RefObject } from 'react';
import { initializeCamera, applyLensToCanvas, captureCanvas, cleanupCamera } from '../lib/cameraKitService';

type CameraStatus = 'loading' | 'permission_needed' | 'ready' | 'error';

export const useCameraKit = (
  containerRef: RefObject<HTMLDivElement>,
  canvasRef: RefObject<HTMLCanvasElement>
) => {
  const [status, setStatus] = useState<CameraStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isFrontCamera, setIsFrontCamera] = useState(true);
  const [isFlashEnabled, setIsFlashEnabled] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const init = async () => {
      try {
        if (!containerRef.current || !canvasRef.current) {
          throw new Error('Container or canvas reference not available');
        }

        const permission = await navigator.permissions.query({ 
          name: 'camera' as PermissionName 
        });
        
        if (permission.state === 'denied') {
          setStatus('permission_needed');
          return;
        }

        setStatus('loading');
        
        const stream = await initializeCamera({
          canvas: canvasRef.current,
          facingMode: isFrontCamera ? 'user' : 'environment'
        });
        
        if (!mounted) {
          stream.getTracks().forEach(track => track.stop());
          await cleanupCamera();
          return;
        }
        
        streamRef.current = stream;
        setStatus('ready');
      } catch (err) {
        console.error('Camera initialization failed:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to initialize camera');
          setStatus('error');
        }
      }
    };
    
    init();
    
    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      cleanupCamera().catch(err => {
        console.warn('Error during Camera Kit cleanup:', err);
      });
    };
  }, [containerRef, canvasRef, isFrontCamera]);

  const requestPermission = async () => {
    try {
      setStatus('loading');
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const stream = await initializeCamera({
        canvas: canvasRef.current!,
        facingMode: isFrontCamera ? 'user' : 'environment'
      });
      
      streamRef.current = stream;
      setStatus('ready');
    } catch (err) {
      console.error('Permission request failed:', err);
      setError(err instanceof Error ? err.message : 'Permission denied');
      setStatus('permission_needed');
    }
  };

  const toggleCamera = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    await cleanupCamera();
    setIsFrontCamera(prev => !prev);
  };

  const toggleFlash = () => {
    if (streamRef.current) {
      const videoTrack = streamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = videoTrack.getCapabilities() as any;
        if (capabilities?.torch) {
          const newFlashState = !isFlashEnabled;
          videoTrack.applyConstraints({
            advanced: [{ torch: newFlashState } as any]
          }).then(() => {
            setIsFlashEnabled(newFlashState);
          }).catch(err => {
            console.error('Failed to toggle flash:', err);
          });
        }
      }
    }
  };
  
  const applyLens = (lensId: string, groupId: string | null = null) => {
    if (status !== 'ready' || !canvasRef.current) {
      return;
    }
    
    applyLensToCanvas(canvasRef.current, lensId, groupId).catch(err => {
      console.error('Failed to apply lens:', err);
      setError(err instanceof Error ? err.message : 'Failed to apply lens');
    });
  };

  const capturePhoto = async (): Promise<string | null> => {
    if (status !== 'ready' || !canvasRef.current) {
      return null;
    }
    
    try {
      return await captureCanvas(canvasRef.current);
    } catch (err) {
      console.error('Failed to capture photo:', err);
      setError(err instanceof Error ? err.message : 'Failed to capture photo');
      return null;
    }
  };

  return {
    status,
    error,
    isFrontCamera,
    isFlashEnabled,
    requestPermission,
    toggleCamera,
    toggleFlash,
    applyLens,
    capturePhoto
  };
};
