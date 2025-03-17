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
  device_name: string;
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
        category_tag, AI_analysis, device_id, device_name
      FROM dbo.ImageData
      WHERE image_id = @param0
    `, [params.id]);

    if (currentImage.length === 0) {
      return NextResponse.json(
        { status: 'error', message: '未找到相关记录' },
        { status: 404 }
      );
    }

    // 获取同一设备同一日期同一时间点的所有图片
    const sameDeviceImages = await query<ImageData[]>(`
      SELECT 
        image_id, image_url, time, temperature, humidity,
        category_tag, AI_analysis, device_id, device_name
      FROM dbo.ImageData
      WHERE device_id = @param0
      AND CAST(time AS DATE) = CAST(@param1 AS DATE)
      AND DATEPART(HOUR, time) = DATEPART(HOUR, @param1)
      AND DATEPART(MINUTE, time) = DATEPART(MINUTE, @param1)
      AND image_id != @param2
      ORDER BY time ASC
    `, [currentImage[0].device_id, currentImage[0].time, currentImage[0].image_id]);

    const detection = currentImage[0];
    
    return NextResponse.json({
      status: 'success',
      data: {
        id: detection.image_id,
        imageUrl: detection.image_url,
        deviceId: detection.device_id,
        deviceName: detection.device_name,
        timestamp: detection.time,
        category: detection.category_tag.toLowerCase(),
        temperature: detection.temperature,
        humidity: detection.humidity,
        analysis: detection.AI_analysis,
        relatedImages: [
          {
            id: detection.image_id,
            imageUrl: detection.image_url,
            timestamp: detection.time,
            category: detection.category_tag.toLowerCase()
          },
          ...sameDeviceImages.map(img => ({
            id: img.image_id,
            imageUrl: img.image_url,
            timestamp: img.time,
            category: img.category_tag.toLowerCase()
          }))
        ]
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