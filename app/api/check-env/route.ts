import { NextResponse } from 'next/server'

/**
 * Route de diagnostic pour vérifier les variables d'environnement
 * ATTENTION: À supprimer ou sécuriser en production
 */
export async function GET() {
  const envCheck = {
    // Variables critiques pour NextAuth
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_SECRET_value: process.env.AUTH_SECRET ? 'Défini (masqué)' : 'NON DÉFINI ❌',
    NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    NEXTAUTH_SECRET_value: process.env.NEXTAUTH_SECRET ? 'Défini (masqué)' : 'NON DÉFINI ❌',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NON DÉFINI ❌',

    // Database
    DATABASE_URL: !!process.env.DATABASE_URL,
    DATABASE_URL_preview: process.env.DATABASE_URL
      ? `${process.env.DATABASE_URL.substring(0, 30)}...`
      : 'NON DÉFINI ❌',

    // App URL
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'NON DÉFINI ❌',

    // Node env
    NODE_ENV: process.env.NODE_ENV,

    // Vercel
    VERCEL_ENV: process.env.VERCEL_ENV || 'Non Vercel',
    VERCEL_URL: process.env.VERCEL_URL || 'Non Vercel',

    // Check critique
    hasAuthSecret: !!(process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET),

    // Recommandations
    recommendations: [] as string[]
  }

  // Ajouter des recommandations
  if (!envCheck.hasAuthSecret) {
    envCheck.recommendations.push('❌ CRITIQUE: AUTH_SECRET ou NEXTAUTH_SECRET manquant - NextAuth ne fonctionnera PAS')
  }

  if (!process.env.DATABASE_URL) {
    envCheck.recommendations.push('❌ CRITIQUE: DATABASE_URL manquant')
  }

  if (!process.env.NEXT_PUBLIC_APP_URL && process.env.NODE_ENV === 'production') {
    envCheck.recommendations.push('⚠️  NEXT_PUBLIC_APP_URL devrait être défini en production')
  }

  if (!process.env.NEXTAUTH_URL && process.env.NODE_ENV === 'production') {
    envCheck.recommendations.push('⚠️  NEXTAUTH_URL devrait être défini en production')
  }

  if (envCheck.recommendations.length === 0) {
    envCheck.recommendations.push('✅ Toutes les variables critiques sont définies')
  }

  return NextResponse.json(envCheck, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store'
    }
  })
}
