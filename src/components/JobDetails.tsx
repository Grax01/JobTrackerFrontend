import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { buildApiUrl, API_ENDPOINTS } from '../utils/api.ts'

interface InterviewRound {
  id: string
  user_job_id: string
  round_type: string
  experience_summary: string
  created_at: string
}

interface Note {
  id: string
  user_job_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

interface JobData {
  job_post: {
    id: string
    title: string
    company: string
    location: string
    tech_stack: string[]
    experience_years: number
    experience_months: number
    description: string
    source_url?: string
    created_at: string
  }
  user_job: {
    id: string
    status: string
    applied_at: string
  }
  interview_experiences?: InterviewRound[]
  notes?: Note[]
}

// JobDetailsResponse interface removed as it's not being used

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
const CompanyLogo = ({ companyName, size = 80 }: { companyName: string; size?: number }) => {
  const [logoError, setLogoError] = useState(false)
  const formattedName = formatCompanyName(companyName)
  const logoUrl = `https://logo.clearbit.com/${companyName.toLowerCase()}.com`

  return (
    <div style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: logoError ? '#f1f3f4' : 'transparent',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: logoError ? '28px' : '0px',
      color: logoError ? '#5f6368' : 'transparent',
      fontWeight: '600',
      border: logoError ? '1px solid #e8eaed' : 'none',
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
            borderRadius: '12px'
          }}
          onError={() => setLogoError(true)}
        />
      ) : (
        formattedName.charAt(0).toUpperCase()
      )}
    </div>
  )
}

const JobDetails = ({ auth_user_id }: { auth_user_id: string }) => {
  const { userJobId } = useParams()
  const navigate = useNavigate()
  const [jobData, setJobData] = useState<JobData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [showInterviewForm, setShowInterviewForm] = useState(false)
  const [interviewData, setInterviewData] = useState({
    roundType: "",
    experienceSummary: ""
  })
  const [submittingInterview, setSubmittingInterview] = useState(false)
  const [expandedInterviews, setExpandedInterviews] = useState(new Set())
  
  // Notes state
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteData, setNoteData] = useState({
    title: "",
    content: ""
  })
  const [submittingNote, setSubmittingNote] = useState(false)
  const [expandedNotes, setExpandedNotes] = useState(new Set())
  const [notes, setNotes] = useState<Note[]>([])

  // Confirmation dialog state
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [deleteItemType, setDeleteItemType] = useState("") // "note" or "interview"
  const [deleteItemId, setDeleteItemId] = useState("")
  const [deleteItemTitle, setDeleteItemTitle] = useState("")

  useEffect(() => {
    if (!userJobId || !auth_user_id) return

    console.log('🔍 JobDetails: Fetching job data for userJobId:', userJobId, 'auth_user_id:', auth_user_id)
    
    const fetchJobData = async () => {
      try {
        const params = new URLSearchParams({
          auth_user_id: auth_user_id
        })
        
        const apiUrl = `${buildApiUrl(API_ENDPOINTS.USER_JOB_DETAILS(userJobId!))}?${params.toString()}`
        console.log('📡 JobDetails: Making API call to:', apiUrl)
        
        const res = await axios.get(apiUrl)
        console.log('✅ JobDetails: API response received:', {
          status: res.status,
          data: res.data
        })
        
        setJobData(res.data)
        setNotes(res.data.notes || [])
        setLoading(false)
      } catch (err) {
        console.error('❌ JobDetails: Error fetching job data:', err)
        console.error('❌ JobDetails: Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
        setError("Failed to fetch job details")
        setLoading(false)
      }
    }

    fetchJobData()
  }, [userJobId, auth_user_id])

  const validStatuses = ["in_progress", "interview_scheduled", "offered", "rejected"]

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'interview_scheduled': return '#2196F3'
      case 'in_progress': return '#FF9800'
      case 'offered': return '#4CAF50'
      case 'rejected': return '#F44336'
      default: return '#9E9E9E'
    }
  }

  const formatStatusName = (status: string) => {
    switch (status) {
      case 'in_progress': return 'In Progress'
      case 'interview_scheduled': return 'Interview Scheduled'
      case 'offered': return 'Offered'
      case 'rejected': return 'Rejected'
      default: return status.replace('_', ' ')
    }
  }

  const handleStatusUpdate = async (newStatus: string) => {
    if (!jobData) return
    
    setUpdatingStatus(true)
    try {
              await axios.put(buildApiUrl(API_ENDPOINTS.JOB_POST_STATUS(jobData.job_post.id)), {
        status: newStatus
      })
      
      // Update local state
      setJobData({
        ...jobData,
        user_job: {
          ...jobData.user_job,
          status: newStatus
        }
      })
    } catch (err) {
      setError("Failed to update status")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const handleInterviewSubmit = async () => {
    if (!jobData || !interviewData.experienceSummary.trim() || !interviewData.roundType.trim()) return
    
    setSubmittingInterview(true)
    try {
              await axios.post(buildApiUrl(API_ENDPOINTS.JOB_POST_INTERVIEW(jobData.job_post.id)), {
        round_type: interviewData.roundType,
        experience_summary: interviewData.experienceSummary
      })
      
      // Reset form and hide it
      setInterviewData({ roundType: "", experienceSummary: "" })
      setShowInterviewForm(false)
      setError("") // Clear any previous errors
      
      // Refresh job data to get updated interview experiences
      const params = new URLSearchParams({
        auth_user_id: auth_user_id
      })
      const res = await axios.get(`http://localhost:8081/user_jobs/job/${userJobId}?${params.toString()}`)
      setJobData(res.data)
    } catch (err) {
      setError("Failed to submit interview experience")
    } finally {
      setSubmittingInterview(false)
    }
  }

  const handleNoteSubmit = async () => {
    if (!jobData || !noteData.title.trim()) return
    
    setSubmittingNote(true)
    try {
              await axios.post(buildApiUrl(API_ENDPOINTS.JOB_POST_NOTES(jobData.job_post.id)), {
        title: noteData.title,
        content: noteData.content
      })
      
      // Reset form and hide it
      setNoteData({ title: "", content: "" })
      setShowNoteForm(false)
      setError("") // Clear any previous errors
      
      // Refresh job data to get updated notes
      const params = new URLSearchParams({
        auth_user_id: auth_user_id
      })
      const res = await axios.get(`${buildApiUrl(API_ENDPOINTS.USER_JOB_DETAILS(userJobId!))}?${params.toString()}`)
      setJobData(res.data)
      setNotes(res.data.notes || [])
    } catch (err) {
      setError("Failed to submit note")
    } finally {
      setSubmittingNote(false)
    }
  }

  const handleNoteDelete = async (noteId) => {
    try {
      await axios.delete(buildApiUrl(API_ENDPOINTS.NOTES(noteId)))
      
      // Refresh job data to get updated notes
      const params = new URLSearchParams({
        auth_user_id: auth_user_id
      })
      const res = await axios.get(`${buildApiUrl(API_ENDPOINTS.USER_JOB_DETAILS(userJobId!))}?${params.toString()}`)
      setJobData(res.data)
      setNotes(res.data.notes || [])
    } catch (err) {
      setError("Failed to delete note")
    }
  }

  const handleInterviewDelete = async (interviewId) => {
    try {
      await axios.delete(buildApiUrl(API_ENDPOINTS.INTERVIEW(interviewId)))
      
      // Refresh job data to get updated interview experiences
      const params = new URLSearchParams({
        auth_user_id: auth_user_id
      })
      const res = await axios.get(`${buildApiUrl(API_ENDPOINTS.USER_JOB_DETAILS(userJobId!))}?${params.toString()}`)
      setJobData(res.data)
    } catch (err) {
      setError("Failed to delete interview experience")
    }
  }

  const showDeleteConfirmationDialog = (type, id, title) => {
    setDeleteItemType(type)
    setDeleteItemId(id)
    setDeleteItemTitle(title)
    setShowDeleteConfirmation(true)
  }

  const handleConfirmDelete = async () => {
    try {
      if (deleteItemType === "note") {
        await handleNoteDelete(deleteItemId)
      } else if (deleteItemType === "interview") {
        await handleInterviewDelete(deleteItemId)
      }
      setShowDeleteConfirmation(false)
      setDeleteItemType("")
      setDeleteItemId("")
      setDeleteItemTitle("")
    } catch (err) {
      setError("Failed to delete item")
    }
  }

  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false)
    setDeleteItemType("")
    setDeleteItemId("")
    setDeleteItemTitle("")
  }

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '200px' 
    }}>
      <div style={{ fontSize: '18px', color: '#666' }}>Loading job details...</div>
    </div>
  )
  
  if (error) return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px', 
      color: '#f44336' 
    }}>
      {error}
    </div>
  )

  if (!jobData) return (
    <div style={{ 
      textAlign: 'center', 
      padding: '20px', 
      color: '#f44336' 
    }}>
      Job not found
    </div>
  )

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '20px'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 20px',
            backgroundColor: 'white',
            color: '#495057',
            border: '1px solid #dee2e6',
            borderRadius: '25px',
            cursor: 'pointer',
            fontSize: '14px',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
          }}
        >
          ← Back to Dashboard
        </button>

        {/* Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '30px',
          alignItems: 'start'
        }}>
          {/* Left Column - Main Job Details */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid #e8eaed',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Decorative background elements */}
            <div style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '200px',
              height: '200px',
              background: 'linear-gradient(45deg, #667eea, #764ba2)',
              borderRadius: '50%',
              opacity: '0.08'
            }} />
            <div style={{
              position: 'absolute',
              bottom: '-30px',
              left: '-30px',
              width: '150px',
              height: '150px',
              background: 'linear-gradient(45deg, #764ba2, #667eea)',
              borderRadius: '50%',
              opacity: '0.08'
            }} />

            {/* Status badge */}
            {jobData.user_job.status && (
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                padding: '10px 24px',
                borderRadius: '25px',
                fontSize: '12px',
                fontWeight: 'bold',
                color: 'white',
                backgroundColor: getStatusColor(jobData.user_job.status),
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                zIndex: 10
              }}>
                {jobData.user_job.status.replace('_', ' ')}
              </div>
            )}

            {/* Header section */}
            <div style={{ marginBottom: '40px', position: 'relative', zIndex: 1 }}>
              <div style={{ marginBottom: '25px' }}>
                <CompanyLogo companyName={jobData.job_post.company} size={90} />
              </div>
              
              <h1 style={{ 
                margin: '0 0 15px 0', 
                fontSize: '32px',
                color: '#1a1a1a',
                fontWeight: '700',
                lineHeight: '1.2'
              }}>
                {jobData.job_post.title}
              </h1>
              
              <h2 style={{ 
                margin: '0 0 12px 0', 
                fontSize: '20px',
                color: '#5f6368',
                fontWeight: '600'
              }}>
                {formatCompanyName(jobData.job_post.company)}
              </h2>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px',
                marginBottom: '25px'
              }}>
                <div style={{
                  padding: '8px 16px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '20px',
                  fontSize: '14px',
                  color: '#5f6368',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #e8eaed',
                  fontWeight: '500'
                }}>
                  📍 {jobData.job_post.location}
                </div>
              </div>
            </div>

            {/* Experience section */}
            <div style={{ 
              marginBottom: '35px',
              padding: '30px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '18px',
              border: '1px solid #e9ecef',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)'
              }} />
              <h3 style={{ 
                margin: '0 0 20px 0', 
                fontSize: '20px',
                color: '#2c3e50',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>⏱️</span>
                Experience Required
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}>
                <div style={{
                  padding: '15px 25px',
                  backgroundColor: 'white',
                  borderRadius: '15px',
                  fontSize: '18px',
                  color: '#2c3e50',
                  fontWeight: '700',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.1)',
                  border: '1px solid #e9ecef'
                }}>
                  {jobData.job_post.experience_years} years, {jobData.job_post.experience_months} months
                </div>
              </div>
            </div>

            {/* Tech stack section */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{ 
                margin: '0 0 25px 0', 
                fontSize: '20px',
                color: '#2c3e50',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>💻</span>
                Tech Stack
              </h3>
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '15px'
              }}>
                {jobData.job_post.tech_stack.map((tech, index) => (
                  <span
                    key={index}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#f8f9fa',
                      color: '#5f6368',
                      border: '1px solid #e8eaed',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      cursor: 'default'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-3px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)'
                      e.currentTarget.style.backgroundColor = '#667eea'
                      e.currentTarget.style.color = 'white'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.backgroundColor = '#f8f9fa'
                      e.currentTarget.style.color = '#5f6368'
                    }}
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Description section */}
            <div style={{ marginBottom: '35px' }}>
              <h3 style={{ 
                margin: '0 0 25px 0', 
                fontSize: '20px',
                color: '#2c3e50',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '24px' }}>📝</span>
                Description
              </h3>
              <div style={{
                padding: '30px',
                backgroundColor: '#f8f9fa',
                borderRadius: '18px',
                border: '1px solid #e9ecef',
                position: 'relative'
              }}>
                <p style={{ 
                  margin: '0', 
                  fontSize: '16px',
                  color: '#555',
                  lineHeight: '1.8',
                  fontWeight: '400'
                }}>
                  {jobData.job_post.description}
                </p>
              </div>
            </div>

            {/* Source URL section */}
            {jobData.job_post.source_url && (
              <div style={{ marginBottom: '35px' }}>
                <h3 style={{ 
                  margin: '0 0 25px 0', 
                  fontSize: '20px',
                  color: '#2c3e50',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>🔗</span>
                  Job Posting Link
                </h3>
                <a 
                  href={jobData.job_post.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 24px',
                    backgroundColor: '#667eea',
                    color: 'white',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    borderRadius: '25px',
                    border: 'none',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}
                >
                  View Original Posting →
                </a>
              </div>
            )}

            {/* Status Update Section */}
            <div style={{ 
              marginTop: '40px',
              padding: '35px',
              background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '20px',
              border: '1px solid #e9ecef',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute',
                top: '0',
                left: '0',
                width: '100%',
                height: '4px',
                background: 'linear-gradient(90deg, #667eea, #764ba2)'
              }} />
              <h3 style={{ 
                margin: '0 0 30px 0', 
                fontSize: '22px',
                color: '#2c3e50',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <span style={{ fontSize: '26px' }}>🔄</span>
                Update Application Status
              </h3>
              <div style={{ 
                display: 'flex', 
                gap: '15px',
                flexWrap: 'wrap'
              }}>
                {validStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => handleStatusUpdate(status)}
                    disabled={updatingStatus || jobData.user_job.status === status}
                    style={{
                      padding: '14px 28px',
                      backgroundColor: jobData.user_job.status === status ? getStatusColor(status) : 'white',
                      color: jobData.user_job.status === status ? 'white' : '#2c3e50',
                      border: jobData.user_job.status === status ? 'none' : '2px solid #e9ecef',
                      borderRadius: '25px',
                      cursor: updatingStatus ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      opacity: updatingStatus ? 0.6 : 1,
                      transition: 'all 0.3s ease',
                      boxShadow: jobData.user_job.status === status ? '0 6px 20px rgba(0,0,0,0.2)' : '0 4px 15px rgba(0,0,0,0.1)'
                    }}
                    onMouseEnter={(e) => {
                      if (!updatingStatus && jobData.user_job.status !== status) {
                        e.currentTarget.style.transform = 'translateY(-3px)'
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!updatingStatus && jobData.user_job.status !== status) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    {formatStatusName(status)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Application Timeline */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid #e8eaed',
            position: 'sticky',
            top: '20px',
            height: 'fit-content'
          }}>
            <h3 style={{ 
              margin: '0 0 25px 0', 
              fontSize: '22px',
              color: '#1a1a1a',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '26px' }}>📅</span>
              Application Timeline
            </h3>
            
            {/* Timeline */}
            <div style={{ position: 'relative' }}>
              {/* Timeline line */}
              <div style={{
                position: 'absolute',
                left: '20px',
                top: '0',
                bottom: '0',
                width: '2px',
                backgroundColor: '#e9ecef',
                zIndex: 1
              }} />
              
              {/* Timeline items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                {/* Job Posted */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#667eea',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                  }}>
                    📋
                  </div>
                  <div style={{
                    marginLeft: '60px',
                    marginTop: '-30px'
                  }}>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a1a1a'
                    }}>
                      Job Posted
                    </h4>
                    <p style={{
                      margin: '0 0 5px 0',
                      fontSize: '14px',
                      color: '#5f6368'
                    }}>
                      {new Date(jobData.job_post.created_at).toLocaleDateString()}
                    </p>
                    <p style={{
                      margin: '0',
                      fontSize: '12px',
                      color: '#9aa0a6'
                    }}>
                      Job listing created
                    </p>
                  </div>
                </div>

                {/* Applied */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: '#4CAF50',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                  }}>
                    ✅
                  </div>
                  <div style={{
                    marginLeft: '60px',
                    marginTop: '-30px'
                  }}>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a1a1a'
                    }}>
                      Applied
                    </h4>
                    <p style={{
                      margin: '0 0 5px 0',
                      fontSize: '14px',
                      color: '#5f6368'
                    }}>
                      {new Date(jobData.user_job.applied_at).toLocaleDateString()}
                    </p>
                    <p style={{
                      margin: '0',
                      fontSize: '12px',
                      color: '#9aa0a6'
                    }}>
                      Application submitted
                    </p>
                  </div>
                </div>

                {/* Current Status */}
                <div style={{ position: 'relative', zIndex: 2 }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: getStatusColor(jobData.user_job.status),
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    boxShadow: `0 4px 15px ${getStatusColor(jobData.user_job.status)}40`
                  }}>
                    {jobData.user_job.status === 'interview_scheduled' ? '📞' :
                     jobData.user_job.status === 'in_progress' ? '🔄' :
                     jobData.user_job.status === 'offered' ? '🎉' :
                     jobData.user_job.status === 'rejected' ? '❌' : '📋'}
                  </div>
                  <div style={{
                    marginLeft: '60px',
                    marginTop: '-30px'
                  }}>
                    <h4 style={{
                      margin: '0 0 8px 0',
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#1a1a1a'
                    }}>
                      {jobData.user_job.status.replace('_', ' ')}
                    </h4>
                    <p style={{
                      margin: '0 0 5px 0',
                      fontSize: '14px',
                      color: '#5f6368'
                    }}>
                      Current status
                    </p>
                    <p style={{
                      margin: '0',
                      fontSize: '12px',
                      color: '#9aa0a6'
                    }}>
                      {jobData.user_job.status === 'interview_scheduled' ? 'Interview scheduled' :
                       jobData.user_job.status === 'in_progress' ? 'Application in progress' :
                       jobData.user_job.status === 'offered' ? 'Offer received' :
                       jobData.user_job.status === 'rejected' ? 'Application rejected' : 'Status updated'}
                    </p>
                  </div>
                </div>

                {/* Interview Experiences Count */}
                {jobData.interview_experiences && jobData.interview_experiences.length > 0 && (
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#FF9800',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
                    }}>
                      🎯
                    </div>
                    <div style={{
                      marginLeft: '60px',
                      marginTop: '-30px'
                    }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a1a1a'
                      }}>
                        Interviews
                      </h4>
                      <p style={{
                        margin: '0 0 5px 0',
                        fontSize: '14px',
                        color: '#5f6368'
                      }}>
                        {jobData.interview_experiences.length} completed
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '12px',
                        color: '#9aa0a6'
                      }}>
                        Interview experiences recorded
                      </p>
                    </div>
                  </div>
                )}

                {/* Notes Count */}
                {notes && notes.length > 0 && (
                  <div style={{ position: 'relative', zIndex: 2 }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#9C27B0',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: 'bold',
                      boxShadow: '0 4px 15px rgba(156, 39, 176, 0.3)'
                    }}>
                      📝
                    </div>
                    <div style={{
                      marginLeft: '60px',
                      marginTop: '-30px'
                    }}>
                      <h4 style={{
                        margin: '0 0 8px 0',
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#1a1a1a'
                      }}>
                        Notes
                      </h4>
                      <p style={{
                        margin: '0 0 5px 0',
                        fontSize: '14px',
                        color: '#5f6368'
                      }}>
                        {notes.length} notes
                      </p>
                      <p style={{
                        margin: '0',
                        fontSize: '12px',
                        color: '#9aa0a6'
                      }}>
                        Personal notes added
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div style={{
              marginTop: '40px',
              padding: '25px',
              backgroundColor: '#f8f9fa',
              borderRadius: '15px',
              border: '1px solid #e9ecef'
            }}>
              <h4 style={{
                margin: '0 0 20px 0',
                fontSize: '18px',
                fontWeight: '600',
                color: '#1a1a1a'
              }}>
                Quick Stats
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <span style={{ fontSize: '14px', color: '#5f6368' }}>Days since applied:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#1a1a1a',
                    fontSize: '14px'
                  }}>
                    {Math.floor((new Date().getTime() - new Date(jobData.user_job.applied_at).getTime()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  backgroundColor: 'white',
                  borderRadius: '10px',
                  border: '1px solid #e9ecef'
                }}>
                  <span style={{ fontSize: '14px', color: '#5f6368' }}>Tech stack items:</span>
                  <span style={{ 
                    fontWeight: '600', 
                    color: '#1a1a1a',
                    fontSize: '14px'
                  }}>
                    {jobData.job_post.tech_stack.length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interview Experience Section */}
        {jobData.user_job.status === 'interview_scheduled' && (
          <div style={{ 
            marginTop: '30px',
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid #e8eaed'
          }}>
            <h3 style={{ 
              margin: '0 0 25px 0', 
              fontSize: '22px',
              color: '#1a1a1a',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '26px' }}>🎯</span>
              Interview Experience
            </h3>
            
            {!showInterviewForm ? (
              <button
                onClick={() => setShowInterviewForm(true)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)'
                }}
              >
                + Add Interview Experience
              </button>
            ) : (
              <div style={{ 
                marginTop: '20px',
                padding: '30px',
                backgroundColor: '#f8f9fa',
                borderRadius: '15px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1a1a1a'
                  }}>
                    Round Type:
                  </label>
                  <input
                    type="text"
                    value={interviewData.roundType}
                    onChange={(e) => setInterviewData({
                      ...interviewData,
                      roundType: e.target.value
                    })}
                    placeholder="e.g., DSA, System Design, Behavioral, Technical, etc."
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '14px',
                      backgroundColor: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                
                <div style={{ marginBottom: '25px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#1a1a1a'
                  }}>
                    Experience Summary:
                  </label>
                  <textarea
                    value={interviewData.experienceSummary}
                    onChange={(e) => setInterviewData({
                      ...interviewData,
                      experienceSummary: e.target.value
                    })}
                    placeholder="Describe your interview experience, questions asked, challenges faced, etc."
                    style={{
                      width: '100%',
                      minHeight: '120px',
                      padding: '16px',
                      border: '1px solid #e9ecef',
                      borderRadius: '10px',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      backgroundColor: 'white',
                      transition: 'all 0.3s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#667eea'
                      e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)'
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e9ecef'
                      e.target.style.boxShadow = 'none'
                    }}
                  />
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  gap: '15px',
                  justifyContent: 'flex-end'
                }}>
                  <button
                    onClick={() => {
                      setShowInterviewForm(false)
                      setInterviewData({ roundType: "", experienceSummary: "" })
                    }}
                    disabled={submittingInterview}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#f8f9fa',
                      color: '#5f6368',
                      border: '1px solid #e9ecef',
                      borderRadius: '25px',
                      cursor: submittingInterview ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.3s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!submittingInterview) {
                        e.currentTarget.style.backgroundColor = '#e9ecef'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!submittingInterview) {
                        e.currentTarget.style.backgroundColor = '#f8f9fa'
                      }
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInterviewSubmit}
                    disabled={submittingInterview || !interviewData.experienceSummary.trim() || !interviewData.roundType.trim()}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: submittingInterview ? 'not-allowed' : 'pointer',
                      fontSize: '14px',
                      fontWeight: '600',
                      opacity: submittingInterview || !interviewData.experienceSummary.trim() || !interviewData.roundType.trim() ? 0.6 : 1,
                      transition: 'all 0.3s ease',
                      boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      if (!submittingInterview && interviewData.experienceSummary.trim() && interviewData.roundType.trim()) {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(76, 175, 80, 0.4)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!submittingInterview && interviewData.experienceSummary.trim() && interviewData.roundType.trim()) {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 15px rgba(76, 175, 80, 0.3)'
                      }
                    }}
                  >
                    {submittingInterview ? 'Submitting...' : 'Submit Experience'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview Experiences Display */}
        {jobData.interview_experiences && jobData.interview_experiences.length > 0 && (
          <div style={{ 
            marginTop: '30px',
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid #e8eaed'
          }}>
            <h3 style={{ 
              margin: '0 0 30px 0', 
              fontSize: '22px',
              color: '#1a1a1a',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '26px' }}>🎯</span>
              Interview Experiences ({jobData.interview_experiences.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {jobData.interview_experiences.map((experience) => (
                <div
                  key={experience.id}
                  style={{
                    border: '1px solid #e9ecef',
                    borderRadius: '15px',
                    backgroundColor: '#f8f9fa',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Interview Card Header */}
                  <div
                    onClick={() => {
                      const newExpanded = new Set(expandedInterviews)
                      if (newExpanded.has(experience.id)) {
                        newExpanded.delete(experience.id)
                      } else {
                        newExpanded.add(experience.id)
                      }
                      setExpandedInterviews(newExpanded)
                    }}
                    style={{
                      padding: '20px 25px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: expandedInterviews.has(experience.id) ? '1px solid #e9ecef' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '18px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(76, 175, 80, 0.3)'
                      }}>
                        {experience.round_type.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '18px',
                          color: '#1a1a1a',
                          fontWeight: '600'
                        }}>
                          {experience.round_type}
                        </h4>
                        <p style={{ 
                          margin: '0', 
                          fontSize: '14px',
                          color: '#5f6368'
                        }}>
                          {new Date(experience.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          showDeleteConfirmationDialog("interview", experience.id, experience.round_type)
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        Delete
                      </button>
                      <div style={{
                        fontSize: '20px',
                        color: '#5f6368',
                        transition: 'transform 0.3s ease',
                        transform: expandedInterviews.has(experience.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        ▼
                      </div>
                    </div>
                  </div>
                  
                  {/* Interview Card Content */}
                  {expandedInterviews.has(experience.id) && (
                    <div style={{ padding: '25px' }}>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #e9ecef'
                      }}>
                        <h5 style={{ 
                          margin: '0 0 15px 0', 
                          fontSize: '16px',
                          color: '#1a1a1a',
                          fontWeight: '600'
                        }}>
                          Experience Summary:
                        </h5>
                        <p style={{ 
                          margin: '0', 
                          fontSize: '15px',
                          color: '#555',
                          lineHeight: '1.7',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {experience.experience_summary}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes Section */}
        <div style={{ 
          marginTop: '30px',
          background: 'white',
          borderRadius: '20px',
          padding: '40px',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
          border: '1px solid #e8eaed'
        }}>
          <h3 style={{ 
            margin: '0 0 25px 0', 
            fontSize: '22px',
            color: '#1a1a1a',
            fontWeight: '700',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <span style={{ fontSize: '26px' }}>📝</span>
            Notes
          </h3>
          
          {!showNoteForm ? (
            <button
              onClick={() => setShowNoteForm(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#FF9800',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 152, 0, 0.4)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)'
              }}
            >
              + Add Note
            </button>
          ) : (
            <div style={{ 
              marginTop: '20px',
              padding: '30px',
              backgroundColor: '#fff8e1',
              borderRadius: '15px',
              border: '1px solid #ffcc80'
            }}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>
                  Title:
                </label>
                <input
                  type="text"
                  value={noteData.title}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    title: e.target.value
                  })}
                  placeholder="Enter note title"
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: '1px solid #ffcc80',
                    borderRadius: '10px',
                    fontSize: '14px',
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FF9800'
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ffcc80'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              
              <div style={{ marginBottom: '25px' }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>
                  Content:
                </label>
                <textarea
                  value={noteData.content}
                  onChange={(e) => setNoteData({
                    ...noteData,
                    content: e.target.value
                  })}
                  placeholder="Enter note content"
                  style={{
                    width: '100%',
                    minHeight: '100px',
                    padding: '16px',
                    border: '1px solid #ffcc80',
                    borderRadius: '10px',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                    resize: 'vertical',
                    backgroundColor: 'white',
                    transition: 'all 0.3s ease'
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FF9800'
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 152, 0, 0.1)'
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#ffcc80'
                    e.target.style.boxShadow = 'none'
                  }}
                />
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: '15px',
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => {
                    setShowNoteForm(false)
                    setNoteData({ title: "", content: "" })
                  }}
                  disabled={submittingNote}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#f8f9fa',
                    color: '#5f6368',
                    border: '1px solid #e9ecef',
                    borderRadius: '25px',
                    cursor: submittingNote ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!submittingNote) {
                      e.currentTarget.style.backgroundColor = '#e9ecef'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submittingNote) {
                      e.currentTarget.style.backgroundColor = '#f8f9fa'
                    }
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleNoteSubmit}
                  disabled={submittingNote || !noteData.title.trim()}
                  style={{
                    padding: '12px 24px',
                    backgroundColor: '#FF9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: submittingNote ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    opacity: submittingNote || !noteData.title.trim() ? 0.6 : 1,
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    if (!submittingNote && noteData.title.trim()) {
                      e.currentTarget.style.transform = 'translateY(-2px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 152, 0, 0.4)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!submittingNote && noteData.title.trim()) {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 152, 0, 0.3)'
                    }
                  }}
                >
                  {submittingNote ? 'Submitting...' : 'Submit Note'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Notes Display */}
        {notes && notes.length > 0 && (
          <div style={{ 
            marginTop: '20px',
            background: 'white',
            borderRadius: '20px',
            padding: '40px',
            boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
            border: '1px solid #e8eaed'
          }}>
            <h3 style={{ 
              margin: '0 0 30px 0', 
              fontSize: '22px',
              color: '#1a1a1a',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{ fontSize: '26px' }}>📝</span>
              Notes ({notes.length})
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    border: '1px solid #ffcc80',
                    borderRadius: '15px',
                    backgroundColor: '#fff8e1',
                    overflow: 'hidden',
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 152, 0, 0.2)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = 'none'
                  }}
                >
                  {/* Note Card Header */}
                  <div
                    onClick={() => {
                      const newExpanded = new Set(expandedNotes)
                      if (newExpanded.has(note.id)) {
                        newExpanded.delete(note.id)
                      } else {
                        newExpanded.add(note.id)
                      }
                      setExpandedNotes(newExpanded)
                    }}
                    style={{
                      padding: '20px 25px',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: expandedNotes.has(note.id) ? '1px solid #ffcc80' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        backgroundColor: '#FF9800',
                        color: 'white',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '20px',
                        fontWeight: 'bold',
                        boxShadow: '0 4px 15px rgba(255, 152, 0, 0.3)'
                      }}>
                        📝
                      </div>
                      <div>
                        <h4 style={{ 
                          margin: '0 0 8px 0', 
                          fontSize: '18px',
                          color: '#1a1a1a',
                          fontWeight: '600'
                        }}>
                          {note.title}
                        </h4>
                        <p style={{ 
                          margin: '0', 
                          fontSize: '14px',
                          color: '#5f6368'
                        }}>
                          {new Date(note.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          showDeleteConfirmationDialog("note", note.id, note.title)
                        }}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#f44336',
                          color: 'white',
                          border: 'none',
                          borderRadius: '20px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '600',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-1px)'
                          e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.3)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)'
                          e.currentTarget.style.boxShadow = 'none'
                        }}
                      >
                        Delete
                      </button>
                      <div style={{
                        fontSize: '20px',
                        color: '#5f6368',
                        transition: 'transform 0.3s ease',
                        transform: expandedNotes.has(note.id) ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}>
                        ▼
                      </div>
                    </div>
                  </div>
                  
                  {/* Note Card Content */}
                  {expandedNotes.has(note.id) && (
                    <div style={{ padding: '25px' }}>
                      <div style={{
                        backgroundColor: 'white',
                        padding: '20px',
                        borderRadius: '12px',
                        border: '1px solid #ffcc80'
                      }}>
                        <h5 style={{ 
                          margin: '0 0 15px 0', 
                          fontSize: '16px',
                          color: '#1a1a1a',
                          fontWeight: '600'
                        }}>
                          Content:
                        </h5>
                        <p style={{ 
                          margin: '0', 
                          fontSize: '15px',
                          color: '#555',
                          lineHeight: '1.7',
                          whiteSpace: 'pre-wrap'
                        }}>
                          {note.content || 'No content'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '40px',
            maxWidth: '450px',
            width: '90%',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            textAlign: 'center',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              backgroundColor: '#f44336',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              fontSize: '24px',
              color: 'white'
            }}>
              ⚠️
            </div>
            <h3 style={{
              margin: '0 0 20px 0',
              fontSize: '24px',
              color: '#1a1a1a',
              fontWeight: '700'
            }}>
              Confirm Delete
            </h3>
            <p style={{
              margin: '0 0 30px 0',
              fontSize: '16px',
              color: '#5f6368',
              lineHeight: '1.6'
            }}>
              Are you sure you want to delete this {deleteItemType === "note" ? "note" : "interview experience"}?
              {deleteItemTitle && (
                <span style={{ fontWeight: '600', color: '#1a1a1a' }}>
                  <br />"{deleteItemTitle}"
                </span>
              )}
              <br /><br />
              This action cannot be undone.
            </p>
            <div style={{
              display: 'flex',
              gap: '15px',
              justifyContent: 'center'
            }}>
              <button
                onClick={handleCancelDelete}
                style={{
                  padding: '14px 28px',
                  backgroundColor: '#f8f9fa',
                  color: '#5f6368',
                  border: '1px solid #e9ecef',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '14px 28px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '25px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 4px 15px rgba(244, 67, 54, 0.3)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#d32f2f'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(244, 67, 54, 0.4)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f44336'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(244, 67, 54, 0.3)'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px) scale(0.95);
            }
            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>
    </div>
  )
}

export default JobDetails 