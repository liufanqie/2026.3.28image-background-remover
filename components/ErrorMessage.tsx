'use client';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">❌</div>
      <p className="text-red-500 text-lg mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="px-8 py-3 bg-gray-500 text-white rounded-lg font-medium
                   hover:bg-gray-600 hover:shadow-lg transition-all duration-300"
      >
        重试
      </button>
    </div>
  );
}
