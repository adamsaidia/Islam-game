'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="nl">
      <body style={{ margin: 0, minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0C3331', color: '#fff', fontFamily: 'system-ui, sans-serif', textAlign: 'center', padding: 24 }}>
        <div>
          <p style={{ letterSpacing: 6, color: '#C8A96A', fontSize: 13 }}>AQUA SISTERS</p>
          <h1 style={{ fontWeight: 400 }}>De website is tijdelijk niet bereikbaar</h1>
          <button onClick={reset} style={{ marginTop: 16, padding: '12px 24px', background: '#C8A96A', border: 0, color: '#0C3331', cursor: 'pointer' }}>Opnieuw proberen</button>
        </div>
      </body>
    </html>
  );
}
