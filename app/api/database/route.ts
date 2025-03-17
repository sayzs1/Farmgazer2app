import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface Detection {
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

export async function GET(request: Request) {
  try {
    const result = await query<Detection[]>(`
      SELECT TOP 100
        image_id,
        image_url,
        time,
        temperature,
        humidity,
        category_tag,
        AI_analysis,
        priority,
        device_id
      FROM dbo.ImageData
      ORDER BY time DESC
    `);

    return NextResponse.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch database records'
      },
      { status: 500 }
    );
  }
} 