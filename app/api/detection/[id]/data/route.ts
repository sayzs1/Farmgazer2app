import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface ImageData {
  temperature: number;
  humidity: number;
  AI_analysis: string;
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const result = await query<ImageData[]>(`
      SELECT 
        temperature,
        humidity,
        AI_analysis
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
        temperature: detection.temperature,
        humidity: detection.humidity,
        analysis: detection.AI_analysis
      }
    });
  } catch (error) {
    console.error('Failed to fetch detection data:', error);
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