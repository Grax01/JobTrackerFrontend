# Job Tracker

A React application for tracking job applications and managing your career journey.

## Features

- **Google Authentication**: Secure login using Google OAuth
- **Job Dashboard**: View all your job applications in a clean, card-based interface
- **Clickable Job Cards**: Click on any job card to view detailed information
- **Job Details Page**: Comprehensive view of individual job postings including:
  - Job title and company information
  - Location and salary details
  - Tech stack requirements
  - Application status
  - Posted date
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

## Usage

1. **Login**: Click "Login with Google" to authenticate with your Google account
2. **View Jobs**: Browse your job applications on the dashboard
3. **View Details**: Click on any job card to see detailed information
4. **Navigate**: Use the back button to return to the dashboard

## API Endpoints

The application expects the following API endpoints:

- `GET /dashboard?email={email}` - Fetch all jobs for a user
- `GET /job/{jobId}` - Fetch detailed information for a specific job

## Technologies Used

- React 18
- TypeScript
- React Router DOM
- Axios
- Supabase (Authentication)
- CSS-in-JS (Inline styles)

## Project Structure

```
src/
├── components/
│   ├── dashboard.tsx      # Main dashboard with job cards
│   └── JobDetails.tsx     # Detailed job view page
├── App.js                 # Main app with routing
└── supabaseClient.js      # Supabase configuration
```
