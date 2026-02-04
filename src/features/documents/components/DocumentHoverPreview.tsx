import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FileText, ImageIcon, Loader2, AlertCircle } from 'lucide-react';
import { FileEntry } from '../../../types';

interface DocumentHoverPreviewProps {
  document: FileEntry;
  children: React.ReactNode;
  delay?: number;
}

const DocumentHoverPreview: React.FC<DocumentHoverPreviewProps> = ({
  document,
  children,
  delay = 600
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset on document change
  useEffect(() => {
    setPreviewUrl(null);
    setError(false);
  }, [document.id]);

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();

    // Calculate position - show to the right, but adjust if too close to edge
    let xPos = rect.right + 12;
    const tooltipWidth = 380;

    if (xPos + tooltipWidth > window.innerWidth) {
      // Show to the left instead
      xPos = rect.left - tooltipWidth - 12;
    }

    // Vertical position - align with top of element
    let yPos = rect.top;

    // Adjust if too close to bottom
    if (yPos + 400 > window.innerHeight) {
      yPos = window.innerHeight - 410;
    }

    // Ensure not negative
    if (yPos < 10) {
      yPos = 10;
    }

    setPosition({ x: xPos, y: yPos });

    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      loadThumbnail();
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const loadThumbnail = useCallback(async () => {
    console.log('[HoverPreview] Loading thumbnail for:', document.id, document.name);
    setIsLoading(true);
    setError(false);

    try {
      // Get auth token
      const { TokenManager } = await import('../../../lib/api-client');
      const { token } = TokenManager.getTokens();

      if (!token) {
        throw new Error('No auth token');
      }

      const apiUrl = `${import.meta.env.VITE_API_URL}/documents/${document.id}/thumbnail`;
      console.log('[HoverPreview] Fetching from:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('[HoverPreview] Response status:', response.status);

      // 404 means thumbnail not available (not an image or file not found)
      if (response.status === 404) {
        console.log('[HoverPreview] Thumbnail not available (404)');
        setError(true);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const blob = await response.blob();
      console.log('[HoverPreview] Blob size:', blob.size, 'type:', blob.type);

      if (blob.size === 0) {
        throw new Error('Empty response');
      }

      // Check if it's actually an image
      if (!blob.type.startsWith('image/')) {
        console.log('[HoverPreview] Not an image type:', blob.type);
        setError(true);
        return;
      }

      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
      console.log('[HoverPreview] Thumbnail loaded successfully');

    } catch (err) {
      console.error('[HoverPreview] Failed to load thumbnail:', err);
      setError(true);
    } finally {
      setIsLoading(false);
    }
  }, [document.id, document.name]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getFileTypeIcon = () => {
    // For now, show a generic document icon since names don't have extensions
    return <FileText size={24} className="text-slate-400" />;
  };

  if (!isVisible) {
    return (
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="inline-block"
      >
        {children}
      </div>

      {/* Tooltip */}
      <div
        className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden pointer-events-none animate-in fade-in duration-200"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          width: '380px',
        }}
        onMouseEnter={() => setIsVisible(false)}
      >
        {/* Header */}
        <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
              {getFileTypeIcon()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-sm truncate" title={document.name}>
                {document.name}
              </p>
              <p className="text-xs text-slate-500">
                {document.size} • {document.date}
              </p>
            </div>
          </div>
        </div>

        {/* Preview Content */}
        <div className="p-4 bg-slate-50/50" style={{ maxHeight: '320px' }}>
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 size={32} className="animate-spin text-red-500 mb-3" />
              <p className="text-xs text-slate-500">Loading preview...</p>
            </div>
          )}

          {!isLoading && previewUrl && (
            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
              <img
                src={previewUrl}
                alt={document.name}
                className="w-full h-48 object-cover"
              />
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <AlertCircle size={24} className="text-slate-400" />
              </div>
              <p className="text-xs text-slate-500">Preview not available</p>
            </div>
          )}

          {!isLoading && !previewUrl && !error && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                {getFileTypeIcon()}
              </div>
              <p className="text-xs text-slate-500">Click to preview</p>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="bg-white px-4 py-3 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
            <div>
              <span className="text-slate-500">Revision:</span>
              <span className="ml-1.5 font-medium text-slate-900">{document.rev}</span>
            </div>
            <div>
              <span className="text-slate-500">Status:</span>
              <span className="ml-1.5 font-medium text-slate-900">{document.status}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-500">Author:</span>
              <span className="ml-1.5 font-medium text-slate-900">{document.author}</span>
            </div>
            {document.description && (
              <div className="col-span-2">
                <p className="text-slate-500 truncate" title={document.description}>
                  {document.description}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Arrow */}
        <div
          className="absolute w-3 h-3 bg-white border-l border-t border-slate-200 transform rotate-45 -left-1.5"
          style={{
            top: '40px',
          }}
        />
      </div>
    </>
  );
};

export default DocumentHoverPreview;
