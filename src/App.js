import React, { useEffect, useState, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from './supabaseClient'
import Dashboard from './components/dashboard.tsx'
import JobDetails from './components/JobDetails.tsx'
import ProfileCompletion from './components/ProfileCompletion.tsx'
import OAuthCallback from './components/OAuthCallback.tsx'
import TestAuth from './components/TestAuth.tsx'
import GoogleAuth from './components/GoogleAuth.tsx'
import SimpleAuth from './components/SimpleAuth.tsx'
import OAuthDebug from './components/OAuthDebug.tsx'
import PrivacyPolicy from './components/PrivacyPolicy.tsx'
import TermsOfService from './components/TermsOfService.tsx'
import Support from './components/Support.tsx'
import { getAuthCookie, clearAuthCookie, getUserFromCookie, setAuthCookie } from './utils/cookieAuth'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from './utils/api.ts'

// Add comprehensive logging utility
const log = (level, message, data = null) => {
  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] [${level}] ${message}`
  console.log(logMessage, data || '')
  
  // Also log to localStorage for debugging
  const logs = JSON.parse(localStorage.getItem('app_logs') || '[]')
  logs.push({ timestamp, level, message, data })
  if (logs.length > 100) logs.shift() // Keep only last 100 logs
  localStorage.setItem('app_logs', JSON.stringify(logs))
}

// Add immediate logging to verify script is loaded
console.log('🚀 App.js script loaded at:', new Date().toISOString())
log('INFO', '🚀 App.js script loaded')

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [profileComplete, setProfileComplete] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Add immediate logging when component mounts
  console.log('🚀 AppContent component mounted at:', new Date().toISOString())
  log('INFO', '🚀 AppContent component mounted', {
    pathname: location.pathname,
    fullUrl: window.location.href
  })

  // Cookie-based authentication
  useEffect(() => {
    log('INFO', '🍪 Starting cookie-based authentication check')
    
    const initializeAuth = async () => {
      try {
        log('INFO', '🍪 Checking for auth cookie...')
        
        // Don't check for OAuth parameters if we're already on the callback route
        if (location.pathname === '/auth/callback') {
          log('INFO', '🔄 Already on OAuth callback route, skipping OAuth parameter check')
          setLoading(false)
          return
        }
        
        // Check if this is an OAuth callback (fallback for when callback route doesn't work)
        const urlParams = new URLSearchParams(window.location.search)
        let hashParams = new URLSearchParams()
        
        // Check if we have parameters in the hash fragment
        if (window.location.hash && window.location.hash.includes('=')) {
          const hashString = window.location.hash.substring(1) // Remove the #
          hashParams = new URLSearchParams(hashString)
        }
        
        // Combine parameters (hash takes precedence)
        const allParams = new URLSearchParams(urlParams.toString())
        for (const [key, value] of hashParams.entries()) {
          allParams.set(key, value)
        }
        
        const hasOAuthParams = allParams.get('access_token') || allParams.get('code') || allParams.get('error')
        
        if (hasOAuthParams) {
          log('INFO', '🔄 OAuth parameters detected in main app, redirecting to callback')
          // Preserve both query params and hash params
          const redirectUrl = '/auth/callback' + window.location.search + window.location.hash
          navigate(redirectUrl)
          return
        }
        
        // Get authentication data from cookie
        const authData = getAuthCookie()
        
        log('INFO', '🍪 Cookie check result', {
          hasAuthData: !!authData,
          userId: authData?.user_id,
          email: authData?.email
        })
        
        if (authData) {
          log('INFO', '✅ Auth cookie found, setting up user')
          const userFromCookie = getUserFromCookie()
          setUser(userFromCookie)
          await checkUserProfile(authData.auth_user_id)
        } else {
          log('INFO', '❌ No auth cookie found - showing login page')
          setUser(null)
          setProfileComplete(false)
          setLoading(false)
        }
      } catch (error) {
        log('ERROR', '❌ Error in auth initialization', error)
        setUser(null)
        setProfileComplete(false)
        setLoading(false)
      }
    }

    initializeAuth()
  }, [navigate, location.pathname])

  const handleAuthSuccess = (user) => {
    log('INFO', '✅ Auth success callback', { user })
    // User will be set by cookie check
  }

  const handleProfileComplete = () => {
    log('INFO', '✅ Profile complete callback')
    setProfileComplete(true)
  }

  // Manual auth check function for debugging
  const checkAuthManually = async () => {
    log('INFO', '🔍 Manual auth check')
    
    try {
      const authData = getAuthCookie()
      
      log('INFO', '🔍 Manual auth check result', {
        hasAuthData: !!authData,
        userId: authData?.user_id,
        email: authData?.email,
        expires: authData?.expires ? new Date(authData.expires).toISOString() : null
      })
      
      return { authData }
    } catch (error) {
      log('ERROR', '❌ Manual auth check error', error)
      return { authData: null, error }
    }
  }

  // Expose manual auth check to window for debugging
  useEffect(() => {
    window.checkAuthManually = checkAuthManually
    log('INFO', '🔧 Manual auth check function exposed to window.checkAuthManually')
    
    // Add manual OAuth processing function
    window.processOAuthManually = async () => {
      console.log('🔄 Manual OAuth processing triggered')
      
      try {
        // Get user data from localStorage
        const localStorageToken = localStorage.getItem('sb-yxrjqcvlqverhfbrfeji-auth-token')
        const localStorageUserId = localStorage.getItem('supabase_user_id')
        const localStorageUserEmail = localStorage.getItem('supabase_user_email')
        
        if (localStorageToken && localStorageUserId && localStorageUserEmail) {
          console.log('✅ Found user data in localStorage')
          
          const tokenData = JSON.parse(localStorageToken)
          const userData = tokenData.user
          
          if (userData) {
            console.log('✅ Using user data from localStorage:', userData)
            
            // Store authentication data in cookie
            const authData = {
              user_id: userData.id,
              email: userData.email,
              full_name: userData.user_metadata?.full_name || userData.user_metadata?.name || '',
              auth_user_id: userData.id,
              provider: 'google'
            }
            
            const cookieSet = setAuthCookie(authData)
            if (cookieSet) {
              console.log('✅ Auth cookie set successfully')
              
              // Force a page reload to trigger the auth check
              window.location.href = '/'
              return true
            } else {
              console.error('❌ Failed to set auth cookie')
              return false
            }
          }
        }
        
        console.error('❌ No user data found in localStorage')
        return false
      } catch (error) {
        console.error('❌ Error in manual OAuth processing:', error)
        return false
      }
    }
    
    console.log('🔧 Manual OAuth processing function exposed to window.processOAuthManually')
    
    // Add test function to simulate OAuth callback
    window.testOAuthCallback = () => {
      console.log('🧪 Testing OAuth callback route...')
      window.location.href = '/auth/callback#access_token=test&refresh_token=test'
    }
    
    console.log('🔧 Test OAuth callback function exposed to window.testOAuthCallback')
  }, [])

  const checkUserProfile = useCallback(async (authUserId) => {
    log('INFO', '🔍 Checking user profile', { authUserId })
    
    // Check if we already have user data and profile is complete
    if (user && profileComplete) {
      log('INFO', '✅ User data and profile already complete, skipping backend check')
      setLoading(false)
      return
    }
    
    // Only set loading to true if we don't already have user data
    if (!user) {
      setLoading(true)
    }

    try {
      const authData = getAuthCookie()
      const userEmail = authData?.email
      
      if (!userEmail) {
        log('ERROR', '❌ No user email found in auth cookie')
        setError('No user email found. Please log in again.')
        setLoading(false)
        return
      }
      
      log('INFO', '🔧 Using email from auth cookie', { userEmail })
      
      // Check if user exists and profile is complete
              const backendUrl = `${buildApiUrl(API_ENDPOINTS.AUTH_CHECK_PROFILE)}?auth_user_id=${authUserId}&email=${encodeURIComponent(userEmail)}`
      log('INFO', '📡 Checking user profile at backend', { backendUrl })
      
      const response = await axios.get(backendUrl, {
        timeout: 10000
      })
      
      log('INFO', '📡 Backend response received', {
        status: response.status,
        data: response.data
      })
      
      if (response.data.is_new_user || !response.data.profile_complete) {
        log('INFO', '🆕 New user or incomplete profile')
        setUser(response.data.user)
        setProfileComplete(false)
      } else {
        log('INFO', '✅ Existing user with complete profile')
        setUser(response.data.user)
        setProfileComplete(true)
      }
      
    } catch (error) {
      log('ERROR', '❌ Error checking user profile', {
        message: error.message,
        status: error.response?.status
      })
      
      if (error.code === 'ERR_NETWORK') {
        setError('Cannot connect to server. Please make sure the backend is running on port 8081.')
      } else {
        setError('An error occurred while checking your profile. Please try again.')
      }
      
      setUser(null)
      setProfileComplete(false)
    } finally {
      setLoading(false)
    }
  }, [user, profileComplete])

  const logout = async () => {
    log('INFO', '🚪 Logging out user')
    clearAuthCookie()
    setUser(null)
    setProfileComplete(false)
    navigate('/')
  }

  // Handle redirects
  useEffect(() => {
    if (user && profileComplete && location.pathname === '/') {
      log('INFO', '🔄 Redirecting authenticated user to dashboard')
      navigate('/dashboard', { replace: true })
    }
  }, [user, profileComplete, location.pathname, navigate])

  // Check if we're on the OAuth callback route - handle this after all hooks are declared
  console.log('🔍 Checking route:', {
    pathname: location.pathname,
    isCallbackRoute: location.pathname === '/auth/callback',
    fullUrl: window.location.href
  })
  
  if (location.pathname === '/auth/callback') {
    log('INFO', '🔄 Rendering OAuth callback component')
    console.log('🔄 OAuth callback route detected - rendering component')
    return <OAuthCallback />
  }

  if (loading) {
    log('INFO', '⏳ App is loading...')
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        <div style={{
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          {error ? (
            <>
              <div style={{
                width: '60px',
                height: '60px',
                backgroundColor: '#ffebee',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
                fontSize: '30px'
              }}>
                ⚠️
              </div>
              <h3 style={{ marginBottom: '10px', color: '#c62828' }}>Error</h3>
              <p style={{ color: '#c62828', fontSize: '14px', marginBottom: '20px' }}>
                {error}
              </p>
              <button
                onClick={() => {
                  log('INFO', '🔄 Retrying after error')
                  window.location.reload()
                }}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Retry
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: '60px',
                height: '60px',
                border: '4px solid #f3f4f6',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 20px'
              }}></div>
              <h3 style={{ marginBottom: '10px', color: '#374151' }}>Loading...</h3>
              <p style={{ color: '#6b7280', fontSize: '14px' }}>
                Please wait while we load your dashboard
              </p>
            </>
          )}
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    )
  }

  // Render based on authentication state
  if (!user) {
    log('INFO', '🔐 No user found, showing login page')
    return (
      <Routes>
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
        <Route path="/support" element={<Support />} />
        <Route path="*" element={<GoogleAuth onAuthSuccess={handleAuthSuccess} onProfileComplete={handleProfileComplete} />} />
      </Routes>
    )
  }

  if (user && !profileComplete) {
    log('INFO', '📝 User exists but profile incomplete, showing profile completion')
    return <ProfileCompletion user={user} onComplete={handleProfileComplete} />
  }

  log('INFO', '✅ User and profile complete, showing main app')
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Dashboard auth_user_id={user.auth_user_id} onLogout={logout} />} />
      <Route path="/job/:userJobId" element={<JobDetails auth_user_id={user.auth_user_id} onLogout={logout} />} />
      <Route path="/complete-profile" element={<ProfileCompletion user={user} onComplete={handleProfileComplete} />} />
      <Route path="/test-auth" element={<TestAuth />} />
      <Route path="/simple-auth" element={<SimpleAuth onAuthSuccess={handleAuthSuccess} onProfileComplete={handleProfileComplete} />} />
      <Route path="/oauth-debug" element={<OAuthDebug />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/support" element={<Support />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  )
}

export default App
