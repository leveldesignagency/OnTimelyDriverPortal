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
      <div style={{ 
        minHeight: '100vh', 
        background: '#000000',
        color: '#cbd5e1',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, sans-serif',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {!allowed ? (
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
                fontSize: '64px',
                marginBottom: '24px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                📱
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
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '20px',
                marginTop: '24px'
              }}>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  📲
                </div>
                <div style={{
                  width: '56px',
                  height: '56px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  border: '1px solid rgba(16, 185, 129, 0.2)'
                }}>
                  📟
                </div>
              </div>
            </div>
          </div>
        ) : (
          <Trips />
        )}
      </div>
    </SupabaseProvider>
  )
}
