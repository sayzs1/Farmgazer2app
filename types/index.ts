export interface ImageData {
  image_id: string;
  image_url: string;
  time: string;
  temperature: number;
  humidity: number;
  category_tag: string;
  AI_analysis: string;
  device_id: string;
  priority?: number;
}

export interface Detection {
  id: string;
  imageUrl: string;
  deviceId: string;
  timestamp: string;
  category: 'weeds' | 'drought' | 'disease' | 'waterpooling';
  temperature: number;
  humidity: number;
  analysis: string;
}

export interface HistoryRecord {
  image_id: string;
  image_url: string;
  time: string;
  category_tag: string;
  device_id: string;
} 