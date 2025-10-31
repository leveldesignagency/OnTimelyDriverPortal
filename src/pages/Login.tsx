import React, { useState } from 'react'
import { useSupabase } from '../lib/SupabaseProvider'

type LoginProps = {
  onLogin: () => void
}

export default function Login({ onLogin }: LoginProps) {
  const supabase = useSupabase()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      // Check if user is a driver
      const userMetadata = data.user?.user_metadata || {}
      if (userMetadata.role !== 'driver') {
        await supabase.auth.signOut()
        throw new Error('Access denied. Driver account required.')
      }

      onLogin()
    } catch (e: any) {
      setError(e.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100dvh',
      paddingTop: 'env(safe-area-inset-top, 0px)',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      background: '#000000',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: '16px',
      paddingRight: '16px'
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

      {/* Login card */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        background: 'rgba(17, 24, 39, 0.55)',
        backdropFilter: 'blur(8px)',
        borderRadius: '18px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 8px 30px rgba(0,0,0,0.45)',
        padding: '48px 40px',
        maxWidth: '440px',
        width: '100%'
      }}>
        {/* Logo/Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
            <img src="/logo.svg" alt="OnTimely" style={{ height: 36, width: 'auto', opacity: 0.95 }} />
          </div>
          <div style={{
            fontSize: '16px',
            color: '#9ca3af'
          }}>
            Driver Portal
          </div>
        </div>

        {/* Login form */}
        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '8px'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                background: 'rgba(15, 17, 21, 0.8)',
                color: '#e5e7eb',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 600,
              color: '#cbd5e1',
              marginBottom: '8px'
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              style={{
                width: '100%',
                padding: '14px 16px',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.14)',
                background: 'rgba(15, 17, 21, 0.8)',
                color: '#e5e7eb',
                fontSize: '15px',
                outline: 'none',
                transition: 'all 0.2s'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = 'rgba(16, 185, 129, 0.5)'
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.14)'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              borderRadius: '10px',
              padding: '12px',
              marginBottom: '20px',
              color: '#fca5a5',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: '10px',
              background: loading ? 'rgba(16, 185, 129, 0.5)' : '#10b981',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: 600,
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              opacity: loading ? 0.7 : 1
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#0d9d70'
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = '#10b981'
              }
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}

