// Test script to debug OAuth flow
console.log('🔍 OAuth Flow Debug Script Loaded')

// Function to check current URL and parameters
function checkCurrentUrl() {
  console.log('📍 Current URL:', window.location.href)
  console.log('📍 Pathname:', window.location.pathname)
  console.log('📍 Search:', window.location.search)
  console.log('📍 Hash:', window.location.hash)
  
  const urlParams = new URLSearchParams(window.location.search)
  const params = {}
  for (const [key, value] of urlParams.entries()) {
    params[key] = value
  }
  console.log('🔍 URL Parameters:', params)
  
  // Also check hash parameters
  let hashParams = {}
  const fullUrl = window.location.href
  const hashIndex = fullUrl.indexOf('#')
  
  if (hashIndex !== -1) {
    const hashString = fullUrl.substring(hashIndex + 1)
    if (hashString.includes('=')) {
      const hashSearchParams = new URLSearchParams(hashString)
      for (const [key, value] of hashSearchParams.entries()) {
        hashParams[key] = value
      }
      console.log('🔍 Hash Parameters:', hashParams)
    }
  } else if (window.location.hash && window.location.hash.includes('=')) {
    // Fallback to window.location.hash if available
    const hashString = window.location.hash.substring(1)
    const hashSearchParams = new URLSearchParams(hashString)
    for (const [key, value] of hashSearchParams.entries()) {
      hashParams[key] = value
    }
    console.log('🔍 Hash Parameters (fallback):', hashParams)
  }
  
  // Combine all parameters
  const allParams = { ...params, ...hashParams }
  console.log('🔍 Combined Parameters:', allParams)
  
  return { urlParams: params, hashParams, allParams }
}

// Function to check cookies
function checkCookies() {
  console.log('🍪 All Cookies:', document.cookie)
  
  const cookies = document.cookie.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=')
    if (name && value) {
      acc[name] = decodeURIComponent(value)
    }
    return acc
  }, {})
  
  console.log('🍪 Parsed Cookies:', cookies)
  return cookies
}

// Function to check localStorage
function checkLocalStorage() {
  console.log('💾 LocalStorage Keys:', Object.keys(localStorage))
  const authKeys = Object.keys(localStorage).filter(key => 
    key.includes('auth') || key.includes('supabase') || key.includes('session')
  )
  console.log('🔐 Auth-related LocalStorage Keys:', authKeys)
  
  authKeys.forEach(key => {
    try {
      const value = localStorage.getItem(key)
      console.log(`🔐 ${key}:`, value)
    } catch (error) {
      console.log(`🔐 ${key}: Error reading -`, error.message)
    }
  })
  
  return authKeys
}

// Function to check sessionStorage
function checkSessionStorage() {
  console.log('📱 SessionStorage Keys:', Object.keys(sessionStorage))
  const authKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('auth') || key.includes('supabase') || key.includes('session')
  )
  console.log('🔐 Auth-related SessionStorage Keys:', authKeys)
  
  authKeys.forEach(key => {
    try {
      const value = sessionStorage.getItem(key)
      console.log(`🔐 ${key}:`, value)
    } catch (error) {
      console.log(`🔐 ${key}: Error reading -`, error.message)
    }
  })
  
  return authKeys
}

// Function to simulate OAuth callback
function simulateOAuthCallback() {
  console.log('🔄 Simulating OAuth callback...')
  
  // Create mock OAuth parameters
  const mockParams = {
    access_token: 'mock_access_token_' + Date.now(),
    refresh_token: 'mock_refresh_token_' + Date.now(),
    expires_in: '3600',
    token_type: 'bearer',
    provider_token: 'mock_provider_token',
    provider_refresh_token: 'mock_provider_refresh_token'
  }
  
  // Build URL with parameters
  const params = new URLSearchParams(mockParams)
  const callbackUrl = window.location.origin + '/auth/callback?' + params.toString()
  
  console.log('🔄 Redirecting to:', callbackUrl)
  window.location.href = callbackUrl
}

// Function to test cookie auth functions
function testCookieAuth() {
  console.log('🍪 Testing Cookie Auth Functions...')
  
  // Test setting a cookie
  const testAuthData = {
    user_id: 'test_user_' + Date.now(),
    email: 'test@example.com',
    full_name: 'Test User',
    auth_user_id: 'test_auth_' + Date.now(),
    provider: 'test'
  }
  
  try {
    // Import cookie functions (if available)
    if (typeof setAuthCookie === 'function') {
      const result = setAuthCookie(testAuthData)
      console.log('🍪 setAuthCookie result:', result)
    } else {
      console.log('🍪 setAuthCookie function not available')
    }
    
    if (typeof getAuthCookie === 'function') {
      const cookie = getAuthCookie()
      console.log('🍪 getAuthCookie result:', cookie)
    } else {
      console.log('🍪 getAuthCookie function not available')
    }
    
    if (typeof isAuthenticated === 'function') {
      const auth = isAuthenticated()
      console.log('🍪 isAuthenticated result:', auth)
    } else {
      console.log('🍪 isAuthenticated function not available')
    }
  } catch (error) {
    console.error('🍪 Error testing cookie auth:', error)
  }
}

// Function to check if we're on the callback route
function checkCallbackRoute() {
  const isCallback = window.location.pathname === '/auth/callback'
  console.log('🔄 Is on callback route:', isCallback)
  
  if (isCallback) {
    console.log('✅ Currently on OAuth callback route')
    checkCurrentUrl()
    checkCookies()
    checkLocalStorage()
    checkSessionStorage()
  } else {
    console.log('❌ Not on OAuth callback route')
  }
  
  return isCallback
}

// Function to manually trigger OAuth
function triggerOAuth() {
  console.log('🔐 Triggering OAuth manually...')
  
  // This would normally be done by the GoogleAuth component
  // For testing, we'll just log what should happen
  console.log('🔐 Should redirect to Google OAuth with redirectTo:', window.location.origin + '/auth/callback')
  
  // You can manually visit this URL to test:
  // https://yxrjqcvlqverhfbrfeji.supabase.co/auth/v1/authorize?provider=google&redirect_to=http://localhost:3000/auth/callback
}

// Main debug function
function debugOAuthFlow() {
  console.log('🚀 Starting OAuth Flow Debug...')
  console.log('=' * 50)
  
  const paramResults = checkCurrentUrl()
  const cookies = checkCookies()
  const localStorageKeys = checkLocalStorage()
  const sessionStorageKeys = checkSessionStorage()
  const isCallback = checkCallbackRoute()
  
  console.log('=' * 50)
  console.log('📊 Summary:')
  console.log('- URL Parameters:', Object.keys(paramResults.urlParams).length)
  console.log('- Hash Parameters:', Object.keys(paramResults.hashParams).length)
  console.log('- Combined Parameters:', Object.keys(paramResults.allParams).length)
  console.log('- Cookies:', Object.keys(cookies).length)
  console.log('- LocalStorage Auth Keys:', localStorageKeys.length)
  console.log('- SessionStorage Auth Keys:', sessionStorageKeys.length)
  console.log('- Is Callback Route:', isCallback)
  
  // Check for OAuth-specific parameters
  const oauthParams = ['access_token', 'refresh_token', 'code', 'error', 'state']
  const foundOAuthParams = oauthParams.filter(param => paramResults.allParams[param])
  console.log('- OAuth Parameters Found:', foundOAuthParams)
  
  if (foundOAuthParams.length > 0) {
    console.log('🎯 OAuth callback detected!')
    console.log('Parameters:', foundOAuthParams.map(param => `${param}: ${paramResults.allParams[param] ? 'YES' : 'NO'}`))
  }
  
  return {
    ...paramResults,
    cookies,
    localStorageKeys,
    sessionStorageKeys,
    isCallback,
    foundOAuthParams
  }
}

// Expose functions to window for manual testing
window.debugOAuthFlow = debugOAuthFlow
window.checkCurrentUrl = checkCurrentUrl
window.checkCookies = checkCookies
window.checkLocalStorage = checkLocalStorage
window.checkSessionStorage = checkSessionStorage
window.simulateOAuthCallback = simulateOAuthCallback
window.testCookieAuth = testCookieAuth
window.triggerOAuth = triggerOAuth
window.checkCallbackRoute = checkCallbackRoute

// Auto-run debug on page load
console.log('🔍 OAuth Debug Script - Functions available:')
console.log('- debugOAuthFlow() - Full debug')
console.log('- checkCurrentUrl() - Check URL parameters')
console.log('- checkCookies() - Check cookies')
console.log('- checkLocalStorage() - Check localStorage')
console.log('- checkSessionStorage() - Check sessionStorage')
console.log('- simulateOAuthCallback() - Simulate OAuth callback')
console.log('- testCookieAuth() - Test cookie auth functions')
console.log('- triggerOAuth() - Trigger OAuth manually')
console.log('- checkCallbackRoute() - Check if on callback route')

// Run initial debug
setTimeout(() => {
  console.log('🔍 Running initial OAuth debug...')
  debugOAuthFlow()
}, 1000) 