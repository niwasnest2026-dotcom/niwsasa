# 🚀 Deployment Fix Guide - Search Not Working Issue

## Problem
Search functionality works in localhost but not in deployment (shows "32 total" but no results).

## Root Causes & Solutions

### 1. ✅ Environment Variables Missing
**Most Common Issue**

#### Check Your Deployment Platform:

**For Vercel:**
1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xpasvhmwuhipzvcqohhq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwYXN2aG13dWhpcHp2Y3FvaGhxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0OTk5ODMsImV4cCI6MjA4MjA3NTk4M30.mFM1oZXZ5NvFzXJOXoU7T6OGAu6pPlDQPCbolh-z6M0
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
RAZORPAY_KEY_SECRET=thisissecretkey
```

5. **IMPORTANT**: After adding, click **Redeploy** or trigger new deployment

**For Netlify:**
1. Go to: Site Settings → Environment Variables
2. Add the same variables above
3. Redeploy the site

**For Railway/Render:**
1. Go to Environment Variables section
2. Add the variables
3. Redeploy

---

### 2. ✅ Supabase RLS (Row Level Security) Issue

Your deployment can't fetch properties due to database permissions.

#### Fix in Supabase:

1. Go to: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication** → **Policies**
4. Click on **properties** table

#### Add Policy:
```sql
-- Enable read access to properties for everyone
CREATE POLICY "Enable read access for all users"
ON properties
FOR SELECT
USING (true);
```

#### Quick Fix SQL (Run in SQL Editor):
```sql
-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read properties
CREATE POLICY "Allow public read access to properties"
ON properties
FOR SELECT
TO public
USING (is_available = true);

-- Allow everyone to read property_rooms
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to property_rooms"
ON property_rooms
FOR SELECT
TO public
USING (is_available = true);

-- Allow everyone to read property_amenities
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to property_amenities"
ON property_amenities
FOR SELECT
TO public
USING (true);
```

---

### 3. ✅ CORS / API Route Issues

#### Check if API routes are accessible:

**Test in browser console (on deployed site):**
```javascript
// Open browser DevTools (F12) and run:
fetch('/api/get-locations')
  .then(r => r.json())
  .then(data => console.log('API Response:', data))
  .catch(err => console.error('API Error:', err));
```

**Expected Output:**
```json
{
  "success": true,
  "locations": ["Koramangala", "HSR Layout", ...],
  "dynamic_count": 6,
  "static_count": 0
}
```

---

### 4. ✅ Database Has No Data

Check if sample data was added to production database.

#### Run Sample Data:
1. Go to Supabase Dashboard → SQL Editor
2. Open the file: `supabase/sample-data.sql`
3. Copy and paste the entire content
4. Click **Run**
5. Verify: `SELECT COUNT(*) FROM properties;` should return 6

---

### 5. ✅ Build Errors

Check deployment logs for errors.

#### Common Issues:

**TypeScript Errors:**
✅ Already handled in `next.config.js`:
```javascript
typescript: {
  ignoreBuildErrors: true,
}
```

**Missing Dependencies:**
```bash
npm install
```

**Environment Variable Access:**
Make sure you're using `NEXT_PUBLIC_` prefix for client-side variables.

---

### 6. ✅ Network/CORS Issues

If API calls are blocked by CORS:

#### Add to `next.config.js`:
```javascript
async headers() {
  return [
    {
      source: '/api/:path*',
      headers: [
        { key: 'Access-Control-Allow-Origin', value: '*' },
        { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
      ],
    },
  ];
},
```

---

## 🔍 Debugging Steps

### Step 1: Check Browser Console
1. Open deployed site
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for errors (red messages)
5. Check Network tab for failed requests

### Step 2: Check API Response
```javascript
// In browser console:
fetch('/api/get-locations')
  .then(r => r.json())
  .then(console.log)
```

### Step 3: Check Supabase Connection
```javascript
// In browser console:
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
```

### Step 4: Check Database
1. Go to Supabase Dashboard
2. Table Editor → properties
3. Verify `is_available = true` for properties
4. Check `latitude` and `longitude` are filled

---

## 📋 Quick Checklist

- [ ] Environment variables added to deployment platform
- [ ] Redeployed after adding env vars
- [ ] RLS policies created in Supabase
- [ ] Sample data inserted in production database
- [ ] Properties have `is_available = true`
- [ ] Properties have latitude/longitude coordinates
- [ ] No errors in browser console
- [ ] API route `/api/get-locations` returns data
- [ ] Build succeeded without errors

---

## 🎯 Most Likely Fix (90% of cases)

**Missing Environment Variables + RLS Policy**

### Quick Fix:
1. Add environment variables in deployment platform
2. Run this SQL in Supabase:
   ```sql
   ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
   CREATE POLICY "public_read" ON properties FOR SELECT USING (is_available = true);
   ```
3. Redeploy

---

## 📞 Still Not Working?

### Collect This Information:

1. **Deployment Platform**: Vercel / Netlify / Other?
2. **Deployment URL**: https://your-site.vercel.app
3. **Browser Console Errors**: Screenshot or copy error messages
4. **API Response**: Result of `fetch('/api/get-locations')`
5. **Environment Variables**: Confirm they're set (don't share actual values)

### Common Error Messages:

**"Failed to fetch"**
→ Check environment variables and redeploy

**"Unauthorized"**
→ Check Supabase RLS policies

**"No locations available"**
→ Check database has sample data

**"undefined is not an object"**
→ Check API route is returning correct data structure

---

## ✅ Verification After Fix

1. Open deployed site
2. Click on search bar
3. Should see dropdown with locations
4. Click "Allow" for location permission
5. Should see "Sorted by distance" indicator
6. Locations should be listed

---

## 🚀 Deploy Again

After making fixes:

**Vercel:**
```bash
git add .
git commit -m "Fix: Add environment variables and RLS policies"
git push origin main
# Auto-deploys on Vercel
```

**Manual Deploy:**
```bash
npm run build
npm run start
```

---

## Need More Help?

Check deployment logs:
- Vercel: Dashboard → Deployments → Click latest → View Logs
- Netlify: Deploys → Click latest → Deploy Log
- Check for build errors or runtime errors
