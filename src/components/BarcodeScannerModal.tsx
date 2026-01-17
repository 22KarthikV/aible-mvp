/**
 * Barcode Scanner Modal Component
 *
 * Camera-based barcode scanner using @zxing/browser library.
 * Scans barcodes and pre-fills item data if available.
 */

import { useEffect, useRef, useState } from 'react';
import { X, Camera, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (barcode: string) => void;
}

export default function BarcodeScannerModal({
  isOpen,
  onClose,
  onScanSuccess,
}: BarcodeScannerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  /**
   * Initialize barcode scanner
   */
  useEffect(() => {
    if (!isOpen) {
      // Clean up when modal closes
      setIsScanning(false);
      setScannedCode(null);
      setError(null);
      return;
    }

    // Start scanning when modal opens
    startScanning();

    return () => {
      // Cleanup on unmount - the reader will be cleaned up in startScanning
    };
  }, [isOpen]);

  /**
   * Start camera and barcode scanning
   */
  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);

      // Check if camera permission is granted
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });

      // Stop the test stream
      stream.getTracks().forEach((track) => track.stop());

      // Initialize barcode reader
      const codeReader = new BrowserMultiFormatReader();
      codeReaderRef.current = codeReader;

      // Get video element
      if (!videoRef.current) {
        throw new Error('Video element not found');
      }

      // Start decoding from video device
      await codeReader.decodeFromVideoDevice(
        undefined, // Use default camera
        videoRef.current,
        (result, error) => {
          if (result) {
            const barcodeText = result.getText();
            console.log('Barcode scanned:', barcodeText);
            setScannedCode(barcodeText);
            setIsScanning(false);

            // Notify parent component
            setTimeout(() => {
              onScanSuccess(barcodeText);
              onClose();
            }, 1000);
          }

          if (error && error.name !== 'NotFoundException') {
            console.error('Barcode scanning error:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error starting camera:', err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to access camera. Please check permissions.'
      );
      setIsScanning(false);
    }
  };

  /**
   * Handle manual close
   */
  const handleClose = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-white">Scan Barcode</h2>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors"
              aria-label="Close scanner"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>

        {/* Scanner Area */}
        <div className="relative bg-black">
          {/* Video Stream */}
          <video
            ref={videoRef}
            className="w-full h-[400px] object-cover"
            autoPlay
            playsInline
          />

          {/* Scanning Overlay */}
          {isScanning && !scannedCode && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Scanning Frame */}
                <div className="w-64 h-64 border-4 border-blue-500 rounded-2xl relative">
                  {/* Corner Markers */}
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white" />

                  {/* Scanning Line Animation */}
                  <div className="absolute inset-0 overflow-hidden rounded-2xl">
                    <div className="w-full h-1 bg-blue-500 animate-scan-line" />
                  </div>
                </div>

                {/* Instructions */}
                <p className="text-white text-center mt-6 font-semibold bg-black/50 px-4 py-2 rounded-xl">
                  Position barcode within frame
                </p>
              </div>
            </div>
          )}

          {/* Success State */}
          {scannedCode && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                  <CheckCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-white text-xl font-bold mb-2">Barcode Scanned!</p>
                <p className="text-gray-300 font-mono bg-black/50 px-4 py-2 rounded-lg">
                  {scannedCode}
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center max-w-md px-6">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-12 h-12 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-white text-xl font-bold mb-2">Camera Error</p>
                <p className="text-gray-300 mb-6">{error}</p>
                <button
                  onClick={startScanning}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              {isScanning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                  <span className="text-sm font-semibold">Scanning...</span>
                </>
              ) : scannedCode ? (
                <>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    Success!
                  </span>
                </>
              ) : (
                <span className="text-sm font-semibold">
                  Ready to scan
                </span>
              )}
            </div>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(256px);
          }
        }
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
      `}</style>
    </div>
  );
}
