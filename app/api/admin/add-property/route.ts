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
    const { propertyData, selectedAmenities, createDefaultRoom } = body;

    // Insert property
    const { data: property, error: propertyError } = await supabaseAdmin
      .from('properties')
      .insert(propertyData)
      .select()
      .single();

    if (propertyError) {
      console.error('Property insert error:', propertyError);
      return NextResponse.json({ success: false, error: propertyError.message }, { status: 500 });
    }

    // Insert amenities if selected
    if (selectedAmenities && selectedAmenities.length > 0) {
      const amenityInserts = selectedAmenities.map((amenityId: string) => ({
        property_id: property.id,
        amenity_id: amenityId,
      }));

      const { error: amenitiesError } = await supabaseAdmin
        .from('property_amenities')
        .insert(amenityInserts);

      if (amenitiesError) {
        console.error('Amenities insert error:', amenitiesError);
        // Don't fail the entire operation
      }
    }

    // Create default room if requested
    if (createDefaultRoom) {
      const defaultRoom = {
        property_id: property.id,
        room_number: 'Room 1',
        room_type: 'Standard',
        sharing_type: 'Single',
        price_per_person: propertyData.price,
        security_deposit_per_person: propertyData.security_deposit || propertyData.price * 2,
        total_beds: 1,
        available_beds: 1,
        floor_number: 1,
        has_attached_bathroom: true,
        has_balcony: false,
        has_ac: false,
        room_size_sqft: 100,
        description: 'Standard room with basic amenities',
        is_available: true
      };

      const { error: roomError } = await supabaseAdmin
        .from('property_rooms')
        .insert(defaultRoom);

      if (roomError) {
        console.error('Room insert error:', roomError);
        // Don't fail the entire operation
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Property added successfully',
      property: property
    });

  } catch (error: any) {
    console.error('Admin add property error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
