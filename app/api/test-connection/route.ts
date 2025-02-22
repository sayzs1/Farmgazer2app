import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    await query('SELECT 1 as test');
    return NextResponse.json({ status: 'success', message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection test failed:', error);
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