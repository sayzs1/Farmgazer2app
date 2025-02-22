'use client';

import { Filter } from 'lucide-react';

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
  return (
    <div className="flex items-center gap-2 pt-0 pb-4">
      <select
        value={filters.device}
        onChange={(e) => onFilterChange('device', e.target.value)}
        className="w-[70px] h-[27px] px-[5px] text-xs font-semibold rounded-[5px] border border-black bg-transparent"
      >
        <option value="">Device</option>
        {Array.from({ length: 7 }, (_, i) => i + 1).map(num => (
          <option key={num} value={String(num).padStart(2, '0')}>
            {String(num).padStart(2, '0')}
          </option>
        ))}
      </select>

      <select
        value={filters.date}
        onChange={(e) => onFilterChange('date', e.target.value)}
        className="w-[70px] h-[27px] px-[5px] text-xs font-semibold rounded-[5px] border border-black bg-transparent"
      >
        <option value="">Date</option>
        <option value="today">Today</option>
        <option value="week">Week</option>
        <option value="month">Month</option>
      </select>

      <select
        value={filters.tag}
        onChange={(e) => onFilterChange('tag', e.target.value)}
        className="w-[70px] h-[27px] px-[5px] text-xs font-semibold rounded-[5px] border border-black bg-transparent"
      >
        <option value="">Tag</option>
        <option value="disease">Disease</option>
        <option value="weeds">Weeds</option>
        <option value="drought">Drought</option>
      </select>

      <select
        value={filters.priority}
        onChange={(e) => onFilterChange('priority', e.target.value)}
        className="w-[70px] h-[27px] px-[5px] text-xs font-semibold rounded-[5px] border border-black bg-transparent"
      >
        <option value="">Mark</option>
        <option value="1">High</option>
        <option value="2">Medium</option>
        <option value="3">Low</option>
      </select>

      <button
        onClick={onReset}
        className="text-[10px] font-light text-black underline leading-[18px] ml-auto"
      >
        Reset
      </button>
    </div>
  );
} 