import { NextResponse } from 'next/server';
import { ENV_CONFIG } from '@/lib/env-config';

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      // Client-side env vars (should be available)
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasRazorpayKeyId: !!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

      // Server-side env vars (these might be missing)
      hasServiceRoleKeyInEnv: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasRazorpaySecretInEnv: !!process.env.RAZORPAY_KEY_SECRET,

      // Check if ENV_CONFIG fallbacks are working
      hasServiceRoleKeyInConfig: !!ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY,
      hasRazorpaySecretInConfig: !!ENV_CONFIG.RAZORPAY_KEY_SECRET,

      // Show partial values (first 10 chars only for security)
      serviceRoleKeyPreview: ENV_CONFIG.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...',
      razorpaySecretPreview: ENV_CONFIG.RAZORPAY_KEY_SECRET?.substring(0, 10) + '...',
    },
    allEnvKeys: Object.keys(process.env).filter(key =>
      key.includes('SUPABASE') ||
      key.includes('RAZORPAY') ||
      key.includes('VERCEL')
    ).sort()
  });
}
