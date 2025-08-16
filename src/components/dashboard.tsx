// src/components/Dashboard.tsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import AddJobModal from './AddJobModal.tsx'
import { buildApiUrl, API_ENDPOINTS } from '../utils/api.ts'

interface Job {
  id: number
  user_job_id: string
  title: string
  company: string
  location: string
  tech_stack: string[]
  created_at: string
  status?: string
  salary?: string
  description?: string
  source_type?: string
}

type SortDirection = 'asc' | 'desc'

// Utility function to convert company name from lowercase to proper case
const formatCompanyName = (companyName: string): string => {
  if (!companyName) return ''
  
  // Split by spaces and capitalize each word
  return companyName
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

// Component for company logo with fallback to initials
const CompanyLogo = ({ companyName }: { companyName: string }) => {
  const [logoError, setLogoError] = useState(false)
  const formattedName = formatCompanyName(companyName)
  const logoUrl = `https://logo.clearbit.com/${companyName.toLowerCase()}.com`

  return (
    <div style={{
      width: '40px',
      height: '40px',
      backgroundColor: logoError ? '#EFF6FF' : 'transparent',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '16px',
      color: logoError ? '#3B82F6' : 'transparent',
      fontWeight: '600',
      overflow: 'hidden'
    }}>
      {!logoError ? (
        <img
          src={logoUrl}
          alt={`${formattedName} logo`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: '8px'
          }}
          onError={() => setLogoError(true)}
        />
      ) : (
        formattedName.charAt(0).toUpperCase()
      )}
    </div>
  )
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

const Dashboard = ({ auth_user_id, onLogout }: { auth_user_id: string, onLogout: () => void }) => {
  console.log('🚀 Dashboard component mounted with auth_user_id:', auth_user_id)
  
  // Add cleanup effect to track unmounting
  useEffect(() => {
    return () => {
      console.log('🔄 Dashboard component unmounting')
    }
  }, [])
  
  const navigate = useNavigate()
  const isFetchingRef = useRef(false)
  const [jobs, setJobs] = useState([] as Job[])
  const [companyFilter, setCompanyFilter] = useState("")
  const [locationFilter, setLocationFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [sortBy, setSortBy] = useState('applied_on')
  const [sortDirection, setSortDirection] = useState('desc' as SortDirection)
  const [downloadingCSV, setDownloadingCSV] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isAddJobModalOpen, setIsAddJobModalOpen] = useState(false)

  // Debounce the filters to prevent excessive API calls
  const debouncedCompanyFilter = useDebounce(companyFilter, 300)
  const debouncedLocationFilter = useDebounce(locationFilter, 300)

  // Fetch jobs when dependencies change
  useEffect(() => {
    const fetchJobs = async () => {
      // Prevent multiple simultaneous API calls
      if (isFetchingRef.current) {
        console.log('🔄 Dashboard: Skipping fetch - already in progress')
        return
      }
      
      console.log('🔍 Dashboard: fetchJobs called with auth_user_id:', auth_user_id)
      isFetchingRef.current = true
      setLoading(true)
      setError("")
      
      const params = new URLSearchParams({
        auth_user_id: auth_user_id,
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (debouncedCompanyFilter) params.append('company', debouncedCompanyFilter)
      if (debouncedLocationFilter) params.append('location', debouncedLocationFilter)
      if (statusFilter) params.append('status', statusFilter)
      
      const apiUrl = `${buildApiUrl(API_ENDPOINTS.DASHBOARD_SEARCH)}?${params.toString()}`
      console.log('📡 Dashboard: Making API call to:', apiUrl)
      
      try {
        const res = await axios.get(apiUrl)
        console.log('✅ Dashboard: API response received:', {
          status: res.status,
          success: res.data.success,
          jobsCount: res.data.jobs?.length || 0,
          pagination: res.data.pagination
        })
        
        if (res.data.success) {
          setJobs(res.data.jobs || [])
          setTotalPages(res.data.pagination.total_pages)
          setTotalCount(res.data.pagination.total_count)
        } else {
          console.error('❌ Dashboard: API returned success: false')
          setError("Failed to fetch jobs")
        }
      } catch (err) {
        console.error("❌ Dashboard: Error fetching jobs:", err)
        console.error("❌ Dashboard: Error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
        setError("Failed to fetch jobs")
      } finally {
        setLoading(false)
        isFetchingRef.current = false
      }
    }

    fetchJobs()
    
    // Cleanup function to cancel ongoing requests when component unmounts
    return () => {
      isFetchingRef.current = false
    }
  }, [auth_user_id, currentPage, debouncedCompanyFilter, debouncedLocationFilter, statusFilter])

  // Reset to page 1 when filters change (but not when page changes due to pagination)
  useEffect(() => {
    // Only reset if we're not already on page 1 and filters have changed
    if (currentPage !== 1) {
      setCurrentPage(1)
    }
  }, [debouncedCompanyFilter, debouncedLocationFilter, statusFilter])

  // Fetch job summary
  const [jobSummary, setJobSummary] = useState({
    total: 0,
    in_progress: 0,
    interview_scheduled: 0,
    offered: 0,
    rejected: 0
  })

  useEffect(() => {
    console.log('🔍 Dashboard: Fetching job summary for auth_user_id:', auth_user_id)
    const summaryUrl = `${buildApiUrl(API_ENDPOINTS.DASHBOARD_SUMMARY)}?auth_user_id=${auth_user_id}`
    console.log('📡 Dashboard: Making summary API call to:', summaryUrl)
    
    axios
      .get(summaryUrl)
      .then((res) => {
        console.log('✅ Dashboard: Summary API response received:', {
          status: res.status,
          success: res.data.success,
          summary: res.data.summary
        })
        if (res.data.success) {
          setJobSummary(res.data.summary)
        }
      })
      .catch((err) => {
        console.error("❌ Dashboard: Error fetching job summary:", err)
        console.error("❌ Dashboard: Summary error details:", {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
      })
  }, [auth_user_id])

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'interview_scheduled': return '#3B82F6'  // Blue
      case 'in_progress': return '#F59E0B'         // Amber
      case 'offered': return '#10B981'             // Green
      case 'rejected': return '#EF4444'            // Red
      default: return '#6B7280'                    // Gray
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'interview_scheduled': return '#EFF6FF'  // Light blue
      case 'in_progress': return '#FFFBEB'          // Light amber
      case 'offered': return '#ECFDF5'              // Light green
      case 'rejected': return '#FEF2F2'             // Light red
      default: return '#F3F4F6'                     // Light gray
    }
  }

  const formatStatus = (status: string) => {
    if (!status) return ''
    switch (status) {
      case 'in_progress': return 'In Progress'
      case 'interview_scheduled': return 'Interview Scheduled'
      case 'offered': return 'Offered'
      case 'rejected': return 'Rejected'
      default: return status
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
    }
  }

  // Sort jobs (client-side sorting for now)
  const sortedJobs = useMemo(() => {
    const sorted = [...jobs]
    sorted.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime()
      const dateB = new Date(b.created_at).getTime()
      return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
    })
    return sorted
  }, [jobs, sortDirection])

  const handleSort = (column: 'applied_on') => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortDirection('desc')
    }
  }

  const clearFilters = () => {
    setCompanyFilter("")
    setLocationFilter("")
    setStatusFilter("")
    setCurrentPage(1)
  }

  const handleJobCreated = (userJobId: string) => {
    // Refresh the jobs list by resetting to page 1
    setCurrentPage(1)
    // Navigate to the newly created job
    navigate(`/job/${userJobId}`)
  }

  if (error) return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px', 
      color: '#f44336' 
    }}>
      {error}
    </div>
  )

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: '32px',
        gap: '24px',
        padding: '24px 24px 0 24px'
      }}>
        <div style={{ flex: 1 }}>
          <h2 style={{ margin: '0 0 4px 0', color: '#1F2937', fontSize: '24px', fontWeight: '600' }}>
            Jobly
          </h2>
          <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
            Track your job applications and land your dream role 🚀
          </p>
        </div>
        
        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          flexShrink: 0,
          alignItems: 'center'
        }}>
          {jobSummary.total > 0 && (
            <button style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
              color: '#374151',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              cursor: downloadingCSV ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(148, 163, 184, 0.2)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              opacity: downloadingCSV ? 0.5 : 1,
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              if (!downloadingCSV) {
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(148, 163, 184, 0.3)'
                e.currentTarget.style.background = 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 100%)'
              }
            }}
            onMouseLeave={(e) => {
              if (!downloadingCSV) {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(148, 163, 184, 0.2)'
                e.currentTarget.style.background = 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
              }
            }}
            disabled={downloadingCSV}
            onClick={() => {
              if (!downloadingCSV) {
                setDownloadingCSV(true)
                const url = `${buildApiUrl(API_ENDPOINTS.DASHBOARD_CSV)}?auth_user_id=${auth_user_id}`
                const link = document.createElement('a')
                link.href = url
                link.download = 'job_posts.csv'
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                setTimeout(() => setDownloadingCSV(false), 1000)
              }
            }}
            >
              {downloadingCSV ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    border: '1.5px solid #cbd5e1',
                    borderTop: '1.5px solid #64748b',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }}></div>
                  <span>Downloading...</span>
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <span style={{ fontSize: '14px' }}>📊</span>
                  <span>Export CSV</span>
                  <span style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    color: '#64748b',
                    padding: '1px 6px',
                    borderRadius: '10px',
                    fontSize: '11px',
                    fontWeight: '600',
                    border: '1px solid #e2e8f0'
                  }}>
                    {jobSummary.total}
                  </span>
                </div>
              )}
            </button>
          )}
          
          <button 
            onClick={() => setIsAddJobModalOpen(true)}
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)'
              e.currentTarget.style.background = 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.3)'
              e.currentTarget.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}
          >
            <span style={{ 
              fontSize: '14px',
              fontWeight: 'bold'
            }}>+</span>
            <span>Add New Job</span>
          </button>
          
          <button 
            onClick={onLogout}
            style={{
              padding: '12px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: '600',
              boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)'
              e.currentTarget.style.backgroundColor = '#d32f2f'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)'
              e.currentTarget.style.backgroundColor = '#f44336'
            }}
          >
            <span style={{ fontSize: '14px' }}>↪</span>
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Job Summary Section */}
      <div style={{
        display: 'flex',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        padding: '0 24px'
      }}>
        {/* In Progress Card */}
        <div style={{
          backgroundColor: '#fefce8',
          borderRadius: '16px',
          padding: '24px',
          flex: 1,
          minWidth: '200px',
          border: '1px solid #fef3c7',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
        }}
        onClick={() => setStatusFilter('in_progress')}
        >
          {/* Icon */}
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#fef3c7',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(251, 191, 36, 0.15)'
          }}>
            <span style={{ fontSize: '28px' }}>⏰</span>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, position: 'relative' }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#92400e', 
              fontSize: '13px', 
              fontWeight: '600', 
              textTransform: 'uppercase', 
              letterSpacing: '0.8px' 
            }}>
              In Progress
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ 
                margin: '0', 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#92400e' 
              }}>
                {jobSummary.in_progress}
              </p>
            </div>
          </div>
        </div>

        {/* Interview Scheduled Card */}
        <div style={{
          backgroundColor: '#f0f9ff',
          borderRadius: '16px',
          padding: '24px',
          flex: 1,
          minWidth: '200px',
          border: '1px solid #e0f2fe',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
        }}
        onClick={() => setStatusFilter('interview_scheduled')}
        >
          {/* Icon */}
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#dbeafe',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)'
          }}>
            <span style={{ fontSize: '28px' }}>📋</span>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, position: 'relative' }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#1e40af', 
              fontSize: '13px', 
              fontWeight: '600', 
              textTransform: 'uppercase', 
              letterSpacing: '0.8px' 
            }}>
              Interview Scheduled
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ 
                margin: '0', 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#1e40af' 
              }}>
                {jobSummary.interview_scheduled}
              </p>
            </div>
          </div>
        </div>

        {/* Offered Card */}
        <div style={{
          backgroundColor: '#f0fdf4',
          borderRadius: '16px',
          padding: '24px',
          flex: 1,
          minWidth: '200px',
          border: '1px solid #dcfce7',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
        }}
        onClick={() => setStatusFilter('offered')}
        >
          {/* Icon */}
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#d1fae5',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.15)'
          }}>
            <span style={{ fontSize: '28px' }}>✅</span>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, position: 'relative' }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#065f46', 
              fontSize: '13px', 
              fontWeight: '600', 
              textTransform: 'uppercase', 
              letterSpacing: '0.8px' 
            }}>
              Offered
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ 
                margin: '0', 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#065f46' 
              }}>
                {jobSummary.offered}
              </p>
            </div>
          </div>
        </div>

        {/* Rejected Card */}
        <div style={{
          backgroundColor: '#fef2f2',
          borderRadius: '16px',
          padding: '24px',
          flex: 1,
          minWidth: '200px',
          border: '1px solid #fecaca',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          position: 'relative',
          overflow: 'hidden'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05)'
        }}
        onClick={() => setStatusFilter('rejected')}
        >
          {/* Icon */}
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#fee2e2',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)'
          }}>
            <span style={{ fontSize: '28px' }}>❌</span>
          </div>
          
          {/* Content */}
          <div style={{ flex: 1, position: 'relative' }}>
            <h3 style={{ 
              margin: '0 0 8px 0', 
              color: '#991b1b', 
              fontSize: '13px', 
              fontWeight: '600', 
              textTransform: 'uppercase', 
              letterSpacing: '0.8px' 
            }}>
              Rejected
            </h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <p style={{ 
                margin: '0', 
                fontSize: '32px', 
                fontWeight: '800', 
                color: '#991b1b' 
              }}>
                {jobSummary.rejected}
              </p>
            </div>
          </div>
        </div>
      </div>

      {(!jobs || jobs.length === 0) && !(debouncedCompanyFilter || debouncedLocationFilter || statusFilter) && totalCount === 0 ? (
        <div style={{ 
          textAlign: 'center', 
          padding: '60px 20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '2px dashed #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          margin: '0 24px 24px 24px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>📋</div>
          <h3 style={{ color: '#374151', marginBottom: '10px', fontSize: '18px' }}>No job posts yet</h3>
          <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '14px' }}>
            Start tracking your job applications by adding your first job post
          </p>
          <button 
            onClick={() => setIsAddJobModalOpen(true)}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#2563EB'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#3B82F6'
            }}
          >
            Add Your First Job
          </button>
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          border: '1px solid #E5E7EB',
          position: 'relative',
          margin: '0 24px 24px 24px'
        }}>
          {/* Loading overlay */}
          {loading && !(jobs.length === 0 && !debouncedCompanyFilter && !debouncedLocationFilter && !statusFilter) && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              borderRadius: '12px'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px 24px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid #E5E7EB'
              }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #E5E7EB',
                  borderTop: '2px solid #3B82F6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
                <span style={{ color: '#6B7280', fontSize: '14px' }}>Updating results...</span>
              </div>
            </div>
          )}

          {/* Results count */}
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid #F3F4F6',
            backgroundColor: '#F9FAFB',
            fontSize: '14px',
            color: '#6B7280',
            fontWeight: '500',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              Showing {jobs.length} of {totalCount} jobs
              {(debouncedCompanyFilter || debouncedLocationFilter || statusFilter) && (
                <span style={{ color: '#3B82F6', marginLeft: '8px' }}>
                  (filtered)
                </span>
              )}
            </span>
            
            {/* Clear Filters Button - moved to top */}
            {(companyFilter || locationFilter || statusFilter) && (
              <button
                onClick={clearFilters}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '12px',
                  color: '#6B7280',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#E5E7EB'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#F3F4F6'
                }}
              >
                ✕ Clear all filters
              </button>
            )}
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px'
            }}>
              {/* Table Headers with inline filters */}
              <thead>
                <tr style={{
                  backgroundColor: '#F9FAFB',
                  borderBottom: '1px solid #E5E7EB'
                }}>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#6B7280',
                    fontSize: '12px',
                    verticalAlign: 'top',
                    width: '60px'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginBottom: '4px',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        #
                      </div>
                    </div>
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#6B7280',
                    fontSize: '12px',
                    verticalAlign: 'top'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginBottom: '4px',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Company
                      </div>
                      <input
                        type="text"
                        value={companyFilter}
                        onChange={(e) => setCompanyFilter(e.target.value)}
                        placeholder="Filter..."
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '11px',
                          width: '100px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          backgroundColor: 'white',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          color: '#374151'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6'
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                          e.target.style.backgroundColor = '#F8FAFC'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E5E7EB'
                          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                          e.target.style.backgroundColor = 'white'
                        }}
                      />
                    </div>
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#6B7280',
                    fontSize: '12px',
                    verticalAlign: 'top'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginBottom: '4px',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Location
                      </div>
                      <input
                        type="text"
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder="Filter..."
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '11px',
                          width: '100px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          backgroundColor: 'white',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          color: '#374151'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6'
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                          e.target.style.backgroundColor = '#F8FAFC'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E5E7EB'
                          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                          e.target.style.backgroundColor = 'white'
                        }}
                      />
                    </div>
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#6B7280',
                    fontSize: '12px',
                    verticalAlign: 'top'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginBottom: '4px',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Status
                      </div>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{
                          padding: '6px 10px',
                          border: '1px solid #E5E7EB',
                          borderRadius: '6px',
                          fontSize: '11px',
                          width: '100px',
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          backgroundColor: 'white',
                          cursor: 'pointer',
                          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                          color: '#374151',
                          appearance: 'none',
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 6px center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '16px',
                          paddingRight: '28px'
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = '#3B82F6'
                          e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)'
                          e.target.style.backgroundColor = '#F8FAFC'
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = '#E5E7EB'
                          e.target.style.boxShadow = '0 1px 2px rgba(0, 0, 0, 0.05)'
                          e.target.style.backgroundColor = 'white'
                        }}
                      >
                        <option value="" style={{ color: '#6B7280' }}>All</option>
                        <option value="in_progress" style={{ 
                          color: '#F59E0B',
                          backgroundColor: '#FFFBEB'
                        }}>In Progress</option>
                        <option value="interview_scheduled" style={{ 
                          color: '#3B82F6',
                          backgroundColor: '#EFF6FF'
                        }}>Interview Scheduled</option>
                        <option value="offered" style={{ 
                          color: '#10B981',
                          backgroundColor: '#ECFDF5'
                        }}>Offered</option>
                        <option value="rejected" style={{ 
                          color: '#EF4444',
                          backgroundColor: '#FEF2F2'
                        }}>Rejected</option>
                      </select>
                    </div>
                  </th>
                  <th style={{
                    padding: '12px 16px',
                    textAlign: 'left',
                    fontWeight: '500',
                    color: '#6B7280',
                    fontSize: '12px',
                    verticalAlign: 'top'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      marginBottom: '4px',
                      gap: '8px'
                    }}>
                      <div style={{
                        fontWeight: '600',
                        color: '#374151',
                        fontSize: '13px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Applied On
                      </div>
                      <div style={{
                        padding: '6px 10px',
                        border: '1px solid #E5E7EB',
                        borderRadius: '6px',
                        fontSize: '11px',
                        width: '100px',
                        backgroundColor: '#F8FAFC',
                        color: '#6B7280',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        textAlign: 'center',
                        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                      onClick={() => handleSort('applied_on')}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F1F5F9'
                        e.currentTarget.style.borderColor = '#CBD5E1'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#F8FAFC'
                        e.currentTarget.style.borderColor = '#E5E7EB'
                      }}
                      >
                        <span style={{ fontSize: '10px' }}>
                          {sortBy === 'applied_on' ? (sortDirection === 'asc' ? '↑' : '↓') : '↕'}
                        </span>
                        <span style={{ fontSize: '10px' }}>Sort</span>
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedJobs.length > 0 ? (
                  sortedJobs.map((job, index) => (
                    <tr
                      key={job.id}
                      style={{
                        borderBottom: '1px solid #F3F4F6',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s ease',
                        backgroundColor: index % 2 === 0 ? 'white' : '#F9FAFB'
                      }}
                      onClick={() => navigate(`/job/${job.user_job_id}`)}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F0F9FF'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = index % 2 === 0 ? 'white' : '#F9FAFB'
                      }}
                    >
                      <td style={{
                        padding: '16px 24px',
                        color: '#6B7280',
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        textAlign: 'center'
                      }}>
                        {((currentPage - 1) * 10) + index + 1}
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        fontWeight: '500',
                        color: '#1F2937',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <CompanyLogo companyName={job.company} />
                          <div>
                            <div style={{ 
                              fontWeight: '600', 
                              color: '#1F2937', 
                              marginBottom: '2px'
                            }}>
                              {formatCompanyName(job.company)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6B7280' }}>
                              {job.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        color: '#6B7280',
                        fontSize: '14px'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '12px' }}>📍</span>
                          {job.location && job.location.trim() !== '' ? job.location : '-'}
                        </div>
                      </td>
                      <td style={{
                        padding: '16px 24px'
                      }}>
                        {job.status && (
                          <span style={{
                            padding: '6px 12px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: '600',
                            color: getStatusColor(job.status),
                            backgroundColor: getStatusBgColor(job.status),
                            border: `1px solid ${getStatusColor(job.status)}20`
                          }}>
                            {formatStatus(job.status)}
                          </span>
                        )}
                      </td>
                      <td style={{
                        padding: '16px 24px',
                        color: '#6B7280',
                        fontSize: '13px'
                      }}>
                        {new Date(job.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{
                      padding: '60px 24px',
                      textAlign: 'center',
                      color: '#6B7280',
                      fontSize: '14px',
                      backgroundColor: 'white'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '20px' }}>🔍</div>
                      <h3 style={{ color: '#374151', marginBottom: '10px', fontSize: '16px' }}>
                        No jobs found matching your filters
                      </h3>
                      <p style={{ color: '#6B7280', marginBottom: '20px', fontSize: '13px' }}>
                        Try adjusting your search criteria or clear the filters
                      </p>
                      <button 
                        onClick={clearFilters}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#3B82F6',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#2563EB'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#3B82F6'
                        }}
                      >
                        Clear All Filters
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '12px',
              padding: '24px',
              borderTop: '1px solid #E5E7EB',
              backgroundColor: '#F9FAFB'
            }}>
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  backgroundColor: currentPage === 1 ? '#F3F4F6' : 'white',
                  color: currentPage === 1 ? '#9CA3AF' : '#374151',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== 1) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                Previous
              </button>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                color: '#6B7280'
              }}>
                <span>Page</span>
                <span style={{ fontWeight: '600', color: '#374151' }}>{currentPage}</span>
                <span>of</span>
                <span style={{ fontWeight: '600', color: '#374151' }}>{totalPages}</span>
                <span>({totalCount} total jobs)</span>
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '6px',
                  backgroundColor: currentPage === totalPages ? '#F3F4F6' : 'white',
                  color: currentPage === totalPages ? '#9CA3AF' : '#374151',
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = '#F3F4F6'
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentPage !== totalPages) {
                    e.currentTarget.style.backgroundColor = 'white'
                  }
                }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* CSS for loading animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Add Job Modal */}
      <AddJobModal
        isOpen={isAddJobModalOpen}
        onClose={() => setIsAddJobModalOpen(false)}
        auth_user_id={auth_user_id}
        onJobCreated={handleJobCreated}
      />
    </div>
  )
}

export default Dashboard
