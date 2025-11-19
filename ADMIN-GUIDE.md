# Mangli Website Admin Panel

## 🔑 Admin Access

**Admin URL:** `/admin`
**Password:** Set in your `.env.local` as `NEXT_PUBLIC_ADMIN_PASSWORD`

⚠️ **IMPORTANT:** Change the password in `/app/admin/page.js` before deploying to production!

## 🛠️ Admin Features

### Product Management
- ✅ View all products in your store
- ✅ Edit product names, descriptions, and prices
- ✅ Update product images (multiple images supported)
- ✅ Manage product variants and sizes
- ✅ Sync products from Printful automatically

### Security Features
- 🔒 Strong password authentication
- 🕒 24-hour session timeout
- 🔄 Session validation on page load
- 🚫 Automatic redirect for unauthorized access

## 📋 How to Use

### 1. Access Admin Panel
1. Go to `yourdomain.com/admin`
2. Enter the admin password from your `.env.local` file
3. Click "Access Admin Panel"

### 2. Manage Products
1. Click on "Products" tab
2. View all your store products
3. Click "✏️ Edit" to modify any product:
   - Update product name and description
   - Change pricing
   - Add/remove product images
   - Save changes

### 3. Sync Printful Products
1. Click "🔄 Sync Printful" button
2. System will fetch latest products from your Printful store
3. Automatically adds new products and updates existing ones
4. Applies your €10 profit margin automatically

### 4. Image Management
- Add multiple image URLs (one per line)
- First image becomes the primary thumbnail
- Supports any web-accessible image URL
- Images display in product carousel automatically

## 🔧 Configuration

### Change Admin Password
Edit `/app/admin/page.js` and update this line:
```javascript
const ADMIN_PASSWORD = "KamehaAdmin2025!Secure#Printful"
```

### Session Duration
Default: 24 hours. Change in `/app/admin/dashboard/page.js`:
```javascript
const sessionDuration = 24 * 60 * 60 * 1000 // 24 hours
```

## 🎯 Product Updates

### Pricing Strategy
- Base Printful price + €10 profit margin
- Manually adjustable through admin panel
- Applied automatically during Printful sync

### Image Guidelines
- Use high-quality mockup images
- Recommended resolution: 1000x1000px minimum
- Multiple angles recommended for better sales
- Images should be web-accessible URLs

## 🚀 Deployment Notes

1. **Change the password** before going live
2. The admin panel works on any hosting platform
3. Uses your existing database and Printful integration
4. No additional setup required

## 🔄 Regular Tasks

### Daily
- Check new orders
- Review product performance

### Weekly
- Sync Printful products for new items
- Update product descriptions if needed
- Review and update pricing

### Monthly
- Analyze sales data
- Update product images with better mockups
- Add new product variants

## 📞 Support

This admin panel integrates seamlessly with your existing:
- Printful API integration
- Stripe payment system
- Product database
- Image carousel system

All changes made through the admin panel immediately update your live store.