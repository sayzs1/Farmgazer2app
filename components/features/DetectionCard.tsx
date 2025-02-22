'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DetectionCardProps {
  id: string;
  imageUrl: string;
  deviceId: string;
  timestamp: string;
  category: 'weeds' | 'drought' | 'disease' | 'waterpooling';
}

export function DetectionCard({ id, imageUrl, deviceId, timestamp, category }: DetectionCardProps) {
  const router = useRouter();
  const date = new Date(timestamp).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  const handleClick = () => {
    router.push(`/detection/${id}`);
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick();
        }
      }}
    >
      <div className="relative w-full" style={{ paddingTop: '56.25%' }}> {/* 16:9 aspect ratio */}
        <Image
          src={imageUrl}
          alt={category}
          fill
          className="object-cover absolute top-0 left-0"
        />
      </div>
      <div className="flex items-center justify-between px-2 py-1.5">
        <div className="text-xs text-gray-500">{deviceId}</div>
        <div className="text-xs text-gray-400">{date}</div>
      </div>
    </div>
  );
}