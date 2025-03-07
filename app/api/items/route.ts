import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ImageData {
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

interface DetectionResponse {
  id: string;
  imageUrl: string;
  deviceId: string;
  timestamp: string;
  category: 'weeds' | 'drought' | 'disease' | 'waterpooling';
  temperature: number;
  humidity: number;
  analysis: string;
}

export async function GET(request: Request) {
  try {
    const result = await query<ImageData[]>(`
      SELECT 
        image_id,
        image_url,
        time,
        temperature,
        humidity,
        category_tag,
        AI_analysis,
        device_id
      FROM dbo.ImageData
      WHERE CONVERT(date, DATEADD(hour, -8, time)) = CONVERT(date, DATEADD(hour, -8, GETUTCDATE()))
      ORDER BY time DESC
    `);

    const detections: DetectionResponse[] = result.map(item => ({
      id: item.image_id,
      imageUrl: item.image_url,
      deviceId: item.device_id,
      timestamp: item.time,
      category: item.category_tag.toLowerCase() as 'weeds' | 'drought' | 'disease' | 'waterpooling',
      temperature: item.temperature,
      humidity: item.humidity,
      analysis: item.AI_analysis
    }));

    const pstDate = new Date(new Date().toLocaleString("en-US", {timeZone: "America/Los_Angeles"}));

    return NextResponse.json({ 
      status: 'success', 
      data: detections,
      debug: {
        totalRecords: result.length,
        serverDate: new Date().toISOString(),
        pstDate: pstDate.toISOString()
      }
    });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Failed to fetch data',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 