import { PrismaClient } from '@prisma/client'
import { hashToken, generateGuestToken } from '../lib/auth'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create admin user
  const defaultPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@invitation-manager.com' },
    update: {},
    create: {
      email: 'admin@invitation-manager.com',
      password: defaultPassword,
      name: 'Admin',
      role: 'ADMIN',
    },
  })

  console.log('✓ Admin user created:', admin.email)

  // Create demo event
  const event = await prisma.event.upsert({
    where: { slug: 'soiree-partenaires-2026' },
    update: {},
    create: {
      name: 'Soirée Partenaires 2026',
      slug: 'soiree-partenaires-2026',
      startsAt: new Date('2026-03-12T19:00:00'),
      endsAt: new Date('2026-03-12T23:00:00'),
      venueName: 'Pavillon Gabriel',
      address: '5 Avenue Gabriel',
      city: 'Paris',
      country: 'France',
      description: `Nous avons le plaisir de vous inviter à notre soirée annuelle des partenaires.

Une soirée exceptionnelle pour célébrer nos succès communs et échanger dans un cadre prestigieux.

Au programme :
- 19h00 : Accueil et cocktail
- 20h00 : Dîner de gala
- 21h30 : Présentation des nouveaux projets
- 22h00 : Soirée dansante`,
      program: 'Programme détaillé à venir',
      dressCode: 'Tenue de soirée',
      rsvpDeadline: new Date('2026-03-01T23:59:59'),
      maxPlusOnes: 1,
      allowPlusOnes: true,
      requireMeal: true,
      mealOptions: ['Normal', 'Végétarien', 'Végan', 'Sans gluten', 'Halal'],
      enableTransport: true,
      enableLodging: true,
      enableAccessibility: true,
      enablePhotoConsent: true,
      adminId: admin.id,
    },
  })

  console.log('✓ Demo event created:', event.name)

  // Create demo guests
  const demoGuests = [
    { firstName: 'Sophie', lastName: 'Martin', email: 'sophie.martin@example.com', company: 'TechCorp', tags: ['VIP'] },
    { firstName: 'Jean', lastName: 'Dupont', email: 'jean.dupont@example.com', company: 'InnovateLab', tags: ['Partner'] },
    { firstName: 'Marie', lastName: 'Durand', email: 'marie.durand@example.com', company: 'Digital Solutions', tags: ['VIP', 'Press'] },
    { firstName: 'Pierre', lastName: 'Leblanc', email: 'pierre.leblanc@example.com', company: 'StartupHub', tags: ['Partner'] },
    { firstName: 'Amélie', lastName: 'Rousseau', email: 'amelie.rousseau@example.com', company: 'CloudTech', tags: ['VIP'] },
    { firstName: 'Thomas', lastName: 'Bernard', email: 'thomas.bernard@example.com', company: 'DataFlow', tags: ['Staff'] },
    { firstName: 'Julie', lastName: 'Petit', email: 'julie.petit@example.com', company: 'AI Solutions', tags: ['Partner'] },
    { firstName: 'Marc', lastName: 'Garcia', email: 'marc.garcia@example.com', company: 'SecureNet', tags: ['VIP'] },
    { firstName: 'Laura', lastName: 'Moreau', email: 'laura.moreau@example.com', company: 'GreenTech', tags: ['Partner'] },
    { firstName: 'Nicolas', lastName: 'Fontaine', email: 'nicolas.fontaine@example.com', company: 'FutureLab', tags: ['Press'] },
  ]

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
        tokenExpiry: new Date('2026-03-15T23:59:59'),
        status: 'PENDING',
      },
    })

    console.log('✓ Guest created:', guest.email, '(token:', token, ')')
  }

  // Create one RSVP example
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
        mealChoice: 'Végétarien',
        allergies: 'Aucune',
        consentPhotos: true,
      },
    })

    await prisma.guest.update({
      where: { id: exampleGuest.id },
      data: { status: 'RESPONDED' },
    })

    console.log('✓ Example RSVP created for:', exampleGuest.email)
  }

  console.log('✅ Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
