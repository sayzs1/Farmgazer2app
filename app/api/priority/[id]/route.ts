import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

interface PriorityRecord {
  priority: number;
}

// 获取指定image_id的优先级
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = params.id;
    
    const result = await query<PriorityRecord[]>(
      `SELECT priority FROM dbo.ImageData WHERE image_id = '${imageId}'`
    );

    if (!result || result.length === 0) {
      return NextResponse.json(
        {
          status: 'error',
          message: '未找到指定图像'
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: { priority: Number(result[0].priority) || 0 }
    });

  } catch (error) {
    console.error('获取优先级出错:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: '获取优先级失败'
      },
      { status: 500 }
    );
  }
}

// 更新指定image_id的优先级
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const imageId = params.id;
    const { priority } = await request.json();
    
    // 验证优先级值是否有效
    if (![0, 1, 2].includes(priority)) {
      return NextResponse.json(
        {
          status: 'error',
          message: '无效的优先级值。优先级必须是0、1或2'
        },
        { status: 400 }
      );
    }

    // 更新数据库中的优先级
    await query(
      `UPDATE dbo.ImageData SET priority = ${priority} WHERE image_id = '${imageId}'`
    );

    return NextResponse.json({
      status: 'success',
      message: '优先级已更新',
      data: { priority }
    });

  } catch (error) {
    console.error('更新优先级出错:', error);
    return NextResponse.json(
      {
        status: 'error',
        message: '更新优先级失败'
      },
      { status: 500 }
    );
  }
} 