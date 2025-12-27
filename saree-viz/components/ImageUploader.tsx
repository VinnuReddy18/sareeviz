'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

interface ImageUploaderProps {
  onImageUpload: (file: File, previewUrl: string) => void;
  disabled?: boolean;
}

export default function ImageUploader({ onImageUpload, disabled }: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageUpload(file, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPreview(result);
        onImageUpload(file, result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="w-full">
      <div
        onClick={() => !disabled && fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative border-3 border-dashed rounded-3xl p-12 text-center transition-all duration-500 ${
          disabled 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : isDragging
            ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 scale-[1.03] shadow-2xl shadow-purple-500/30 ring-4 ring-purple-300/50'
            : 'border-gray-300 hover:border-purple-400 hover:bg-gradient-to-br hover:from-purple-50/50 hover:to-pink-50/50 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-[1.01]'
        }`}
      >
        {preview ? (
          <div className="space-y-8 group">
            <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-xl shadow-purple-500/20 ring-2 ring-purple-200 group-hover:ring-4 group-hover:ring-purple-300 transition-all duration-500">
              <Image
                src={preview}
                alt="Saree preview"
                fill
                className="object-contain transition-all duration-700 group-hover:scale-105"
              />
              {!disabled && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end justify-center pb-8">
                  <div className="text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="w-14 h-14 mx-auto mb-3 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-bold text-base">Click to Change</p>
                  </div>
                </div>
              )}
            </div>
            {!disabled && (
              <div className="flex items-center justify-center gap-3 text-base text-gray-700 bg-gradient-to-br from-purple-50 to-pink-50 py-4 px-6 rounded-2xl border border-purple-200 shadow-sm">
                <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold">Click or drag to change image</span>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-10 py-16">
            <div className={`transition-all duration-500 ${isDragging ? 'scale-125 rotate-3' : 'scale-100'}`}>
              <div className="inline-block p-8 bg-gradient-to-br from-purple-100 via-pink-100 to-purple-100 rounded-[2rem] mb-6 shadow-xl shadow-purple-500/20 group-hover:shadow-2xl group-hover:shadow-purple-500/30 transition-all duration-500">
                <svg
                  className={`w-24 h-24 transition-all duration-500 ${
                    isDragging ? 'text-purple-600 scale-110' : 'text-purple-500'
                  }`}
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-2xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent mb-3 tracking-tight">
                {isDragging ? 'Drop your saree image here!' : 'Upload Saree Image'}
              </p>
              <p className="text-base text-gray-700 font-bold mb-2">Click to browse or drag and drop</p>
              <p className="text-sm text-gray-500 font-medium">PNG, JPG, WEBP • Max 10MB</p>
              <div className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border-2 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-purple-800 font-bold">Best with flat lay or floor shots</span>
              </div>
            </div>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
      />
    </div>
  );
}
