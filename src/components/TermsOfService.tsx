import React from 'react'

const TermsOfService = () => {
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
        Terms of Service
      </h1>
      
      <p style={{ color: '#7f8c8d', fontSize: '14px' }}>
        Last updated: {new Date().toLocaleDateString()}
      </p>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>1. Acceptance of Terms</h2>
        <p>
          By installing and using the Job Tracker Chrome extension ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use the Service.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>2. Description of Service</h2>
        <p>
          Job Tracker is a Chrome extension that helps users track and manage job applications. The Service includes:
        </p>
        <ul>
          <li>AI-powered job posting extraction and parsing</li>
          <li>Job application tracking and management</li>
          <li>Personal dashboard for organizing job searches</li>
          <li>Integration with job sites like LinkedIn, Indeed, and others</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>3. User Accounts</h2>
        <p>
          To use the Service, you must:
        </p>
        <ul>
          <li>Be at least 13 years old</li>
          <li>Create an account using Google OAuth</li>
          <li>Provide accurate and complete information</li>
          <li>Maintain the security of your account</li>
          <li>Notify us immediately of any unauthorized use</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>4. Acceptable Use</h2>
        <p>You agree to use the Service only for lawful purposes and in accordance with these Terms. You agree not to:</p>
        <ul>
          <li>Use the Service for any illegal or unauthorized purpose</li>
          <li>Attempt to gain unauthorized access to our systems</li>
          <li>Interfere with or disrupt the Service</li>
          <li>Use the Service to collect or store personal data of others</li>
          <li>Reverse engineer or attempt to extract source code</li>
          <li>Use the Service for commercial purposes without permission</li>
        </ul>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>5. User Content</h2>
        <p>
          You retain ownership of any content you create or upload to the Service. By using the Service, you grant us a limited license to store and process your content to provide the Service.
        </p>
        <p>
          You are responsible for ensuring that your content does not violate any laws or third-party rights.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>6. Privacy</h2>
        <p>
          Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the Service, to understand our practices.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>7. Intellectual Property</h2>
        <p>
          The Service and its original content, features, and functionality are owned by Job Tracker and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>8. Disclaimers</h2>
        <p>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED OR ERROR-FREE.
        </p>
        <p>
          We are not responsible for the accuracy, completeness, or reliability of job postings extracted from third-party websites.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>9. Limitation of Liability</h2>
        <p>
          IN NO EVENT SHALL JOB TRACKER BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING WITHOUT LIMITATION, LOSS OF PROFITS, DATA, USE, GOODWILL, OR OTHER INTANGIBLE LOSSES.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>10. Termination</h2>
        <p>
          We may terminate or suspend your account and access to the Service immediately, without prior notice, for any reason, including breach of these Terms.
        </p>
        <p>
          Upon termination, your right to use the Service will cease immediately, and we may delete your account and data.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>11. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page and updating the "Last updated" date.
        </p>
        <p>
          Your continued use of the Service after any changes constitutes acceptance of the new Terms.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>12. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Job Tracker operates, without regard to its conflict of law provisions.
        </p>
      </section>

      <section style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#2c3e50' }}>13. Contact Information</h2>
        <p>
          If you have any questions about these Terms of Service, please contact us at:
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

export default TermsOfService 