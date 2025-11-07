import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const events = await prisma.event.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            guests: true,
            rsvps: true,
          },
        },
      },
    })

    return NextResponse.json(events)
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate slug from name
    const slug = body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now()

    // Create a dummy admin user if none exists
    let adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
    if (!adminUser) {
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@weevup.com',
          role: 'ADMIN',
        },
      })
    }

    const event = await prisma.event.create({
      data: {
        name: body.name,
        slug: slug,
        description: body.description,
        startsAt: new Date(body.date),
        venueName: body.location || body.venueName,
        address: body.address,
        city: body.city,
        adminId: adminUser.id,
      },
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)

    // Return detailed error message
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      {
        error: 'Erreur lors de la création de l\'événement',
        details: errorMessage
      },
      { status: 500 }
    )
  }
}
