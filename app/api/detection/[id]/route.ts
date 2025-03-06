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
    // 首先获取当前图片信息
    const currentImage = await query<ImageData[]>(`
      SELECT 
        image_id, image_url, time, temperature, humidity,
        category_tag, AI_analysis, device_id
      FROM dbo.ImageData
      WHERE image_id = @param0
    `, [params.id]);

    if (currentImage.length === 0) {
      return NextResponse.json(
        { status: 'error', message: '未找到相关记录' },
        { status: 404 }
      );
    }

    // 获取同一设备同一天的所有图片
    const sameDeviceImages = await query<ImageData[]>(`
      SELECT 
        image_id, image_url, time, temperature, humidity,
        category_tag, AI_analysis, device_id
      FROM dbo.ImageData
      WHERE device_id = @param0
      AND CAST(time AS DATE) = CAST(@param1 AS DATE)
      ORDER BY time ASC
    `, [currentImage[0].device_id, currentImage[0].time]);

    const detection = currentImage[0];
    
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
        analysis: detection.AI_analysis,
        relatedImages: sameDeviceImages.map(img => ({
          id: img.image_id,
          imageUrl: img.image_url,
          timestamp: img.time,
          category: img.category_tag.toLowerCase()
        }))
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