# Mangli Website - Vercel Deployment Setup

## 🚀 Pre-Deployment Checklist

### ✅ Current Project Status
- [x] Next.js 15 application ready
- [x] Printful integration working
- [x] Product database configured
- [x] Cart and checkout functionality
- [x] Image carousel with mockups

### 📋 Deployment Steps

## 1. Environment Variables Setup
Create these in Vercel Dashboard:

```bash
# Database (Vercel Postgres)
DATABASE_URL=your_vercel_postgres_url

# Printful Integration
PRINTFUL_API_KEY=your_printful_api_key_here

# Stripe Payment Processing
STRIPE_PUBLIC_KEY=pk_test_51Qy7kkIPZbEsdliDlsroHDLE6s7CQYnzaqISg8QmRDYgP9aIdJH6C3D7qGLrnXkOwlfK6ysoxKMtwp6Vuth4VDTh00jPRrVnKp
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Next.js Configuration
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXTAUTH_SECRET=your-secure-secret-key-here

# App Settings
NODE_ENV=production
```

## 2. Database Migration
After connecting Vercel Postgres:
```bash
# Initialize database
npx prisma db push

# Seed with your Printful product
node sync-printful-product.js
```

## 3. Image Hosting Options

### Option A: Vercel Blob Storage
```bash
npm install @vercel/blob
```

### Option B: Keep Printful CDN (Recommended)
- Uses Printful's CDN for product images
- Automatically updates when you change mockups
- No additional storage costs

## 4. Domain Configuration
- Custom domain: your-store-name.com
- SSL certificate: Auto-configured
- CDN: Global edge network

## 🎯 Benefits of Vercel Deployment

### Performance
- Global CDN for fast loading
- Edge functions for dynamic content
- Automatic image optimization

### Scalability  
- Serverless auto-scaling
- Handle traffic spikes automatically
- Pay only for what you use

### Database
- Vercel Postgres for production
- Automatic backups
- Connection pooling

### Monitoring
- Real-time analytics
- Error tracking
- Performance insights

## 🔧 Final Optimization

### Before Deployment:
1. Test all functionality locally
2. Verify environment variables
3. Check database migrations
4. Test Printful integration
5. Verify Stripe webhooks

### After Deployment:
1. Set up Stripe webhooks to new domain
2. Test complete purchase flow
3. Verify Printful order fulfillment
4. Monitor error logs
5. Set up custom domain

---

💡 **Your KAMEHA Son Goku T-Shirt will be live on the web!**
🌍 **Global customers can order your anime designs**
📈 **Scale automatically with Vercel's infrastructure**