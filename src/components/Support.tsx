import React from 'react'

const Support = () => {
  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px',
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333'
    }}>
      <h1 style={{ color: '#2c3e50', borderBottom: '2px solid #3498db', paddingBottom: '10px' }}>
        Support & Help
      </h1>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>Getting Started</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#2c3e50', marginTop: '0' }}>How to Use Job Tracker</h3>
          <ol>
            <li><strong>Install the Extension:</strong> Add Job Tracker to your Chrome browser</li>
            <li><strong>Sign In:</strong> Click the extension icon and sign in with your Google account</li>
            <li><strong>Complete Profile:</strong> Fill in your basic information (one-time setup)</li>
            <li><strong>Start Saving Jobs:</strong> Browse job sites and click "Add Job to Tracker"</li>
            <li><strong>Manage Applications:</strong> View and organize your saved jobs in the dashboard</li>
          </ol>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>Supported Job Sites</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <p>Job Tracker works with most job posting websites, including:</p>
          <ul>
            <li>LinkedIn Jobs</li>
            <li>Indeed</li>
            <li>Glassdoor</li>
            <li>Company career pages</li>
            <li>And many more!</li>
          </ul>
          <p><em>Note: The extension works best on dedicated job posting pages rather than general company websites.</em></p>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>Common Issues & Solutions</h2>
        
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#2c3e50' }}>🔍 Job Not Being Saved</h3>
          <p><strong>Possible causes:</strong></p>
          <ul>
            <li>You're not on a job posting page (try navigating to the actual job listing)</li>
            <li>The page hasn't fully loaded (wait a few seconds and try again)</li>
            <li>You're not signed in (click the extension icon to sign in)</li>
            <li>The job site is not supported (try a different job site)</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#2c3e50' }}>🔐 Authentication Issues</h3>
          <p><strong>If you can't sign in:</strong></p>
          <ul>
            <li>Make sure you're using a supported Google account</li>
            <li>Check your internet connection</li>
            <li>Try refreshing the page and signing in again</li>
            <li>Clear your browser cache and cookies</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#2c3e50' }}>📊 Dashboard Not Loading</h3>
          <p><strong>If the dashboard won't open:</strong></p>
          <ul>
            <li>Check your internet connection</li>
            <li>Try refreshing the page</li>
            <li>Sign out and sign back in</li>
            <li>Check if the extension is enabled in Chrome</li>
          </ul>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#2c3e50' }}>🔄 Extension Not Working</h3>
          <p><strong>If the extension seems broken:</strong></p>
          <ul>
            <li>Disable and re-enable the extension</li>
            <li>Uninstall and reinstall the extension</li>
            <li>Update Chrome to the latest version</li>
            <li>Check for any error messages in the browser console</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>Features & Tips</h2>
        
        <div style={{ backgroundColor: '#e8f5e8', padding: '20px', borderRadius: '8px', marginBottom: '15px' }}>
          <h3 style={{ color: '#2c3e50', marginTop: '0' }}>💡 Pro Tips</h3>
          <ul>
            <li><strong>Right-click Menu:</strong> Right-click on any job page and select "Add Job to Tracker"</li>
            <li><strong>Keyboard Shortcut:</strong> Use Ctrl+Shift+J (or Cmd+Shift+J on Mac) to quickly save jobs</li>
            <li><strong>Batch Saving:</strong> You can save multiple jobs quickly by visiting different job pages</li>
            <li><strong>Notes:</strong> Add personal notes to each job for better organization</li>
            <li><strong>Status Tracking:</strong> Update job status as you progress through applications</li>
          </ul>
        </div>

        <div style={{ backgroundColor: '#fff3cd', padding: '20px', borderRadius: '8px' }}>
          <h3 style={{ color: '#2c3e50', marginTop: '0' }}>🎯 Best Practices</h3>
          <ul>
            <li>Save jobs as soon as you find them interesting</li>
            <li>Update job status regularly to track your progress</li>
            <li>Add notes about your application process</li>
            <li>Use the search and filter features to find specific jobs</li>
            <li>Export your data periodically as a backup</li>
          </ul>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>Contact Support</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <p>Need help? We're here to assist you!</p>
          
          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '5px' }}>📧 Email Support</h4>
            <p style={{ margin: '0' }}>
              <strong>Email:</strong> namangauatama31@gmail.com<br />
              <strong>Phone:</strong> +91 6396664079<br />
              <em>We typically respond within 24 hours.</em>
            </p>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h4 style={{ color: '#2c3e50', marginBottom: '5px' }}>🌐 Website</h4>
            <p style={{ margin: '0' }}>
              <strong>Main Site:</strong> https://job-tracker-frontend.vercel.app<br />
              <em>Visit our website for more information and updates.</em>
            </p>
          </div>

          <div>
            <h4 style={{ color: '#2c3e50', marginBottom: '5px' }}>📋 Bug Reports</h4>
            <p style={{ margin: '0' }}>
              When reporting issues, please include:
            </p>
            <ul style={{ margin: '10px 0 0 0' }}>
              <li>Your Chrome version</li>
              <li>Extension version</li>
              <li>Steps to reproduce the issue</li>
              <li>Screenshots if possible</li>
            </ul>
          </div>
        </div>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>Privacy & Security</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '20px', borderRadius: '8px' }}>
          <p>Your privacy and security are important to us:</p>
          <ul>
            <li>We use Google OAuth for secure authentication</li>
            <li>Your data is encrypted and stored securely</li>
            <li>We don't share your personal information with third parties</li>
            <li>You can delete your account and data at any time</li>
          </ul>
          <p>
            <a href="/privacy-policy" style={{ color: '#3498db', textDecoration: 'none' }}>
              Read our Privacy Policy →
            </a>
          </p>
        </div>
      </section>

      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa', 
        borderRadius: '8px',
        textAlign: 'center' 
      }}>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '12px 24px',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px',
            marginRight: '10px'
          }}
        >
          ← Back
        </button>
        <button 
          onClick={() => window.open('mailto:namangauatama31@gmail.com', '_blank')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#27ae60',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Contact Support
        </button>
      </div>
    </div>
  )
}

export default Support 