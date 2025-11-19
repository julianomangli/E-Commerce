#!/bin/bash

# Vercel Deployment Script for KAMEHA E-Commerce
echo "🚀 Deploying KAMEHA to Vercel..."

# Step 1: Create Vercel project (if not exists)
echo "📁 Creating Vercel project..."
vercel --prod --confirm

# Step 2: Set environment variables
echo "🔧 Setting environment variables..."
vercel env add PRINTFUL_API_KEY
vercel env add STRIPE_PUBLIC_KEY
vercel env add STRIPE_SECRET_KEY
vercel env add NEXT_PUBLIC_ADMIN_PASSWORD
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL

# Step 3: Create PostgreSQL database
echo "🗄️  Create PostgreSQL database in Vercel Dashboard:"
echo "1. Go to your project in Vercel dashboard"
echo "2. Click 'Storage' tab"
echo "3. Click 'Create Database'"
echo "4. Choose 'Postgres'"
echo "5. After creation, copy the connection URLs"

# Step 4: Set database URLs
echo "🔗 Set database environment variables:"
vercel env add DATABASE_URL
vercel env add DIRECT_URL

echo "✅ Setup complete! Your KAMEHA store is ready for production!"
echo "📋 Don't forget to:"
echo "   • Copy your Vercel Postgres URLs to DATABASE_URL and DIRECT_URL"
echo "   • Update your Stripe webhook endpoint"
echo "   • Test the admin panel after deployment"