import { NextRequest, NextResponse } from 'next/server';
import QualityControlService from '@/lib/quality-control';

export async function POST(request: NextRequest) {
  try {
    // Verify the request is from Vercel Cron or has proper authorization
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting cron job: quality-check');
    
    // Run daily quality checks
    await QualityControlService.runDailyQualityChecks();
    
    console.log('Quality checks completed');
    return NextResponse.json({
      success: true,
      message: 'Quality checks completed successfully'
    });

  } catch (error) {
    console.error('Quality check cron job failed:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// Allow GET for testing
export async function GET() {
  return NextResponse.json({
    message: 'Quality check cron endpoint',
    usage: 'POST to trigger quality checks'
  });
}
