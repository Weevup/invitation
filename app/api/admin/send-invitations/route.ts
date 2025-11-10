import { NextRequest, NextResponse } from 'next/server'
import { sendBulkInvitations } from '@/lib/email/invitations'
import { EmailType } from '@prisma/client'
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions'

/**
 * POST /api/admin/send-invitations
 * Send invitations to guests
 */
export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin()
    const body = await request.json()
    const { eventId, guestIds, emailType = 'INVITE' } = body

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      )
    }

    // Verify admin owns this event before sending invitations
    await requireEventOwnership(eventId, session.user.id)

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
    return handleAuthError(error)
  }
}
