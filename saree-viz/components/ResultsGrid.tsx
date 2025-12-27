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
    <div className="mt-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Generated Gallery</h2>
            <p className="text-sm text-gray-600 font-medium">{images.length} professional {images.length === 1 ? 'pose' : 'poses'} created</p>
          </div>
        </div>
        {isLoading && currentGeneration && totalGenerations && (
          <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200 shadow-lg">
            <div className="animate-spin rounded-full h-5 w-5 border-3 border-purple-600 border-t-transparent"></div>
            <span className="text-sm text-gray-800 font-bold">
              Creating pose {currentGeneration} of {totalGenerations}
            </span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {images.map((image, index) => (
          <div 
            key={image.id} 
            className="group relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-purple-200 hover:border-purple-400 transition-all duration-500 shadow-lg hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-[1.03] animate-slideUp"
            style={{animationDelay: `${index * 50}ms`}}
          >
            <Image
              src={image.localPath || image.url}
              alt={`Generated saree model ${index + 1}`}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            
            <div className="absolute top-3 left-3 w-10 h-10 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
              <span className="text-lg font-black bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">{index + 1}</span>
            </div>
            
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent text-white px-4 py-4 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold">Pose {index + 1}</span>
                {image.downloadUrl && (
                  <a
                    href={image.downloadUrl}
                    download={`saree-model-${index + 1}.png`}
                    className="flex items-center gap-2 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-bold transition-all duration-300 hover:scale-105 border border-white/30"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Save
                  </a>
                )}
              </div>
            </div>
            
            {image.localPath && (
              <a
                href={image.localPath}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute top-3 right-3 flex items-center gap-2 bg-white/95 backdrop-blur-sm hover:bg-white px-3 py-2 rounded-xl text-sm font-bold opacity-0 group-hover:opacity-100 transition-all duration-500 shadow-xl hover:scale-110 border border-purple-200"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-purple-600">View</span>
              </a>
            )}
          </div>
        ))}
        
        {isLoading && (
          <div className="relative aspect-[3/4] rounded-2xl border-3 border-dashed border-purple-300 flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg animate-pulse">
            <div className="text-center">
              <div className="inline-block p-4 bg-white rounded-2xl shadow-xl mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
              </div>
              <p className="text-sm text-gray-800 font-bold">Creating magic...</p>
              <p className="text-xs text-gray-600 font-medium mt-1">Please wait</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
