import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '../utils/api.ts'

const TestAuth = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const testAuth = async () => {
    setLoading(true)
    setError('')

    try {
      // Simulate a user ID (this would normally come from Supabase OAuth)
      const testUserId = `test-user-${Date.now()}`
      
      // Check if user exists in our backend
      const response = await axios.get(`${buildApiUrl(API_ENDPOINTS.AUTH_CHECK_PROFILE)}?auth_user_id=${testUserId}`)
      
      if (response.data.is_new_user || !response.data.profile_complete) {
        // Redirect to profile completion
        navigate('/complete-profile', { 
          state: { user: response.data.user } 
        })
      } else {
        // User is authenticated and profile is complete
        navigate('/dashboard')
      }
    } catch (error) {
      console.error('Error testing auth:', error)
      setError('Failed to test authentication')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      fontSize: '18px'
    }}>
      <h2>Test Authentication</h2>
      <p style={{ color: '#666', marginBottom: '20px' }}>
        This bypasses Google OAuth for testing purposes
      </p>
      
      {error && (
        <div style={{
          padding: '12px 16px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #ffcdd2'
        }}>
          {error}
        </div>
      )}
      
      <button 
        onClick={testAuth}
        disabled={loading}
        style={{
          padding: '12px 24px',
          fontSize: '16px',
          backgroundColor: loading ? '#ccc' : '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {loading ? 'Testing...' : 'Test Authentication'}
      </button>
    </div>
  )
}

export default TestAuth 