'use client';

import { useEffect, useState } from 'react';
import FilterBar from '@/components/database/FilterBar';
import { ImageList } from '@/components/database/ImageList';
import { Loading } from '@/components/ui/loading';

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

export default function DatabasePage() {
  const [detections, setDetections] = useState<Detection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState({
    device: '',
    date: '',
    tag: '',
    priority: ''
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/database');
        const data = await response.json();
        
        if (data.status === 'success') {
          setDetections(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters({
      device: '',
      date: '',
      tag: '',
      priority: ''
    });
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="flex items-center justify-center h-screen">
          <div className="text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 pt-4">
      <FilterBar 
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleReset}
      />
      <ImageList detections={detections} filters={filters} />
    </div>
  );
} 