'use client';

import * as React from 'react';
import { DetectionCard } from '@/components/features/DetectionCard';
import { CategoryTag } from '@/components/features/CategoryTag';

interface Detection {
  id: string;
  imageUrl: string;
  deviceId: string;
  timestamp: string;
  category: 'weeds' | 'drought' | 'disease' | 'waterpooling';
}

interface DetectionGridProps {
  detections: Detection[];
}

export function DetectionGrid({ detections }: DetectionGridProps) {
  // Group detections by category
  const groupedDetections = detections.reduce((acc, detection) => {
    if (!acc[detection.category]) {
      acc[detection.category] = [];
    }
    acc[detection.category].push(detection);
    return acc;
  }, {} as Record<Detection['category'], Detection[]>);

  return (
    <div className="flex flex-col gap-4">
      {Object.entries(groupedDetections).map(([category, categoryDetections]) => (
        <div key={category} className="flex flex-col gap-2">
          <div>
            <CategoryTag category={category as Detection['category']} />
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto gap-4 snap-x snap-mandatory hide-scrollbar">
              {categoryDetections.map((detection) => (
                <div 
                  key={detection.id} 
                  className="flex-none w-[50vw] snap-center"
                >
                  <DetectionCard
                    id={detection.id}
                    imageUrl={detection.imageUrl}
                    deviceId={detection.deviceId}
                    timestamp={detection.timestamp}
                    category={detection.category}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}