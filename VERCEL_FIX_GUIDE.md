# Vercel Deployment Fix Guide

## 🔧 Fix for DIRECT_URL Error

The error you're seeing is because Vercel PostgreSQL requires both `DATABASE_URL` and `DIRECT_URL` environment variables.

### 🎯 Solution Steps:

#### 1. Create Vercel Postgres Database
1. Go to your Vercel dashboard
2. Navigate to your project
3. Click "Storage" tab
4. Click "Create Database"
5. Choose "Postgres"
6. Create the database

#### 2. Copy Connection Strings
After creating the database, Vercel will show you:
- `POSTGRES_URL` (pooled connection)
- `POSTGRES_URL_NON_POOLED` (direct connection)

#### 3. Set Environment Variables in Vercel
In your Vercel project dashboard, go to Settings → Environment Variables and add:

```
DATABASE_URL = [paste POSTGRES_URL here]
DIRECT_URL = [paste POSTGRES_URL_NON_POOLED here]
```

#### 4. Add Other Required Variables
Make sure these are also set in Vercel:

```
PRINTFUL_API_KEY = iugRFg9jIZi5m1boCU2UjXr49iuGTDLMILvp3gWN
NEXT_PUBLIC_ADMIN_PASSWORD = KamehaAdmin2025!SecurePassword
STRIPE_PUBLIC_KEY = pk_test_51Qy7kkIPZbEsdliDlsroHDLE6s7CQYnzaqISg8QmRDYgP9aIdJH6C3D7qGLrnXkOwlfK6ysoxKMtwp6Vuth4VDTh00jPRrVnKp
STRIPE_SECRET_KEY = sk_test_51Qy7kkIPZbEsdliDoISyIZlV2hpkIMUcMC4DYGvNUQPrKdlrcB7Zcm1Rgj0eYMufgYhdTvrxknHSGhlGiMFTG1Za00vmJb9TqI
NEXTAUTH_SECRET = your-secret-key-here
NEXTAUTH_URL = https://your-domain.vercel.app
```

#### 5. Deploy Again
After setting the environment variables, trigger a new deployment:
- Either push a new commit
- Or go to Deployments tab and click "Redeploy"

### 🚀 Alternative Quick Fix
If you want to deploy immediately without PostgreSQL, you can temporarily change the schema:

1. Comment out the `directUrl` line in `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url = env("DATABASE_URL")
  // directUrl = env("DIRECT_URL")
}
```

2. But this is NOT recommended for production!

### ✅ Recommended Approach
Use the PostgreSQL setup above for a production-ready deployment with proper database hosting.