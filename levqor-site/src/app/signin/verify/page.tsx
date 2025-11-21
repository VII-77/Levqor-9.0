export default function VerifyRequest() {
  return (
    <main style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div style={{ 
        background: 'white', 
        padding: '3rem', 
        borderRadius: '12px', 
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
        <h1 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>Check your email</h1>
        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
          A sign in link has been sent to your email address.
        </p>
        <p style={{ fontSize: '0.875rem', color: '#999' }}>
          Click the link in the email to sign in. You can close this window.
        </p>
      </div>
    </main>
  )
}
