#!/bin/bash

# Local Development Setup Script for Job Tracker Frontend

set -e

echo "🚀 Setting up local development environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_status "Setting up local environment variables..."

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    print_status "Creating .env.local file..."
    cp env.local.example .env.local
    print_success "Created .env.local file"
else
    print_warning ".env.local already exists. Skipping creation."
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

print_status "Starting development server..."
print_success "Local development setup complete!"
echo ""
echo "📋 Next steps:"
echo "1. Make sure your backend is running on http://localhost:8081"
echo "2. Start the development server: npm start"
echo "3. Open http://localhost:8082 in your browser"
echo ""
echo "🔧 Environment Configuration:"
echo "- Local Backend: http://localhost:8081"
echo "- Frontend: http://localhost:8082"
echo "- Environment: .env.local"
echo ""
echo "🚀 To start development server:"
echo "npm start" 