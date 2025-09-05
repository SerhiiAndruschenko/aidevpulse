import { NextRequest, NextResponse } from 'next/server';
import IngestService from '@/lib/ingest';
import ArticleGenerator from '@/lib/article-generator';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has proper authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting cron job: content-pipeline');
    
    // Step 1: Run daily ingest
    console.log('Step 1: Ingesting new data...');
    const ingestedCount = await IngestService.runDailyIngest();
    console.log(`Ingested ${ingestedCount} new items`);
    
    // Step 2: Generate daily article
    console.log('Step 2: Generating article...');
    const article = await ArticleGenerator.generateDailyArticle();
    
    if (article) {
      console.log(`Successfully generated article: ${article.slug}`);
      return NextResponse.json({
        success: true,
        message: 'Content pipeline completed successfully',
        results: {
          ingested_count: ingestedCount,
          article: {
            id: article.slug,
            title: article.title,
            slug: article.slug,
            published_at: article.published_at
          }
        }
      });
    } else {
      console.log('No article generated today');
      return NextResponse.json({
        success: true,
        message: 'Content pipeline completed - no article generated',
        results: {
          ingested_count: ingestedCount,
          article: null
        }
      });
    }

  } catch (error) {
    console.error('Content pipeline cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Content pipeline cron endpoint',
    usage: 'POST to trigger content pipeline (ingest + generate article)',
    steps: [
      '1. Ingest new data from sources',
      '2. Generate daily article from ingested data'
    ]
  });
}
