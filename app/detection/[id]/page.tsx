'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Thermometer, Droplets, AlertCircle, Download, Share2, Bookmark, Pencil, ChevronLeft, ChevronRight, Loader2, Flag } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import Link from 'next/link';
import { format } from 'date-fns';
import { Loading } from '@/components/ui/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VALID_CATEGORIES } from "@/lib/constants";
import { Separator } from "@/components/ui/separator";

interface Detection {
  id: string;
  imageUrl: string;
  deviceId: string;
  timestamp: string;
  category: string;
  temperature: number;
  humidity: number;
  analysis: string;
  priority: number;
  relatedImages: {
    id: string;
    imageUrl: string;
    timestamp: string;
    category: string;
  }[];
}

interface HistoryRecord {
  image_id: string;
  image_url: string;
  time: string;
  category_tag: string;
  device_id: string;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// 修改默认预置问题为英文
const DEFAULT_PRESET_QUESTIONS = [
  'How many times has this disease occurred this year?',
  'How to prevent this disease?'
];

export default function DetectionDetail() {
  const params = useParams();
  const router = useRouter();
  const [detection, setDetection] = useState<Detection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [customQuestion, setCustomQuestion] = useState('');
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isInPresetArea, setIsInPresetArea] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  // 将预置问题状态移到组件内
  const [presetQuestions, setPresetQuestions] = useState<string[]>(DEFAULT_PRESET_QUESTIONS);

  // 添加 useEffect 来处理 localStorage
  useEffect(() => {
    // 从 localStorage 读取预置问题
    const stored = localStorage.getItem('presetQuestions');
    if (stored) {
      setPresetQuestions(JSON.parse(stored));
    }
  }, []);

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

  const fetchHistory = useCallback(async (deviceId: string) => {
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
  }, []);

  useEffect(() => {
    if (detection?.deviceId) {
      fetchHistory(detection.deviceId);
    }
  }, [detection?.deviceId, fetchHistory]);

  useEffect(() => {
    if (detection?.relatedImages) {
      // 找到当前图片在相关图片中的索引
      const index = detection.relatedImages.findIndex(img => img.id === params.id);
      if (index !== -1) {
        setCurrentImageIndex(index);
      }
    }
  }, [detection, params.id]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: ChatMessage = {
      role: 'user',
      content: inputMessage
    };

    setMessages(prev => [...prev, newMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful agricultural assistant specialized in crop disease detection and treatment.'
            },
            ...messages,
            newMessage
          ]
        })
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setMessages(prev => [...prev, data.data]);
      } else {
        throw new Error(data.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 添加发送预置问题的处理函数
  const handlePresetQuestion = (question: string) => {
    setInputMessage(question);
    handleSendMessage();
  };

  // 添加保存预置问题的函数
  const handleSavePreset = (newQuestion: string, index: number) => {
    const newPresetQuestions = [...presetQuestions];
    newPresetQuestions[index] = newQuestion;
    setPresetQuestions(newPresetQuestions);
    localStorage.setItem('presetQuestions', JSON.stringify(newPresetQuestions));
    setEditingIndex(null);
    setCustomQuestion('');
  };

  const handlePrevImage = () => {
    if (detection?.relatedImages && currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      // 更新 URL 并获取新的数据
      const newId = detection.relatedImages[currentImageIndex - 1].id;
      window.history.pushState({}, '', `/detection/${newId}`);
      fetchDetectionData(newId);
    }
  };

  const handleNextImage = () => {
    if (detection?.relatedImages && currentImageIndex < detection.relatedImages.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      // 更新 URL 并获取新的数据
      const newId = detection.relatedImages[currentImageIndex + 1].id;
      window.history.pushState({}, '', `/detection/${newId}`);
      fetchDetectionData(newId);
    }
  };

  // 添加图片加载状态
  const [imageLoading, setImageLoading] = useState(false);

  // 修改获取数据的函数
  const fetchDetectionData = async (imageId: string) => {
    try {
      setImageLoading(true); // 使用专门的图片加载状态
      const response = await fetch(`/api/detection/${imageId}/data`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setDetection(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            temperature: data.data.temperature,
            humidity: data.data.humidity,
            analysis: data.data.analysis
          };
        });
      }
    } catch (err) {
      console.error('Failed to fetch detection data:', err);
    } finally {
      setImageLoading(false);
    }
  };

  // 添加 popstate 事件监听
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      router.push('/');  // 永远返回到首页
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [router]);

  // 添加分类更新加载状态
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [categoryError, setCategoryError] = useState<string | null>(null);
  
  // 修改分类更新处理函数
  const handleCategoryChange = async (newCategory: string) => {
    if (!detection || newCategory === detection.relatedImages[currentImageIndex].category) {
      return;
    }
    
    setCategoryLoading(true);
    setCategoryError(null);
    
    try {
      const response = await fetch(`/api/detection/${detection.relatedImages[currentImageIndex].id}/category`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ category: newCategory }),
      });

      const data = await response.json();

      if (data.status === "success") {
        // 更新当前图片的分类
        const updatedImages = [...detection.relatedImages];
        updatedImages[currentImageIndex] = {
          ...updatedImages[currentImageIndex],
          category: data.data.category
        };
        
        setDetection({
          ...detection,
          relatedImages: updatedImages
        });
      } else {
        setCategoryError(data.message || "更新分类失败");
      }
    } catch (err) {
      setCategoryError("请求失败，请稍后再试");
      console.error("Failed to update category:", err);
    } finally {
      setCategoryLoading(false);
    }
  };

  // 添加 Tab 切换处理函数
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    
    // 当切换到 history tab 时，重新加载历史数据
    if (value === 'history' && detection?.deviceId) {
      fetchHistory(detection.deviceId);
    }
  }, [detection?.deviceId, fetchHistory]);

  // 添加一个 ref 来引用编辑框
  const editBoxRef = useRef<HTMLDivElement>(null);

  // 添加点击事件监听器
  useEffect(() => {
    // 只有在编辑模式时才添加监听器
    if (editingIndex !== null) {
      const handleClickOutside = (event: MouseEvent) => {
        // 如果点击发生在编辑框外部
        if (editBoxRef.current && !editBoxRef.current.contains(event.target as Node)) {
          setEditingIndex(null);
          setCustomQuestion('');
        }
      };

      // 添加全局点击事件监听器
      document.addEventListener('mousedown', handleClickOutside);

      // 清理函数
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingIndex]);

  const [priority, setPriority] = useState<number>(0);
  const [priorityLoading, setPriorityLoading] = useState(false);
  
  // 获取优先级
  const fetchPriority = useCallback(async (imageId: string) => {
    try {
      const response = await fetch(`/api/priority/${imageId}`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setPriority(Number(data.data.priority) || 0);
      }
    } catch (err) {
      console.error('获取优先级失败:', err);
    }
  }, []);

  // 更新优先级
  const handlePriorityChange = async () => {
    if (!detection) return;
    
    const imageId = params.id as string;
    const newPriority = (priority + 1) % 3; // 循环：0 -> 1 -> 2 -> 0
    
    setPriorityLoading(true);
    try {
      const response = await fetch(`/api/priority/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ priority: newPriority }),
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        setPriority(newPriority);
      }
    } catch (err) {
      console.error('更新优先级失败:', err);
    } finally {
      setPriorityLoading(false);
    }
  };

  // 在组件加载时获取优先级
  useEffect(() => {
    if (params.id) {
      fetchPriority(params.id as string);
    }
  }, [params.id, fetchPriority]);

  // 替换 Shadcn UI 的 Select 组件为自定义实现
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  // 添加点击外部关闭下拉菜单的功能
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isSelectOpen) {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setIsSelectOpen(false);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isSelectOpen]);

  if (loading) {
    return <Loading />;
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
        <div className="aspect-video relative w-full overflow-hidden bg-gray-100">
          {imageLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
            </div>
          ) : (
            detection.relatedImages && detection.relatedImages.length > 0 && (
              <Image
                src={detection.relatedImages[currentImageIndex].imageUrl}
                alt={detection.relatedImages[currentImageIndex].category}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            )
          )}
          
          {/* 导航按钮 */}
          {currentImageIndex > 0 && (
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          {detection.relatedImages && currentImageIndex < detection.relatedImages.length - 1 && (
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {/* 替换原来的分类按钮为自定义下拉选择器 */}
          {detection && detection.relatedImages && (
            <div className="absolute bottom-4 left-4 z-10">
              <div className="relative" ref={selectRef}>
                {/* 触发器按钮 */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSelectOpen(!isSelectOpen);
                  }}
                  disabled={categoryLoading}
                  className="bg-black/60 hover:bg-black/80 text-white border-0 px-3 py-1 rounded-full text-sm flex items-center transition-colors"
                >
                  {categoryLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      <span>Loading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <span className="capitalize">{detection.relatedImages[currentImageIndex].category}</span>
                      <Pencil className="w-3 h-3 ml-1.5" />
                    </div>
                  )}
                </button>
                
                {/* 下拉菜单 */}
                {isSelectOpen && (
                  <div 
                    className="absolute bottom-full left-0 mb-1 bg-black/50 text-white rounded-lg overflow-hidden"
                    style={{ width: 'auto', minWidth: '90px' }}
                  >
                    <div className="py-1">
                      {VALID_CATEGORIES
                        .filter(category => category !== detection.relatedImages[currentImageIndex].category)
                        .map((category) => (
                          <button
                            key={category}
                            onClick={() => {
                              handleCategoryChange(category);
                              setIsSelectOpen(false);
                            }}
                            className="w-full text-left px-3 py-1.5 capitalize hover:bg-black/70 transition-colors text-sm"
                          >
                            {category}
                          </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 图片计数器 */}
          <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
            {currentImageIndex + 1} / {detection.relatedImages.length}
          </div>

          {/* 优先级按钮 */}
          <button
            onClick={handlePriorityChange}
            disabled={priorityLoading}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors flex items-center justify-center"
            title={`优先级：${priority === 0 ? '低' : priority === 1 ? '中' : '高'}`}
          >
            {priorityLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <div 
                className={`w-4 h-4 rounded-full ${
                  priority === 0 ? 'bg-gray-300' : 
                  priority === 1 ? 'bg-yellow-400' : 
                  'bg-red-500'
                }`} 
              />
            )}
          </button>
        </div>

        {/* Title Section */}
        <div className="px-6 md:px-8 pt-6 pb-4 border-b border-gray-200">
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
        <Tabs 
          defaultValue="overview" 
          value={activeTab}
          onValueChange={handleTabChange}
          className="w-full"
        >
          <div className="border-b border-gray-200 pt-2">
            <TabsList className="max-w-4xl mx-auto h-12 w-full bg-transparent border-0 px-6 md:px-8">
              <div className="flex w-full">
                <TabsTrigger 
                  value="overview"
                  className="flex-1 px-1 font-medium data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none h-12"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="history"
                  className="flex-1 px-1 font-medium data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none h-12"
                >
                  History
                </TabsTrigger>
                <TabsTrigger 
                  value="data"
                  className="flex-1 px-1 font-medium data-[state=active]:border-b-2 data-[state=active]:border-emerald-600 rounded-none h-12"
                >
                  Copilot
                </TabsTrigger>
              </div>
            </TabsList>
          </div>

          {/* Tab Contents */}
          <TabsContent value="overview" className="px-6 md:px-8 py-4">
            <div className="space-y-4">
              {/* 温度和湿度卡片 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="py-2 px-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Thermometer className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="text-sm text-gray-500">Temperature</div>
                      <div className="font-medium h-6">
                        {imageLoading ? (
                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : (
                          detection.temperature != null 
                            ? `${detection.temperature.toFixed(1)}°C`
                            : '-'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-2 px-4 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Droplets className="w-6 h-6 text-emerald-600" />
                    <div>
                      <div className="text-sm text-gray-500">Humidity</div>
                      <div className="font-medium h-6">
                        {imageLoading ? (
                          <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                        ) : (
                          detection.humidity != null 
                            ? `${detection.humidity.toFixed(1)}%`
                            : '-'
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />

              {/* AI 分析部分 */}
              <div>
                <h3 className="font-medium mb-3">AI Analysis</h3>
                <div className="p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
                  <div className="text-gray-600 text-sm min-h-[20px]">
                    {imageLoading ? (
                      <div className="flex items-center">
                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                      </div>
                    ) : (
                      detection.analysis || '-'
                    )}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="history" className="px-6 md:px-8 py-6">
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

          <TabsContent value="data" className="px-6 md:px-8 py-6">
            {/* 消息列表容器 */}
            <div className="pb-80"> {/* 增加更多底部padding */}
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 rounded-lg px-4 py-2">
                      Thinking...
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 预置问题按钮组 */}
            {(isInputFocused || editingIndex !== null) && (
              <div 
                className="fixed bottom-[8.5rem] left-0 right-0 px-6"
                onMouseEnter={() => setIsInPresetArea(true)}
                onMouseLeave={() => setIsInPresetArea(false)}
              >
                <div className="max-w-4xl mx-auto flex flex-col items-end gap-2">
                  {presetQuestions.map((question, index) => (
                    <div 
                      key={index} 
                      className="flex items-center gap-1.5 transform transition-all duration-300 ease-out"
                      style={{
                        opacity: (isInputFocused || editingIndex !== null) ? 1 : 0,
                        transform: `translateY(${(isInputFocused || editingIndex !== null) ? 0 : '20px'})`,
                        transitionDelay: `${index * 100}ms`,
                        scale: (isInputFocused || editingIndex !== null) ? '1' : '0.95'
                      }}
                    >
                      {editingIndex === index ? (
                        // 编辑状态
                        <div className="flex gap-2" ref={editBoxRef}>
                          <input
                            type="text"
                            value={customQuestion}
                            onChange={(e) => setCustomQuestion(e.target.value)}
                            placeholder="Enter custom question..."
                            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 w-64 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                            autoFocus
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            onBlur={(e) => {
                              e.stopPropagation();
                            }}
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (customQuestion.trim()) {
                                  handleSavePreset(customQuestion.trim(), index);
                                }
                              }}
                              disabled={!customQuestion.trim()}
                              className="text-sm text-emerald-600 hover:text-emerald-700 disabled:text-gray-400"
                            >
                              Save
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setEditingIndex(null);
                                setCustomQuestion('');
                              }}
                              className="text-sm text-gray-500 hover:text-gray-700"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        // 非编辑状态
                        <>
                          <div className="max-w-[300px] overflow-x-auto scrollbar-hide">
                            <button
                              onClick={() => handlePresetQuestion(question)}
                              className="text-sm text-gray-600 hover:text-gray-900 border border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg transition-all whitespace-nowrap"
                            >
                              {question}
                            </button>
                          </div>
                          <button
                            onClick={() => {
                              setCustomQuestion(question);
                              setEditingIndex(index);
                            }}
                            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 输入框 */}
            <div className="fixed bottom-[4.5rem] left-0 right-0 px-6 py-3">
              <div className="max-w-4xl mx-auto flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => {
                    setTimeout(() => {
                      if (!isInPresetArea && editingIndex === null) {
                        setIsInputFocused(false);
                      }
                    }, 200);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Ask about the crop condition..."
                  className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send
                </button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 