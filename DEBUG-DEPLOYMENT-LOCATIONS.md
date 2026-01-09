# 🔍 DEBUG: Locations Not Showing in Vercel Deployment

## Current Situation
- ✅ Localhost: Locations showing correctly
- ❌ Vercel: Shows "Available Locations (32 total)" but no locations appear in list
- ✅ Environment variables: Already added in Vercel

## Root Cause Analysis

The issue is that your API at `/api/get-locations` is returning an empty `locations` array even though it says "32 total". This indicates:

1. The database query IS working (it found 32 items)
2. BUT the locations are being filtered out or not extracted properly
3. Most likely cause: **Row Level Security (RLS) policies are blocking public reads**

## 🚀 SOLUTION - Follow These Steps

### Step 1: Fix Database Permissions (Most Important)

Your deployment cannot read the `properties` table because RLS is enabled but no public read policy exists.

1. **Go to Supabase Dashboard**: https://supabase.com/dashboard
2. **Select your project**: `xpasvhmwuhipzvcqohhq`
3. **Click "SQL Editor"** (left sidebar)
4. **Click "+ New query"**
5. **Copy and paste this SQL**:

```sql
-- Fix RLS policies to allow public reading
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access to properties" ON properties;

-- Create new policy for public read access
CREATE POLICY "Allow public read access to properties"
ON properties
FOR SELECT
TO public
USING (is_available = true);

-- Also fix property_rooms table
ALTER TABLE property_rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to property_rooms" ON property_rooms;

CREATE POLICY "Allow public read access to property_rooms"
ON property_rooms
FOR SELECT
TO public
USING (is_available = true);

-- Fix property_amenities table
ALTER TABLE property_amenities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to property_amenities" ON property_amenities;

CREATE POLICY "Allow public read access to property_amenities"
ON property_amenities
FOR SELECT
TO public
USING (true);
```

6. **Click "RUN"** (bottom right)
7. **Wait for "Success. No rows returned"** message

---

### Step 2: Verify Environment Variables in Vercel

Double-check that these 4 variables exist in Vercel with the EXACT names:

| Variable Name | Value | Environments |
|---------------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xpasvhmwuhipzvcqohhq.supabase.co` | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | Production, Preview, Development |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_1DP5mmOlF5G5ag` | Production, Preview, Development |
| `RAZORPAY_KEY_SECRET` | `thisissecretkey` | Production, Preview, Development |

**To check:**
1. Go to: https://vercel.com/dashboard
2. Click your project
3. Click **Settings** → **Environment Variables**
4. Verify all 4 variables are there
5. Verify each has all 3 environments checked ✓

---

### Step 3: Force Redeploy

Even if environment variables are set, you need to redeploy to make them active:

**Option A - Trigger Redeploy from Vercel:**
1. Go to **Deployments** tab
2. Click the **⋮** (3 dots) on the latest deployment
3. Click **Redeploy**
4. Click **Redeploy** again to confirm
5. Wait 1-2 minutes for deployment to complete

**Option B - Push a Small Change to GitHub:**
```bash
# In your local project directory
git commit --allow-empty -m "Force redeploy for env vars"
git push origin master
```

This will trigger a new deployment automatically.

---

### Step 4: Test the Deployed Site

After 2-3 minutes:

1. **Clear your browser cache**: Press `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. **Open your deployed site**: `https://niwsasa.vercel.app` (or your URL)
3. **Click on the search bar**
4. **You should now see locations** like:
   - Aecs layout
   - Singasandra
   - Koramangala
   - etc.

---

## 🔍 Still Not Working? Debug It

If locations still don't show, let's debug:

### Check Browser Console:

1. **On your deployed site**, press **F12**
2. Go to **Console** tab
3. Click on the search bar
4. Look for console logs that start with:
   - 🔄 Starting to fetch locations...
   - 🌐 Fetching from: /api/get-locations
   - 📡 Response status: 200
   - 📦 Response data: {...}

### Manually Test the API:

In the browser console, run:

```javascript
fetch('/api/get-locations')
  .then(r => r.json())
  .then(data => {
    console.log('Success:', data.success);
    console.log('Locations:', data.locations);
    console.log('Count:', data.dynamic_count);
    console.log('Error:', data.error);
  })
```

**Expected Output:**
```json
{
  "success": true,
  "locations": [
    "a block, 60 feet road",
    "Singasandra",
    "60 feet road, aecs layout, Banglore",
    "Banglore",
    "aecs layout",
    ...
  ],
  "dynamic_count": 6,
  "static_count": 0
}
```

**If you see:**

❌ **`success: false`** with an error message:
- Copy the error message
- It will tell you exactly what's wrong (likely RLS policy issue)

❌ **`locations: []`** but `dynamic_count: 6`:
- Database has data but query is filtered by RLS
- Go back to Step 1 and run the SQL again
- Make sure you see "Success" after running SQL

❌ **`dynamic_count: 0`**:
- No properties in database
- Need to add sample data (see next section)

---

## 📊 Add Sample Data (If Database is Empty)

If `dynamic_count: 0`, your database is empty:

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Click "+ New query"**
3. **Find the file** `supabase/sample-data.sql` in your codebase
4. **Copy the entire content** and paste it
5. **Click "RUN"**
6. **Should see**: "Success. 6 rows returned"

---

## 🎯 Quick Troubleshooting Checklist

Go through this list in order:

- [ ] Ran RLS policy SQL in Supabase SQL Editor
- [ ] Saw "Success" message after running SQL
- [ ] Verified all 4 environment variables exist in Vercel
- [ ] All environment variables have all 3 environments checked
- [ ] Redeployed the site after setting variables
- [ ] Waited at least 2-3 minutes for deployment to complete
- [ ] Cleared browser cache (Ctrl + Shift + R)
- [ ] Opened deployed site in incognito/private window
- [ ] Checked browser console for errors
- [ ] Manually tested `/api/get-locations` endpoint
- [ ] Verified database has sample data (6 properties)

---

## 💡 Why This Happens

**Localhost works** because:
- Your `.env` file provides environment variables locally
- Local development might bypass some RLS checks
- Data is directly accessible

**Deployment doesn't work** because:
- Environment variables must be manually added in Vercel
- Row Level Security (RLS) is enforced strictly
- Public access requires explicit policies

---

## 📸 What You Should See After Fix

**Before (Current):**
```
Available Locations (32 total)
Showing nearest locations first based on your location

[Empty - shows "Coming Soon"]
```

**After (Fixed):**
```
Available Locations (32 total)
🟢 Sorted by distance
Showing nearest locations first based on your location

📍 Aecs layout
   a block, 60 feet road

📍 Singasandra
   60 feet road, aecs layout, Banglore

📍 Singasandra
   60 feet road, aecs layout

[... more locations ...]
```

---

## 🆘 Still Need Help?

If you've followed all steps and it's still not working, tell me:

1. **Screenshot of browser console** (F12 → Console tab) after clicking search
2. **Output of the manual API test** (the fetch command above)
3. **Screenshot of Vercel environment variables** page
4. **Any error messages** you see

I'll help you debug further!

---

## ✅ Success Indicators

You'll know it's working when:

1. ✅ Click on search bar → locations immediately appear
2. ✅ See "Sorted by distance" green badge (if location permission granted)
3. ✅ Can search and filter locations by typing
4. ✅ Clicking a location shows nearby properties
5. ✅ No "Coming Soon" message

---

## 🔑 Key Takeaway

The main issue is **Row Level Security (RLS) policies** in Supabase. Step 1 (running the SQL) is the most critical step that will likely fix your issue.

Environment variables are already set (from your screenshot), so the SQL fix should resolve everything!
