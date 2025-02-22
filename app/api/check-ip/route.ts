import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return NextResponse.json({ ip: data.ip });
  } catch (error) {
    console.error('Error fetching IP:', error);
    return NextResponse.json({ error: 'Failed to fetch IP address' }, { status: 500 });
  }
}