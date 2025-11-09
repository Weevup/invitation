import { prisma } from '../lib/prisma'

async function testEventsAPI() {
  try {
    console.log('🔍 Checking events in database...\n')

    const events = await prisma.event.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            guests: true
          }
        }
      },
      take: 10
    })

    if (events.length === 0) {
      console.log('❌ No events found in database')
      return
    }

    console.log(`✅ Found ${events.length} events:\n`)
    events.forEach((event, index) => {
      console.log(`${index + 1}. ${event.name}`)
      console.log(`   ID: ${event.id}`)
      console.log(`   Slug: ${event.slug}`)
      console.log(`   Guests: ${event._count.guests}`)
      console.log('')
    })

    // Test fetching first event with full details
    if (events.length > 0) {
      const firstEventId = events[0].id
      console.log(`\n🔬 Testing full fetch for event: ${events[0].name}`)

      const fullEvent = await prisma.event.findUnique({
        where: { id: firstEventId },
        include: {
          guests: {
            include: {
              rsvp: true,
            },
            orderBy: {
              lastName: 'asc',
            },
          },
        },
      })

      if (fullEvent) {
        console.log(`✅ Full event fetch successful`)
        console.log(`   Guests loaded: ${fullEvent.guests.length}`)
        console.log(`   Has showcase: ${fullEvent.showcaseEnabled}`)
      } else {
        console.log(`❌ Could not fetch full event details`)
      }
    }

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testEventsAPI()
