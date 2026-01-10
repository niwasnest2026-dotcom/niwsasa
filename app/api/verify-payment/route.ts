import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Payment verification started');
    
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user session
    const supabase = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_ANON_KEY,
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError);
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    console.log('✅ User authenticated:', user.id);

    // Extract payment data
    const body = await request.json();
    console.log('📝 Request body:', { ...body, razorpay_signature: '[HIDDEN]' });

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      propertyId,
      roomId,
      userDetails
    } = body;

    // Validate required fields
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !propertyId || !userDetails) {
      console.error('❌ Missing required fields:', {
        razorpay_order_id: !!razorpay_order_id,
        razorpay_payment_id: !!razorpay_payment_id,
        razorpay_signature: !!razorpay_signature,
        propertyId: !!propertyId,
        roomId: !!roomId,
        userDetails: !!userDetails
      });
      return NextResponse.json(
        { success: false, error: 'Missing required payment verification data' },
        { status: 400 }
      );
    }

    // Verify Razorpay signature
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET || ENV_CONFIG.RAZORPAY_KEY_SECRET;
    console.log('🔑 Using Razorpay Secret:', razorpaySecret ? `${razorpaySecret.substring(0, 10)}...` : 'MISSING');
    
    const signatureBody = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpaySecret)
      .update(signatureBody.toString())
      .digest('hex');

    console.log('🔐 Signature Check:', {
      signatureBody: signatureBody.substring(0, 30) + '...',
      expectedSignatureStart: expectedSignature.substring(0, 20) + '...',
      receivedSignatureStart: razorpay_signature.substring(0, 20) + '...',
      match: expectedSignature === razorpay_signature
    });

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      console.error('❌ Signature verification failed');
      return NextResponse.json(
        { success: false, error: 'Payment verification failed - invalid signature' },
        { status: 400 }
      );
    }

    console.log('✅ Razorpay signature verified');

    // Create admin client for database operations
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    // Validate property exists
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name, price, security_deposit')
      .eq('id', propertyId)
      .single();

    if (propertyError || !property) {
      console.error('❌ Property not found:', propertyError);
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404 }
      );
    }

    console.log('✅ Property found:', property.name);

    // Fetch room details if roomId is provided
    let room = null;
    if (roomId) {
      const { data: roomData, error: roomError } = await supabaseAdmin
        .from('property_rooms')
        .select('*')
        .eq('id', roomId)
        .eq('property_id', propertyId)
        .single();

      if (roomError || !roomData) {
        console.error('❌ Room not found:', roomError);
        return NextResponse.json(
          { success: false, error: 'Room not found' },
          { status: 404 }
        );
      }

      room = roomData;
      console.log('✅ Room found:', `Room ${room.room_number} - ${room.sharing_type}`);
    }

    // Check if booking already exists
    const { data: existingBooking } = await supabaseAdmin
      .from('bookings')
      .select('id')
      .eq('payment_id', razorpay_payment_id)
      .single();

    if (existingBooking) {
      console.log('⚠️ Booking already exists:', existingBooking.id);
      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        booking_id: existingBooking.id,
        property_name: property.name
      });
    }

    console.log('📝 Creating new booking...');

    // Use room pricing if available, otherwise fall back to property pricing
    const pricePerPerson = room ? room.price_per_person : property.price;
    const securityDeposit = room ? (room.security_deposit_per_person || 0) : (property.security_deposit || 0);
    const sharingType = room ? room.sharing_type : 'Single Room';

    console.log('💰 Pricing Info:', {
      pricePerPerson,
      securityDeposit,
      sharingType,
      roomProvided: !!room
    });

    // Create booking data matching the database schema
    const bookingData: any = {
      property_id: propertyId,
      user_id: user.id,
      guest_name: userDetails.name,
      guest_email: userDetails.email || user.email,
      guest_phone: userDetails.phone,
      sharing_type: sharingType,
      price_per_person: pricePerPerson || 0,
      total_amount: pricePerPerson || 0,
      amount_paid: Math.round((pricePerPerson || 0) * 0.2),
      amount_due: Math.round((pricePerPerson || 0) * 0.8),
      payment_method: 'razorpay',
      payment_status: 'paid',
      booking_status: 'booked',
      payment_id: razorpay_payment_id,
      payment_date: new Date().toISOString(),
      booking_date: new Date().toISOString(),
      notes: `Razorpay Payment: ${razorpay_payment_id} | Order: ${razorpay_order_id}`
    };

    // Add optional fields only if they have values
    if (roomId) {
      bookingData.room_id = roomId;
    }
    if (securityDeposit > 0) {
      bookingData.security_deposit_per_person = securityDeposit;
    }

    console.log('📝 Booking data to insert:', JSON.stringify(bookingData, null, 2));

    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (bookingError) {
      console.error('❌ Booking creation failed:', bookingError);
      console.error('📝 Full error details:', JSON.stringify(bookingError, null, 2));
      console.error('📝 Booking data that failed:', JSON.stringify({ ...bookingData, notes: '[PAYMENT_INFO]' }, null, 2));

      return NextResponse.json({
        success: false,
        message: 'Payment received but booking pending. Support will contact you.',
        razorpay_payment_id: razorpay_payment_id,
        support_needed: true,
        error: bookingError.message,
        error_details: bookingError.details,
        error_hint: bookingError.hint,
        error_code: bookingError.code
      }, { status: 500 });
    }

    console.log('✅ Booking created successfully:', booking.id);
    console.log('✅ Booking details:', {
      id: booking.id,
      user_id: booking.user_id,
      payment_id: booking.payment_id,
      booking_status: booking.booking_status,
      payment_status: booking.payment_status
    });

    return NextResponse.json({
      success: true,
      message: 'Payment verified and booking created successfully',
      booking_id: booking.id,
      razorpay_payment_id: razorpay_payment_id,
      property_name: property.name,
      guest_name: bookingData.guest_name,
      amount_paid: bookingData.amount_paid,
      amount_due: bookingData.amount_due
    });

  } catch (error: any) {
    console.error('Payment verification error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Payment verification failed',
        message: 'Technical error occurred. Please contact support if payment was deducted.'
      },
      { status: 500 }
    );
  }
}