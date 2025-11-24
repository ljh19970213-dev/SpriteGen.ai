import React, { useState, useEffect, useRef } from 'react';
import { GeneratedSprite } from '../types';
import { Icons } from '../constants';

interface SpriteSheetDisplayProps {
  sprite: GeneratedSprite;
  onDelete: (id: string) => void;
}

const SpriteSheetDisplay: React.FC<SpriteSheetDisplayProps> = ({ sprite, onDelete }) => {
  const [frameCount, setFrameCount] = useState(sprite.frameCount);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const [slicedImages, setSlicedImages] = useState<string[]>([]);

  // Slice the image whenever the source or frame count changes
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas to full image size
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const frameWidth = img.width / frameCount;
      const frameHeight = img.height;
      const slices: string[] = [];

      // Create a temporary canvas for slicing
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = frameWidth;
      tempCanvas.height = frameHeight;
      const tempCtx = tempCanvas.getContext('2d');

      if (tempCtx) {
        for (let i = 0; i < frameCount; i++) {
          tempCtx.clearRect(0, 0, frameWidth, frameHeight);
          // Draw the slice
          tempCtx.drawImage(
            img,
            i * frameWidth, 0, frameWidth, frameHeight, // Source
            0, 0, frameWidth, frameHeight // Dest
          );
          slices.push(tempCanvas.toDataURL('image/png'));
        }
      }
      setSlicedImages(slices);
    };
    img.src = sprite.spriteSheetImage;
  }, [sprite.spriteSheetImage, frameCount]);

  // Animation Loop for Preview
  useEffect(() => {
    if (!isPlaying || slicedImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % slicedImages.length);
    }, 150); // ~6.6 FPS

    return () => clearInterval(interval);
  }, [isPlaying, slicedImages]);

  // Download logic
  const downloadAll = () => {
    // Download Sprite Sheet
    const link = document.createElement('a');
    link.href = sprite.spriteSheetImage;
    link.download = `${sprite.type}_spritesheet.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Download Frames (simulated with a delay to prevent browser blocking or just ZIP in real world, here separate clicks)
    slicedImages.forEach((slice, idx) => {
        const fLink = document.createElement('a');
        fLink.href = slice;
        fLink.download = `${sprite.type}_frame_${String(idx + 1).padStart(2, '0')}.png`;
        document.body.appendChild(fLink);
        fLink.click();
        document.body.removeChild(fLink);
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 p-6 mb-8 shadow-xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{sprite.type} Animation</h3>
          <p className="text-slate-400 text-sm">Generated {new Date(sprite.timestamp).toLocaleTimeString()}</p>
        </div>
        <button 
          onClick={() => onDelete(sprite.id)}
          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
          title="Delete Result"
        >
          <Icons.Trash />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Preview */}
        <div className="flex flex-col gap-4">
          <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 flex flex-col items-center justify-center min-h-[200px]">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-4">Preview</p>
            {slicedImages.length > 0 ? (
               <img 
                 src={slicedImages[currentFrame]} 
                 alt="Preview" 
                 className="max-h-[160px] object-contain image-pixelated"
                 style={{ imageRendering: 'pixelated' }}
               />
            ) : (
              <div className="animate-pulse w-16 h-16 bg-slate-800 rounded-full"></div>
            )}
          </div>
          
          <div className="flex justify-center gap-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
            >
              {isPlaying ? <><Icons.Pause /> Pause</> : <><Icons.Play /> Play</>}
            </button>
          </div>
        </div>

        {/* Right Column: Sheet & Controls */}
        <div className="lg:col-span-2 space-y-6">
          
          <div>
            <div className="flex justify-between items-end mb-2">
              <label className="text-xs text-slate-400 uppercase font-semibold">Full Sprite Sheet</label>
              <div className="flex items-center gap-2">
                <label className="text-xs text-slate-400">Frame Split Count:</label>
                <input 
                  type="number" 
                  min="2" 
                  max="24" 
                  value={frameCount}
                  onChange={(e) => setFrameCount(Math.max(2, parseInt(e.target.value) || 2))}
                  className="w-16 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-sm text-center text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
            <div className="bg-slate-900/50 p-2 rounded-lg border border-slate-700 overflow-x-auto">
              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" />
              <img 
                src={sprite.spriteSheetImage} 
                alt="Sprite Sheet" 
                className="max-h-[200px] w-auto max-w-none object-contain"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          <div>
             <label className="text-xs text-slate-400 uppercase font-semibold block mb-2">Individual Keyframes</label>
             <div className="flex gap-2 overflow-x-auto pb-4 custom-scrollbar">
               {slicedImages.map((slice, idx) => (
                 <div key={idx} className="flex-shrink-0 relative group">
                   <div className="w-20 h-20 bg-slate-900 border border-slate-700 rounded-lg flex items-center justify-center overflow-hidden">
                      <img src={slice} alt={`Frame ${idx}`} className="max-h-full max-w-full object-contain" style={{ imageRendering: 'pixelated' }} />
                   </div>
                   <div className="absolute bottom-1 right-1 text-[10px] bg-black/70 text-white px-1 rounded opacity-50">{idx + 1}</div>
                 </div>
               ))}
             </div>
          </div>

          <div className="pt-4 border-t border-slate-700 flex justify-end">
             <button 
               onClick={downloadAll}
               className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
             >
               <Icons.Download />
               Download Assets
             </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default SpriteSheetDisplay;