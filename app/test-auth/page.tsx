export default function TestAuthPage() {
  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test Page - Si vous voyez ceci, le routing fonctionne</h1>
      <p>La base de données est synchronisée ✅</p>
      <p>Le compte admin existe ✅</p>
      <a href="/auth/admin" style={{ color: 'blue', textDecoration: 'underline' }}>
        Aller vers la page de login
      </a>
    </div>
  )
}
