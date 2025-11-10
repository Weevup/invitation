'use client'

import { useEffect, useState } from 'react'

export default function EnvCheckPage() {
  const [envData, setEnvData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/check-env')
      .then(res => res.json())
      .then(data => {
        setEnvData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace' }}>
        <h1>Chargement...</h1>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '2rem', fontFamily: 'monospace', color: 'red' }}>
        <h1>❌ Erreur</h1>
        <p>{error}</p>
      </div>
    )
  }

  const criticalIssues = envData?.recommendations?.filter((r: string) => r.includes('❌')).length || 0

  return (
    <div style={{
      padding: '2rem',
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: criticalIssues > 0 ? '#dc2626' : '#059669' }}>
        {criticalIssues > 0 ? '❌ Configuration Incomplète' : '✅ Configuration OK'}
      </h1>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginTop: '1rem',
        border: '1px solid #e5e5e5'
      }}>
        <h2>🔍 Variables d&apos;Environnement Critiques</h2>

        <table style={{ width: '100%', marginTop: '1rem', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>AUTH_SECRET</td>
              <td style={{ padding: '0.75rem', color: envData?.AUTH_SECRET ? 'green' : 'red' }}>
                {envData?.AUTH_SECRET_value}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>NEXTAUTH_SECRET</td>
              <td style={{ padding: '0.75rem', color: envData?.NEXTAUTH_SECRET ? 'green' : 'red' }}>
                {envData?.NEXTAUTH_SECRET_value}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>NEXTAUTH_URL</td>
              <td style={{ padding: '0.75rem' }}>{envData?.NEXTAUTH_URL}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>DATABASE_URL</td>
              <td style={{ padding: '0.75rem', color: envData?.DATABASE_URL ? 'green' : 'red' }}>
                {envData?.DATABASE_URL_preview}
              </td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>NEXT_PUBLIC_APP_URL</td>
              <td style={{ padding: '0.75rem' }}>{envData?.NEXT_PUBLIC_APP_URL}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>NODE_ENV</td>
              <td style={{ padding: '0.75rem' }}>{envData?.NODE_ENV}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>VERCEL_ENV</td>
              <td style={{ padding: '0.75rem' }}>{envData?.VERCEL_ENV}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>VERCEL_URL</td>
              <td style={{ padding: '0.75rem' }}>{envData?.VERCEL_URL}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{
        backgroundColor: criticalIssues > 0 ? '#fee2e2' : '#d1fae5',
        padding: '1.5rem',
        borderRadius: '8px',
        marginTop: '1rem',
        border: `2px solid ${criticalIssues > 0 ? '#dc2626' : '#059669'}`
      }}>
        <h2>📋 Recommandations</h2>
        <ul style={{ marginTop: '1rem' }}>
          {envData?.recommendations?.map((rec: string, idx: number) => (
            <li key={idx} style={{ marginBottom: '0.5rem' }}>{rec}</li>
          ))}
        </ul>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        marginTop: '1rem',
        border: '1px solid #e5e5e5'
      }}>
        <h2>🔗 Actions Rapides</h2>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <a
            href="/auth/admin"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#004645',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'inline-block'
            }}
          >
            → Tester la page de login
          </a>
          <a
            href="/test-login"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#009197',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '6px',
              display: 'inline-block'
            }}
          >
            → Page de test simple
          </a>
        </div>

        <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#fef3c7', borderRadius: '6px' }}>
          <strong>📝 Identifiants de connexion:</strong>
          <ul style={{ marginTop: '0.5rem' }}>
            <li><strong>Email:</strong> contact@weevup.com</li>
            <li><strong>Mot de passe:</strong> admin123</li>
          </ul>
        </div>
      </div>

      <div style={{
        marginTop: '2rem',
        padding: '1rem',
        backgroundColor: '#fee2e2',
        borderRadius: '6px',
        border: '1px solid #dc2626'
      }}>
        <strong>⚠️  SÉCURITÉ:</strong> Cette page de diagnostic doit être supprimée ou sécurisée en production!
      </div>
    </div>
  )
}
