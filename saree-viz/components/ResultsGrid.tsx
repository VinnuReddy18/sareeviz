'use client';

import Image from 'next/image';

interface GeneratedImage {
  id: string;
  url: string;
  timestamp: number;
  localPath?: string;
  downloadUrl?: string;
}

interface ResultsGridProps {
  images: GeneratedImage[];
  isLoading?: boolean;
  currentGeneration?: number;
  totalGenerations?: number;
}

export default function ResultsGrid({ 
  images, 
  isLoading, 
  currentGeneration, 
  totalGenerations 
}: ResultsGridProps) {
  if (images.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Generated Images</h2>
        {isLoading && currentGeneration && totalGenerations && (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <span className="text-sm text-gray-600">
              Generating {currentGeneration} of {totalGenerations}...
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors group"
          >
            <Image
              src={image.localPath || image.url}
              alt={`Generated saree model ${index + 1}`}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 flex items-center justify-between">
              <span>Generation {index + 1}</span>
              {image.downloadUrl && (
                <a
                  href={image.downloadUrl}
                  download={`saree-model-${index + 1}.png`}
                  className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs font-medium transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Download
                </a>
              )}
            </div>
            {image.localPath && (
              <a
                href={image.localPath}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-2 right-2 bg-white bg-opacity-90 hover:bg-opacity-100 px-2 py-1 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                View Full
              </a>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="relative aspect-[3/4] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Generating...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
