import React, { useState } from 'react'
import { setAuthCookie } from '../utils/cookieAuth'

interface SimpleAuthProps {
  onAuthSuccess: (user: any) => void
  onProfileComplete: () => void
}

const SimpleAuth = ({ onAuthSuccess, onProfileComplete }: SimpleAuthProps) => {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSimpleLogin = async (e: any) => {
    e.preventDefault()
    
    if (!email || !fullName) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError('')
      
      console.log('🔐 Starting simple login...')
      
      // Create mock auth data
      const authData = {
        user_id: `simple_${Date.now()}`,
        email: email,
        full_name: fullName,
        auth_user_id: `simple_${Date.now()}`,
        provider: 'simple'
      }
      
      // Store in cookie
      const cookieSet = setAuthCookie(authData)
      
      if (!cookieSet) {
        setError('Failed to save authentication data')
        return
      }

      console.log('✅ Simple login successful:', authData)
      
      // Call success callback
      onAuthSuccess(authData)
      
      // Reload page to trigger auth check
      window.location.reload()
      
    } catch (err) {
      console.error('❌ Simple login error:', err)
      setError('Failed to login. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      backgroundColor: '#f8fafc'
    }}>
      <div style={{
        maxWidth: '400px',
        width: '100%',
        padding: '40px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        textAlign: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          backgroundColor: '#EFF6FF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '40px'
        }}>
          🎯
        </div>
        
        <h1 style={{
          marginBottom: '10px',
          color: '#1f2937',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          Job Tracker
        </h1>
        
        <p style={{
          color: '#6b7280',
          marginBottom: '30px',
          fontSize: '16px'
        }}>
          Simple login for testing
        </p>

        {error && (
          <div style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px',
            marginBottom: '20px',
            color: '#dc2626',
            fontSize: '14px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSimpleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div style={{
          marginTop: '30px',
          padding: '16px',
          backgroundColor: '#f8fafc',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#6b7280',
          lineHeight: '1.4'
        }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '500' }}>🧪 Test Mode:</p>
          <p style={{ margin: '0' }}>
            This is a simple login for testing cookie-based authentication without Google OAuth.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SimpleAuth 