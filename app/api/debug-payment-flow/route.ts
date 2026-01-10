import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Razorpay from 'razorpay';

export async function GET(request: NextRequest) {
  const results: any = {
    timestamp: new Date().toISOString(),
    checks: {}
  };

  // 1. Check Environment Variables
  results.checks.environment = {
    SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ? 
      `${process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID.substring(0, 15)}...` : 'MISSING',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET ? 
      `${process.env.RAZORPAY_KEY_SECRET.substring(0, 10)}...` : 'MISSING',
    IS_LIVE_MODE: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_live_') || false
  };

  // 2. Test Supabase Connection
  try {
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Test properties table
    const { data: properties, error: propError } = await supabaseAdmin
      .from('properties')
      .select('id, name, price, security_deposit')
      .limit(1);

    results.checks.supabase_properties = {
      success: !propError,
      count: properties?.length || 0,
      sample: properties?.[0] ? {
        id: properties[0].id,
        name: properties[0].name,
        price: properties[0].price,
        security_deposit: properties[0].security_deposit
      } : null,
      error: propError?.message
    };

    // Test bookings table schema
    const { data: bookings, error: bookError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .limit(1);

    results.checks.supabase_bookings = {
      success: !bookError,
      count: bookings?.length || 0,
      columns: bookings?.[0] ? Object.keys(bookings[0]) : [],
      error: bookError?.message
    };

    // Test INSERT capability with a dry run (we'll rollback)
    if (properties?.[0]) {
      const testBookingData = {
        property_id: properties[0].id,
        user_id: null, // Will be null for test
        guest_name: 'TEST_USER_DELETE_ME',
        guest_email: 'test@test.com',
        guest_phone: '9999999999',
        sharing_type: 'Single Room',
        price_per_person: 1000,
        security_deposit_per_person: 500,
        total_amount: 1500,
        amount_paid: 200,
        amount_due: 1300,
        payment_method: 'razorpay',
        payment_status: 'pending',
        booking_status: 'pending',
        payment_id: 'TEST_PAYMENT_DELETE_ME',
        notes: 'DEBUG TEST - DELETE THIS'
      };

      const { data: testInsert, error: insertError } = await supabaseAdmin
        .from('bookings')
        .insert(testBookingData)
        .select()
        .single();

      if (testInsert) {
        // Delete the test record
        await supabaseAdmin
          .from('bookings')
          .delete()
          .eq('id', testInsert.id);

        results.checks.booking_insert_test = {
          success: true,
          message: 'Test booking created and deleted successfully',
          created_id: testInsert.id
        };
      } else {
        results.checks.booking_insert_test = {
          success: false,
          error: insertError?.message,
          error_details: insertError?.details,
          error_hint: insertError?.hint,
          error_code: insertError?.code,
          test_data: testBookingData
        };
      }
    }

  } catch (error: any) {
    results.checks.supabase_connection = {
      success: false,
      error: error.message
    };
  }

  // 3. Test Razorpay Connection
  try {
    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Try to fetch orders (this validates credentials)
    const orders = await razorpay.orders.all({ count: 1 });
    
    results.checks.razorpay = {
      success: true,
      message: 'Razorpay credentials valid',
      recent_orders_count: orders.count || 0,
      mode: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.startsWith('rzp_live_') ? 'LIVE' : 'TEST'
    };
  } catch (error: any) {
    results.checks.razorpay = {
      success: false,
      error: error.message,
      description: error.error?.description
    };
  }

  // 4. Summary
  const allChecks = Object.values(results.checks);
  const passedChecks = allChecks.filter((c: any) => c.success).length;
  
  results.summary = {
    total_checks: allChecks.length,
    passed: passedChecks,
    failed: allChecks.length - passedChecks,
    status: passedChecks === allChecks.length ? '✅ ALL CHECKS PASSED' : '❌ SOME CHECKS FAILED'
  };

  return NextResponse.json(results, { status: 200 });
}
