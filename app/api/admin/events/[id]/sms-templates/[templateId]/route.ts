import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/auth-utils'
import { logger } from '@/lib/logger'
import {
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} from '@/lib/sms-template-service'

// GET /api/admin/events/[id]/sms-templates/[templateId] - Get template details
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    await requireAdmin()
    const { templateId } = await params

    const template = await getTemplateById(templateId)

    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      template,
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error fetching SMS template'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to fetch template',
      },
      { status: 500 }
    )
  }
}

// PUT /api/admin/events/[id]/sms-templates/[templateId] - Update template
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    await requireAdmin()
    const { templateId } = await params
    const body = await req.json()

    const template = await updateTemplate(templateId, {
      name: body.name,
      description: body.description,
      category: body.category,
      message: body.message,
      isActive: body.isActive,
      isDefault: body.isDefault,
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
      'Error updating SMS template'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to update template',
      },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/events/[id]/sms-templates/[templateId] - Delete template
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; templateId: string }> }
) {
  try {
    await requireAdmin()
    const { templateId } = await params

    await deleteTemplate(templateId)

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    })
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      'Error deleting SMS template'
    )

    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Failed to delete template',
      },
      { status: 500 }
    )
  }
}
