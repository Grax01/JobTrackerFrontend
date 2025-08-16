import React, { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { supabase } from '../supabaseClient'
import { buildApiUrl, API_ENDPOINTS } from '../utils/api.ts'

interface ProfileCompletionProps {
  user: {
    id: number
    auth_user_id: string
    full_name: string
    email?: string
  }
  onProfileComplete: () => void
}

interface Domain {
  value: string
  label: string
}



const ProfileCompletion = ({ user, onProfileComplete }: ProfileCompletionProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  
  // Use user from props or from route state
  const userData = user || location.state?.user
  const isNewUser = location.state?.isNewUser || false
  
  // Get email from Supabase session as fallback
  const [sessionEmail, setSessionEmail] = useState('')
  
  useEffect(() => {
    const getSessionEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.email) {
        setSessionEmail(session.user.email)
      }
    }
    getSessionEmail()
  }, [])
  
  // Debug logging
  console.log('🔍 ProfileCompletion Debug:', {
    user,
    locationState: location.state,
    userData,
    fullNameFromUser: user?.full_name,
    fullNameFromLocation: location.state?.user?.full_name,
    fullNameFromUserData: userData?.full_name,
    googleUserData: location.state?.user,
    allData: {
      user,
      locationState: location.state,
      userData
    }
  })
  
  const [formData, setFormData] = useState({
    fullName: userData?.full_name || location.state?.user?.full_name || user?.full_name || 'Naman Kumar' || '',
    dateOfBirth: '',
    domain: '',
    yearsOfExperience: 0,
    monthsOfExperience: 0
  })
  const [domains, setDomains] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    console.log('🚀 ProfileCompletion mounted with data:', {
      user,
      locationState: location.state,
      userData,
      formData
    })
    
    // Fetch available domains
    axios.get(buildApiUrl(API_ENDPOINTS.DOMAINS))
      .then((domainsResponse) => {
        const domainOptions = domainsResponse.data.domains.map((domain: string) => ({
          value: domain,
          label: domain
        }))
        setDomains(domainOptions)
        setLoadingData(false)
      })
      .catch(err => {
        console.error('Failed to fetch data:', err)
        setLoadingData(false)
      })
  }, [])

  const handleInputChange = (e: any) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'yearsOfExperience' || name === 'monthsOfExperience' ? parseInt(value) || 0 : value
    }))
  }



  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Use email for new users, auth_user_id for existing users
    const userIdentifier = userData.email || userData.auth_user_id
    
    console.log('🔍 Profile submission debug:', {
      userData,
      userIdentifier,
      formData,
      isNewUser
    })

    try {
      const response = await axios.put(buildApiUrl(API_ENDPOINTS.USER_PROFILE(userIdentifier)), {
        full_name: formData.fullName,
        date_of_birth: formData.dateOfBirth,
        domain: formData.domain,
        years_of_experience: formData.yearsOfExperience || 0,
        months_of_experience: formData.monthsOfExperience || 0,
        tech_stack: []
      })

      if (response.status === 200) {
        if (onProfileComplete) {
          onProfileComplete()
        } else {
          navigate('/dashboard')
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete profile')
    } finally {
      setLoading(false)
    }
  }

  if (!userData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div style={{ fontSize: '18px', color: '#c62828' }}>No user data found. Please login again.</div>
      </div>
    )
  }

  if (loadingData) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px' 
      }}>
        <div style={{ fontSize: '18px', color: '#666' }}>Loading...</div>
      </div>
    )
  }

  // Calculate form completion percentage
  const getCompletionPercentage = () => {
    const requiredFields = [formData.fullName, formData.dateOfBirth, formData.domain]
    const completedFields = requiredFields.filter(field => field && field.trim() !== '').length
    return Math.round((completedFields / requiredFields.length) * 100)
  }

  const completionPercentage = getCompletionPercentage()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        backgroundColor: 'white',
        borderRadius: '20px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        position: 'relative'
      }}>
        {/* Header with gradient */}
        <div style={{
          background: 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
          padding: '40px 30px 30px',
          textAlign: 'center',
          color: 'white',
          position: 'relative'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))'
          }}>
            {isNewUser ? '🎉' : '👤'}
          </div>
          <h1 style={{ 
            margin: '0 0 8px 0',
            fontSize: '28px',
            fontWeight: '700',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {isNewUser ? 'Welcome to Job Tracker!' : 'Complete Your Profile'}
          </h1>
          <p style={{ 
            margin: '0',
            fontSize: '16px',
            opacity: '0.9',
            lineHeight: '1.5'
          }}>
            {isNewUser 
              ? `Hi ${userData.full_name}! Let's get you set up with your job tracking profile.`
              : 'Please provide some additional information to complete your profile.'
            }
          </p>
          {(userData.email || location.state?.user?.email || sessionEmail) && (
            <div style={{
              marginTop: '16px',
              padding: '8px 16px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '20px',
              fontSize: '14px',
              display: 'inline-block'
            }}>
              📧 {userData.email || location.state?.user?.email || sessionEmail}
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div style={{
          padding: '20px 30px 0',
          backgroundColor: 'white'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '8px'
          }}>
            <span style={{ fontSize: '14px', color: '#666', fontWeight: '500' }}>
              Profile Completion
            </span>
            <span style={{ fontSize: '14px', color: '#4CAF50', fontWeight: '600' }}>
              {completionPercentage}%
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '8px',
            backgroundColor: '#f0f0f0',
            borderRadius: '4px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${completionPercentage}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #4CAF50 0%, #45a049 100%)',
              borderRadius: '4px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: '30px' }}>
          {error && (
            <div style={{
              padding: '16px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid #ffcdd2',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '20px' }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '16px' }}>👤</span>
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  boxSizing: 'border-box'
                }}
                placeholder="Enter your full name"
                onFocus={(e) => {
                  e.target.style.borderColor = '#4CAF50'
                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.boxShadow = 'none'
                }}
              />
            </div>

            {/* Date of Birth */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '16px' }}>🎂</span>
                Date of Birth *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  max={new Date().toISOString().split('T')[0]}
                  min="1900-01-01"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    border: '2px solid #e0e0e0',
                    borderRadius: '12px',
                    fontSize: '16px',
                    transition: 'all 0.3s ease',
                    boxSizing: 'border-box',
                    backgroundColor: 'white',
                    cursor: 'pointer'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#4CAF50'
                    e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#e0e0e0'
                    e.target.style.boxShadow = 'none'
                  }}
                  onClick={(e) => {
                    // Open calendar when clicking anywhere on the input
                    e.target.showPicker()
                  }}
                />

              </div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginTop: '4px',
                fontStyle: 'italic'
              }}>
                Click to open calendar picker
              </div>
            </div>

            {/* Domain */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '16px' }}>💼</span>
                Domain *
              </label>
              <select
                name="domain"
                value={formData.domain}
                onChange={handleInputChange}
                required
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '12px',
                  fontSize: '16px',
                  transition: 'all 0.3s ease',
                  backgroundColor: 'white',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4CAF50'
                  e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)'
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e0e0e0'
                  e.target.style.boxShadow = 'none'
                }}
              >
                <option value="">Select your domain</option>
                {domains.map((domain: any) => (
                  <option key={domain.value} value={domain.value}>
                    {domain.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
                fontWeight: '600',
                color: '#333',
                fontSize: '14px'
              }}>
                <span style={{ fontSize: '16px' }}>⏰</span>
                Experience (Optional)
              </label>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    name="yearsOfExperience"
                    value={formData.yearsOfExperience}
                    onChange={handleInputChange}
                    min="0"
                    max="50"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Years"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4CAF50'
                      e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    name="monthsOfExperience"
                    value={formData.monthsOfExperience}
                    onChange={handleInputChange}
                    min="0"
                    max="11"
                    style={{
                      width: '100%',
                      padding: '16px 20px',
                      border: '2px solid #e0e0e0',
                      borderRadius: '12px',
                      fontSize: '16px',
                      transition: 'all 0.3s ease',
                      boxSizing: 'border-box'
                    }}
                    placeholder="Months"
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4CAF50'
                      e.target.style.boxShadow = '0 0 0 3px rgba(76, 175, 80, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e0e0e0'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px 24px',
                background: loading 
                  ? 'linear-gradient(135deg, #ccc 0%, #bbb 100%)'
                  : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: loading ? 'none' : '0 4px 15px rgba(76, 175, 80, 0.3)',
                transform: loading ? 'none' : 'translateY(0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(76, 175, 80, 0.4)'
                }
              }}
              onMouseLeave={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)'
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>
                {loading ? '⏳' : (isNewUser ? '🚀' : '✅')}
              </span>
              {loading ? 'Completing Profile...' : (isNewUser ? 'Get Started' : 'Complete Profile')}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ProfileCompletion 