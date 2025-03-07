import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface TaskItem {
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

export async function GET() {
  try {
    // 查询优先级为1或2的图片数据
    const result = await query<TaskItem[]>(`
      SELECT 
        image_id, image_url, time, temperature, humidity,
        category_tag, AI_analysis, priority, device_id
      FROM dbo.ImageData
      WHERE priority IN (1, 2)
      ORDER BY time DESC
    `);

    return NextResponse.json({
      status: 'success',
      data: result
    });
  } catch (error) {
    console.error('获取任务列表失败:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: '获取任务列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 