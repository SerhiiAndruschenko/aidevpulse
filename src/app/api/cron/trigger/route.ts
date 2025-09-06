import { NextRequest, NextResponse } from 'next/server';
import IngestService from '@/lib/ingest';
import ArticleGenerator from '@/lib/article-generator';

export async function GET(request: NextRequest) {
  // This endpoint is specifically for Vercel cron jobs
  // It will trigger the content pipeline
  try {
    console.log('🚀 Cron trigger: Starting content pipeline...');
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Vercel region:', process.env.VERCEL_REGION);
    
    // Check environment variables
    console.log('Environment check:');
    console.log('- DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('- GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET');
    
    // Step 1: Run daily ingest
    console.log('📥 Step 1: Ingesting new data...');
    const ingestedCount = await IngestService.runDailyIngest();
    console.log(`✅ Ingested ${ingestedCount} new items`);
    
    // Step 2: Generate multiple articles (3 by default)
    console.log('🤖 Step 2: Generating multiple articles...');
    const articles = await ArticleGenerator.generateMultipleArticles(3);
    
    if (articles.length > 0) {
      console.log(`✅ Successfully generated ${articles.length} articles`);
      return NextResponse.json({
        success: true,
        message: `Content pipeline completed successfully - generated ${articles.length} articles`,
        results: {
          ingested_count: ingestedCount,
          articles_generated: articles.length,
          articles: articles.map(article => ({
            id: article.slug,
            title: article.title,
            slug: article.slug,
            published_at: article.published_at,
            review_status: article.review_status
          }))
        }
      });
    } else {
      console.log('⚠️ No articles generated today - check logs above for details');
      return NextResponse.json({
        success: true,
        message: 'Content pipeline completed - no articles generated',
        results: {
          ingested_count: ingestedCount,
          articles_generated: 0,
          articles: []
        }
      });
    }

  } catch (error) {
    console.error('❌ Content pipeline cron job failed:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

// Also support POST for manual testing
export async function POST(request: NextRequest) {
  return GET(request);
}
