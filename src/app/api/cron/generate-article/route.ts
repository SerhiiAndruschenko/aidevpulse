import { NextRequest, NextResponse } from 'next/server';
import ArticleGenerator from '@/lib/article-generator';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has proper authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting cron job: generate-article');
    
    // Generate daily article
    const article = await ArticleGenerator.generateDailyArticle();
    
    if (article) {
      console.log(`Successfully generated article: ${article.slug}`);
      return NextResponse.json({
        success: true,
        article: {
          id: article.slug,
          title: article.title,
          slug: article.slug,
          published_at: article.published_at
        }
      });
    } else {
      console.log('No article generated today');
      return NextResponse.json({
        success: false,
        message: 'No suitable content found for article generation'
      });
    }

  } catch (error) {
    console.error('Cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Article generation cron endpoint',
    usage: 'POST to trigger article generation'
  });
}
