import { PrismaClient } from '@prisma/client'
import { hashToken, generateGuestToken } from '../lib/auth'

const prisma = new PrismaClient()

async function main() {
  console.log('🎉 Creating Weevup 10th Anniversary Event...')

  // Create admin user for Weevup
  const admin = await prisma.user.upsert({
    where: { email: 'contact@weevup.com' },
    update: {},
    create: {
      email: 'contact@weevup.com',
      role: 'ADMIN',
    },
  })

  console.log('✓ Weevup admin user created:', admin.email)

  // Create Weevup 10th Anniversary event
  const event = await prisma.event.upsert({
    where: { slug: 'weevup-10-ans' },
    update: {},
    create: {
      name: '10 ans de Weevup',
      slug: 'weevup-10-ans',
      startsAt: new Date('2025-06-20T19:00:00'), // Ajustez la date selon vos besoins
      endsAt: new Date('2025-06-21T01:00:00'),
      venueName: 'Molitor Paris',
      address: '13 Rue Nungesser et Coli',
      city: 'Paris',
      country: 'France',
      coverImage: 'https://images.unsplash.com/photo-1519167758481-83f29da8c43f?w=1200',
      description: `Rejoignez-nous pour célébrer une décennie d'innovation et de succès !

Nous sommes ravis de vous inviter à célébrer les 10 ans de Weevup au prestigieux Molitor Paris. Une soirée exceptionnelle pour remercier nos partenaires, clients et collaborateurs qui ont contribué à notre succès.

🎊 Au programme :
• 19h00 : Accueil & Cocktail au bord de la piscine
• 20h30 : Dîner gastronomique
• 22h00 : Rétrospective des 10 ans de Weevup
• 22h30 : Soirée festive avec DJ
• 00h30 : Clôture

Dress code : Élégant & décontracté
Parking : Valet parking disponible`,
      program: `19h00 - Accueil champagne & cocktail
20h30 - Dîner gastronomique
22h00 - Rétrospective Weevup
22h30 - Soirée DJ
00h30 - Clôture`,
      dressCode: 'Élégant & décontracté',
      rsvpDeadline: new Date('2025-06-10T23:59:59'),
      maxPlusOnes: 1,
      allowPlusOnes: true,
      requireMeal: true,
      mealOptions: [
        'Menu Classique',
        'Menu Végétarien',
        'Menu Végan',
        'Menu Sans gluten',
        'Menu Halal'
      ],
      enableTransport: true,
      enableLodging: false,
      enableAccessibility: true,
      enablePhotoConsent: true,
      adminId: admin.id,
    },
  })

  console.log('✓ Weevup 10th Anniversary event created!')
  console.log(`   Event: ${event.name}`)
  console.log(`   Venue: ${event.venueName}, ${event.city}`)
  console.log(`   Date: ${event.startsAt.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`)
  console.log('')

  // Create demo guests for testing
  console.log('📧 Creating test guests with invitation links...')
  console.log('')

  const demoGuests = [
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@example.com', company: 'TechCorp', tags: ['VIP', 'Client'] },
    { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', company: 'InnovateLab', tags: ['Partenaire'] },
    { firstName: 'Marie', lastName: 'Durand', email: 'marie.durand@example.com', company: 'Digital Solutions', tags: ['VIP', 'Presse'] },
    { firstName: 'Pierre', lastName: 'Leblanc', email: 'pierre.leblanc@example.com', company: 'StartupHub', tags: ['Client'] },
    { firstName: 'Amélie', lastName: 'Rousseau', email: 'amelie.rousseau@example.com', company: 'CloudTech', tags: ['VIP', 'Partenaire'] },
    { firstName: 'Thomas', lastName: 'Bernard', email: 'thomas.bernard@example.com', company: 'Weevup', tags: ['Staff', 'Équipe'] },
    { firstName: 'Julie', lastName: 'Petit', email: 'julie.petit@example.com', company: 'AI Solutions', tags: ['Client'] },
    { firstName: 'Marc', lastName: 'Garcia', email: 'marc.garcia@example.com', company: 'SecureNet', tags: ['VIP', 'Client'] },
    { firstName: 'Laura', lastName: 'Moreau', email: 'laura.moreau@example.com', company: 'GreenTech', tags: ['Partenaire'] },
    { firstName: 'Nicolas', lastName: 'Fontaine', email: 'nicolas.fontaine@example.com', company: 'TechMag', tags: ['Presse'] },
  ]

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  for (const guestData of demoGuests) {
    const token = generateGuestToken()
    const tokenHash = hashToken(token)

    const guest = await prisma.guest.upsert({
      where: { eventId_email: { eventId: event.id, email: guestData.email } },
      update: {},
      create: {
        ...guestData,
        eventId: event.id,
        token,
        tokenHash,
        tokenExpiry: new Date('2025-06-25T23:59:59'),
        status: 'PENDING',
      },
    })

    const invitationUrl = `${baseUrl}/guest/${token}`

    console.log(`✓ ${guest.firstName} ${guest.lastName}`)
    console.log(`  Email: ${guest.email}`)
    console.log(`  Company: ${guest.company || 'N/A'}`)
    console.log(`  Tags: ${guest.tags.join(', ')}`)
    console.log(`  🔗 Invitation URL: ${invitationUrl}`)
    console.log('')
  }

  // Create one example RSVP to show how it looks
  const exampleGuest = await prisma.guest.findFirst({
    where: { email: 'sophie.martin@example.com' },
  })

  if (exampleGuest) {
    await prisma.rSVP.upsert({
      where: { guestId: exampleGuest.id },
      update: {},
      create: {
        eventId: event.id,
        guestId: exampleGuest.id,
        attending: true,
        plusOnes: 1,
        mealChoice: 'Menu Végétarien',
        allergies: 'Aucune',
        consentPhotos: true,
      },
    })

    await prisma.guest.update({
      where: { id: exampleGuest.id },
      data: { status: 'RESPONDED' },
    })

    console.log('✓ Example RSVP created for Sophie Martin (already confirmed)')
    console.log('')
  }

  console.log('═══════════════════════════════════════════════════════════')
  console.log('✅ Weevup 10th Anniversary Event Setup Complete!')
  console.log('═══════════════════════════════════════════════════════════')
  console.log('')
  console.log('🎯 Next steps:')
  console.log('1. Start the dev server: npm run dev')
  console.log('2. Visit admin dashboard: http://localhost:3000/admin')
  console.log('3. Test guest invitations using the URLs above')
  console.log('')
  console.log('💡 Tip: Copy any invitation URL and open it to test the RSVP flow!')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
