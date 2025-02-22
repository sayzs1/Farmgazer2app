import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface HistoryRecord {
  image_id: string;
  image_url: string;
  time: string;
  category_tag: string;
  device_id: string;
}

export async function GET(
  request: Request,
  { params }: { params: { deviceId: string } }
) {
  try {
    const deviceId = params.deviceId;
    
    const result = await query<HistoryRecord[]>(`
      SELECT 
        image_id,
        image_url,
        time,
        category_tag,
        device_id
      FROM dbo.ImageData
      WHERE device_id = @param0
      ORDER BY time DESC
    `, [deviceId]);

    return NextResponse.json({
      status: 'success',
      data: result
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: 'Failed to fetch device history'
      },
      { status: 500 }
    );
  }
} 