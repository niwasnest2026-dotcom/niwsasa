# Payment Flow Debug Guide

## Step 1: Test Razorpay Credentials
Visit: http://localhost:3002/api/test-razorpay

Expected Response:
```json
{
  "success": true,
  "message": "Razorpay is working correctly",
  "testOrder": {
    "id": "order_...",
    "amount": 10000,
    "currency": "INR"
  }
}
```

## Step 2: Manual Payment Flow Test

### 2a. Login to the application
- Go to http://localhost:3002
- Click "Login" or "Book a Stay"
- Login with your credentials

### 2b. Select a property and room
- Browse listings
- Click on a property
- Select a room

### 2c. Fill booking details
- Enter guest name
- Enter guest email
- Enter guest phone (10 digits)
- Click "Pay Now"

### 2d. Check browser console for logs
Look for these logs in order:
1. `🔑 Razorpay Key: rzp_test_...`
2. `✅ Script Loaded: true`
3. `✅ Window.Razorpay: function`

### 2e. Complete Razorpay payment
- Razorpay modal should open
- Use test card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- Click Pay

### 2f. Check for success
Expected flow:
1. Payment modal closes
2. Redirects to `/booking-success?booking_id=...`
3. Shows "Booking Confirmed! 🎉"
4. Displays booking details

## Step 3: Verify in Admin Panel
- Go to http://localhost:3002/admin/bookings
- Should see the new booking in the table
- Payment status should be "Paid"
- Booking status should be "Booked"

## Step 4: Check Server Logs
Look for these logs in terminal:

### Create Order Logs:
```
📨 Create Order Request Received
🔐 Auth Header Present: true
🔍 Verifying user session...
👤 User: [user-id]
📦 Parsing request body...
📋 Request Data: { propertyId, amount, userDetailsPresent }
🏠 Validating property: [property-id]
🏠 Property Found: [property-name]
💳 Initializing Razorpay...
🔑 Razorpay Config: { hasKeyId: true, hasKeySecret: true }
📝 Creating Razorpay order...
✅ Order Created: [order-id]
```

### Verify Payment Logs:
```
🔍 Payment verification started
🔐 Auth Header Present: true
✅ User authenticated: [user-id]
📝 Request body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
✅ Razorpay signature verified
🏠 Property found: [property-name]
📝 Creating new booking...
✅ Booking created successfully: [booking-id]
```

## Troubleshooting

### Issue: "Unable to start payment"
- Check browser console for errors
- Verify Razorpay script loaded
- Check if user is logged in
- Verify all form fields are filled

### Issue: "Payment verification failed"
- Check server logs for signature verification error
- Verify Razorpay credentials in .env
- Check if booking table exists in Supabase

### Issue: Booking not showing in admin
- Verify user is logged in as admin
- Check if booking was created in Supabase
- Check admin/bookings page for errors

### Issue: 500 Error on create-order
- Check server logs for detailed error
- Verify Razorpay credentials
- Verify Supabase connection
- Check if property exists in database

## Database Check

Run in Supabase SQL Editor:
```sql
-- Check bookings table
SELECT * FROM bookings ORDER BY booking_date DESC LIMIT 10;

-- Check if booking was created
SELECT id, guest_name, guest_email, payment_status, booking_status 
FROM bookings 
WHERE guest_email = 'your-email@example.com';
```

## Environment Variables Check

Verify in .env:
```
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_S1qXBoeUDt3iXE
RAZORPAY_KEY_SECRET=76nN6M0n3CrYbqnW5vm7nOE8
NEXT_PUBLIC_SUPABASE_URL=https://xpasvhmwuhipzvcqohhq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-key]
SUPABASE_SERVICE_ROLE_KEY=[your-key]
```

## Test Razorpay Cards

**Success:**
- Card: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits

**Failure:**
- Card: 4000 0000 0000 0002
- Expiry: Any future date
- CVV: Any 3 digits
