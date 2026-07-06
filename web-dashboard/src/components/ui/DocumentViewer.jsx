import React from 'react';
import { X, ZoomIn, ZoomOut, Download, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export function DocumentViewer({ isOpen, onClose, title, documentUrl }) {
  const [scale, setScale] = React.useState(1);
  const [error, setError] = React.useState(false);

  // Reset state when opened
  React.useEffect(() => {
    if (isOpen) {
      setScale(1);
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleZoomIn = () => setScale(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScale(s => Math.max(s - 0.25, 0.5));
  
  const handleDownload = () => {
    if (!documentUrl) return;
    const a = document.createElement('a');
    a.href = documentUrl;
    a.download = title.replace(/\s+/g, '_') + '.jpg';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl max-h-full bg-sidebar border border-gray-800 rounded-xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800 bg-[#0B1020]">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          
          <div className="flex items-center gap-2">
            <button onClick={handleZoomOut} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Zoom Out">
              <ZoomOut size={20} />
            </button>
            <span className="text-xs text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
            <button onClick={handleZoomIn} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Zoom In">
              <ZoomIn size={20} />
            </button>
            <div className="w-px h-6 bg-gray-800 mx-1"></div>
            <button onClick={handleDownload} className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors" title="Download">
              <Download size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-2">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Image Container */}
        <div className="flex-1 overflow-auto bg-[#050814] relative min-h-[500px] flex items-center justify-center">
          {!documentUrl ? (
            <div className="flex flex-col items-center justify-center text-gray-500">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p>No document uploaded</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center text-red-500">
              <AlertCircle size={48} className="mb-4 opacity-50" />
              <p>Failed to load image</p>
            </div>
          ) : (
            <img 
              src={documentUrl} 
              alt={title}
              onError={() => setError(true)}
              style={{ transform: `scale(${scale})`, transition: 'transform 0.2s ease-out' }}
              className="max-w-full max-h-full object-contain origin-center cursor-move"
            />
          )}
        </div>

      </div>
    </div>
  );
}
