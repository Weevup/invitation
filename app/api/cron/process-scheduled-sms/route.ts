import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'
import { processPendingSMS } from '@/lib/sms-scheduling-service'

/**
 * Cron job to process pending scheduled SMS
 * This endpoint should be called by a cron service (Vercel Cron, etc.)
 * every 5-10 minutes
 *
 * Security: Use CRON_SECRET env variable to protect this endpoint
 */
export async function GET(req: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      logger.warn('Unauthorized cron request')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    logger.info('Starting scheduled SMS processing cron job')

    const processed = await processPendingSMS()

    logger.info(
      { processed },
      'Scheduled SMS processing cron job completed'
    )

    return NextResponse.json({
      success: true,
      processed,
      message: `Processed ${processed} scheduled SMS`,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error in scheduled SMS processing cron job'
    )

    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to process scheduled SMS',
      },
      { status: 500 }
    )
  }
}

// Also support POST for compatibility
export async function POST(req: NextRequest) {
  return GET(req)
}
