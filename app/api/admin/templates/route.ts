import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET all templates
export async function GET() {
  try {
    const templates = await prisma.emailTemplate.findMany({
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    // Serialize dates to strings to avoid client-side errors
    const serializedTemplates = templates.map(template => ({
      ...template,
      createdAt: template.createdAt.toISOString(),
      updatedAt: template.updatedAt.toISOString(),
      lastUsedAt: template.lastUsedAt?.toISOString() || null
    }))

    return NextResponse.json(serializedTemplates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const template = await prisma.emailTemplate.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        type: body.type,
        subject: body.subject,
        htmlContent: body.htmlContent,
        textContent: body.textContent,
        primaryColor: body.primaryColor || '#004645',
        secondaryColor: body.secondaryColor || '#009197',
        accentColor: body.accentColor || '#FF4713',
        fontFamily: body.fontFamily || 'Arial, sans-serif',
        isActive: body.isActive !== undefined ? body.isActive : true
      }
    })

    return NextResponse.json(template, { status: 201 })
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    )
  }
}
