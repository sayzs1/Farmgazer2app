import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface CountResult {
  count: number;
}

export async function GET() {
  try {
    // 测试简单的查询，使用 dbo.ImageData 表
    const result = await query<CountResult>('SELECT COUNT(*) as count FROM dbo.ImageData');
    
    if (!result || !Array.isArray(result) || result.length === 0) {
      throw new Error('Invalid database response');
    }

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