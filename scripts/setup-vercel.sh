#!/bin/bash
# Vercel deployment script

echo "🚀 Starting Vercel deployment setup..."

# Generate Prisma client
echo "📦 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️ Setting up database schema..."
npx prisma db push --force-reset

# Seed the database
echo "🌱 Seeding database with products..."
node scripts/add-featured-products.js

echo "✅ Database setup complete!"