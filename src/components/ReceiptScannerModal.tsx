/**
 * Receipt Scanner Modal Component
 *
 * Allows users to capture or upload receipt images for OCR processing.
 * Uses Google Vision API to extract item information from receipts.
 */

import { useRef, useState, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  Loader2,
  AlertCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import {
  processReceiptImage,
  imageFileToBase64,
  type ParsedReceipt,
} from '../services/receiptOCRService';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReceiptProcessed: (receipt: ParsedReceipt, imageData: string) => void;
}

export default function ReceiptScannerModal({
  isOpen,
  onClose,
  onReceiptProcessed,
}: ReceiptScannerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [mode, setMode] = useState<'select' | 'camera' | 'upload'>('select');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  /**
   * Initialize camera when entering camera mode
   */
  useEffect(() => {
    let mediaStream: MediaStream | null = null;

    const initCamera = async () => {
      if (mode === 'camera' && videoRef.current && !stream) {
        try {
          setError(null);
          mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: 1280, height: 720 },
          });

          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            setStream(mediaStream);
            setIsCameraActive(true);
          }
        } catch (err) {
          console.error('Error accessing camera:', err);
          setError(
            'Failed to access camera. Please check permissions or try uploading an image instead.'
          );
          setMode('select'); // Go back on error
        }
      }
    };

    initCamera();

    return () => {
      // Cleanup stream if component unmounts or mode changes away from camera
      if (mode !== 'camera' && mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [mode]);

  /**
   * Start camera for capturing receipt photo
   */
  const startCamera = () => {
    setMode('camera');
  };

  /**
   * Stop camera stream
   */
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  /**
   * Capture photo from camera
   */
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert canvas to base64
    const imageData = canvas.toDataURL('image/jpeg', 0.9);

    // Stop camera
    stopCamera();

    // Process receipt
    await processReceipt(imageData);
  };

  /**
   * Handle file upload
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image file is too large. Please upload a file smaller than 10MB.');
      return;
    }

    try {
      setError(null);
      const imageData = await imageFileToBase64(file);
      await processReceipt(imageData);
    } catch (err) {
      console.error('Error reading file:', err);
      setError('Failed to read image file. Please try again.');
    }
  };

  /**
   * Process receipt image with OCR
   */
  const processReceipt = async (imageData: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: ocrError } = await processReceiptImage(imageData);

      if (ocrError || !data) {
        setError(ocrError || 'Failed to process receipt');
        setIsProcessing(false);
        return;
      }

      // Show success briefly before closing
      setTimeout(() => {
        onReceiptProcessed(data, imageData);
        handleClose();
      }, 1000);
    } catch (err) {
      console.error('Error processing receipt:', err);
      setError(
        err instanceof Error ? err.message : 'Unknown error occurred'
      );
      setIsProcessing(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    stopCamera();
    setMode('select');
    setError(null);
    setIsProcessing(false);
    onClose();
  };

  /**
   * Go back to mode selection
   */
  const goBack = () => {
    stopCamera();
    setMode('select');
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" strokeWidth={2.5} />
              </div>
              <h2 className="text-2xl font-bold text-white">Scan Receipt</h2>
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

        {/* Content Area */}
        <div className="relative bg-white min-h-[400px]">
          {/* Mode Selection */}
          {mode === 'select' && (
            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">
                How would you like to scan your receipt?
              </h3>
              <p className="text-gray-600 text-center mb-8">
                We'll extract items automatically using AI
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Camera Option */}
                <button
                  onClick={startCamera}
                  className="group p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <div className="w-16 h-16 bg-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Camera className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Take Photo
                  </h4>
                  <p className="text-sm text-gray-600">
                    Use your camera to capture the receipt
                  </p>
                </button>

                {/* Upload Option */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="group p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 hover:border-blue-400 rounded-2xl transition-all duration-300 hover:shadow-xl hover:scale-105"
                >
                  <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-white" strokeWidth={2.5} />
                  </div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">
                    Upload Image
                  </h4>
                  <p className="text-sm text-gray-600">
                    Choose a photo from your device
                  </p>
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>
          )}

          {/* Camera Mode */}
          {mode === 'camera' && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-[400px] object-cover bg-black"
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Camera Controls Overlay */}
              {isCameraActive && !isProcessing && (
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={goBack}
                      className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors"
                    >
                      Back
                    </button>
                    <button
                      onClick={capturePhoto}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2"
                    >
                      <Camera className="w-5 h-5" />
                      <span>Capture Receipt</span>
                    </button>
                  </div>
                  <p className="text-white text-center text-sm mt-4">
                    Position the receipt within the frame
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/95 backdrop-blur-sm">
              <div className="text-center">
                <Loader2 className="w-16 h-16 text-purple-600 animate-spin mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Processing Receipt...
                </h3>
                <p className="text-gray-600">
                  Extracting items using AI
                </p>
                <div className="mt-6 space-y-2 text-sm text-gray-500">
                  <p className="flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span>Reading text from image</span>
                  </p>
                  <p className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-500" />
                    <span>Parsing items and prices</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-bold text-red-900 mb-1">
                      Error Processing Receipt
                    </h3>
                    <p className="text-red-700 mb-4">{error}</p>
                    <div className="flex gap-3">
                      <button
                        onClick={goBack}
                        className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors"
                      >
                        Try Again
                      </button>
                      <button
                        onClick={handleClose}
                        className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-600">
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                  <span className="text-sm font-semibold text-purple-600">
                    Processing...
                  </span>
                </>
              ) : (
                <span className="text-sm text-gray-500">
                  Powered by Google Vision AI
                </span>
              )}
            </div>
            {mode === 'select' && (
              <button
                onClick={handleClose}
                className="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
