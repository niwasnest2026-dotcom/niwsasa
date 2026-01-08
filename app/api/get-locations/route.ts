import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const userLat = searchParams.get('lat');
    const userLng = searchParams.get('lng');

    // Fetch all properties with their addresses
    const { data: properties, error } = await supabase
      .from('properties')
      .select('id, name, address, area, city, latitude, longitude')
      .eq('is_available', true);

    if (error) {
      console.error('Error fetching properties:', error);
      return NextResponse.json({
        success: false,
        error: error.message,
        locations: [],
        dynamic_count: 0,
        static_count: 0
      });
    }

    if (!properties || properties.length === 0) {
      return NextResponse.json({
        success: true,
        locations: [],
        dynamic_count: 0,
        static_count: 0,
        message: 'No properties found'
      });
    }

    // Create a Set to store unique locations
    const locationSet = new Set<string>();

    // Add full addresses
    properties.forEach(property => {
      if (property.address) {
        locationSet.add(property.address);
      }

      // Also add area + city combinations
      if (property.area && property.city) {
        locationSet.add(`${property.area}, ${property.city}`);
      }

      // Add just the area
      if (property.area) {
        locationSet.add(property.area);
      }

      // Add just the city
      if (property.city) {
        locationSet.add(property.city);
      }
    });

    let locations = Array.from(locationSet).filter(loc => loc && loc.trim());

    // If user location is provided, sort by distance
    if (userLat && userLng) {
      const userLatNum = parseFloat(userLat);
      const userLngNum = parseFloat(userLng);

      if (!isNaN(userLatNum) && !isNaN(userLngNum)) {
        // Calculate distances for properties with lat/lng
        const locationsWithDistance = locations.map(location => {
          // Find properties matching this location
          const matchingProperties = properties.filter(p =>
            p.address === location ||
            `${p.area}, ${p.city}` === location ||
            p.area === location ||
            p.city === location
          );

          // Calculate average distance for this location
          let minDistance = Infinity;
          matchingProperties.forEach(property => {
            if (property.latitude && property.longitude) {
              const distance = calculateDistance(
                userLatNum,
                userLngNum,
                property.latitude,
                property.longitude
              );
              if (distance < minDistance) {
                minDistance = distance;
              }
            }
          });

          return {
            location,
            distance: minDistance === Infinity ? 999999 : minDistance
          };
        });

        // Sort by distance
        locationsWithDistance.sort((a, b) => a.distance - b.distance);
        locations = locationsWithDistance.map(item => item.location);
      }
    }

    return NextResponse.json({
      success: true,
      locations,
      dynamic_count: properties.length,
      static_count: 0,
      sorted_by_location: !!(userLat && userLng)
    });

  } catch (error: any) {
    console.error('Error in get-locations API:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'Internal server error',
      locations: [],
      dynamic_count: 0,
      static_count: 0
    });
  }
}

// Haversine formula to calculate distance between two coordinates in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
