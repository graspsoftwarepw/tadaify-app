function App() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center">
        <h1
          className="text-4xl font-semibold mb-4"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--brand-primary)' }}
        >
          tada!ify
        </h1>
        <p style={{ color: 'var(--fg-muted)', fontFamily: 'var(--font-sans)' }}>
          Link-in-bio for creators — Story 0 scaffold
        </p>
      </div>
    </div>
  )
}

export default App
