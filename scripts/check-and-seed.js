const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

const prisma = new PrismaClient();

async function checkAndSeed() {
  try {
    console.log('🔍 Vérification de l\'état de la base de données...\n');

    // Vérifier les événements
    const eventCount = await prisma.event.count();
    console.log(`📊 Événements dans la base: ${eventCount}`);

    // Vérifier les invités
    const guestCount = await prisma.guest.count();
    console.log(`👥 Invités dans la base: ${guestCount}`);

    // Vérifier les RSVP
    const rsvpCount = await prisma.rSVP.count();
    console.log(`✅ RSVP dans la base: ${rsvpCount}\n`);

    if (eventCount === 0 || guestCount === 0) {
      console.log('⚠️  La base de données semble vide ou incomplète.\n');
      console.log('💡 Solution: Exécuter le seed pour créer des données de démonstration.\n');
      console.log('Voulez-vous exécuter le seed maintenant?\n');
      console.log('Commande à exécuter:');
      console.log('  npx prisma db seed\n');
      console.log('Cela va créer:');
      console.log('  - 1 événement complet (Tech Summit 2025)');
      console.log('  - 67 invités avec statuts variés');
      console.log('  - Des RSVP (confirmations/refus)');
      console.log('  - Des templates d\'emails');
      console.log('  - Une configuration email\n');
    } else {
      console.log('✨ La base de données contient des données.\n');

      // Afficher un résumé par événement
      const events = await prisma.event.findMany({
        include: {
          _count: {
            select: {
              guests: true,
              rsvps: true
            }
          }
        }
      });

      console.log('📋 Résumé des événements:\n');
      events.forEach((event, index) => {
        console.log(`${index + 1}. ${event.name}`);
        console.log(`   Slug: ${event.slug}`);
        console.log(`   Invités: ${event._count.guests}`);
        console.log(`   RSVP: ${event._count.rsvps}`);
        console.log('');
      });

      if (guestCount === 0) {
        console.log('⚠️  Vous avez des événements mais aucun invité!');
        console.log('💡 Exécutez: npx prisma db seed');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error.message);

    if (error.message.includes('invitationSentAt') || error.message.includes('invitationEmailId')) {
      console.log('\n⚠️  Il semble que la migration n\'a pas été appliquée.');
      console.log('💡 Solution: Exécutez "npx prisma db push" puis réessayez.');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkAndSeed();
