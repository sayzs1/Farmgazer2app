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
  device_id: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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
      WHERE image_id = @param0
    `, [params.id]);

    if (result.length === 0) {
      return NextResponse.json(
        { status: 'error', message: '未找到相关记录' },
        { status: 404 }
      );
    }

    const detection = result[0];
    
    return NextResponse.json({
      status: 'success',
      data: {
        id: detection.image_id,
        imageUrl: detection.image_url,
        deviceId: detection.device_id,
        timestamp: detection.time,
        category: detection.category_tag.toLowerCase(),
        temperature: detection.temperature,
        humidity: detection.humidity,
        analysis: detection.AI_analysis
      }
    });
  } catch (error) {
    console.error('Failed to fetch detection:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: '获取数据失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 