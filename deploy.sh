#!/bin/bash

# BuildTrack Deployment Helper Script
# This script helps you deploy your application to Vercel and Render

echo "======================================"
echo "BuildTrack Deployment Helper"
echo "======================================"
echo ""

# Step 1: Check if Vercel CLI is installed
echo "Step 1: Checking Vercel CLI..."
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI is not installed"
    echo "   Install with: npm install -g vercel"
    echo ""
    read -p "Press Enter to install Vercel CLI..."
    npm install -g vercel
else
    echo "✅ Vercel CLI is installed"
fi

echo ""

# Step 2: Authenticate with Vercel
echo "Step 2: Authenticate with Vercel..."
echo "This will open your browser for authentication"
echo ""
read -p "Press Enter to authenticate with Vercel..."
vercel login

echo ""

# Step 3: Deploy frontend
echo "Step 3: Deploy Frontend to Vercel..."
echo "Navigate to client directory..."
cd client

echo ""
echo "Starting Vercel deployment..."
echo ""
read -p "Press Enter to continue..."

vercel

echo ""
echo "======================================"
echo "Frontend Deployment Complete!"
echo "======================================"
echo ""
echo "Next steps:"
echo "1. Copy your Vercel URL"
echo "2. Go to Render dashboard"
echo "3. Update CLIENT_URL environment variable"
echo ""
echo "Backend URL will be provided by Render after deployment"
echo ""
