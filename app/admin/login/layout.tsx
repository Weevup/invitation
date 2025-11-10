import { ReactNode } from 'react'

/**
 * Layout pour la redirection de login
 * Évite l'exécution du layout admin parent
 */
export default function LoginRedirectLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
