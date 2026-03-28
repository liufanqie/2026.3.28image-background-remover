'use client';

import { useState, useCallback } from 'react';
import UploadArea from '@/components/UploadArea';
import Preview from '@/components/Preview';
import Loading from '@/components/Loading';
import ErrorMessage from '@/components/ErrorMessage';

type AppState = 'upload' | 'loading' | 'preview' | 'error';

export default function Home() {
  const [state, setState] = useState<AppState>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [originalUrl, setOriginalUrl] = useState<string>('');
  const [processedUrl, setProcessedUrl] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const validateFile = (file: File): string | null => {
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return '不支持的文件格式，请上传 JPG、PNG 或 WebP 图片';
    }
    if (file.size > 10 * 1024 * 1024) {
      return '文件大小超过 10MB 限制';
    }
    return null;
  };

  const processFile = useCallback(async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setErrorMessage(error);
      setState('error');
      return;
    }

    // Show original image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    setState('loading');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/remove', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
        throw new Error(errorData.error || '处理失败');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setProcessedUrl(imageUrl);
      setState('preview');
    } catch (err) {
      console.error('Error:', err);
      setErrorMessage(err instanceof Error ? err.message : '处理失败，请重试');
      setState('error');
    }
  }, []);

  const handleDownload = useCallback(() => {
    const link = document.createElement('a');
    link.href = processedUrl;
    link.download = 'removed-bg.png';
    link.click();
  }, [processedUrl]);

  const handleReset = useCallback(() => {
    setOriginalUrl('');
    setProcessedUrl('');
    setErrorMessage('');
    setState('upload');
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-500 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🖼️ Image Background Remover
          </h1>
          <p className="text-white/80 text-lg">
            快速移除图片背景，支持 JPG、PNG、WebP 格式
          </p>
        </header>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 md:p-10">
          {state === 'upload' && (
            <UploadArea
              onFileSelect={processFile}
              isDragging={isDragging}
              setIsDragging={setIsDragging}
            />
          )}

          {state === 'loading' && <Loading />}

          {state === 'preview' && (
            <Preview
              originalUrl={originalUrl}
              processedUrl={processedUrl}
              onDownload={handleDownload}
              onReset={handleReset}
            />
          )}

          {state === 'error' && (
            <ErrorMessage
              message={errorMessage}
              onRetry={handleReset}
            />
          )}
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-white/60">
          <p>
            Powered by{' '}
            <a
              href="https://www.remove.bg/api"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white hover:underline"
            >
              remove.bg API
            </a>
          </p>
        </footer>
      </div>
    </main>
  );
}
