import { NextRequest, NextResponse } from 'next/server'
import { sendBulkInvitations } from '@/lib/email/invitations'
import { EmailType } from '@prisma/client'

/**
 * POST /api/admin/send-invitations
 * Send invitations to guests
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, guestIds, emailType = 'INVITE' } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Validate email type
    const validTypes: EmailType[] = ['INVITE', 'INVITATION', 'SAVE_THE_DATE', 'REMINDER', 'CONFIRMATION', 'INFO', 'CUSTOM']
    if (!validTypes.includes(emailType)) {
      return NextResponse.json(
        { error: `Invalid email type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      )
    }

    const result = await sendBulkInvitations(
      eventId,
      guestIds,
      emailType
    )

    if (!result.success && result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ...result,
      message: `Sent ${result.sent}/${result.total} invitations`
    })
  } catch (error) {
    console.error('Error in send-invitations API:', error)
    return NextResponse.json(
      {
        error: 'Failed to send invitations',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
