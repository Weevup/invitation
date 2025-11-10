export default function TestLoginPage() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>✅ Page de test accessible</h1>
      <p>Si vous voyez cette page, le problème n&apos;est PAS le routing.</p>
      <p>Les identifiants corrects sont:</p>
      <ul>
        <li><strong>Email:</strong> contact@weevup.com</li>
        <li><strong>Mot de passe:</strong> admin123</li>
      </ul>
      <p>
        <a href="/auth/admin" style={{ color: 'blue', textDecoration: 'underline' }}>
          Aller à la page de login
        </a>
      </p>
    </div>
  )
}
