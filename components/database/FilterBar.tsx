'use client';

import { Filter, Check, RefreshCw } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface FilterBarProps {
  filters: {
    device: string;
    date: string;
    tag: string;
    priority: string;
  };
  onFilterChange: (key: string, value: string) => void;
  onReset: () => void;
}

export default function FilterBar({ filters, onFilterChange, onReset }: FilterBarProps) {
  // 设备筛选选项
  const deviceOptions = Array.from({ length: 7 }, (_, i) => ({
    value: String(i + 1).padStart(2, '0'),
    label: String(i + 1).padStart(2, '0')
  }));
  
  // 日期筛选选项
  const dateOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' }
  ];
  
  // 标签筛选选项
  const tagOptions = [
    { value: 'disease', label: 'Disease' },
    { value: 'weeds', label: 'Weeds' },
    { value: 'drought', label: 'Drought' }
  ];
  
  // 优先级筛选选项
  const priorityOptions = [
    { value: '1', label: 'High' },
    { value: '2', label: 'Medium' },
    { value: '3', label: 'Low' }
  ];
  
  // 获取当前筛选器的标签显示
  const getFilterLabel = (key: string, value: string) => {
    if (!value) return key.charAt(0).toUpperCase() + key.slice(1);
    
    switch(key) {
      case 'device':
        return value;
      case 'date':
        return dateOptions.find(o => o.value === value)?.label || value;
      case 'tag':
        return tagOptions.find(o => o.value === value)?.label || value;
      case 'priority':
        return priorityOptions.find(o => o.value === value)?.label || value;
      default:
        return value;
    }
  };
  
  // 判断是否有激活的筛选器
  const hasActiveFilters = Object.values(filters).some(v => v !== '');
  
  return (
    <div className="flex items-center gap-2 pb-4 flex-wrap">
      {/* 设备筛选器 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-8 text-sm ${filters.device ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
          >
            {getFilterLabel('device', filters.device)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="text-sm bg-white">
          <DropdownMenuItem onClick={() => onFilterChange('device', '')}>
            All Devices {!filters.device && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
          {deviceOptions.map(option => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => onFilterChange('device', option.value)}
            >
              {option.label}
              {filters.device === option.value && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 日期筛选器 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-8 text-sm ${filters.date ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
          >
            {getFilterLabel('date', filters.date)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="text-sm bg-white">
          <DropdownMenuItem onClick={() => onFilterChange('date', '')}>
            Any Date {!filters.date && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
          {dateOptions.map(option => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => onFilterChange('date', option.value)}
            >
              {option.label}
              {filters.date === option.value && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 标签筛选器 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-8 text-sm ${filters.tag ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
          >
            {getFilterLabel('tag', filters.tag)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="text-sm bg-white">
          <DropdownMenuItem onClick={() => onFilterChange('tag', '')}>
            All Tags {!filters.tag && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
          {tagOptions.map(option => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => onFilterChange('tag', option.value)}
            >
              {option.label}
              {filters.tag === option.value && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 优先级筛选器 */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className={`h-8 text-sm ${filters.priority ? "bg-emerald-600 text-white hover:bg-emerald-700" : ""}`}
          >
            {filters.priority ? getFilterLabel('priority', filters.priority) : 'Priority'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="text-sm bg-white">
          <DropdownMenuItem onClick={() => onFilterChange('priority', '')}>
            Any Priority {!filters.priority && <Check className="ml-2 h-4 w-4" />}
          </DropdownMenuItem>
          {priorityOptions.map(option => (
            <DropdownMenuItem 
              key={option.value}
              onClick={() => onFilterChange('priority', option.value)}
            >
              {option.label}
              {filters.priority === option.value && <Check className="ml-2 h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* 重置按钮 */}
      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onReset} 
          className="h-8 w-8 ml-auto text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          title="Reset filters"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 