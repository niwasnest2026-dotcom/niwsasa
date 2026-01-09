import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from '@supabase/supabase-js';
import { ENV_CONFIG } from '@/lib/env-config';

export async function POST(request: NextRequest) {
  try {
    console.log('📨 Create Order Request Received');
    
    // Validate authentication first
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Auth Header Present:', !!authHeader);
    
    if (!authHeader) {
      console.error('❌ No authorization header');
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Verify user session
    console.log('🔍 Verifying user session...');
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
    console.log('👤 User:', user?.id, 'Auth Error:', authError?.message);
    
    if (authError || !user) {
      console.error('❌ Authentication failed:', authError?.message);
      return NextResponse.json(
        { success: false, message: 'Invalid authentication' },
        { status: 401 }
      );
    }

    // Parse request body
    console.log('📦 Parsing request body...');
    const body = await request.json();
    const { propertyId, amount, userDetails } = body;
    console.log('📋 Request Data:', { propertyId, amount, userDetailsPresent: !!userDetails });

    // Validate required fields
    if (!propertyId || !amount || !userDetails?.name || !userDetails?.email || !userDetails?.phone) {
      console.error('❌ Missing required fields:', { propertyId, amount, userDetails });
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate property exists
    console.log('🏠 Validating property:', propertyId);
    const supabaseAdmin = createClient(
      ENV_CONFIG.SUPABASE_URL,
      ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .select('id, name, price')
      .eq('id', propertyId)
      .single();

    console.log('🏠 Property Found:', property?.name, 'Error:', propertyError?.message);

    if (propertyError || !property) {
      console.error('❌ Property not found:', propertyError?.message);
      return NextResponse.json(
        { success: false, message: 'Property not available' },
        { status: 404 }
      );
    }

    // Initialize Razorpay only after validation
    console.log('💳 Initializing Razorpay...');
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('🔑 Razorpay Config:', {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
      keyIdLength: keyId?.length,
      keySecretLength: keySecret?.length
    });

    if (!keyId || !keySecret) {
      console.error('❌ Missing Razorpay credentials');
      return NextResponse.json(
        { success: false, message: 'Payment system not configured' },
        { status: 500 }
      );
    }

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create Razorpay order
    console.log('📝 Creating Razorpay order...');
    const orderOptions = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}_${propertyId.slice(-8)}`,
      notes: {
        property_id: propertyId,
        property_name: property.name,
        user_id: user.id,
        user_email: user.email,
        guest_name: userDetails.name,
        guest_email: userDetails.email,
        guest_phone: userDetails.phone
      },
    };

    console.log('📋 Order Options:', { amount: orderOptions.amount, currency: orderOptions.currency });

    const order = await razorpay.orders.create(orderOptions as any) as any;
    console.log('✅ Order Created:', order.id);

    return NextResponse.json({
      success: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      property: {
        id: property.id,
        name: property.name
      },
      user: {
        id: user.id,
        email: user.email
      }
    });

  } catch (error: any) {
    console.error('❌ Order creation error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      name: error.name,
      stack: error.stack?.split('\n').slice(0, 3).join('\n')
    });

    // Return detailed error for debugging
    return NextResponse.json(
      {
        success: false,
        message: 'Unable to create payment order',
        error: error.message || 'Unknown error',
        errorCode: error.code || error.statusCode || 'UNKNOWN'
      },
      { status: 500 }
    );
  }
}