// API configuration utility
const getApiBaseUrl = (): string => {
  // Check if we're in development mode
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  // Use environment variable if available
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback based on environment
  if (isDevelopment) {
    return 'https://jobtrackerbackend-production-5284.up.railway.app';
  }
  
  // Production fallback
  return 'https://jobtrackerbackend-production-5284.up.railway.app';
};

export const API_BASE_URL = getApiBaseUrl();

// Common API endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH_CHECK_PROFILE: '/auth/check-profile',
  
  // Dashboard endpoints
  DASHBOARD_SEARCH: '/dashboard/search',
  DASHBOARD_SUMMARY: '/dashboard/summary',
  DASHBOARD_CSV: '/dashboard/csv',
  
  // User jobs endpoints
  USER_JOBS: '/api/user_jobs',
  USER_JOB_DETAILS: (jobId: string) => `/user_jobs/job/${jobId}`,
  
  // Job posts endpoints
  JOB_POST_STATUS: (jobId: string) => `/job_posts/${jobId}/status`,
  JOB_POST_INTERVIEW: (jobId: string) => `/job_posts/${jobId}/interview`,
  JOB_POST_NOTES: (jobId: string) => `/job_posts/${jobId}/notes`,
  
  // Notes endpoints
  NOTES: (noteId: string) => `/notes/${noteId}`,
  
  // Interview endpoints
  INTERVIEW: (interviewId: string) => `/interview/${interviewId}`,
  
  // User profile endpoints
  DOMAINS: '/domains',
  USER_PROFILE: (userId: string) => `/users/${userId}/profile`,
  
  // Health check
  HEALTH: '/health'
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
}; 