import React, { useState, useEffect } from 'react'
import { SupabaseProvider, useSupabase } from './lib/SupabaseProvider'
import Trips from './pages/Trips'
import Login from './pages/Login'

const isMobileOrTablet = () => {
  if (typeof navigator !== 'undefined') {
    return /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || (typeof window !== 'undefined' && window.innerWidth <= 1024)
  }
  return false
}

function AppContent() {
  const supabase = useSupabase()
  const [session, setSession] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const allowed = isMobileOrTablet()

  useEffect(() => {
    // Check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleLogin = () => {
    // Session will be updated via onAuthStateChange
  }

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#cbd5e1'
      }}>
        Loading...
      </div>
    )
  }

  return (
    <div style={{ 
      minHeight: '100dvh', 
      background: '#000000',
      color: '#cbd5e1',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)'
    }}>
      {!session ? (
        <Login onLogin={handleLogin} />
      ) : !allowed ? (
          <div style={{
            position: 'relative',
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
          }}>
            {/* Background gradient overlay */}
            <div style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 70% 20%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)',
              pointerEvents: 'none',
              zIndex: 0
            }} />
            
            {/* Glassmorphic card */}
            <div style={{
              position: 'relative',
              zIndex: 1,
              background: 'rgba(17, 24, 39, 0.55)',
              backdropFilter: 'blur(8px)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.45)',
              padding: '60px 48px',
              maxWidth: '600px',
              width: '100%',
              textAlign: 'center'
            }}>
              {/* Icon */}
              <div style={{
                display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '16px'
              }}>
                <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12" y2="18"></line>
                </svg>
              </div>
              
              {/* Heading */}
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#e5e7eb',
                marginBottom: '16px',
                lineHeight: '1.3'
              }}>
                Open OnTimely Driver Portal on a mobile or tablet
              </h1>
              
              {/* Description */}
              <p style={{
                fontSize: '16px',
                color: '#9ca3af',
                lineHeight: '1.6',
                marginBottom: '32px'
              }}>
                This portal is optimized for mobile and tablet devices. Please use your phone or tablet to continue.
              </p>
              
              {/* Icons row */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '8px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect>
                  </svg>
                </div>
                <div style={{ width: 44, height: 44, borderRadius: 10, border: '1px solid rgba(16,185,129,0.25)', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19V6h13v10"/>
                    <path d="M1 19h22v2H1z"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Trips />
        )}
      </div>
  )
}

export default function App() {
  return (
    <SupabaseProvider>
      <AppContent />
    </SupabaseProvider>
  )
}