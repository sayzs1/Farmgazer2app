'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface DetectionCardProps {
  id: string;
  imageUrl: string;
  deviceId: string;
  deviceName: string;
  timestamp: string;
  category: 'weeds' | 'drought' | 'disease' | 'ponding' | 'healthy' | 'pest';
  priority?: number;
}

export const DetectionCard = ({ id, imageUrl, deviceId, deviceName, timestamp, category, priority = 0 }: DetectionCardProps) => {
  const router = useRouter();
  const [currentPriority, setCurrentPriority] = useState<number>(priority);
  const [priorityLoading, setPriorityLoading] = useState(false);
  
  const date = new Date(timestamp).toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  });

  // Material Design 颜色方案
  const categoryColors = {
    disease: 'bg-red-50 text-red-800',
    weeds: 'bg-green-50 text-green-800',
    drought: 'bg-amber-50 text-amber-800',
    ponding: 'bg-blue-50 text-blue-800',
    healthy: 'bg-emerald-50 text-emerald-800',
    pest: 'bg-purple-50 text-purple-800'
  };

  // 处理优先级变更
  const handlePriorityChange = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 防止卡片点击事件触发
    
    const newPriority = (currentPriority + 1) % 3; // 循环：0 -> 1 -> 2 -> 0
    
    setPriorityLoading(true);
    try {
      const response = await fetch(`/api/priority/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setCurrentPriority(newPriority);
      }
    } catch (err) {
      console.error('更新优先级失败:', err);
    } finally {
      setPriorityLoading(false);
    }
  };

  // 处理卡片点击
  const handleCardClick = () => {
    router.push(`/detection/${id}`);
  };

  // 处理键盘操作
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      router.push(`/detection/${id}`);
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer"
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label={`Detection of ${category} from ${deviceName}`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 17 
      }}
    >
      {/* 图片区域 */}
      <div className="relative w-full aspect-video">
        <Image
          src={imageUrl}
          alt={category}
          fill
          className="object-cover"
        />
        
        {/* 优先级按钮 */}
        <motion.button
          onClick={handlePriorityChange}
          disabled={priorityLoading}
          className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors flex items-center justify-center z-[5]"
          title={`优先级：${currentPriority === 0 ? '低' : currentPriority === 1 ? '中' : '高'}`}
          whileTap={{ scale: 0.9 }}
        >
          {priorityLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <div 
              className={`w-3 h-3 rounded-full ${
                currentPriority === 0 ? 'bg-gray-300' : 
                currentPriority === 1 ? 'bg-yellow-400' : 
                'bg-red-500'
              }`} 
            />
          )}
        </motion.button>
      </div>

      {/* 信息区域 */}
      <div className="p-4 space-y-2">
        {/* 设备名称和分类标签 */}
        <div className="flex items-center justify-between">
          <div className="text-base font-medium">
            {deviceName}
          </div>
          <div className={`px-4 py-1 rounded-full text-sm font-medium capitalize ${categoryColors[category]}`}>
            {category}
          </div>
        </div>
        {/* 时间戳 */}
        <div className="text-sm text-gray-500">
          {date}
        </div>
      </div>
    </motion.div>
  );
};