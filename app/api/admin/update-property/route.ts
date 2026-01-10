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

    // Use service role for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await request.json();
    const { propertyId, propertyData, selectedAmenities } = body;

    if (!propertyId) {
      return NextResponse.json({ success: false, error: 'Property ID required' }, { status: 400 });
    }

    // Update property
    const { error: propertyError } = await supabaseAdmin
      .from('properties')
      .update({
        ...propertyData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', propertyId);

    if (propertyError) {
      console.error('Property update error:', propertyError);
      return NextResponse.json({ success: false, error: propertyError.message }, { status: 500 });
    }

    // Update amenities - delete existing and insert new
    const { error: deleteError } = await supabaseAdmin
      .from('property_amenities')
      .delete()
      .eq('property_id', propertyId);

    if (deleteError) {
      console.error('Amenities delete error:', deleteError);
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    if (selectedAmenities && selectedAmenities.length > 0) {
      const amenityInserts = selectedAmenities.map((amenityId: string) => ({
        property_id: propertyId,
        amenity_id: amenityId,
      }));

      const { error: insertError } = await supabaseAdmin
        .from('property_amenities')
        .insert(amenityInserts);

      if (insertError) {
        console.error('Amenities insert error:', insertError);
        return NextResponse.json({ success: false, error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, message: 'Property updated successfully' });

  } catch (error: any) {
    console.error('Admin update error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
