import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing Razorpay Configuration...');
    
    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    console.log('🔑 Credentials Check:', {
      keyId: keyId ? `${keyId.substring(0, 15)}...` : 'MISSING',
      keySecret: keySecret ? `${keySecret.substring(0, 10)}...` : 'MISSING'
    });

    if (!keyId || !keySecret) {
      return NextResponse.json({
        success: false,
        error: 'Missing Razorpay credentials',
        details: {
          hasKeyId: !!keyId,
          hasKeySecret: !!keySecret
        }
      }, { status: 400 });
    }

    // Try to initialize Razorpay
    console.log('💳 Initializing Razorpay...');
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    console.log('✅ Razorpay initialized successfully');

    // Try to create a test order
    console.log('📝 Creating test order...');
    const testOrder = await razorpay.orders.create({
      amount: 10000, // ₹100
      currency: 'INR',
      receipt: `test_${Date.now()}`,
    });

    console.log('✅ Test order created:', testOrder.id);

    return NextResponse.json({
      success: true,
      message: 'Razorpay is working correctly',
      testOrder: {
        id: testOrder.id,
        amount: testOrder.amount,
        currency: testOrder.currency
      }
    });

  } catch (error: any) {
    console.error('❌ Razorpay Test Error:', {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      response: error.response?.data
    });

    return NextResponse.json({
      success: false,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.response?.data
    }, { status: 500 });
  }
}
