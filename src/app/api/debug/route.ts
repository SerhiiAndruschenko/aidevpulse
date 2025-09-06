import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/lib/database';

export async function GET(request: NextRequest) {
  const debugInfo: any = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercel: process.env.VERCEL ? 'true' : 'false',
    region: process.env.VERCEL_REGION || 'unknown'
  };

  // Check environment variables
  debugInfo.env_vars = {
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'SET' : 'NOT SET',
    CRON_SECRET: process.env.CRON_SECRET ? 'SET' : 'NOT SET',
    SITE_URL: process.env.SITE_URL || 'NOT SET'
  };

  // Test database connection
  try {
    const result = await Database.query('SELECT NOW() as current_time, version() as db_version');
    debugInfo.database = {
      status: 'CONNECTED',
      current_time: result.rows[0].current_time,
      version: result.rows[0].db_version
    };
  } catch (error) {
    debugInfo.database = {
      status: 'ERROR',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Check sources
  try {
    const sources = await Database.query('SELECT COUNT(*) as total, COUNT(CASE WHEN active = true THEN 1 END) as active FROM sources');
    debugInfo.sources = {
      total: sources.rows[0].total,
      active: sources.rows[0].active
    };
  } catch (error) {
    debugInfo.sources = {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Check recent data
  try {
    const recentItems = await Database.query(`
      SELECT COUNT(*) as count, MAX(created_at) as latest 
      FROM items_raw 
      WHERE created_at > NOW() - INTERVAL '7 days'
    `);
    debugInfo.recent_data = {
      items_last_7_days: recentItems.rows[0].count,
      latest_item: recentItems.rows[0].latest
    };
  } catch (error) {
    debugInfo.recent_data = {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Check articles
  try {
    const articles = await Database.query(`
      SELECT COUNT(*) as count, MAX(published_at) as latest 
      FROM articles 
      WHERE published_at > NOW() - INTERVAL '7 days'
    `);
    debugInfo.articles = {
      articles_last_7_days: articles.rows[0].count,
      latest_article: articles.rows[0].latest
    };
  } catch (error) {
    debugInfo.articles = {
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }

  // Test AI service
  if (process.env.GEMINI_API_KEY) {
    try {
      const { GoogleGenerativeAI } = await import('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const result = await model.generateContent('Test connection - respond with "OK"');
      const response = await result.response;
      debugInfo.ai_service = {
        status: 'CONNECTED',
        response: response.text().substring(0, 100)
      };
    } catch (error) {
      debugInfo.ai_service = {
        status: 'ERROR',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  } else {
    debugInfo.ai_service = {
      status: 'NO_API_KEY'
    };
  }

  return NextResponse.json(debugInfo, { status: 200 });
}

export async function POST(request: NextRequest) {
  // Test manual article generation
  try {
    console.log('Manual article generation test started...');
    
    const { ArticleGenerator } = await import('@/lib/article-generator');
    const article = await ArticleGenerator.generateDailyArticle();
    
    if (article) {
      return NextResponse.json({
        success: true,
        message: 'Article generated successfully',
        article: {
          id: article.id,
          title: article.title,
          slug: article.slug,
          published_at: article.published_at
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'No article generated - check logs for details'
      });
    }
  } catch (error) {
    console.error('Manual article generation failed:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
