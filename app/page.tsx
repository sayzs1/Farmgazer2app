'use client';

import { useEffect, useState } from 'react';
import { DetectionGrid } from '@/components/layout/DetectionGrid';

interface Detection {
  id: string;
  imageUrl: string;
  deviceId: string;
  timestamp: string;
  category: 'weeds' | 'drought' | 'disease' | 'waterpooling';
  temperature: number;
  humidity: number;
  analysis: string;
}

export default function Home() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDetections() {
      try {
        const response = await fetch('/api/items');
        const data = await response.json();
        
        if (data.status === 'success') {
          setDetections(data.data);
        } else {
          throw new Error(data.error || '获取数据失败');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : '发生未知错误');
      } finally {
        setLoading(false);
      }
    }

    fetchDetections();
  }, []);

  if (loading) {
    return (
      <div className="w-full px-4 pt-4">
        <div className="text-center text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full px-4 pt-4">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (detections.length === 0) {
    return (
      <div className="w-full px-4 pt-4">
        <div className="text-center text-gray-600">No records found today</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-4 overflow-hidden">
      <DetectionGrid detections={detections} />
    </div>
  );
}