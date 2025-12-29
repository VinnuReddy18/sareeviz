'use client';

import { useState } from 'react';
import ImageUploader from '@/components/ImageUploader';
import ResultsGrid from '@/components/ResultsGrid';

interface GeneratedImage {
  id: string;
  url: string;
  timestamp: number;
  localPath?: string;
  downloadUrl?: string;
  poseIndex?: number;
}

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<{ file: File; preview: string } | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState(0);
  const [totalGenerations, setTotalGenerations] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [analysisText, setAnalysisText] = useState<string>('');
  const [sessionSeed, setSessionSeed] = useState<string>('');

  const handleImageUpload = (file: File, previewUrl: string) => {
    setUploadedImage({ file, preview: previewUrl });
    setGeneratedImages([]);
    setError(null);
    setAnalysisText('');
    // Generate new session seed for each upload
    setSessionSeed(`session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  };

  const generateSingleImage = async (photoIndex: number, customPrompt?: string): Promise<GeneratedImage | null> => {
    if (!uploadedImage) return null;

    const formData = new FormData();
    formData.append('image', uploadedImage.file);
    formData.append('photoIndex', photoIndex.toString());
    formData.append('sessionSeed', sessionSeed);
    if (customPrompt) {
      formData.append('customPrompt', customPrompt);
    }

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      
      // Store analysis from first generation
      if (data.analysis && !analysisText) {
        setAnalysisText(data.analysis);
      }

      // Handle the image URL from Gemini response
      if (data.imageUrl || data.localPath) {
        return {
          id: `${Date.now()}-${Math.random()}`,
          url: data.imageUrl,
          localPath: data.localPath,
          downloadUrl: data.downloadUrl,
          timestamp: Date.now(),
          poseIndex: photoIndex,
        };
      }

      // If no image but generation was successful, show analysis
      if (data.success && !data.imageUrl) {
        throw new Error('Image generated but URL not found in response');
      }

      return null;
    } catch (err) {
      console.error('Generation error:', err);
      throw err;
    }
  };

  const handleRegenerate = async (poseIndex: number, customPrompt: string) => {
    try {
      const image = await generateSingleImage(poseIndex, customPrompt);
      
      if (image) {
        // Replace the existing image at the pose index
        setGeneratedImages(prevImages => {
          const newImages = [...prevImages];
          const existingIndex = newImages.findIndex(img => img.poseIndex === poseIndex);
          if (existingIndex !== -1) {
            newImages[existingIndex] = image;
          } else {
            newImages.push(image);
          }
          return newImages;
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Failed to regenerate pose ${poseIndex}: ${errorMessage}`);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) return;

    setIsGenerating(true);
    setError(null);
    setGeneratedImages([]);
    setCurrentGeneration(0);

    const newImages: GeneratedImage[] = [];

    for (let i = 0; i < totalGenerations; i++) {
      try {
        setCurrentGeneration(i + 1);
        const image = await generateSingleImage(i + 1); // Pass photo index (1-based)
        
        if (image) {
          newImages.push(image);
          setGeneratedImages([...newImages]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(`Failed at generation ${i + 1}: ${errorMessage}`);
        break;
      }
    }

    setIsGenerating(false);
    setCurrentGeneration(0);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-40 left-1/2 w-80 h-80 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="container mx-auto px-4 py-16 relative z-10">
        {/* Header */}
        <div className="text-center mb-20 animate-slideUp">
          <h1 className="text-6xl md:text-7xl font-black mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
              SareeViz
            </span>
          </h1>
          <p className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 tracking-tight">
            Virtual Saree Photoshoot Studio
          </p>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto leading-relaxed">
            Transform your saree into <span className="font-bold text-purple-700">stunning professional photoshoots</span> with AI<span className="mx-2">•</span>10 unique poses<span className="mx-2">•</span>Instant results
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {/* Image Upload Section */}
          <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-purple-500/10 p-12 mb-10 border border-purple-100/50 hover:border-purple-200 transition-all duration-500 animate-slideUp hover:shadow-purple-500/20" style={{animationDelay: '100ms'}}>
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-500/30 group hover:scale-110 transition-transform duration-300">
                <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 tracking-tight">Upload Saree</h2>
                <p className="text-sm text-gray-600 font-medium mt-1">Start by uploading your saree image</p>
              </div>
            </div>
            <ImageUploader 
              onImageUpload={handleImageUpload}
              disabled={isGenerating}
            />
            
            {uploadedImage && (
              <div className="mt-10 space-y-7 animate-slideUp" style={{animationDelay: '200ms'}}>
                <div className="bg-gradient-to-br from-purple-50/80 via-pink-50/50 to-indigo-50/80 rounded-2xl p-8 border-2 border-purple-200/60 hover:border-purple-300/80 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="flex items-center justify-between mb-5">
                    <label className="text-lg font-bold text-gray-900 flex items-center gap-3 tracking-tight">
                      <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                        </svg>
                      </div>
                      Number of Poses
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={totalGenerations}
                      onChange={(e) => setTotalGenerations(Math.min(10, Math.max(1, parseInt(e.target.value) || 10)))}
                      disabled={isGenerating}
                      className="w-28 px-4 py-3 border-2 border-purple-300 rounded-2xl focus:ring-4 focus:ring-purple-500/40 focus:border-purple-500 font-black text-xl text-center bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100"
                    />
                  </div>
                  <p className="text-sm text-gray-700 flex items-center gap-2.5 font-medium">
                    <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Recommended: <span className="font-bold text-purple-700">10 poses</span> for a complete professional photoshoot
                  </p>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-indigo-600 text-white py-5 px-10 rounded-2xl font-black text-lg tracking-tight hover:shadow-2xl hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-500 transform hover:scale-[1.03] disabled:hover:scale-100 shadow-xl shadow-purple-500/30 relative overflow-hidden group"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-3 border-white"></div>
                        <span className="font-bold">Capturing pose {currentGeneration} of {totalGenerations}...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-7 h-7 group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>Start {totalGenerations}-Pose Photoshoot</span>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-105"></div>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500">
                    <div className="absolute inset-0 bg-gradient-to-r from-white to-transparent animate-shimmer"></div>
                  </div>
                </button>
              </div>
            )}

            {error && (
              <div className="mt-6 p-5 bg-red-50 border-2 border-red-200 rounded-2xl flex items-start gap-3 animate-slideUp">
                <svg className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-800 font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Analysis Section */}
          {analysisText && (
            <div className="bg-white/80 backdrop-blur-2xl rounded-[2rem] shadow-2xl shadow-emerald-500/10 p-12 mb-10 border border-emerald-100/50 hover:border-emerald-200 transition-all duration-500 animate-slideUp hover:shadow-emerald-500/20" style={{animationDelay: '200ms'}}>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/30 group hover:scale-110 transition-transform duration-300">
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">AI Analysis</h2>
                  <p className="text-sm text-gray-600 font-medium mt-1">Detailed saree characteristics</p>
                </div>
              </div>
              <div className="prose prose-lg max-w-none text-gray-700 bg-gray-50 rounded-2xl p-6">
                <p className="whitespace-pre-wrap leading-relaxed">{analysisText}</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {(generatedImages.length > 0 || isGenerating) && (
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-10 border border-white/50 animate-slideUp" style={{animationDelay: '300ms'}}>
              <ResultsGrid 
                images={generatedImages}
                isLoading={isGenerating}
                currentGeneration={currentGeneration}
                totalGenerations={totalGenerations}
                onRegenerate={handleRegenerate}
                uploadedImage={uploadedImage?.preview}
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="text-center mt-20 pb-8">
          <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
            </svg>
            Powered by AI • Professional Quality • Instant Results
          </p>
        </div>
      </div>
    </main>
  );
}
