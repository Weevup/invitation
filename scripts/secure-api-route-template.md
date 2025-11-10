# Template pour Sécuriser une Route API Admin

## Import Statement
```typescript
import { requireAdmin, handleAuthError } from '@/lib/auth-utils'
import { requireEventOwnership } from '@/lib/permissions' // Si besoin d'ownership
```

## Pattern de Base (Sans Ownership)
```typescript
export async function GET/POST/PUT/DELETE() {
  try {
    const session = await requireAdmin()

    // Votre logique métier ici
    // ...

    return NextResponse.json(result)
  } catch (error) {
    return handleAuthError(error)
  }
}
```

## Pattern avec Ownership (Routes [id])
```typescript
export async function GET/POST/PUT/DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdmin()
    const { id } = await params

    // Vérifier ownership
    await requireEventOwnership(id, session.user.id)

    // Votre logique métier ici
    // ...

    return NextResponse.json(result)
  } catch (error) {
    return handleAuthError(error)
  }
}
```

## Routes à Protéger (Priorité)

### 🔴 CRITIQUE - À faire maintenant
- [x] `/api/admin/events/route.ts`
- [x] `/api/admin/events/[id]/route.ts`
- [x] `/api/admin/users/route.ts`
- [x] `/api/admin/users/[id]/route.ts`
- [ ] `/api/admin/integrations/email/route.ts` (clés API!)
- [ ] `/api/admin/dashboard/stats/route.ts`
- [ ] `/api/admin/events/[id]/guests/route.ts`
- [ ] `/api/admin/events/[id]/send-invitations/route.ts`

### 🟡 HAUTE - À faire après
- [ ] `/api/admin/templates/route.ts`
- [ ] `/api/admin/templates/[id]/route.ts`
- [ ] `/api/admin/events/[id]/send-emails/route.ts`
- [ ] `/api/admin/events/[id]/save-the-date/route.ts`
- [ ] `/api/admin/events/[id]/showcase/route.ts`

### 🟢 NORMALE - À faire si temps
- [ ] `/api/admin/analytics/route.ts`
- [ ] `/api/admin/status/route.ts`
- [ ] `/api/admin/database-status/route.ts`
- [ ] Toutes les autres routes admin

### ⚪ OPTIONNELLE/UTILITAIRES
- [ ] `/api/admin/diagnostic/route.ts`
- [ ] `/api/admin/test-email/route.ts`
- [ ] `/api/admin/init/route.ts`
- [ ] `/api/admin/seed/route.ts`
- [ ] `/api/admin/migrate/route.ts`
- [ ] `/api/admin/setup/route.ts`
- [ ] `/api/admin/clear-database/route.ts`
