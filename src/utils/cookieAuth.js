// Cookie-based authentication utility
const COOKIE_NAME = 'job_tracker_auth'
const COOKIE_EXPIRY_DAYS = 30

// Set a cookie with authentication data
export const setAuthCookie = (authData) => {
  try {
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + COOKIE_EXPIRY_DAYS)
    
    const cookieValue = JSON.stringify({
      ...authData,
      expires: expiryDate.toISOString()
    })
    
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(cookieValue)}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`
    
    console.log('🍪 Auth cookie set successfully')
    return true
  } catch (error) {
    console.error('❌ Error setting auth cookie:', error)
    return false
  }
}

// Get authentication data from cookie
export const getAuthCookie = () => {
  try {
    const cookies = document.cookie.split(';')
    const authCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${COOKIE_NAME}=`)
    )
    
    if (!authCookie) {
      console.log('🍪 No auth cookie found')
      return null
    }
    
    const cookieValue = decodeURIComponent(authCookie.split('=')[1])
    const authData = JSON.parse(cookieValue)
    
    // Check if cookie has expired
    if (authData.expires && new Date(authData.expires) < new Date()) {
      console.log('🍪 Auth cookie has expired')
      clearAuthCookie()
      return null
    }
    
    console.log('🍪 Auth cookie retrieved successfully')
    return authData
  } catch (error) {
    console.error('❌ Error reading auth cookie:', error)
    clearAuthCookie()
    return null
  }
}

// Clear authentication cookie
export const clearAuthCookie = () => {
  try {
    document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
    console.log('🍪 Auth cookie cleared')
    return true
  } catch (error) {
    console.error('❌ Error clearing auth cookie:', error)
    return false
  }
}

// Check if user is authenticated
export const isAuthenticated = () => {
  const authData = getAuthCookie()
  return authData !== null && authData.user_id && authData.email
}

// Get user data from cookie
export const getUserFromCookie = () => {
  const authData = getAuthCookie()
  if (!authData) return null
  
  return {
    id: authData.user_id,
    email: authData.email,
    full_name: authData.full_name,
    auth_user_id: authData.auth_user_id
  }
} 