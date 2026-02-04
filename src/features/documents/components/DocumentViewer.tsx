import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  FileText,
  Image as ImageIcon,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { DocumentsService } from '../api/documentsService';
import { FileEntry } from '../../../types';

interface DocumentViewerProps {
  document: FileEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ document, isOpen, onClose }) => {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fileType, setFileType] = useState<'pdf' | 'image' | 'other'>('other');

  // Cleanup preview URL on unmount or when document changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    };
  }, [document?.id]);

  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const loadPreview = useCallback(async () => {
    if (!document) return;

    console.log('[DocumentViewer] Loading preview for:', document.id, document.name);

    setIsLoading(true);
    setError(null);

    try {
      // Detect file type from actual file on server
      // First try to get the extension from the name, if not there, check via preview endpoint
      let detectedType: 'pdf' | 'image' | 'other' = 'other';

      const nameLower = document.name.toLowerCase();
      if (nameLower.endsWith('.pdf')) {
        detectedType = 'pdf';
      } else if (nameLower.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
        detectedType = 'image';
      } else {
        // No extension in name - try to detect via API
        console.log('[DocumentViewer] No extension in name, will detect from API');
      }

      setFileType(detectedType);

      // Get auth token
      const { TokenManager } = await import('../../../lib/api-client');
      const { token } = TokenManager.getTokens();

      if (!token) {
        throw new Error('No authentication token found');
      }

      const apiUrl = `${import.meta.env.VITE_API_URL}/documents/${document.id}/preview`;
      console.log('[DocumentViewer] Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[DocumentViewer] Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[DocumentViewer] Error response:', errorText);
        throw new Error(`Failed to load preview: ${response.status} ${response.statusText}`);
      }

      const blob = await response.blob();
      console.log('[DocumentViewer] Blob size:', blob.size, 'type:', blob.type);

      if (blob.size === 0) {
        throw new Error('Received empty file');
      }

      // Detect actual file type from blob
      if (blob.type === 'application/pdf') {
        detectedType = 'pdf';
      } else if (blob.type.startsWith('image/')) {
        detectedType = 'image';
      }
      setFileType(detectedType);

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      console.log('[DocumentViewer] Preview URL created:', url, 'type:', detectedType);

    } catch (err) {
      console.error('[DocumentViewer] Load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load preview');
    } finally {
      setIsLoading(false);
    }
  }, [document]);

  // Load preview when document changes or modal opens
  useEffect(() => {
    if (document && isOpen) {
      loadPreview();
    } else if (!isOpen) {
      // Reset when closed
      setScale(1);
      setRotation(0);
      setError(null);
    }
  }, [document, isOpen, loadPreview]);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.25));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleDownload = async () => {
    if (!document) return;
    try {
      await DocumentsService.download(document.id, document.name);
    } catch (err) {
      console.error('Download failed:', err);
    }
  };

  const getFileTypeIcon = () => {
    if (!document) return null;
    const ext = document.name.split('.').pop()?.toLowerCase();
    if (ext === 'pdf') return <FileText size={48} className="text-red-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon size={48} className="text-purple-500" />;
    }
    return <FileText size={48} className="text-slate-400" />;
  };

  if (!isOpen || !document) return null;

  const canTransform = fileType === 'image';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div className="w-full h-full flex flex-col">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                {getFileTypeIcon()}
              </div>
              <div>
                <h2 className="text-white font-bold text-lg truncate max-w-xl">{document.name}</h2>
                <p className="text-slate-400 text-xs">
                  Rev: {document.rev} | Status: {document.status} | {document.size}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Zoom controls */}
            {previewUrl && canTransform && (
              <>
                <button
                  onClick={handleZoomOut}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Zoom Out"
                >
                  <ZoomOut size={20} />
                </button>
                <span className="text-slate-300 text-sm font-medium min-w-[60px] text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Zoom In"
                >
                  <ZoomIn size={20} />
                </button>
                <button
                  onClick={handleRotate}
                  className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Rotate"
                >
                  <RotateCw size={20} />
                </button>
                <div className="w-px h-6 bg-slate-700 mx-2" />
              </>
            )}

            <button
              onClick={handleDownload}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
            >
              <Download size={18} />
              <span className="font-medium">Download</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
              title="Close (Esc)"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-950 p-8">
          {isLoading && (
            <div className="flex flex-col items-center">
              <Loader2 size={48} className="animate-spin text-red-500 mb-4" />
              <p className="text-slate-400">Loading preview...</p>
            </div>
          )}

          {!isLoading && error && (
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={48} className="text-red-500" />
              </div>
              <p className="text-slate-400 mb-4">{error}</p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Download to View
              </button>
            </div>
          )}

          {!isLoading && !error && !previewUrl && fileType === 'other' && (
            <div className="text-center">
              <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                {getFileTypeIcon()}
              </div>
              <p className="text-slate-400 mb-2">Preview not available</p>
              <p className="text-slate-500 text-sm mb-4">This file type cannot be previewed. Please download to view.</p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Download File
              </button>
            </div>
          )}

          {!isLoading && !error && previewUrl && fileType === 'image' && (
            <div
              className="transition-transform duration-200"
              style={{
                transform: `scale(${scale}) rotate(${rotation}deg)`,
              }}
            >
              <img
                src={previewUrl}
                alt={document.name}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}

          {!isLoading && !error && previewUrl && fileType === 'pdf' && (
            <div className="w-full h-full">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0 rounded-lg"
                title={document.name}
              />
            </div>
          )}
        </div>

        {/* Footer with metadata */}
        <div className="px-6 py-3 bg-slate-900 border-t border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center space-x-6">
              <span><strong className="text-slate-300">Author:</strong> {document.author}</span>
              <span><strong className="text-slate-300">Discipline:</strong> {document.discipline}</span>
              <span><strong className="text-slate-300">Date:</strong> {document.date}</span>
            </div>
            {document.description && (
              <span className="text-slate-500 max-w-lg truncate">{document.description}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
