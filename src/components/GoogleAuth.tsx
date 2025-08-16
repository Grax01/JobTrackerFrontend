import React, { useState } from 'react'
import { supabase } from '../supabaseClient'

interface GoogleAuthProps {
  onAuthSuccess: (user: any) => void
  onProfileComplete: () => void
}

const GoogleAuth: React.FC<GoogleAuthProps> = ({ onAuthSuccess, onProfileComplete }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('🔐 Starting Google OAuth login...')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      })

      if (error) {
        console.error('❌ Google OAuth error:', error)
        setError(error.message)
        return
      }

      console.log('✅ Google OAuth initiated successfully:', data)
      
      // The user will be redirected to the OAuth provider
      // When they return, the OAuth callback will handle the session
      
    } catch (err) {
      console.error('❌ Login error:', err)
      setError('Failed to login with Google. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden',
        maxWidth: '500px',
        width: '100%'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          color: 'white',
          padding: '40px 30px',
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 'bold',
            marginBottom: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}>
            <span>🎯</span>
            <span>Jobly</span>
          </div>
          <div style={{
            fontSize: '16px',
            opacity: '0.9',
            fontWeight: '400'
          }}>
            Track your job applications in one place
          </div>
        </div>

        {/* Content */}
        <div style={{
          padding: '40px 30px'
        }}>
          {/* Welcome Section */}
          <div style={{
            marginBottom: '30px',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#1F2937',
              marginBottom: '15px'
            }}>
              Welcome to Jobly! 🚀
            </h2>
            <p style={{
              fontSize: '15px',
              color: '#6B7280',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              The ultimate job tracking platform that helps you organize and manage your job applications effortlessly. 
              Never lose track of your applications again!
            </p>
          </div>

          {/* Features Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '10px',
                display: 'block'
              }}>🎯</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '5px'
              }}>One-Click Tracking</div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                lineHeight: '1.4'
              }}>Add jobs with a single click from any job page</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '10px',
                display: 'block'
              }}>📊</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '5px'
              }}>Smart Analytics</div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                lineHeight: '1.4'
              }}>Track your application progress and success rates</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '10px',
                display: 'block'
              }}>📝</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '5px'
              }}>Add Notes</div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                lineHeight: '1.4'
              }}>Keep detailed notes for each application</div>
            </div>
            <div style={{
              textAlign: 'center',
              padding: '20px',
              background: '#F8FAFC',
              borderRadius: '12px',
              border: '1px solid #E5E7EB'
            }}>
              <div style={{
                fontSize: '24px',
                marginBottom: '10px',
                display: 'block'
              }}>💼</div>
              <div style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#1F2937',
                marginBottom: '5px'
              }}>Interview Experience</div>
              <div style={{
                fontSize: '12px',
                color: '#6B7280',
                lineHeight: '1.4'
              }}>Track your interview experiences and learnings</div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div style={{
              background: '#FEF2F2',
              border: '1px solid #FECACA',
              color: '#EF4444',
              padding: '12px 16px',
              borderRadius: '8px',
              marginBottom: '20px',
              fontSize: '14px'
            }}>
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <div style={{
            marginTop: '30px',
            textAlign: 'center'
          }}>
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px 24px',
                borderRadius: '12px',
                fontSize: '15px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                color: 'white',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                opacity: loading ? 0.7 : 1
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)'
                }
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @media (max-width: 480px) {
          .container {
            margin: 10px;
          }
          
          .features {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default GoogleAuth 