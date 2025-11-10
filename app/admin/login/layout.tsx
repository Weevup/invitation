import { ReactNode } from 'react'

/**
 * Layout pour la page de login
 * N'hérite pas du layout admin parent pour éviter les redirections
 */
export default function LoginLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
