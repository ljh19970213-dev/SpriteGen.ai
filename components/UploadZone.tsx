import React, { useRef, useState } from 'react';
import { Icons } from '../constants';

interface UploadZoneProps {
  onImageSelected: (base64: string) => void;
  currentImage: string | null;
  onClear: () => void;
}

const UploadZone: React.FC<UploadZoneProps> = ({ onImageSelected, currentImage, onClear }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          onImageSelected(e.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  if (currentImage) {
    return (
      <div className="relative group w-full max-w-xs mx-auto mb-8">
        <div className="aspect-[3/4] rounded-2xl overflow-hidden border-4 border-slate-700 bg-slate-800 shadow-2xl relative">
            <img 
              src={currentImage} 
              alt="Character Reference" 
              className="w-full h-full object-contain"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-200 flex items-center justify-center">
                <button 
                  onClick={(e) => { e.stopPropagation(); onClear(); }}
                  className="bg-red-500/90 hover:bg-red-600 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-200 shadow-lg"
                >
                  <Icons.Trash />
                </button>
            </div>
        </div>
        <p className="text-center mt-3 text-sm text-slate-400 font-medium">Character Reference</p>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full max-w-2xl mx-auto h-64 rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-4
        ${isDragging 
          ? 'border-indigo-400 bg-indigo-500/10' 
          : 'border-slate-600 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-500'}
      `}
    >
      <input 
        type="file" 
        ref={inputRef} 
        onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])} 
        className="hidden" 
        accept="image/*"
      />
      
      <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/50 text-slate-400'}`}>
        <Icons.Upload />
      </div>
      <div className="text-center">
        <p className="text-lg font-semibold text-slate-200">Upload Character Image</p>
        <p className="text-sm text-slate-500 mt-1">Drag & drop or click to browse (Front View Recommended)</p>
      </div>
    </div>
  );
};

export default UploadZone;