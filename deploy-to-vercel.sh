#!/bin/bash

# Vercel Deployment Script for Job Tracker Frontend
# This script helps prepare and deploy the frontend to Vercel

set -e  # Exit on any error

echo "🚀 Starting Vercel deployment preparation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Please run this script from the job-tracker directory."
    exit 1
fi

print_status "Checking prerequisites..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_success "Node.js and npm are installed"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_warning "Vercel CLI is not installed. Installing now..."
    npm install -g vercel
    print_success "Vercel CLI installed"
else
    print_success "Vercel CLI is already installed"
fi

print_status "Installing dependencies..."
npm install

print_status "Building the application..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed. Please fix the errors and try again."
    exit 1
fi

print_status "Checking for required files..."

# Check for required files
required_files=(
    "vercel.json"
    "src/utils/api.ts"
    "build/index.html"
)

for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        print_success "✓ $file exists"
    else
        print_error "✗ $file is missing"
        exit 1
    fi
done

print_status "Checking environment variables..."

# Check if .env file exists (for local development)
if [ -f ".env" ]; then
    print_warning "Found .env file. Make sure to set environment variables in Vercel dashboard."
else
    print_warning "No .env file found. You'll need to set environment variables in Vercel dashboard."
fi

echo ""
print_status "Deployment preparation completed!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://vercel.com"
echo "2. Click 'New Project'"
echo "3. Import your GitHub repository: job-track/job-tracker"
echo "4. Configure environment variables:"
echo "   - REACT_APP_SUPABASE_URL=https://yxrjqcvlqverhfbrfeji.supabase.co"
echo "   - REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4cmpxY3ZscXZlcmhmYnJmZWppIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzI4MDgsImV4cCI6MjA3MDEwODgwOH0.ut1IpTFLVBa-_IIXNlrNZgnRQk4A0B9Fr47wCijqkSs"
echo "   - REACT_APP_API_URL=https://jobtrackerbackend-production-5284.up.railway.app"
echo "5. Deploy!"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"
echo ""

# Ask if user wants to deploy now
read -p "Do you want to deploy to Vercel now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Starting Vercel deployment..."
    vercel --prod
else
    print_status "Deployment skipped. You can deploy manually later."
fi

print_success "Script completed!" 