import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { VALID_CATEGORIES, CategoryTag } from "@/lib/constants";

// 验证分类标签是否有效
function isValidCategory(category: string): category is CategoryTag {
  return VALID_CATEGORIES.includes(category as CategoryTag);
}

interface ImageRecord {
  image_id: string;
  category_tag: string;
  time: string;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { category } = body;

    // 验证请求体中的分类标签
    if (!category || !isValidCategory(category)) {
      return NextResponse.json(
        { 
          status: 'error', 
          message: '无效的分类标签' 
        },
        { status: 400 }
      );
    }

    // 将整个字符串转为首字母大写格式
    const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    // 更新数据库中的分类标签
    await query(`
      UPDATE dbo.ImageData
      SET category_tag = @param1
      WHERE image_id = @param0
    `, [params.id, capitalizedCategory]);

    // 返回更新后的数据
    const result = await query<ImageRecord[]>(`
      SELECT 
        image_id,
        category_tag,
        time
      FROM dbo.ImageData
      WHERE image_id = @param0
    `, [params.id]);

    if (result.length === 0) {
      return NextResponse.json(
        { status: 'error', message: '未找到相关记录' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: 'success',
      data: {
        id: result[0].image_id,
        category: result[0].category_tag.toLowerCase(),
        timestamp: result[0].time
      }
    });

  } catch (error) {
    console.error('Failed to update category:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: '更新分类失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  }
} 