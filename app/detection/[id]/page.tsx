'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Thermometer, Droplets, AlertCircle, Download, Share2, Bookmark } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from 'next/link';
import { format } from 'date-fns';

interface Detection {
  id: string;
  imageUrl: string;
  deviceId: string;
  timestamp: string;
  category: string;
  temperature: number;
  humidity: number;
  analysis: string;
}

interface HistoryRecord {
  image_id: string;
  image_url: string;
  time: string;
  category_tag: string;
  device_id: string;
}

export default function DetectionDetail() {
  const params = useParams();
  const [detection, setDetection] = useState<Detection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    async function fetchDetection() {
      try {
        const response = await fetch(`/api/detection/${params.id}`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setDetection(data.data);
        } else {
          throw new Error(data.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchDetection();
  }, [params.id]);

  const fetchHistory = async (deviceId: string) => {
    setHistoryLoading(true);
    try {
      const response = await fetch(`/api/detection/history/${deviceId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setHistoryRecords(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (detection?.deviceId) {
      fetchHistory(detection.deviceId);
    }
  }, [detection?.deviceId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-gray-600 text-base">Loading...</div>
        </div>
      </div>
    );
  }

  if (error || !detection) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-red-600 text-base">
            Error: {error || 'No records found'}
          </div>
        </div>
      </div>
    );
  }

  const date = new Date(detection.timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white shadow-sm">
        {/* Image Section */}
        <div className="aspect-video relative w-full overflow-hidden">
          <Image
            src={detection.imageUrl}
            alt={detection.category}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute bottom-4 left-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {detection.category}
          </div>
        </div>

        {/* Title Section */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-semibold mb-2">
                {detection.deviceId}
              </h1>
              <p className="text-gray-600">{date}</p>
            </div>
            <div className="flex space-x-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Download className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <Bookmark className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="overview" className="w-full">
          <div className="border-b border-gray-200">
            <TabsList className="max-w-4xl mx-auto h-12 w-full bg-transparent border-0 p-0">
              <div className="flex w-full">
                <TabsTrigger 
                  value="overview"
                  className="flex-1 px-1 font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="flex-1 px-1 font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12"
                >
                  History
                </TabsTrigger>
                <TabsTrigger 
                  value="data"
                  className="flex-1 px-1 font-medium data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none h-12"
                >
                  Copilot
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="overview" className="p-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Thermometer className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Temperature</div>
                    <div className="font-medium">{detection.temperature.toFixed(1)}°C</div>
                  </div>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <Droplets className="w-5 h-5 text-gray-500" />
                  <div>
                    <div className="text-sm text-gray-500">Humidity</div>
                    <div className="font-medium">{detection.humidity.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-3">
                <h3 className="font-medium">Detection Category</h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  detection.category === 'disease' ? 'bg-red-100 text-red-600' :
                  detection.category === 'weeds' ? 'bg-yellow-100 text-yellow-600' :
                  detection.category === 'drought' ? 'bg-orange-100 text-orange-600' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  {detection.category}
                </span>
              </div>
              <p className="text-gray-600 text-sm">{detection.analysis}</p>
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-6">
            {historyLoading ? (
              <div className="text-center py-4">Loading history...</div>
            ) : historyRecords.length === 0 ? (
              <div className="text-center py-4 text-gray-500">No records found today</div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {historyRecords.map((record) => (
                  <Link
                    key={record.image_id}
                    href={`/detection/${record.image_id}`}
                    className="block bg-white rounded-lg overflow-hidden border border-gray-200"
                  >
                    <div className="relative aspect-video">
                      <Image
                        src={record.image_url}
                        alt={record.category_tag}
                        fill
                        className="object-cover"
                      />
                      <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-[5px] text-xs font-normal font-['Lexend'] ${
                        record.category_tag.toLowerCase() === 'disease' ? 'bg-[#dbcdeb]' :
                        record.category_tag.toLowerCase() === 'weeds' ? 'bg-[#dcebcd]' :
                        'bg-[#ffe89c]'
                      }`}>
                        {record.category_tag}
                      </span>
                    </div>
                    <div className="p-2">
                      <div className="text-xs text-gray-600">
                        {format(new Date(record.time), 'MM/dd HH:mm')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="p-6">
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-2">Environmental Data</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Temperature</span>
                    <span className="font-medium">{detection.temperature.toFixed(1)}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Humidity</span>
                    <span className="font-medium">{detection.humidity.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Detection Time</span>
                    <span className="font-medium">{date}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Action Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto">
          <button
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 flex items-center justify-center"
            onClick={() => {/* 实现报告功能 */}}
          >
            <AlertCircle className="w-5 h-5 mr-2" />
            Report Incorrect Analysis
          </button>
        </div>
      </div>
    </div>
  );
} 