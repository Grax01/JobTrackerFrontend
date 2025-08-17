# Local Development Setup Guide

## 🚀 Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
./setup-local.sh
```

### Option 2: Manual Setup
```bash
# 1. Install dependencies
npm install

# 2. Create local environment file
cp env.local.example .env.local

# 3. Start development server
npm start
```

## 🔧 Environment Configuration

### Local Development (.env.local)
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://yxrjqcvlqverhfbrfeji.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cmpxY3ZscXZlcmhmYnJmZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzI4MDgsImV4cCI6MjA3MDEwODgwOH0.ut1IpTFLVBa-_IIXNlrNZgnRQk4A0B9Fr47wCijqkSs

# Backend API URL (Local Development)
REACT_APP_API_URL=http://localhost:8081
```

### Production (Vercel Environment Variables)
```bash
# Supabase Configuration
REACT_APP_SUPABASE_URL=https://yxrjqcvlqverhfbrfeji.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cmpxY3ZscXZlcmhmYnJmZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzI4MDgsImV4cCI6MjA3MDEwODgwOH0.ut1IpTFLVBa-_IIXNlrNZgnRQk4A0B9Fr47wCijqkSs

# Backend API URL (Production - Railway)
REACT_APP_API_URL=https://jobtrackerbackend-production-5284.up.railway.app
```

## 🏃‍♂️ Running the Application

### Prerequisites
1. **Node.js** (v16 or higher)
2. **Backend running** on `http://localhost:8081`
3. **Supabase project** configured

### Development Commands
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Access Points
- **Frontend**: http://localhost:8082
- **Backend**: http://localhost:8081
- **Supabase**: https://yxrjqcvlqverhfbrfeji.supabase.co

## 🔍 Troubleshooting

### Common Issues

#### 1. "Cannot read properties of null (reading 'map')"
**Fixed**: Added null checks for all array mappings in JobDetails component.

#### 2. API Connection Issues
```bash
# Check if backend is running
curl http://localhost:8081/health

# Check environment variables
echo $REACT_APP_API_URL
```

#### 3. Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Port Conflicts
```bash
# Check what's using port 8082
lsof -i :8082

# Kill process if needed
kill -9 <PID>
```

### Environment Variable Issues
```bash
# Check if .env.local exists
ls -la .env.local

# Verify environment variables are loaded
npm start
# Check console for API_BASE_URL logs
```

## 📁 Project Structure

```
job-tracker/
├── src/
│   ├── components/          # React components
│   │   ├── JobDetails.tsx   # Job details page (fixed null mapping)
│   │   ├── dashboard.tsx    # Dashboard component
│   │   └── ...
│   ├── utils/
│   │   └── api.ts          # API configuration (auto-detects environment)
│   └── App.js              # Main app
├── env.local.example       # Local environment template
├── env.production.example  # Production environment template
├── setup-local.sh          # Automated setup script
└── package.json
```

## 🔄 Switching Between Environments

### Local Development
```bash
# Use local backend
REACT_APP_API_URL=http://localhost:8081
```

### Production Testing
```bash
# Use production backend
REACT_APP_API_URL=https://jobtrackerbackend-production-5284.up.railway.app
```

### Environment Detection
The API utility automatically detects the environment:
- **Development**: Uses `localhost:8081` if no env var set
- **Production**: Uses Railway URL if no env var set
- **Custom**: Uses `REACT_APP_API_URL` if set

## 🚀 Deployment

### Local Testing
```bash
# Build and test locally
npm run build
npx serve -s build -l 8082
```

### Production Deployment
```bash
# Push to GitHub (auto-deploys to Vercel)
git add .
git commit -m "Your changes"
git push origin main
```

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Verify backend is running on localhost:8081
3. Check environment variables are set correctly
4. Clear browser cache and try again
5. Check browser console for errors

## 🎯 Next Steps

1. **Start backend**: Ensure your Railway backend is running
2. **Run setup**: `./setup-local.sh`
3. **Start frontend**: `npm start`
4. **Test functionality**: Navigate to http://localhost:8082
5. **Test job details**: Click on a job to test the fixed null mapping 