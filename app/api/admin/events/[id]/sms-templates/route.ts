import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import {
  getEventTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '@/lib/sms-template-service'

// GET /api/admin/events/[id]/sms-templates - List all templates for event
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id: eventId } = await params

    const templates = await getEventTemplates(eventId)

    return NextResponse.json({
      success: true,
      templates,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching SMS templates'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to fetch templates',
      },
      { status: 500 }
    )
  }
}

// POST /api/admin/events/[id]/sms-templates - Create new template
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin()
    const { id: eventId } = await params
    const body = await req.json()

    // Validate required fields
    if (!body.name || !body.message) {
      return NextResponse.json(
        { error: 'Name and message are required' },
        { status: 400 }
      )
    }

    const template = await createTemplate({
      name: body.name,
      description: body.description,
      category: body.category || 'custom',
      message: body.message,
      eventId: body.isGlobal ? undefined : eventId,
      isDefault: body.isDefault || false,
    })

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error creating SMS template'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to create template',
      },
      { status: 500 }
    )
  }
}
