# 📝 Comment ajouter vos invités pour l'événement Weevup

## Méthode 1 : Modifier le fichier CSV (Recommandé)

### 1. Éditez le fichier `guests-template.csv`

Ouvrez le fichier avec Excel, Numbers, ou Google Sheets et remplissez vos invités :

| firstName | lastName | email | company | tags |
|-----------|----------|-------|---------|------|
| Sophie | Martin | sophie@example.com | TechCorp | VIP,Client |
| Jean | Dupont | jean@example.com | StartupLab | Partenaire |

**Format des colonnes :**
- `firstName` : Prénom
- `lastName` : Nom
- `email` : Email (unique, obligatoire)
- `company` : Entreprise (optionnel)
- `tags` : Tags séparés par des virgules (VIP, Client, Partenaire, Presse, Staff, etc.)

### 2. Créez un script pour importer le CSV

Créez le fichier `prisma/seed-from-csv.ts` :

```typescript
import { PrismaClient } from '@prisma/client'
import { hashToken, generateGuestToken } from '../lib/auth'
import { parse } from 'csv-parse/sync'
import fs from 'fs'

const prisma = new PrismaClient()

interface GuestRow {
  firstName: string
  lastName: string
  email: string
  company?: string
  tags: string
}

async function main() {
  // Lire le CSV
  const csvContent = fs.readFileSync('guests-template.csv', 'utf-8')
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  }) as GuestRow[]

  // Récupérer l'événement Weevup
  const event = await prisma.event.findUnique({
    where: { slug: 'weevup-10-ans' },
  })

  if (!event) {
    throw new Error('Event "weevup-10-ans" not found. Run npm run db:seed:weevup first.')
  }

  console.log(`📧 Importing ${records.length} guests for "${event.name}"...`)
  console.log('')

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  for (const record of records) {
    const token = generateGuestToken()
    const tokenHash = hashToken(token)

    // Convertir les tags en tableau
    const tags = record.tags
      ? record.tags.split(',').map(t => t.trim()).filter(Boolean)
      : []

    try {
      const guest = await prisma.guest.upsert({
        where: {
          eventId_email: {
            eventId: event.id,
            email: record.email.trim(),
          },
        },
        update: {
          firstName: record.firstName.trim(),
          lastName: record.lastName.trim(),
          company: record.company?.trim() || null,
          tags,
        },
        create: {
          eventId: event.id,
          firstName: record.firstName.trim(),
          lastName: record.lastName.trim(),
          email: record.email.trim(),
          company: record.company?.trim() || null,
          tags,
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
      console.log(`  Tags: ${guest.tags.join(', ') || 'None'}`)
      console.log(`  🔗 ${invitationUrl}`)
      console.log('')
    } catch (error) {
      console.error(`✗ Error importing ${record.email}:`, error)
    }
  }

  console.log('✅ Import completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

### 3. Ajoutez la commande dans `package.json`

```json
"db:import:csv": "tsx prisma/seed-from-csv.ts"
```

### 4. Lancez l'import

```bash
npm run db:import:csv
```

Les liens d'invitation seront affichés dans la console - **copiez-les !**

---

## Méthode 2 : Modifier directement le seed TypeScript

Éditez `prisma/seed-weevup.ts` et remplacez le tableau `demoGuests` :

```typescript
const demoGuests = [
  {
    firstName: 'Votre',
    lastName: 'Invité',
    email: 'invite@example.com',
    company: 'Leur Entreprise',
    tags: ['VIP', 'Client']
  },
  // Ajoutez tous vos invités ici...
]
```

Puis relancez :
```bash
npm run db:seed:weevup
```

---

## Tags recommandés

Utilisez des tags pour catégoriser vos invités :

- **VIP** : Invités importants
- **Client** : Clients de Weevup
- **Partenaire** : Partenaires commerciaux
- **Presse** : Journalistes et médias
- **Staff** : Équipe Weevup
- **Fournisseur** : Fournisseurs et prestataires
- **Investisseur** : Investisseurs
- **Ami** : Amis et famille

Vous pouvez créer vos propres tags selon vos besoins !

---

## 📊 Visualiser vos invités

Une fois importés, vous pouvez :

1. **Via le dashboard admin**
   - http://localhost:3000/admin
   - Cliquez sur l'événement
   - Voir tous les invités avec leurs statuts

2. **Via Prisma Studio**
   ```bash
   npm run db:studio
   ```
   - http://localhost:5555
   - Table "Guest" pour voir tous les détails

---

## 🔗 Récupérer les liens d'invitation

Si vous avez perdu les liens affichés lors de l'import, deux solutions :

### Solution 1 : Via le dashboard admin
- Allez sur http://localhost:3000/admin
- Cliquez sur l'événement
- Cliquez sur l'icône 🔗 à côté de chaque invité
- Le lien est copié dans le presse-papier

### Solution 2 : Script pour régénérer l'affichage

Créez `prisma/show-links.ts` :

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const event = await prisma.event.findUnique({
    where: { slug: 'weevup-10-ans' },
    include: { guests: true },
  })

  if (!event) {
    console.error('Event not found')
    return
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  console.log(`\n📧 Invitation links for "${event.name}":\n`)

  for (const guest of event.guests) {
    const url = `${baseUrl}/guest/${guest.token}`
    console.log(`${guest.firstName} ${guest.lastName} (${guest.email})`)
    console.log(`🔗 ${url}\n`)
  }
}

main()
  .finally(() => prisma.$disconnect())
```

Lancez avec : `tsx prisma/show-links.ts`

---

## 💡 Conseils

1. **Vérifiez les emails** : Assurez-vous que tous les emails sont valides et uniques
2. **Utilisez les tags** : Ils vous aideront à filtrer et analyser vos invités
3. **Testez d'abord** : Ajoutez 2-3 invités test avant d'importer toute votre liste
4. **Sauvegardez les liens** : Copiez tous les liens d'invitation dans un document
5. **Base de données propre** : Si vous voulez recommencer, supprimez les guests via Prisma Studio

---

## ❓ Questions fréquentes

**Q : Puis-je ajouter des invités en plusieurs fois ?**
R : Oui ! L'upsert évite les doublons basés sur l'email.

**Q : Comment modifier un invité déjà créé ?**
R : Réimportez le CSV avec les nouvelles infos, ou utilisez Prisma Studio.

**Q : Comment supprimer un invité ?**
R : Utilisez Prisma Studio (npm run db:studio) et supprimez-le manuellement.

**Q : L'email change-t-il si je réimporte ?**
R : Non, l'email est la clé unique. Pour changer l'email, supprimez et recréez.

---

Besoin d'aide ? Consultez le `WEEVUP-QUICKSTART.md` ou le `README.md` principal !
