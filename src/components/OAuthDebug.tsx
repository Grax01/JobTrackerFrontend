import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

const OAuthDebug = () => {
  const location = useLocation()
  const [debugInfo, setDebugInfo] = useState({})

  useEffect(() => {
    const info = {
      currentUrl: window.location.href,
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      urlParams: Object.fromEntries(new URLSearchParams(location.search)),
      cookies: document.cookie,
      localStorage: Object.keys(localStorage),
      sessionStorage: Object.keys(sessionStorage)
    }
    
    setDebugInfo(info)
    console.log('🔍 OAuth Debug Info:', info)
  }, [location])

  return (
    <div style={{
      padding: '20px',
      fontFamily: 'monospace',
      fontSize: '12px',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h2>🔍 OAuth Debug Information</h2>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Current URL:</h3>
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
          {debugInfo.currentUrl}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Location Info:</h3>
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
          <div><strong>Pathname:</strong> {debugInfo.pathname}</div>
          <div><strong>Search:</strong> {debugInfo.search}</div>
          <div><strong>Hash:</strong> {debugInfo.hash}</div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>URL Parameters:</h3>
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
          <pre>{JSON.stringify(debugInfo.urlParams, null, 2)}</pre>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Cookies:</h3>
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px', wordBreak: 'break-all' }}>
          {debugInfo.cookies || 'No cookies'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Local Storage Keys:</h3>
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
          {debugInfo.localStorage?.join(', ') || 'No localStorage keys'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h3>Session Storage Keys:</h3>
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
          {debugInfo.sessionStorage?.join(', ') || 'No sessionStorage keys'}
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          Go to Main App
        </button>
        
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Reload Page
        </button>
      </div>
    </div>
  )
}

export default OAuthDebug 