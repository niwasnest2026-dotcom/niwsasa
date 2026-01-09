# 🚨 URGENT: Payment Failing - Missing Environment Variable

## Current Status

✅ **Payment button is now working** - Shows "Pay ₹2 Securely"
❌ **Payment is failing** - Error: "Unable to start payment"

## The Problem

When you click "Pay ₹2 Securely", the system tries to call `/api/create-order` which:
1. ✅ Authenticates your user session
2. ❌ **FAILS** trying to validate the property because `SUPABASE_SERVICE_ROLE_KEY` is missing
3. Returns 500 error
4. Shows error message to user

## The Solution (Takes 2 Minutes)

### Step 1: Add Environment Variable to Vercel

**This is CRITICAL and MUST be done now:**

1. Go to: https://vercel.com/dashboard
2. Click your project (niwsasa)
3. Click **Settings** (top menu)
4. Click **Environment Variables** (left sidebar)
5. Click **Add New** button
6. Fill in:

```
Key: SUPABASE_SERVICE_ROLE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhwYXN2aG13dWhpcHp2Y3FvaGhxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NjQ5OTk4MywiZXhwIjoyMDgyMDc1OTgzfQ.OxhiMU3PjWc9OIityt7NWCmWq90VrCihFulZKu8Isy4
Environments: ☑ Production ☑ Preview ☑ Development (check ALL 3 boxes)
```

7. Click **Save**

### Step 2: Redeploy

After adding the variable:

1. Go to **Deployments** tab (top menu)
2. Find the latest deployment (should be at the top)
3. Click the **⋮** (3 dots button) on the right
4. Click **Redeploy**
5. Confirm by clicking **Redeploy** again
6. Wait 2-3 minutes for deployment to complete

### Step 3: Test

After redeployment:

1. **Hard refresh your browser**: `Ctrl + Shift + R` (Windows) or `Cmd + Shift + R` (Mac)
2. Go to booking page
3. Click **"Pay ₹2 Securely"**
4. **It should now open the Razorpay payment modal** (not show an error)
5. Complete test payment
6. Should redirect to success page
7. Booking should appear in "My Bookings"

---

## Why This is Happening

The code needs `SUPABASE_SERVICE_ROLE_KEY` in **TWO places**:

1. **`/api/create-order`** (Line 57) - To validate property exists ← **Currently failing here**
2. **`/api/verify-payment`** (Line 92) - To create booking after payment

Without this key:
- ❌ Can't validate property
- ❌ Can't create booking
- ❌ Payment flow completely broken

## After Fix

Once you add the key and redeploy:

✅ Click "Pay ₹2 Securely"
✅ Razorpay modal opens
✅ Complete payment
✅ Booking is created
✅ Appears in "My Bookings"
✅ Success page is shown

Everything will work perfectly!

---

## Current Environment Variables in Vercel

Make sure you have ALL 5 of these:

- [x] `NEXT_PUBLIC_SUPABASE_URL`
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [x] `NEXT_PUBLIC_RAZORPAY_KEY_ID`
- [x] `RAZORPAY_KEY_SECRET`
- [ ] `SUPABASE_SERVICE_ROLE_KEY` ⚠️ **MISSING - ADD THIS NOW!**

---

## Important Security Note

`SUPABASE_SERVICE_ROLE_KEY` is a sensitive key that:
- ✅ Gives admin access to your database
- ✅ Is ONLY used in server-side API routes (never in client code)
- ✅ Your code correctly uses it only in `/api/create-order` and `/api/verify-payment`
- ⚠️ Keep it secret - never commit to git or expose in client-side code

---

## Total Time Required

⏱️ **2-3 minutes to add variable**
⏱️ **2-3 minutes for deployment**
⏱️ **Total: ~5 minutes to complete fix**

---

## Screenshot for Reference

After adding, you should see in Vercel → Settings → Environment Variables:

```
NEXT_PUBLIC_RAZORPAY_KEY_ID          | ••••••••••• | Production, Preview, Development
NEXT_PUBLIC_SUPABASE_ANON_KEY       | ••••••••••• | Production, Preview, Development
NEXT_PUBLIC_SUPABASE_URL            | ••••••••••• | Production, Preview, Development
RAZORPAY_KEY_SECRET                 | ••••••••••• | Production, Preview, Development
SUPABASE_SERVICE_ROLE_KEY          | ••••••••••• | Production, Preview, Development ← NEW!
```

---

## Need Help?

If you get stuck:
1. Take a screenshot of Vercel environment variables page
2. Take a screenshot of any error messages
3. Let me know which step you're on

**But honestly, it's just: Add variable → Redeploy → Wait → Test. That's it!**

🎯 **Do this now and your entire payment system will work!**
