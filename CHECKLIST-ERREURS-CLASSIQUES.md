# ✅ Checklist des Erreurs Classiques à Éviter

**Date** : 11 novembre 2025
**Projet** : Invitation Manager
**Contexte** : Next.js 15 + React 19 + TypeScript + Prisma

---

## 🔴 **ERREURS CRITIQUES (Build Killer)**

### 1. **Imports React incorrects**

❌ **MAUVAIS** :
```typescript
import { useEffect, useState } from 'use'  // Typo !
```

✅ **CORRECT** :
```typescript
import { useEffect, useState } from 'react'
```

**Vérification** :
```bash
grep -r "from 'use'" app/
```

---

### 2. **Manque de 'use client' dans les composants**

❌ **MAUVAIS** :
```typescript
// app/admin/page.tsx
import { useState } from 'react'

export default function Page() {
  const [count, setCount] = useState(0)  // ❌ Erreur si pas de 'use client'
}
```

✅ **CORRECT** :
```typescript
'use client'  // ← OBLIGATOIRE pour useState, useEffect, etc.

import { useState } from 'react'

export default function Page() {
  const [count, setCount] = useState(0)  // ✅ OK
}
```

**Règle** : Tous les composants utilisant des hooks React doivent avoir `'use client'` en première ligne.

---

### 3. **Paramètres de route dynamique (Next.js 15)**

❌ **MAUVAIS** (Next.js 14 style) :
```typescript
// app/api/admin/events/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }  // ❌ Erreur dans Next.js 15 !
) {
  const eventId = params.id
}
```

✅ **CORRECT** (Next.js 15 async params) :
```typescript
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← Promise obligatoire !
) {
  const { id: eventId } = await params  // ← await obligatoire !
  // Utiliser eventId...
}
```

**Erreur typique** :
```
Type error: Route has an invalid "GET" export:
  Type "{ params: { id: string; }; }" is not a valid type for the function's second argument.
```

**Règle Next.js 15** : Tous les `params` doivent être `Promise<{ ... }>` et awaités.

---

### 4. **NextResponse.json() mal utilisé**

❌ **MAUVAIS** :
```typescript
return { error: 'Not found' }  // ❌ Pas de Response !
```

✅ **CORRECT** :
```typescript
return NextResponse.json(
  { error: 'Not found' },
  { status: 404 }
)
```

---

## 🟡 **ERREURS TYPESCRIPT (Type Safety)**

### 5. **Type 'any' non justifié**

❌ **MAUVAIS** :
```typescript
const data: any = await request.json()  // ❌ Perte de type safety
```

✅ **CORRECT** :
```typescript
const body = await request.json()
const validatedData = createSessionSchema.parse(body)  // ✅ Validation Zod
```

---

### 6. **Prisma JSON mal typé**

❌ **MAUVAIS** :
```typescript
speakers: validatedData.speakers  // ❌ Type error
```

✅ **CORRECT** :
```typescript
speakers: validatedData.speakers as any  // ✅ Cast explicite pour JSON
// OU avec type assertion :
speakers: validatedData.speakers as Prisma.JsonValue
```

---

### 7. **Date string non transformée**

❌ **MAUVAIS** :
```typescript
const schema = z.object({
  startTime: z.string()  // ❌ Reste string
})
```

✅ **CORRECT** :
```typescript
const schema = z.object({
  startTime: z.string().transform((str) => new Date(str))  // ✅ Devient Date
})
```

---

## 🟢 **BONNES PRATIQUES (Code Quality)**

### 8. **Validation Zod systématique**

✅ **TOUJOURS valider les inputs utilisateur** :
```typescript
const createSessionSchema = z.object({
  title: z.string().min(1, 'Le titre est requis'),
  type: z.enum(['KEYNOTE', 'WORKSHOP', ...]),
  startTime: z.string().transform((str) => new Date(str)),
})

try {
  const validatedData = createSessionSchema.parse(body)
  // Utiliser validatedData (typé et validé)
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Données invalides', details: error.errors },
      { status: 400 }
    )
  }
}
```

---

### 9. **Gestion d'erreurs complète**

✅ **Pattern recommandé** :
```typescript
try {
  // Code métier
  const result = await prisma.session.create({ ... })
  return NextResponse.json({ result, message: 'Succès' }, { status: 201 })
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json(
      { error: 'Données invalides', details: error.errors },
      { status: 400 }
    )
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Conflit : enregistrement déjà existant' },
        { status: 409 }
      )
    }
  }

  console.error('Error:', error)
  return NextResponse.json(
    { error: 'Erreur interne du serveur' },
    { status: 500 }
  )
}
```

---

### 10. **Index Prisma pour performance**

✅ **Toujours ajouter des index sur** :
- Relations (clés étrangères)
- Champs filtrés (WHERE, ORDER BY)
- Champs de recherche

```prisma
model Session {
  id        String   @id
  eventId   String
  startTime DateTime
  type      SessionType

  @@index([eventId, startTime])  // ✅ Queries optimisées
  @@index([type])
  @@index([status])
}
```

---

### 11. **Unique constraints appropriées**

✅ **Empêcher les doublons** :
```prisma
model SessionParticipant {
  id        String @id
  sessionId String
  guestId   String

  @@unique([sessionId, guestId])  // ✅ Un invité ne peut s'inscrire 2x
}
```

---

## 🔍 **COMMANDES DE VÉRIFICATION**

### Avant chaque commit :

```bash
# 1. Vérifier les imports React
grep -r "from 'use'" app/ || echo "✅ Imports OK"

# 2. Vérifier TypeScript
npx tsc --noEmit 2>&1 | grep -E "(error TS|Module not found)" | head -20

# 3. Vérifier Prisma schema
npx prisma validate

# 4. Tester le build local
npm run build

# 5. Linter
npm run lint
```

---

## 📋 **CHECKLIST PRÉ-COMMIT**

- [ ] Tous les imports React sont corrects (`from 'react'`)
- [ ] `'use client'` ajouté sur tous les composants avec hooks
- [ ] Paramètres de route dynamique typés (`{ params }: { params: { id: string } }`)
- [ ] Validation Zod sur tous les endpoints API
- [ ] Gestion d'erreurs complète (try/catch avec types d'erreurs)
- [ ] Types `any` justifiés avec commentaire
- [ ] Index Prisma sur relations et filtres
- [ ] Unique constraints pour éviter doublons
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npm run build` réussit

---

## 🚨 **ERREURS SPÉCIFIQUES AU PROJET**

### 12. **Prisma Client non généré**

❌ **Erreur** : `@prisma/client` not found

✅ **Solution** :
```bash
npx prisma generate
```

**Automatique** : Le `postinstall` script le fait automatiquement.

---

### 13. **Migration non appliquée**

❌ **Erreur** : Table doesn't exist

✅ **Solution** :
```bash
# Développement
npx prisma migrate dev

# Production (Vercel)
npx prisma db push --accept-data-loss
# OU
npx prisma migrate deploy
```

---

### 14. **Variables d'environnement manquantes**

❌ **Erreur** : `DATABASE_URL` is not defined

✅ **Vérifier** :
```bash
# Local
cat .env | grep DATABASE_URL

# Vercel
vercel env ls
```

---

### 15. **Date-fns locale manquante**

❌ **MAUVAIS** :
```typescript
format(new Date(), 'EEEE d MMMM')  // ❌ En anglais
```

✅ **CORRECT** :
```typescript
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

format(new Date(), 'EEEE d MMMM yyyy', { locale: fr })  // ✅ En français
```

---

## 📊 **STATISTIQUES DES ERREURS**

**Erreur la plus fréquente** : Typo dans imports React (`'use'` au lieu de `'react'`)
**Impact** : Build failure immédiat
**Temps de correction** : 30 secondes
**Prévention** : Linter ESLint avec règle `react/react-in-jsx-scope`

---

## 🎯 **ACTIONS IMMÉDIATES**

1. **Ajouter pre-commit hook** :
```bash
# .husky/pre-commit
npm run lint
npx tsc --noEmit
```

2. **Configurer ESLint strict** :
```json
{
  "rules": {
    "@typescript-eslint/no-explicit-any": "warn",
    "react/react-in-jsx-scope": "error"
  }
}
```

3. **Ajouter tests E2E pour les routes critiques** :
```typescript
// tests/api/sessions.spec.ts
test('POST /api/admin/events/[id]/sessions', async () => {
  const response = await fetch('/api/admin/events/123/sessions', {
    method: 'POST',
    body: JSON.stringify({ title: 'Test' })
  })
  expect(response.status).toBe(201)
})
```

---

**Dernière mise à jour** : 11 novembre 2025
**Auteur** : Claude Code
**Version** : 1.0
