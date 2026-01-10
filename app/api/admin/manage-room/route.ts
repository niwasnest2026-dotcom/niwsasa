import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    // Verify user is admin
    const supabaseAuth = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ success: false, error: 'Invalid authentication' }, { status: 401 });
    }

    // Check if user is admin
    const { data: profile } = await supabaseAuth
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ success: false, error: 'Admin access required' }, { status: 403 });
    }

    // Use service role for admin operations (bypasses RLS)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { action, roomId, roomData } = body;

    if (action === 'create') {
      // Create new room
      const { data, error } = await supabaseAdmin
        .from('property_rooms')
        .insert(roomData)
        .select()
        .single();

      if (error) {
        console.error('Room create error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, room: data });
    }

    if (action === 'update') {
      // Update existing room
      if (!roomId) {
        return NextResponse.json({ success: false, error: 'Room ID required' }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from('property_rooms')
        .update(roomData)
        .eq('id', roomId);

      if (error) {
        console.error('Room update error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Room updated successfully' });
    }

    if (action === 'delete') {
      // Delete room
      if (!roomId) {
        return NextResponse.json({ success: false, error: 'Room ID required' }, { status: 400 });
      }

      const { error } = await supabaseAdmin
        .from('property_rooms')
        .delete()
        .eq('id', roomId);

      if (error) {
        console.error('Room delete error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'Room deleted successfully' });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });

  } catch (error: any) {
    console.error('Admin room management error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
