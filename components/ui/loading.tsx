import React from 'react';

export function Loading() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Shadcn UI 风格的进度条 */}
          <div className="w-full max-w-md">
            <div className="relative h-1 overflow-hidden rounded-full bg-gray-100">
              <div className="animate-progress-indeterminate absolute h-full w-1/3 rounded-full bg-emerald-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 