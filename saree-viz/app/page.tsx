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

  const generateSingleImage = async (photoIndex: number): Promise<GeneratedImage | null> => {
    if (!uploadedImage) return null;

    const formData = new FormData();
    formData.append('image', uploadedImage.file);
    formData.append('photoIndex', photoIndex.toString());
    formData.append('sessionSeed', sessionSeed);

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
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
            SareeViz
          </h1>
          <p className="text-xl text-gray-600">
            AI-Powered Virtual Saree Photoshoots
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Upload a saree floor shot and generate professional model photoshoots
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {/* Image Upload Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Upload Saree Image</h2>
            <ImageUploader 
              onImageUpload={handleImageUpload}
              disabled={isGenerating}
            />
            
            {uploadedImage && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">
                    Number of photoshoot poses:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={totalGenerations}
                    onChange={(e) => setTotalGenerations(Math.min(10, Math.max(1, parseInt(e.target.value) || 10)))}
                    disabled={isGenerating}
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-xs text-gray-500">(Recommended: 10 for full photoshoot)</span>
                </div>
                
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl"
                >
                  {isGenerating 
                    ? `Capturing pose ${currentGeneration} of ${totalGenerations}...` 
                    : `🎬 Start ${totalGenerations}-Pose Photoshoot`
                  }
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}
          </div>

          {/* Analysis Section */}
          {analysisText && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4">Saree Analysis</h2>
              <div className="prose prose-sm max-w-none text-gray-700">
                <p className="whitespace-pre-wrap">{analysisText}</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <ResultsGrid 
              images={generatedImages}
              isLoading={isGenerating}
              currentGeneration={currentGeneration}
              totalGenerations={totalGenerations}
            />
            
            {generatedImages.length === 0 && !isGenerating && (
              <div className="text-center py-12 text-gray-500">
                <svg 
                  className="mx-auto h-16 w-16 mb-4 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                  />
                </svg>
                <p>Upload a saree image to start generating virtual photoshoots</p>
              </div>
            )}
          </div>

          {/* Stats Section */}
          {generatedImages.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl shadow-xl p-6">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-3xl font-bold text-purple-600">{generatedImages.length}</p>
                  <p className="text-sm text-gray-600">Generated</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600">{totalGenerations}</p>
                  <p className="text-sm text-gray-600">Total Requested</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {((generatedImages.length / totalGenerations) * 100).toFixed(0)}%
                  </p>
                  <p className="text-sm text-gray-600">Success Rate</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
