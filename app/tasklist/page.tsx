'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Loader2 } from 'lucide-react';
import { Loading } from '@/components/ui/loading';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItem {
  image_id: string;
  image_url: string;
  time: string;
  temperature: number;
  humidity: number;
  category_tag: string;
  AI_analysis: string;
  priority: string | number;
  device_id: string;
}

// 按日期分组的数据结构
interface GroupedTasks {
  [date: string]: TaskItem[];
}

export default function TaskList() {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<GroupedTasks>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 颜色方案与 ImageList 组件保持一致
  const colorSchemes = {
    weeds: 'bg-emerald-100 text-emerald-800',
    drought: 'bg-amber-100 text-amber-800',
    disease: 'bg-red-100 text-red-800',
    ponding: 'bg-blue-100 text-blue-800',
    healthy: 'bg-green-100 text-green-800',
    pests: 'bg-purple-100 text-purple-800'
  };

  // 获取任务数据
  useEffect(() => {
    async function fetchTasks() {
      try {
        const response = await fetch('/api/tasks');
        const data = await response.json();
        
        if (data.status === 'success') {
          // 更加健壮的数据处理方法
          const processedData = data.data.map((item: TaskItem) => {
            // 清理priority字符串中的非数字字符
            let priorityValue: number;
            if (typeof item.priority === 'string') {
              // 提取字符串中的第一个数字，如果没有则默认为1
              const match = item.priority.match(/^\d/);
              priorityValue = match ? parseInt(match[0], 10) : 1;
            } else if (typeof item.priority === 'number') {
              priorityValue = item.priority;
            } else {
              priorityValue = 1; // 默认值
            }
            
            return {
              ...item,
              priority: priorityValue
            };
          });
          
          setTasks(processedData);
          groupTasksByDate(processedData);
        } else {
          throw new Error(data.message || 'Failed to fetch tasks');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('API error details:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchTasks();
  }, []);

  // 按日期对任务进行分组
  const groupTasksByDate = (taskItems: TaskItem[]) => {
    const grouped = taskItems.reduce((acc: GroupedTasks, item) => {
      // 提取日期部分 (YYYY-MM-DD)
      const dateKey = item.time.split('T')[0];
      
      if (!acc[dateKey]) {
        acc[dateKey] = [];
      }
      
      acc[dateKey].push(item);
      return acc;
    }, {});
    
    setGroupedTasks(grouped);
  };

  // 格式化日期显示
  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    return format(date, 'MMMM dd, yyyy');
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-red-600">Error: {error}</div>
        </div>
      </div>
    );
  }

  if (Object.keys(groupedTasks).length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-6">
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500 text-center">No priority tasks</p>
          </div>
        </div>
      </div>
    );
  }

  // 获取所有日期键，并按倒序排列
  const dateKeys = Object.keys(groupedTasks).sort().reverse();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="container mx-auto px-4 py-4">
        <Accordion 
          type="multiple" 
          className="space-y-4"
          defaultValue={dateKeys.length > 0 ? [dateKeys[0]] : []} 
        >
          {dateKeys.map((dateKey, index) => (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.1,
                type: "spring",
                stiffness: 300,
                damping: 25
              }}
            >
              <AccordionItem 
                value={dateKey}
                className="border rounded-lg bg-white shadow-sm overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-3 hover:bg-gray-50">
                  <div className="flex items-center">
                    <span className="font-medium">{formatDateDisplay(dateKey)}</span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({groupedTasks[dateKey].length} tasks)
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="p-2 space-y-2">
                    <motion.div
                      initial="hidden"
                      animate="visible"
                      variants={{
                        hidden: {},
                        visible: {
                          transition: {
                            staggerChildren: 0.05
                          }
                        }
                      }}
                    >
                      <AnimatePresence>
                        {groupedTasks[dateKey].map((task) => (
                          <motion.div
                            key={task.image_id}
                            variants={{
                              hidden: { opacity: 0, y: 20, scale: 0.95 },
                              visible: { 
                                opacity: 1, 
                                y: 0, 
                                scale: 1,
                                transition: {
                                  type: "spring",
                                  stiffness: 400,
                                  damping: 25
                                }
                              }
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Link
                              href={`/detection/${task.image_id}`}
                              className="block bg-white rounded-lg overflow-hidden border border-gray-100 hover:shadow-md transition-shadow"
                            >
                              <div className="flex items-center">
                                <div className="w-[120px] h-[80px] relative rounded-md overflow-hidden">
                                  <Image
                                    src={task.image_url}
                                    alt={task.category_tag}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                                
                                <div className="flex-1 ml-4 p-2">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm font-medium">Device {task.device_id}</div>
                                    <div 
                                      className={`w-4 h-4 rounded-full ${
                                        parseInt(String(task.priority), 10) === 1 ? 'bg-yellow-400' : 'bg-red-500'
                                      }`} 
                                      title={parseInt(String(task.priority), 10) === 1 ? 'Medium Priority' : 'High Priority'} 
                                    />
                                  </div>
                                  
                                  <div>
                                    <span className={`inline-block px-2 py-0.5 rounded-[5px] text-xs font-normal capitalize ${
                                      colorSchemes[task.category_tag.toLowerCase() as keyof typeof colorSchemes] || 'bg-gray-100 text-gray-800'
                                    }`}>
                                      {task.category_tag}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </Link>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </motion.div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </div>
    </div>
  );
} 