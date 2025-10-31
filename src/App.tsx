import React from 'react'
import { SupabaseProvider } from './lib/SupabaseProvider'
import Trips from './pages/Trips'

const isMobileOrTablet = () => {
  if (typeof navigator !== 'undefined') {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth <= 1024)
  }
  return false
}

export default function App() {
  const allowed = isMobileOrTablet()
  return (
    <SupabaseProvider>
      <div style={{ minHeight: '100vh', background: '#0f1115', color: '#fff', fontFamily: 'Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial' }}>
        {!allowed ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', gap: 16, padding: 24 }}>
            <div style={{ fontSize: 48 }}>📱</div>
            <div style={{ fontSize: 20, fontWeight: 700 }}>Open OnTimely Driver Portal on a mobile or tablet</div>
            <div style={{ opacity: 0.8, textAlign: 'center' }}>This portal is optimized for mobile and tablet. Please use your phone or tablet to continue.</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <span style={{ fontSize: 28 }}>📲</span>
              <span style={{ fontSize: 28 }}>📟</span>
              <span style={{ fontSize: 28 }}>🧭</span>
            </div>
          </div>
        ) : (
          <Trips />
        )}
      </div>
    </SupabaseProvider>
  )
}
