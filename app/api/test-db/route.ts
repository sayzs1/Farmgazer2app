import { NextResponse } from 'next/server';
import { query } from '../../../lib/db';

export async function GET() {
  try {
    // 测试简单的查询，使用 dbo.ImageData 表
    const result = await query<{ count: number }[]>('SELECT COUNT(*) as count FROM dbo.ImageData');
    
    return NextResponse.json({ 
      status: 'success', 
      count: result[0].count,
      message: 'Database connection successful' 
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: 'Database connection failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 