'use client';

import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DetectionCard } from '@/components/features/DetectionCard';
import { Loading } from '@/components/ui/loading';

// 定义检测数据的类型接口
interface Detection {
  id: string;
  imageUrl: string;
  deviceId: string;
  timestamp: string;
  category: 'weeds' | 'drought' | 'disease' | 'ponding' | 'healthy' | 'pest';
  temperature: number;
  humidity: number;
  analysis: string;
}

export default function Home() {
  // 状态管理
  const [detections, setDetections] = useState<Detection[]>([]);  // 存储检测数据
  const [loading, setLoading] = useState(true);  // 加载状态
  const [error, setError] = useState<string | null>(null);  // 错误状态

  // 在组件挂载时获取检测数据
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

  // 加载状态显示
  if (loading) {
    return <Loading />;
  }

  // 错误状态显示
  if (error) {
    return (
      <div className="w-full px-4 pt-4">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  // 无数据状态显示
  if (detections.length === 0) {
    return (
      <div className="w-full px-4 pt-4">
        <div className="text-center text-gray-600">No records found today</div>
      </div>
    );
  }

  // 定义所有允许显示的分类
  const allowedCategories = ['disease', 'weeds', 'drought', 'pest', 'ponding', 'healthy'] as const;
  
  // 将分类分为有数据和无数据两组
  const categoriesWithData = allowedCategories.filter(category => 
    detections.some(detection => detection.category === category)
  );

  const categoriesWithoutData = allowedCategories.filter(category => 
    !detections.some(detection => detection.category === category)
  );

  // 组合两组分类，有数据的在前，无数据的在后
  const orderedCategories = [...categoriesWithData, ...categoriesWithoutData];

  // 如果没有有数据的类别，显示提示信息
  if (categoriesWithData.length === 0) {
    return (
      <div className="w-full px-4 pt-4">
        <div className="text-center text-gray-600">No valid categories found</div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 bg-white min-h-screen">
      <Tabs defaultValue={categoriesWithData[0]} className="w-full">
        <div className="relative pb-[2px] bg-white shadow-sm">
          <div className="overflow-x-auto hide-scrollbar pb-3 -mb-3">
            <TabsList className="flex bg-transparent border-0 p-0 touch-pan-x min-w-full justify-start">
              {orderedCategories.map((category) => {
                const hasData = categoriesWithData.includes(category);
                return (
                  <TabsTrigger
                    key={category}
                    value={category}
                    disabled={!hasData}
                    className={`
                      flex-none 
                      px-4
                      font-medium 
                      h-12 
                      rounded-none 
                      text-[16px]
                      ${hasData ? 'text-gray-600 hover:text-gray-900' : 'text-gray-400 cursor-not-allowed'}
                      transition-colors
                      data-[state=active]:text-emerald-600
                      data-[state=active]:font-medium
                      whitespace-nowrap
                      capitalize
                      select-none
                      relative
                      after:absolute
                      after:bottom-0
                      after:left-0
                      after:right-0
                      after:h-0.5
                      after:rounded-full
                      after:bg-blue-600
                      after:transition-transform
                      after:scale-x-0
                      data-[state=active]:after:scale-x-100
                    `}
                  >
                    {category}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>
        </div>

        {categoriesWithData.map((category) => (
          <TabsContent 
            key={category} 
            value={category}
            className="mt-6"
          >
            <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
              {detections
                .filter(detection => detection.category === category)
                .map((detection) => (
                  <div key={detection.id}>
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
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}