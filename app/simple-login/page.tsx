'use client'

export default function SimpleLoginPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(to bottom right, #004645, #009197)',
      padding: '2rem'
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        maxWidth: '400px',
        width: '100%'
      }}>
        <h1 style={{ marginBottom: '1rem', color: '#004645' }}>Test Simple</h1>

        <div style={{
          padding: '1rem',
          backgroundColor: '#d1fae5',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>✅ Cette page s&apos;affiche = Routing OK</p>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#fef3c7',
          borderRadius: '6px',
          marginBottom: '1rem'
        }}>
          <p style={{ margin: 0, marginBottom: '0.5rem' }}><strong>Tests à faire :</strong></p>
          <ol style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li><a href="/api/admin/check-and-fix" target="_blank" style={{ color: '#004645', fontWeight: 'bold' }}>🔧 Vérifier et Réparer DB</a></li>
            <li><a href="/api/test-db" target="_blank" style={{ color: '#004645' }}>Test DB</a></li>
            <li><a href="/env-check" style={{ color: '#004645' }}>Test Env</a></li>
            <li><a href="/auth/admin" style={{ color: '#004645' }}>Page Login NextAuth</a></li>
          </ol>
        </div>

        <div style={{
          padding: '1rem',
          backgroundColor: '#fee2e2',
          borderRadius: '6px'
        }}>
          <p style={{ margin: 0, marginBottom: '0.5rem' }}><strong>⚠️ Si erreur 500 sur /auth/admin :</strong></p>
          <ul style={{ margin: 0, paddingLeft: '1.5rem', fontSize: '0.9rem' }}>
            <li>Vérifier logs Vercel</li>
            <li>Tester /api/test-db</li>
            <li>Vérifier DATABASE_URL</li>
          </ul>
        </div>

        <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: '#666' }}>
          <strong>Identifiants :</strong><br/>
          contact@weevup.com / admin123
        </div>
      </div>
    </div>
  )
}
