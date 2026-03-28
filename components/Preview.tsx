'use client';

interface PreviewProps {
  originalUrl: string;
  processedUrl: string;
  onDownload: () => void;
  onReset: () => void;
}

export default function Preview({ originalUrl, processedUrl, onDownload, onReset }: PreviewProps) {
  return (
    <div className="space-y-8">
      {/* Preview Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Original Image */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-4">原图</h3>
          <div className="bg-gray-100 rounded-xl p-4 inline-block">
            <img
              src={originalUrl}
              alt="原图"
              className="max-w-full max-h-72 object-contain rounded-lg shadow-md"
            />
          </div>
        </div>

        {/* Processed Image */}
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-700 mb-4">去背景后</h3>
          <div className="bg-checkerboard rounded-xl p-4 inline-block">
            <img
              src={processedUrl}
              alt="去背景后"
              className="max-w-full max-h-72 object-contain rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onDownload}
          className="px-8 py-3 bg-green-500 text-white rounded-lg font-medium
                     hover:bg-green-600 hover:shadow-lg transition-all duration-300
                     flex items-center gap-2"
        >
          <span>📥</span>
          <span>下载图片</span>
        </button>
        <button
          onClick={onReset}
          className="px-8 py-3 bg-gray-500 text-white rounded-lg font-medium
                     hover:bg-gray-600 hover:shadow-lg transition-all duration-300
                     flex items-center gap-2"
        >
          <span>🔄</span>
          <span>重新上传</span>
        </button>
      </div>
    </div>
  );
}
