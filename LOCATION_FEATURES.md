# Location-Based Search Features

This document explains the new location-based search features implemented in the Niwas Nest application.

## Features Implemented

### 1. Property Address Suggestions
The search bar now shows all available property addresses in the dropdown suggestions. This includes:
- Full property addresses
- Area names
- City names
- Area + City combinations

**How it works:**
- When the search bar is focused or clicked, all available locations are displayed
- As the user types, the suggestions are filtered to match the input
- Each suggestion is clickable and will populate the search field

### 2. Location-Based Sorting (Near Me)
When users grant location permission, properties are automatically sorted by distance from their current location.

**How it works:**
- On page load, the browser requests the user's location permission
- If granted, the user's coordinates (latitude, longitude) are captured
- The API endpoint receives these coordinates and calculates distances to all properties
- Properties are sorted from nearest to farthest
- A visual indicator shows that results are "Sorted by distance"

## Technical Implementation

### Database Changes

**Migration File:** `supabase/migrations/20260108000001_add_location_coordinates.sql`

Added two new columns to the `properties` table:
- `latitude` (numeric) - Latitude coordinate (-90 to 90)
- `longitude` (numeric) - Longitude coordinate (-180 to 180)

Features:
- Nullable fields to allow gradual data entry
- Validation constraints for coordinate ranges
- Indexed for faster geospatial queries

### API Endpoint

**File:** `app/api/get-locations/route.ts`

**Endpoint:** `GET /api/get-locations`

**Query Parameters:**
- `lat` (optional) - User's latitude
- `lng` (optional) - User's longitude

**Response:**
```json
{
  "success": true,
  "locations": ["Address 1", "Address 2", ...],
  "dynamic_count": 10,
  "static_count": 0,
  "sorted_by_location": true
}
```

**Features:**
- Fetches all available properties from the database
- Extracts unique location strings (addresses, areas, cities)
- If user coordinates are provided, calculates distances using the Haversine formula
- Sorts locations by distance from user
- Returns deduplicated list of locations

**Distance Calculation:**
Uses the Haversine formula to calculate the great-circle distance between two points on Earth:
```typescript
function calculateDistance(lat1, lon1, lat2, lon2): number
```
Returns distance in kilometers.

### Frontend Changes

**File:** `components/SearchForm.tsx`

**New State Variables:**
- `userLocation` - Stores user's coordinates {lat, lng}
- `locationPermission` - Tracks permission status ('prompt' | 'granted' | 'denied')

**Geolocation Request:**
- Automatically requests location permission on component mount
- Uses high accuracy mode for better precision
- 5-second timeout to avoid hanging
- Handles both success and denial gracefully

**Visual Indicators:**
- Green badge showing "Sorted by distance" when user location is available
- Animated pulse indicator for active location tracking
- Different help text based on location permission status

**Suggestion Display:**
- Shows up to 12 locations when search is empty
- Filters to 10 locations when searching
- Displays location hierarchy (area, city) in separate lines
- Hover effects for better UX

## How to Use

### For Users

1. **Enable Location Access:**
   - When you first visit the search page, your browser will ask for location permission
   - Click "Allow" to enable location-based sorting
   - If you click "Block", you can still search manually

2. **Browse Nearby Properties:**
   - Click on the search bar to see all available locations
   - If location is enabled, locations are automatically sorted by distance
   - Look for the "Sorted by distance" badge at the top

3. **Search for Specific Locations:**
   - Start typing an area, city, or address
   - Suggestions will filter based on your input
   - Click any suggestion to select it

### For Admins

**Adding Coordinates to Properties:**

1. **Go to Admin Panel:**
   - Navigate to `/admin/properties`
   - Click "Add New Property" or edit an existing property

2. **Enter Coordinates:**
   - Scroll to the "Location Coordinates" section
   - You can find coordinates using:
     - Google Maps: Right-click on location → Click coordinates to copy
     - Address lookup services
     - GPS devices

3. **Manual Entry:**
   - Enter Latitude (e.g., 17.3850)
   - Enter Longitude (e.g., 78.4867)
   - Ensure values are within valid ranges (-90 to 90 for latitude, -180 to 180 for longitude)

4. **Alternative - Google Maps URL:**
   - If you have a Google Maps link, extract coordinates from the URL
   - Format: `https://www.google.com/maps/@LATITUDE,LONGITUDE,ZOOM`

## Browser Compatibility

**Geolocation API Support:**
- Chrome: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Edge: ✅ Full support
- Mobile browsers: ✅ Full support

**Requirements:**
- HTTPS connection (required for geolocation API)
- JavaScript enabled
- Location services enabled on device

## Privacy & Security

- User location is never stored on the server
- Location data is only used client-side for sorting
- Users can deny permission and still use all features
- No location tracking or history is maintained
- Location requests use standard browser APIs (secure)

## Troubleshooting

### Location Permission Issues

**Problem:** Browser doesn't ask for location permission
**Solution:**
- Check if site is running on HTTPS
- Clear browser cache and cookies
- Check browser settings for site permissions

**Problem:** "Location unavailable" error
**Solution:**
- Enable location services in device settings
- Check if browser has location permission
- Try refreshing the page

### No Locations Showing

**Problem:** Suggestions dropdown is empty
**Solution:**
- Ensure properties exist in the database
- Check that properties have `is_available = true`
- Verify properties have valid address/area/city fields

### Sorting Not Working

**Problem:** Locations not sorted by distance
**Solution:**
- Grant location permission in browser
- Ensure properties have latitude/longitude coordinates
- Check browser console for errors

## Future Enhancements

Possible improvements for the future:

1. **Map View:** Display properties on an interactive map
2. **Radius Filter:** Allow users to specify search radius (e.g., within 5km)
3. **Auto-Geocoding:** Automatically fetch coordinates when admin enters address
4. **Distance Display:** Show actual distance to each property
5. **Direction Links:** Add "Get Directions" button for each property
6. **Location History:** Remember user's recent searches
7. **Nearby Landmarks:** Show properties near colleges, metro stations, etc.

## API Reference

### GET /api/get-locations

Fetches all available property locations with optional distance-based sorting.

**Request:**
```
GET /api/get-locations?lat=17.3850&lng=78.4867
```

**Response:**
```json
{
  "success": true,
  "locations": [
    "Gachibowli, Hyderabad",
    "Hi-Tech City, Hyderabad",
    "Madhapur, Hyderabad"
  ],
  "dynamic_count": 15,
  "static_count": 0,
  "sorted_by_location": true
}
```

**Fields:**
- `success` - Boolean indicating if request was successful
- `locations` - Array of unique location strings
- `dynamic_count` - Number of properties found in database
- `static_count` - Number of hardcoded locations (currently 0)
- `sorted_by_location` - True if results are sorted by distance

## Development Notes

### Running Migrations

To apply the database migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase dashboard
# Go to SQL Editor and run the migration file
```

### Testing Location Features

1. **Test without location permission:**
   - Deny location access
   - Verify suggestions still work
   - Check that manual search works

2. **Test with location permission:**
   - Grant location access
   - Verify "Sorted by distance" badge appears
   - Check console for location logs
   - Verify suggestions are sorted correctly

3. **Test with coordinates in database:**
   - Add latitude/longitude to test properties
   - Verify distance calculation works
   - Test with properties at different distances

### Code Structure

```
app/
├── api/
│   └── get-locations/
│       └── route.ts          # Location API endpoint
components/
└── SearchForm.tsx            # Main search component
supabase/
└── migrations/
    └── 20260108000001_add_location_coordinates.sql
```

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify database migrations are applied
3. Check that Supabase connection is working
4. Review this documentation for troubleshooting steps

---

**Version:** 1.0
**Last Updated:** January 8, 2026
**Author:** Development Team
