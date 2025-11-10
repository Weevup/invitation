import { redirect } from 'next/navigation'

/**
 * Redirection de l'ancienne URL de login vers la nouvelle
 * Pour compatibilité avec les liens existants
 */
export default function OldLoginRedirect() {
  redirect('/auth/admin')
}
