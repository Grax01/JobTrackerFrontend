import React, { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { setAuthCookie } from '../utils/cookieAuth'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '../utils/api.ts'

const OAuthCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  console.log('🔄 OAuthCallback component RENDERED at:', new Date().toISOString())

  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.log('🔄 OAuthCallback component mounted')
      console.log('📍 Current URL:', window.location.href)
      console.log('📍 Location pathname:', location.pathname)
      console.log('🔍 URL Search Params:', window.location.search)
      console.log('🔍 Location search:', location.search)
      console.log('🔍 URL Hash:', window.location.hash)

      // Parse OAuth parameters from both query string and hash fragment
      let urlParams = new URLSearchParams(window.location.search)
      let hashParams = new URLSearchParams()
      
      // Check if we have parameters in the hash fragment
      // Note: window.location.hash might not be accessible, so we'll try to extract from the full URL
      const fullUrl = window.location.href
      const hashIndex = fullUrl.indexOf('#')
      
      if (hashIndex !== -1) {
        const hashString = fullUrl.substring(hashIndex + 1)
        if (hashString.includes('=')) {
          hashParams = new URLSearchParams(hashString)
          console.log('🔍 Hash Parameters:', hashString)
        }
      } else if (window.location.hash && window.location.hash.includes('=')) {
        // Fallback to window.location.hash if available
        const hashString = window.location.hash.substring(1) // Remove the #
        hashParams = new URLSearchParams(hashString)
        console.log('🔍 Hash Parameters (fallback):', hashString)
      }
      
      // Combine parameters (hash takes precedence)
      const allParams = new URLSearchParams(urlParams.toString())
      for (const [key, value] of hashParams.entries()) {
        allParams.set(key, value)
      }
      
      const errorParam = allParams.get('error')
      const errorDescription = allParams.get('error_description')
      const accessToken = allParams.get('access_token')
      const refreshToken = allParams.get('refresh_token')
      const code = allParams.get('code')

      console.log('🔍 Combined OAuth parameters:', {
        error: errorParam,
        errorDescription,
        hasAccessToken: !!accessToken,
        hasRefreshToken: !!refreshToken,
        hasCode: !!code,
        allParams: Object.fromEntries(allParams.entries())
      })

      if (errorParam) {
        console.error('❌ OAuth error detected:', { error: errorParam, description: errorDescription })
        setError(`Authentication failed: ${errorDescription || errorParam}`)
        setLoading(false)
        return
      }

      try {
        console.log('📡 Processing OAuth callback...')
        
        // Wait a bit for Supabase to process the OAuth response
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Get the session from Supabase
        const { data: { session }, error } = await supabase.auth.getSession()
        
        console.log('📡 OAuth callback result:', { 
          hasSession: !!session, 
          error: error?.message,
          userId: session?.user?.id,
          email: session?.user?.email
        })

        if (error) {
          console.error('❌ OAuth callback error:', error)
          setError('Failed to complete authentication')
          setLoading(false)
          return
        }

        if (!session) {
          console.log('⚠️ No session created from OAuth callback')
          console.log('🔍 Trying to get user directly...')
          
          // Try to get user directly
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          
          if (userError || !user) {
            console.error('❌ No user found either:', userError)
            
            // Try to get user data from localStorage as a last resort
            console.log('🔍 Trying to get user from localStorage...')
            const localStorageToken = localStorage.getItem('sb-yxrjqcvlqverhfbrfeji-auth-token')
            const localStorageUserId = localStorage.getItem('supabase_user_id')
            const localStorageUserEmail = localStorage.getItem('supabase_user_email')
            
            if (localStorageToken && localStorageUserId && localStorageUserEmail) {
              console.log('✅ Found user data in localStorage')
              
              try {
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
                  if (!cookieSet) {
                    console.error('❌ Failed to set auth cookie')
                    setError('Failed to save authentication data')
                    setLoading(false)
                    return
                  }

                  // Continue with profile check
                  await checkUserProfileAndRedirect(userData)
                  return
                }
              } catch (parseError) {
                console.error('❌ Error parsing localStorage token:', parseError)
              }
            }
            
            setError('No session created. Please try again.')
            setLoading(false)
            return
          }
          
          console.log('✅ User found directly:', user)
          
          // Create session-like object
          const mockSession = {
            user: user,
            access_token: accessToken,
            refresh_token: refreshToken
          }
          
          // Store authentication data in cookie
          const authData = {
            user_id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            auth_user_id: user.id,
            provider: 'google'
          }
          
          const cookieSet = setAuthCookie(authData)
          if (!cookieSet) {
            console.error('❌ Failed to set auth cookie')
            setError('Failed to save authentication data')
            setLoading(false)
            return
          }

          // Continue with profile check
          await checkUserProfileAndRedirect(user)
          return
        }

        console.log('✅ Session created successfully:', {
          user_id: session.user?.id,
          email: session.user?.email,
          provider: session.user?.app_metadata?.provider
        })

        // Get user info from Supabase
        console.log('📡 Getting user info...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('❌ User error:', userError)
          setError('Failed to get user info')
          setLoading(false)
          return
        }

        console.log('✅ User info retrieved:', {
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name
        })

        // Store authentication data in cookie
        const authData = {
          user_id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
          auth_user_id: user.id,
          provider: 'google'
        }
        
        const cookieSet = setAuthCookie(authData)
        if (!cookieSet) {
          console.error('❌ Failed to set auth cookie')
          setError('Failed to save authentication data')
          setLoading(false)
          return
        }

        // Continue with profile check
        await checkUserProfileAndRedirect(user)
        
      } catch (error) {
        console.error('💥 OAuth callback error:', error)
        console.error('💥 Error details:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        })
        
        setError('Failed to complete authentication')
        setLoading(false)
      }
    }

    const checkUserProfileAndRedirect = async (user) => {
      try {
        // Check if user exists in our backend and profile status
        console.log('📡 Checking user profile in backend...')
        const backendUrl = `${buildApiUrl(API_ENDPOINTS.AUTH_CHECK_PROFILE)}?auth_user_id=${user.id}&email=${encodeURIComponent(user.email || '')}`

        const response = await axios.get(backendUrl)
        
        console.log('📡 Backend response:', {
          status: response.status,
          data: response.data
        })
        
        if (response.data.is_new_user || !response.data.profile_complete) {
          console.log('🆕 New user or incomplete profile - redirecting to profile completion')
          
          // Redirect to profile completion
          const userWithGoogleData = {
            ...response.data.user,
            auth_user_id: user.id,
            full_name: user.user_metadata?.full_name || user.user_metadata?.name || '',
            email: user.email
          }
          
          navigate('/complete-profile', { 
            state: { 
              user: userWithGoogleData,
              isNewUser: response.data.is_new_user 
            } 
          })
        } else {
          console.log('✅ Existing user with complete profile - redirecting to dashboard')
          // User exists and profile is complete - redirect to dashboard
          navigate('/dashboard')
        }
      } catch (error) {
        console.error('💥 Profile check error:', error)
        setError('Failed to check user profile')
        setLoading(false)
      }
    }

    handleOAuthCallback()
  }, [navigate, location])

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        <div style={{
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #4285f4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto'
            }}></div>
          </div>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>Completing Authentication</h3>
          <p style={{ color: '#666', fontSize: '14px' }}>
            Please wait while we set up your account...
          </p>
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

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        <div style={{
          maxWidth: '400px',
          padding: '40px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            backgroundColor: '#ffebee',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            color: '#c62828',
            fontSize: '24px'
          }}>
            ✕
          </div>
          <h3 style={{ marginBottom: '10px', color: '#333' }}>Authentication Failed</h3>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>
            {error}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              onClick={() => navigate('/')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/simple-auth')}
              style={{
                padding: '12px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: 'pointer'
              }}
            >
              Use Simple Login
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default OAuthCallback 