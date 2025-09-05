import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const tag = searchParams.get('tag');

    const offset = (page - 1) * limit;

    let articles;
    let totalCount;

    if (tag) {
      // Get articles by tag
      articles = await Database.getArticlesByTag(tag, limit, offset);
      totalCount = await Database.getArticlesCountByTag(tag);
    } else {
      // Get all articles
      articles = await Database.getArticles(limit, offset);
      totalCount = await Database.getArticlesCount();
    }

    return NextResponse.json({
      articles,
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      hasNextPage: page < Math.ceil(totalCount / limit),
      hasPrevPage: page > 1
    });

  } catch (error) {
    console.error('Failed to fetch articles:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
