'use client';

import React from 'react';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'card' | 'video' | 'comment';
}

export default function SkeletonLoader({ count = 6, type = 'card' }: SkeletonLoaderProps) {
  const items = Array.from({ length: count });

  const renderSkeleton = () => {
    switch (type) {
      case 'video':
        return (
          <div className="flex flex-col gap-3 w-full">
            <div className="w-full aspect-video bg-gray-300/30 animate-pulse rounded-xl"></div>
            <div className="flex gap-3 mt-2">
              <div className="w-10 h-10 rounded-full bg-gray-300/30 animate-pulse shrink-0"></div>
              <div className="flex flex-col gap-2 w-full">
                <div className="h-4 bg-gray-300/30 animate-pulse rounded w-[90%]"></div>
                <div className="h-4 bg-gray-300/30 animate-pulse rounded w-[60%]"></div>
              </div>
            </div>
          </div>
        );
      case 'comment':
        return (
          <div className="flex gap-3 w-full items-start">
            <div className="w-10 h-10 rounded-full bg-gray-300/30 animate-pulse shrink-0"></div>
            <div className="flex flex-col gap-2 w-full mt-1">
              <div className="h-3 bg-gray-300/30 animate-pulse rounded w-24"></div>
              <div className="h-4 bg-gray-300/30 animate-pulse rounded w-[80%]"></div>
              <div className="h-4 bg-gray-300/30 animate-pulse rounded w-[50%]"></div>
            </div>
          </div>
        );
      case 'card':
      default:
        return (
          <div className="w-full h-48 bg-gray-400 animate-pulse rounded-2xl shadow-sm"></div>
        );
    }
  };

  return (
    <div className={`grid gap-6 ${type === 'comment' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`} dir="rtl">
      {items.map((_, i) => (
        <div key={i}>{renderSkeleton()}</div>
      ))}
    </div>
  );
}
