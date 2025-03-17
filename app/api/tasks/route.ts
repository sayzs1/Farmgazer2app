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
  priority: string | number;
  device_id: string;
}

export async function GET() {
  try {
    // 修改查询，使用字符串比较而非数字比较
    const result = await query<TaskItem[]>(`
      SELECT 
        image_id, image_url, time, temperature, humidity,
        category_tag, AI_analysis, priority, device_id
      FROM dbo.ImageData
      WHERE priority LIKE '1%' OR priority LIKE '2%' 
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