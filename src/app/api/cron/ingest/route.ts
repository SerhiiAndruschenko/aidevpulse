import { NextRequest, NextResponse } from 'next/server';
import IngestService from '@/lib/ingest';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has proper authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting cron job: ingest');
    
    // Run daily ingest
    const ingestedCount = await IngestService.runDailyIngest();
    
    console.log(`Ingested ${ingestedCount} new items`);
    return NextResponse.json({
      success: true,
      ingested_count: ingestedCount
    });

  } catch (error) {
    console.error('Ingest cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Ingest cron endpoint',
    usage: 'POST to trigger data ingestion'
  });
}
