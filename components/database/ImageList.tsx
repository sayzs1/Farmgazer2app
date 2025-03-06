'use client';

import Image from 'next/image';
import { format } from 'date-fns';
import Link from 'next/link';

interface Detection {
  image_id: string;
  image_url: string;
  time: string;
  temperature: number;
  humidity: number;
  category_tag: string;
  AI_analysis: string;
  priority: number;
  device_id: string;
}

interface ImageListProps {
  detections: Detection[];
  filters: {
    device: string;
    date: string;
    tag: string;
    priority: string;
  };
}

export const ImageList = ({ detections, filters }: ImageListProps) => {
  const colorSchemes = {
    weeds: 'bg-emerald-100 text-emerald-800',
    drought: 'bg-amber-100 text-amber-800',
    disease: 'bg-red-100 text-red-800',
    waterpooling: 'bg-blue-100 text-blue-800',
    healthy: 'bg-green-100 text-green-800',
    pests: 'bg-purple-100 text-purple-800'
  };

  const filteredDetections = detections.filter(detection => {
    if (filters.device && detection.device_id !== filters.device) return false;
    if (filters.tag && detection.category_tag.toLowerCase() !== filters.tag) return false;
    if (filters.priority && detection.priority !== parseInt(filters.priority)) return false;
    return true;
  });

  return (
    <div className="space-y-2">
      {filteredDetections.map(detection => (
        <Link
          key={detection.image_id}
          href={`/detection/${detection.image_id}`}
          className="block bg-white rounded-lg overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center">
            <div className="w-[120px] h-[80px] relative rounded-md overflow-hidden">
              <Image
                src={detection.image_url}
                alt={detection.category_tag}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="flex-1 ml-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium">Device {detection.device_id}</div>
                <span className={`inline-block px-2 py-0.5 rounded-[5px] text-xs font-normal mr-4 ${
                  colorSchemes[detection.category_tag.toLowerCase() as keyof typeof colorSchemes]
                }`}>
                  {detection.category_tag}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {format(new Date(detection.time), 'MM/dd HH:mm')}
                </div>
                
                {detection.priority === 1 && (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M12.841 0H2.65977C2.25977 0 1.93164 0.325 1.93164 0.728125V16L7.75039 10.1812L13.5691 16V0.728125C13.5691 0.325 13.2441 0 12.841 0Z" fill="#C42D2D"/>
                  </svg>
                )}
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
} 