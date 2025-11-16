import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { BadgeManagementPage } from './badge-management-page'
import { getDefaultBadgeTemplates } from '@/lib/badge-generator'

export default async function EventBadgesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const session = await auth()
  const { id: eventId } = await params

  if (!session?.user) {
    redirect('/auth/admin')
  }

  // Fetch event
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
      adminId: session.user.id,
    },
    select: {
      id: true,
      name: true,
      slug: true,
    },
  })

  if (!event) {
    redirect('/admin/events')
  }

  // Fetch or create badge design
  let badgeDesign = await prisma.badgeDesign.findUnique({
    where: { eventId },
    include: {
      template: true,
    },
  })

  // Auto-create default badge design if none exists
  if (!badgeDesign) {
    const defaultTemplates = getDefaultBadgeTemplates()
    const defaultTemplate = defaultTemplates.find((t) => t.isDefault) || defaultTemplates[0]

    badgeDesign = await prisma.badgeDesign.create({
      data: {
        eventId,
        name: defaultTemplate.name,
        size: defaultTemplate.size,
        orientation: defaultTemplate.orientation,
        layout: defaultTemplate.layout as any,
        fields: defaultTemplate.fields as any,
        fontFamily: defaultTemplate.fontFamily || 'Inter',
        includeQRCode: true,
        qrCodeSize: 80,
        badgesPerPage: 10,
        pageMargin: 10,
        badgeSpacing: 5,
      },
      include: {
        template: true,
      },
    })
  }

  // Fetch guests with RSVP for badge generation
  const guests = await prisma.guest.findMany({
    where: {
      eventId,
      rsvp: {
        isNot: null,
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      company: true,
      jobTitle: true,
      status: true,
      photoUrl: true,
      badge: {
        select: {
          id: true,
          isReady: true,
        },
      },
    },
    orderBy: [
      { lastName: 'asc' },
      { firstName: 'asc' },
    ],
  })

  // Fetch existing badges
  let badges: any[] = []
  let badgeStats = {
    total: 0,
    ready: 0,
    issued: 0,
    printed: 0,
  }

  if (badgeDesign) {
    badges = await prisma.badge.findMany({
      where: { badgeDesignId: badgeDesign.id },
      include: {
        guest: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            company: true,
            jobTitle: true,
            status: true,
          },
        },
      },
      orderBy: [
        { guest: { lastName: 'asc' } },
        { guest: { firstName: 'asc' } },
      ],
    })

    badgeStats = {
      total: badges.length,
      ready: badges.filter((b) => b.isReady).length,
      issued: badges.filter((b) => b.isIssued).length,
      printed: badges.filter((b) => b.printedCount > 0).length,
    }
  }

  return (
    <BadgeManagementPage
      event={event}
      badgeDesign={badgeDesign}
      guests={guests}
      badges={badges}
      badgeStats={badgeStats}
    />
  )
}
