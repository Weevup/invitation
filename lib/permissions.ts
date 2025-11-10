import { prisma } from '@/lib/prisma'
import { AuthError } from '@/lib/auth-utils'

/**
 * Vérifie qu'un utilisateur est propriétaire d'un événement
 * @throws {AuthError} Si l'événement n'existe pas ou n'appartient pas à l'utilisateur
 */
export async function requireEventOwnership(eventId: string, userId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { adminId: true }
  })

  if (!event) {
    throw new AuthError('Événement introuvable', 'FORBIDDEN')
  }

  if (event.adminId !== userId) {
    throw new AuthError(
      'Vous n\'avez pas les droits pour accéder à cet événement',
      'FORBIDDEN'
    )
  }

  return true
}

/**
 * Vérifie qu'un utilisateur peut accéder à un invité (via l'événement)
 * @throws {AuthError} Si l'invité n'existe pas ou si l'événement associé n'appartient pas à l'utilisateur
 */
export async function requireGuestAccess(guestId: string, userId: string) {
  const guest = await prisma.guest.findUnique({
    where: { id: guestId },
    select: {
      event: {
        select: { adminId: true }
      }
    }
  })

  if (!guest) {
    throw new AuthError('Invité introuvable', 'FORBIDDEN')
  }

  if (guest.event.adminId !== userId) {
    throw new AuthError(
      'Vous n\'avez pas les droits pour accéder à cet invité',
      'FORBIDDEN'
    )
  }

  return true
}

/**
 * Vérifie qu'un utilisateur peut accéder à un template
 * Note: Pour l'instant, tous les admins peuvent accéder aux templates
 * Cette fonction peut être étendue si besoin de permissions plus granulaires
 */
export async function requireTemplateAccess(templateId: string, userId: string) {
  const template = await prisma.emailTemplate.findUnique({
    where: { id: templateId },
    select: { id: true }
  })

  if (!template) {
    throw new AuthError('Template introuvable', 'FORBIDDEN')
  }

  // Pour l'instant, tous les admins peuvent accéder aux templates
  // Si besoin d'ownership: ajouter un champ userId au modèle EmailTemplate
  return true
}

/**
 * Vérifie qu'un utilisateur peut modifier un autre utilisateur
 * Règles:
 * - Un admin peut modifier ses propres infos
 * - Un admin ne peut pas modifier les infos d'autres admins (sauf super-admin si implémenté)
 */
export async function requireUserModificationAccess(
  targetUserId: string,
  currentUserId: string
) {
  // Un utilisateur peut toujours modifier ses propres infos
  if (targetUserId === currentUserId) {
    return true
  }

  // Pour l'instant, on empêche la modification d'autres utilisateurs
  // Cette logique peut être étendue pour un système de super-admin
  throw new AuthError(
    'Vous ne pouvez modifier que vos propres informations',
    'FORBIDDEN'
  )
}

/**
 * Filtre les événements pour ne retourner que ceux appartenant à l'utilisateur
 * Utile pour les requêtes GET /api/admin/events
 */
export function getEventFilter(userId: string) {
  return {
    adminId: userId
  }
}

/**
 * Filtre les invités pour ne retourner que ceux des événements de l'utilisateur
 */
export function getGuestFilter(userId: string) {
  return {
    event: {
      adminId: userId
    }
  }
}
