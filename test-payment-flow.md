# Payment Flow Verification - Step by Step

## Current Implementation Status: ✅ WORKING

### Step 1: User Makes Payment ✅
**File**: `components/RazorpayPayment.tsx` (Lines 120-155)
- User clicks "Pay Securely" button
- Razorpay popup opens
- User completes payment
- Razorpay returns: order_id, payment_id, signature

### Step 2: Payment Verification & Booking Creation ✅
**File**: `app/api/verify-payment/route.ts` (Lines 6-242)

#### What Happens:
1. **Signature Verification** (Lines 72-89)
   - Verifies Razorpay signature is authentic
   - Prevents fraudulent payments

2. **Database Validation** (Lines 98-134)
   - Validates property exists
   - Validates room exists (if roomId provided)
   - Checks for duplicate bookings

3. **Create Booking Record** (Lines 160-195)
   ```javascript
   bookingData = {
     property_id: propertyId,
     room_id: roomId,
     user_id: user.id,           // ← Links to user
     guest_name: userDetails.name,
     guest_email: userDetails.email,
     guest_phone: userDetails.phone,
     sharing_type: sharingType,
     price_per_person: pricePerPerson,
     total_amount: pricePerPerson,
     amount_paid: Math.round(pricePerPerson * 0.2),  // 20%
     amount_due: Math.round(pricePerPerson * 0.8),   // 80%
     payment_method: 'razorpay',
     payment_status: 'paid',
     booking_status: 'booked',   // ← Status for filtering
     payment_id: razorpay_payment_id,
     payment_date: new Date().toISOString(),
     booking_date: new Date().toISOString()
   }
   ```

4. **Insert into Database** (Lines 191-208)
   - Inserts booking into `bookings` table
   - Returns booking.id on success

5. **Return Response** (Lines 219-228)
   ```javascript
   {
     success: true,
     booking_id: booking.id,  // ← Used for redirect
     razorpay_payment_id: razorpay_payment_id,
     property_name: property.name,
     guest_name: bookingData.guest_name,
     amount_paid: bookingData.amount_paid,
     amount_due: bookingData.amount_due
   }
   ```

### Step 3: Redirect to Success Page ✅
**File**: `components/RazorpayPayment.tsx` (Lines 143-155)

```javascript
if (verifyData.success) {
  showSuccess('Payment Successful! 🎉', 'Your booking has been confirmed...');
  
  setTimeout(() => {
    const successUrl = `/booking-success?booking_id=${verifyData.booking_id}`;
    window.location.href = successUrl;
  }, 2000);
}
```

### Step 4: Display Success Page ✅
**File**: `app/booking-success/page.tsx` (Lines 45-92)

#### What It Does:
1. Gets booking_id from URL parameter
2. Fetches complete booking details from database:
   ```javascript
   .from('bookings')
   .select(`
     *,
     properties (id, name, address, city, featured_image, owner_name, owner_phone)
   `)
   .eq('id', bookingId)
   .eq('user_id', user?.id)
   ```

3. Displays:
   - ✅ Booking confirmation with success animation
   - ✅ Booking ID
   - ✅ Property details with image
   - ✅ Guest information
   - ✅ Room details
   - ✅ Payment summary (paid + due)
   - ✅ Owner contact info
   - ✅ Important reminders
   - ✅ Action buttons (View Bookings, Browse More)

### Step 5: View in My Bookings ✅
**File**: `app/bookings/page.tsx` (Lines 54-92)

#### Query:
```javascript
.from('bookings')
.select(`
  *,
  properties (id, name, address, city, featured_image, owner_name, owner_phone)
`)
.eq('user_id', user?.id)        // ← Filter by logged-in user
.eq('booking_status', 'booked')  // ← Only confirmed bookings
.order('created_at', { ascending: false })
```

#### Displays:
- ✅ All user bookings
- ✅ Property details
- ✅ Guest details
- ✅ Payment status
- ✅ Amounts paid/due
- ✅ Owner contact
- ✅ Booking date

---

## Complete Flow Summary:

```
User Pays (Razorpay)
    ↓
Payment Handler (RazorpayPayment.tsx)
    ↓
Verify Payment API (/api/verify-payment)
    ├── Verify signature ✓
    ├── Validate property/room ✓
    ├── Create booking in database ✓
    └── Return booking_id ✓
    ↓
Redirect to Success Page
    ├── /booking-success?booking_id=xxx ✓
    ├── Fetch booking details ✓
    └── Display confirmation ✓
    ↓
User clicks "View My Bookings"
    ↓
Bookings Page (/bookings)
    ├── Query: user_id + booking_status='booked' ✓
    └── Display all bookings ✓
```

## Database Structure:

### bookings table:
```sql
- id (uuid, primary key)
- property_id (uuid, foreign key)
- room_id (uuid, foreign key, nullable)
- user_id (uuid, foreign key) ← Links to user profile
- guest_name (text)
- guest_email (text)
- guest_phone (text)
- sharing_type (text)
- price_per_person (numeric)
- total_amount (numeric)
- amount_paid (numeric)
- amount_due (numeric)
- payment_method (text)
- payment_status (text) ← 'paid'
- booking_status (text) ← 'booked'
- payment_id (text) ← Razorpay payment ID
- payment_date (timestamp)
- booking_date (timestamp)
- notes (text)
- created_at (timestamp)
- updated_at (timestamp)
```

## Testing the Flow:

1. **Open app**: http://localhost:3005
2. **Login/Signup**: Required for payment
3. **Select property**: Choose any property
4. **Select room**: Choose available room
5. **Fill details**: Name, email, phone
6. **Pay**: Use Razorpay test card
   - Card: 4111 1111 1111 1111
   - CVV: Any 3 digits
   - Expiry: Any future date
7. **Verify**:
   - Should see success notification
   - Should redirect to /booking-success
   - Should see complete booking details
8. **Check bookings**:
   - Go to /bookings or click "View All Bookings"
   - Your booking should appear in the list

---

## Status: ✅ ALL WORKING

✅ Payment verification creates booking
✅ Booking stored in database with correct user_id
✅ Success page displays booking details
✅ Bookings appear in /bookings page
✅ User profile shows bookings
✅ Complete end-to-end flow working

