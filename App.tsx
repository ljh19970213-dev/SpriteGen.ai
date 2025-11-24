import React, { useState } from 'react';
import { AnimationType, GeneratedSprite } from './types';
import { ANIMATION_CONFIGS, Icons } from './constants';
import { generateSpriteSheet } from './services/geminiService';
import UploadZone from './components/UploadZone';
import SpriteSheetDisplay from './components/SpriteSheetDisplay';

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedSprites, setGeneratedSprites] = useState<GeneratedSprite[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (type: AnimationType) => {
    if (!sourceImage || isGenerating) return;

    setIsGenerating(true);
    setError(null);
    const config = ANIMATION_CONFIGS[type];

    try {
      const resultBase64 = await generateSpriteSheet(sourceImage, type, config.defaultFrames);
      
      const newSprite: GeneratedSprite = {
        id: crypto.randomUUID(),
        type: type,
        originalImage: sourceImage,
        spriteSheetImage: resultBase64,
        frameCount: config.defaultFrames,
        timestamp: Date.now()
      };

      setGeneratedSprites(prev => [newSprite, ...prev]);
    } catch (err: any) {
      setError(err.message || "Failed to generate animation. Please check the API key and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = (id: string) => {
    setGeneratedSprites(prev => prev.filter(s => s.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      
      {/* Hero Header */}
      <header className="bg-slate-900 border-b border-slate-800 py-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
               <span className="text-white font-bold text-lg">S</span>
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              SpriteGen.ai
            </h1>
          </div>
          <p className="text-slate-400 max-w-xl">
            Upload a character image and let Gemini generate high-quality 2D animation keyframes for your game.
          </p>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        
        {/* Upload Section */}
        <section className="mb-16">
          <UploadZone 
            currentImage={sourceImage}
            onImageSelected={setSourceImage}
            onClear={() => setSourceImage(null)}
          />
        </section>

        {/* Action Panel (Visible only when image uploaded) */}
        {sourceImage && (
          <section className="mb-16 animate-fade-in-up">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Icons.Sparkles /> Generate Animations
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(AnimationType).map((type) => {
                const config = ANIMATION_CONFIGS[type];
                return (
                  <button
                    key={type}
                    onClick={() => handleGenerate(type)}
                    disabled={isGenerating}
                    className={`
                      relative overflow-hidden group p-6 rounded-xl border transition-all duration-300 text-left
                      ${isGenerating 
                        ? 'opacity-50 cursor-not-allowed border-slate-800 bg-slate-900' 
                        : 'border-slate-700 bg-slate-800 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/10'}
                    `}
                  >
                    <div className="relative z-10">
                      <div className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">
                        {config.label}
                      </div>
                      <div className="text-sm text-slate-400 mb-4">
                        {config.description}
                      </div>
                      <div className="text-xs font-mono text-slate-500 bg-slate-900/50 inline-block px-2 py-1 rounded">
                        ~{config.defaultFrames} Frames
                      </div>
                    </div>
                    {/* Hover Effect Background */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>

            {isGenerating && (
              <div className="mt-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mb-2"></div>
                <p className="text-slate-400 text-sm animate-pulse">Consulting the neural matrix... this may take a moment.</p>
              </div>
            )}

            {error && (
              <div className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                {error}
              </div>
            )}
          </section>
        )}

        {/* Results Section */}
        {generatedSprites.length > 0 && (
          <section>
             <h2 className="text-lg font-semibold text-white mb-6 border-b border-slate-800 pb-2">Generated Assets</h2>
             <div className="space-y-6">
                {generatedSprites.map(sprite => (
                  <SpriteSheetDisplay 
                    key={sprite.id} 
                    sprite={sprite} 
                    onDelete={handleDelete}
                  />
                ))}
             </div>
          </section>
        )}

        {!sourceImage && generatedSprites.length === 0 && (
           <div className="text-center py-20 opacity-30">
              <p className="text-4xl font-bold text-slate-700 mb-4">Ready to Create?</p>
              <p className="text-slate-500">Upload a character above to get started.</p>
           </div>
        )}

      </main>
    </div>
  );
};

export default App;