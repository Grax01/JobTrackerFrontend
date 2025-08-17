import React from 'react'

const PrivacyPolicy = () => {
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
        Privacy Policy
      </h1>
      
      <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>1. Information We Collect</h2>
        <p>
          Job Tracker collects the following types of information:
        </p>
        <ul>
          <li><strong>Account Information:</strong> When you sign up, we collect your email address and basic profile information through Google OAuth.</li>
          <li><strong>Job Data:</strong> We collect job postings you save, including job titles, company names, descriptions, and URLs.</li>
          <li><strong>Usage Data:</strong> We collect information about how you use the extension, such as which job sites you visit and when you save jobs.</li>
          <li><strong>Technical Data:</strong> We may collect technical information about your browser and device for troubleshooting purposes.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>2. How We Use Your Information</h2>
        <p>We use the collected information to:</p>
        <ul>
          <li>Provide and maintain the Job Tracker service</li>
          <li>Process and store your saved job postings</li>
          <li>Send you notifications about your job applications</li>
          <li>Improve our service and user experience</li>
          <li>Provide customer support</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>3. Data Storage and Security</h2>
        <p>
          Your data is stored securely using Supabase, a trusted cloud database provider. We implement industry-standard security measures to protect your information, including:
        </p>
        <ul>
          <li>Encryption of data in transit and at rest</li>
          <li>Secure authentication through Google OAuth</li>
          <li>Regular security audits and updates</li>
          <li>Access controls and monitoring</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>4. Third-Party Services</h2>
        <p>We use the following third-party services:</p>
        <ul>
          <li><strong>Google OAuth:</strong> For secure authentication</li>
          <li><strong>Supabase:</strong> For data storage and management</li>
          <li><strong>OpenAI API:</strong> For AI-powered job parsing</li>
          <li><strong>Vercel:</strong> For hosting our web application</li>
        </ul>
        <p>These services have their own privacy policies, and we recommend reviewing them.</p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>5. Your Rights</h2>
        <p>You have the right to:</p>
        <ul>
          <li>Access your personal data</li>
          <li>Update or correct your information</li>
          <li>Delete your account and all associated data</li>
          <li>Export your job data</li>
          <li>Opt out of notifications</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>6. Data Retention</h2>
        <p>
          We retain your data for as long as your account is active. If you delete your account, we will permanently delete all your data within 30 days.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>7. Children's Privacy</h2>
        <p>
          Job Tracker is not intended for use by children under 13 years of age. We do not knowingly collect personal information from children under 13.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>8. Changes to This Policy</h2>
        <p>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last updated" date.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>9. Contact Us</h2>
        <p>
          If you have any questions about this privacy policy, please contact us at:
        </p>
        <p>
          <strong>Email:</strong> namangauatama31@gmail.com<br />
          <strong>Phone:</strong> +91 6396664079<br />
          <strong>Website:</strong> https://job-tracker-frontend.vercel.app
        </p>
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
            fontSize: '16px'
          }}
        >
          ← Back
        </button>
      </div>
    </div>
  )
}

export default PrivacyPolicy 