# Vercel Deployment Guide for Job Tracker Frontend

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Railway Backend**: Your backend should be deployed on Railway
4. **Supabase Database**: Your PostgreSQL database should be set up and accessible

## Step 1: Prepare Your Repository

### 1.1 Ensure Your Code is Ready
- All code is committed to your GitHub repository
- Your application runs locally without issues
- All dependencies are properly specified in `package.json`

### 1.2 Verify Required Files
Make sure these files are in your repository root:
- ✅ `package.json` - Node.js dependencies and scripts
- ✅ `vercel.json` - Vercel configuration for React Router
- ✅ `src/utils/api.ts` - API configuration utility
- ✅ `public/index.html` - Main HTML file
- ✅ `src/App.js` - Main React application

## Step 2: Set Up Vercel Project

### 2.1 Create New Project
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Select "Import Git Repository"
4. Connect your GitHub account if not already connected
5. Select your repository: `job-track/job-tracker`

### 2.2 Configure Build Settings
Vercel will automatically detect your React application, but you can customize:

1. In your Vercel project dashboard, go to "Settings"
2. Under "Build & Deploy", verify:
   - **Framework Preset**: Create React App
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

## Step 3: Configure Environment Variables

### 3.1 Add Environment Variables
In your Vercel project dashboard:

1. Go to "Settings" → "Environment Variables"
2. Add the following environment variables:

```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://yxrjqcvlqverhfbrfeji.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cmpxY3ZscXZlcmhmYnJmZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzI4MDgsImV4cCI6MjA3MDEwODgwOH0.ut1IpTFLVBa-_IIXNlrNZgnRQk4A0B9Fr47wCijqkSs

# Backend API URL (Production - Railway)
REACT_APP_API_URL=https://jobtrackerbackend-production-5284.up.railway.app
```

### 3.2 Environment Variable Scope
Make sure to set these variables for:
- ✅ Production
- ✅ Preview
- ✅ Development

## Step 4: Deploy Your Application

### 4.1 Initial Deployment
1. Vercel will automatically start building your application
2. Monitor the build logs in the "Deployments" tab
3. Wait for the build to complete (usually 2-5 minutes)

### 4.2 Verify Deployment
1. Check the "Deployments" tab for successful deployment
2. Your application will be available at: `https://your-app-name.vercel.app`
3. Test the application functionality

## Step 5: Configure Custom Domain (Optional)

### 5.1 Add Custom Domain
1. Go to "Settings" → "Domains"
2. Click "Add Domain"
3. Enter your custom domain (e.g., `app.yourdomain.com`)
4. Follow the DNS configuration instructions

### 5.2 Update CORS Settings
If you're using a custom domain, update your backend CORS configuration to allow requests from your new domain.

## Step 6: Test Your Deployment

### 6.1 Basic Functionality Tests
1. **Authentication**: Test Google OAuth login
2. **Dashboard**: Verify job listing and search functionality
3. **Job Management**: Test adding, editing, and deleting jobs
4. **Profile Completion**: Test user profile setup

### 6.2 API Integration Tests
1. **Backend Connection**: Verify API calls to Railway backend
2. **Supabase Integration**: Test database operations
3. **File Uploads**: Test any file upload functionality

## Step 7: Monitor and Maintain

### 7.1 Monitor Performance
- Use Vercel Analytics to track performance
- Monitor Core Web Vitals
- Check for any build errors

### 7.2 Set Up Monitoring
- Configure error tracking (e.g., Sentry)
- Set up uptime monitoring
- Monitor API response times

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check build logs in Vercel dashboard
   - Verify all dependencies are in `package.json`
   - Ensure TypeScript compilation passes

2. **Environment Variables**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure variables are set for all environments

3. **API Connection Issues**
   - Verify `REACT_APP_API_URL` is correct
   - Check if Railway backend is running
   - Ensure CORS is properly configured

4. **Routing Issues**
   - Verify `vercel.json` configuration
   - Check React Router setup
   - Ensure all routes are properly defined

### Debugging Commands

```bash
# Check Vercel CLI (if installed)
vercel status
vercel logs
vercel env ls

# Local testing with Vercel environment
vercel dev
```

## Security Considerations

1. **Environment Variables**: Never commit sensitive data to your repository
2. **CORS**: Configure CORS properly for production
3. **HTTPS**: Vercel provides HTTPS by default
4. **API Keys**: Use environment variables for all API keys
5. **Logging**: Avoid logging sensitive information

## Cost Optimization

1. **Free Tier**: Vercel offers a generous free tier
2. **Auto-scaling**: Vercel automatically scales based on traffic
3. **CDN**: Vercel provides global CDN for static assets
4. **Edge Functions**: Use for serverless functions if needed

## Next Steps

1. Set up continuous deployment from your main branch
2. Configure monitoring and alerting
3. Set up staging environment
4. Implement proper logging and error tracking
5. Set up automated testing

## Support

- Vercel Documentation: [vercel.com/docs](https://vercel.com/docs)
- Vercel Discord: [discord.gg/vercel](https://discord.gg/vercel)
- React Documentation: [reactjs.org](https://reactjs.org)

## Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] All dependencies are in `package.json`
- [ ] Environment variables are configured
- [ ] `vercel.json` is properly set up
- [ ] API endpoints are updated to use production URLs
- [ ] Build passes locally (`npm run build`)
- [ ] Application is deployed to Vercel
- [ ] Custom domain is configured (if needed)
- [ ] All functionality is tested
- [ ] Monitoring is set up
- [ ] Documentation is updated 