'use client';

import { useCallback } from 'react';

interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  isDragging: boolean;
  setIsDragging: (value: boolean) => void;
}

export default function UploadArea({ onFileSelect, isDragging, setIsDragging }: UploadAreaProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, [setIsDragging]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, [setIsDragging]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFileSelect(files[0]);
    }
  }, [setIsDragging, onFileSelect]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <div
      className={`
        relative border-3 border-dashed rounded-2xl p-16 text-center cursor-pointer
        transition-all duration-300 ease-in-out
        ${isDragging
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-300 hover:border-purple-400 hover:bg-gray-50'
        }
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input
        id="fileInput"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="text-6xl mb-6">📁</div>
      <p className="text-gray-600 mb-6 text-lg">
        拖拽图片到这里，或点击选择文件
      </p>
      <button
        className="px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white
                   rounded-lg font-medium hover:shadow-lg hover:scale-105 transition-all duration-300"
        onClick={(e) => {
          e.stopPropagation();
          document.getElementById('fileInput')?.click();
        }}
      >
        选择图片
      </button>
      <p className="text-gray-400 text-sm mt-4">
        支持 JPG、PNG、WebP，最大 10MB
      </p>
    </div>
  );
}
