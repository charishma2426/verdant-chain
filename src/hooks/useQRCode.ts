import { useState, useCallback, useRef } from 'react';
import QRCode from 'qrcode';
import jsQR from 'jsqr';

export interface QRCodeData {
  id: string;
  type: 'batch' | 'product' | 'collection' | 'processing' | 'testing';
  data: any;
  timestamp: string;
  hash?: string;
}

export const useQRCode = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const generateQRCode = useCallback(async (
    data: QRCodeData,
    options?: {
      width?: number;
      margin?: number;
      color?: { dark?: string; light?: string };
    }
  ): Promise<string> => {
    setIsGenerating(true);
    
    try {
      const qrData = JSON.stringify(data);
      const qrCodeDataURL = await QRCode.toDataURL(qrData, {
        width: options?.width || 300,
        margin: options?.margin || 2,
        color: {
          dark: options?.color?.dark || '#2D4A3E', // Primary color
          light: options?.color?.light || '#FFFFFF'
        }
      });
      
      return qrCodeDataURL;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const generateBatchQR = useCallback(async (batchData: {
    batchId: string;
    productName: string;
    manufacturingDate: string;
    expiryDate?: string;
    provenanceHash: string;
  }): Promise<string> => {
    const qrData: QRCodeData = {
      id: batchData.batchId,
      type: 'batch',
      data: batchData,
      timestamp: new Date().toISOString(),
    };
    
    return generateQRCode(qrData);
  }, [generateQRCode]);

  const generateProductQR = useCallback(async (productData: {
    productId: string;
    name: string;
    type: string;
    batchIds: string[];
    packagingDate: string;
    verificationUrl?: string;
  }): Promise<string> => {
    const qrData: QRCodeData = {
      id: productData.productId,
      type: 'product',
      data: productData,
      timestamp: new Date().toISOString(),
    };
    
    return generateQRCode(qrData);
  }, [generateQRCode]);

  const startScanning = useCallback(async (
    onScan: (data: QRCodeData) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      onError('Camera not supported in this browser');
      return;
    }

    try {
      setIsScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        const scanFrame = () => {
          if (videoRef.current && canvasRef.current && isScanning) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            
            if (context && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              
              context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              
              const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
              const code = jsQR(imageData.data, imageData.width, imageData.height);
              
              if (code) {
                try {
                  const qrData = JSON.parse(code.data) as QRCodeData;
                  onScan(qrData);
                  stopScanning();
                } catch (e) {
                  onError('Invalid QR code format');
                }
              }
            }
            
            if (isScanning) {
              requestAnimationFrame(scanFrame);
            }
          }
        };

        videoRef.current.addEventListener('loadedmetadata', () => {
          scanFrame();
        });
      }
    } catch (error) {
      onError('Could not access camera');
      setIsScanning(false);
    }
  }, [isScanning]);

  const stopScanning = useCallback(() => {
    setIsScanning(false);
    
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  const scanFromImage = useCallback(async (
    imageFile: File,
    onScan: (data: QRCodeData) => void,
    onError: (error: string) => void
  ): Promise<void> => {
    try {
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        context?.drawImage(img, 0, 0);
        
        const imageData = context?.getImageData(0, 0, canvas.width, canvas.height);
        if (imageData) {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          
          if (code) {
            try {
              const qrData = JSON.parse(code.data) as QRCodeData;
              onScan(qrData);
            } catch (e) {
              onError('Invalid QR code format');
            }
          } else {
            onError('No QR code found in image');
          }
        }
      };
      
      img.src = URL.createObjectURL(imageFile);
    } catch (error) {
      onError('Error processing image');
    }
  }, []);

  return {
    isGenerating,
    isScanning,
    videoRef,
    canvasRef,
    generateQRCode,
    generateBatchQR,
    generateProductQR,
    startScanning,
    stopScanning,
    scanFromImage,
  };
};