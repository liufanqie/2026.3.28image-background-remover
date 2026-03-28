'use client';

export default function Loading() {
  return (
    <div className="text-center py-16">
      <div className="inline-block">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-purple-500 rounded-full animate-spin" />
      </div>
      <p className="text-gray-600 mt-6 text-lg">正在处理中...</p>
      <p className="text-gray-400 text-sm mt-2">请稍候，图片正在去除背景</p>
    </div>
  );
}
