'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { FaTrash, FaPlus, FaArrowUp, FaArrowDown } from 'react-icons/fa';

interface Amenity {
  id: string;
  name: string;
  icon_name: string;
}

interface PropertyImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface PropertyRoom {
  id: string;
  room_number: string;
  room_type: string;
  sharing_type: string;
  price_per_person: number;
  security_deposit_per_person: number;
  total_beds: number;
  available_beds: number;
  has_attached_bathroom: boolean;
  has_ac: boolean;
  has_balcony: boolean;
  is_available: boolean;
}

export default function EditProperty() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [propertyImages, setPropertyImages] = useState<PropertyImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [propertyRooms, setPropertyRooms] = useState<PropertyRoom[]>([]);
  const [editingRoom, setEditingRoom] = useState<PropertyRoom | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [roomFormData, setRoomFormData] = useState({
    room_number: '',
    room_type: 'Standard',
    sharing_type: 'Single',
    price_per_person: '',
    security_deposit_per_person: '',
    total_beds: '1',
    available_beds: '1',
    has_attached_bathroom: true,
    has_ac: false,
    has_balcony: false,
    is_available: true,
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    area: '',
    price: '',
    security_deposit: '',
    available_months: '',
    property_type: 'PG',
    gender_preference: 'Co-living',
    featured_image: '',
    rating: '',
    google_maps_url: '',
    latitude: '',
    longitude: '',
    owner_name: '',
    owner_phone: '',
    payment_instructions: '',
    verified: false,
    instant_book: false,
    secure_booking: false,
    is_available: true,
  });

  useEffect(() => {
    async function checkAdminAndFetch() {
      if (!user) {
        router.push('/');
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (!data || !(data as any).is_admin) {
          router.push('/');
          return;
        }

        setIsAdmin(true);

        const [amenitiesResult, propertyResult, imagesResult, roomsResult] = await Promise.all([
          supabase.from('amenities').select('*').order('name'),
          supabase
            .from('properties')
            .select(`
              *,
              property_amenities(amenity_id)
            `)
            .eq('id', propertyId)
            .single(),
          supabase
            .from('property_images')
            .select('*')
            .eq('property_id', propertyId)
            .order('display_order'),
          supabase
            .from('property_rooms')
            .select('*')
            .eq('property_id', propertyId)
            .order('room_number')
        ]);

        if (amenitiesResult.data) {
          setAmenities(amenitiesResult.data);
        }

        if ((propertyResult as any).data) {
          const property = (propertyResult as any).data;
          setFormData({
            name: property.name || '',
            description: property.description || '',
            address: property.address || '',
            city: property.city || '',
            area: property.area || '',
            price: property.price?.toString() || '',
            security_deposit: property.security_deposit?.toString() || '',
            available_months: property.available_months?.toString() || '',
            property_type: property.property_type || 'PG',
            gender_preference: property.gender_preference || 'Co-living',
            featured_image: property.featured_image || '',
            rating: property.rating?.toString() || '',
            google_maps_url: property.google_maps_url || '',
            latitude: property.latitude?.toString() || '',
            longitude: property.longitude?.toString() || '',
            owner_name: property.owner_name || '',
            owner_phone: property.owner_phone || '',
            payment_instructions: property.payment_instructions || '',
            verified: property.verified || false,
            instant_book: property.instant_book || false,
            secure_booking: property.secure_booking || false,
            is_available: property.is_available !== false,
          });

          const propertyAmenities = property.property_amenities?.map((pa: any) => pa.amenity_id) || [];
          setSelectedAmenities(propertyAmenities);
        }

        if (imagesResult.data) {
          setPropertyImages(imagesResult.data);
        }

        if (roomsResult.data) {
          setPropertyRooms(roomsResult.data);
        }
      } catch (error) {
        console.error('Error:', error);
        router.push('/admin/properties');
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      checkAdminAndFetch();
    }
  }, [user, authLoading, router, propertyId]);

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) return;

    try {
      const maxOrder = propertyImages.length > 0
        ? Math.max(...propertyImages.map(img => img.display_order || 0))
        : -1;

      const { data, error } = await (supabase as any)
        .from('property_images')
        .insert({
          property_id: propertyId,
          image_url: newImageUrl.trim(),
          display_order: maxOrder + 1
        })
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPropertyImages(prev => [...prev, data as PropertyImage]);
        setNewImageUrl('');
      }
    } catch (error) {
      console.error('Error adding image:', error);
      alert('Failed to add image');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      const { error } = await (supabase as any)
        .from('property_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setPropertyImages(prev => prev.filter(img => img.id !== imageId));
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image');
    }
  };

  const handleMoveImage = async (imageId: string, direction: 'up' | 'down') => {
    const currentIndex = propertyImages.findIndex(img => img.id === imageId);
    if (currentIndex === -1) return;
    if (direction === 'up' && currentIndex === 0) return;
    if (direction === 'down' && currentIndex === propertyImages.length - 1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const newImages = [...propertyImages];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];

    try {
      const updates = newImages.map((img, index) => ({
        id: img.id,
        display_order: index
      }));

      for (const update of updates) {
        const { error } = await (supabase as any)
          .from('property_images')
          .update({ display_order: update.display_order })
          .eq('id', update.id);

        if (error) throw error;
      }

      setPropertyImages(newImages.map((img, index) => ({
        ...img,
        display_order: index
      })));
    } catch (error) {
      console.error('Error reordering images:', error);
      alert('Failed to reorder images');
    }
  };

  // Room Management Functions
  const resetRoomForm = () => {
    setRoomFormData({
      room_number: '',
      room_type: 'Standard',
      sharing_type: 'Single',
      price_per_person: formData.price || '',
      security_deposit_per_person: formData.security_deposit || '',
      total_beds: '1',
      available_beds: '1',
      has_attached_bathroom: true,
      has_ac: false,
      has_balcony: false,
      is_available: true,
    });
    setEditingRoom(null);
  };

  const handleEditRoom = (room: PropertyRoom) => {
    setEditingRoom(room);
    setRoomFormData({
      room_number: room.room_number,
      room_type: room.room_type,
      sharing_type: room.sharing_type,
      price_per_person: room.price_per_person.toString(),
      security_deposit_per_person: room.security_deposit_per_person.toString(),
      total_beds: room.total_beds.toString(),
      available_beds: room.available_beds.toString(),
      has_attached_bathroom: room.has_attached_bathroom,
      has_ac: room.has_ac,
      has_balcony: room.has_balcony,
      is_available: room.is_available,
    });
    setShowRoomForm(true);
  };

  const handleSaveRoom = async () => {
    try {
      // Get session for API authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        return;
      }

      const roomData = {
        property_id: propertyId,
        room_number: roomFormData.room_number,
        room_type: roomFormData.room_type,
        sharing_type: roomFormData.sharing_type,
        price_per_person: parseFloat(roomFormData.price_per_person) || 0,
        security_deposit_per_person: parseFloat(roomFormData.security_deposit_per_person) || 0,
        total_beds: parseInt(roomFormData.total_beds) || 1,
        available_beds: parseInt(roomFormData.available_beds) || 1,
        has_attached_bathroom: roomFormData.has_attached_bathroom,
        has_ac: roomFormData.has_ac,
        has_balcony: roomFormData.has_balcony,
        is_available: roomFormData.is_available,
      };

      if (editingRoom) {
        // Update existing room via API
        const response = await fetch('/api/admin/manage-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'update',
            roomId: editingRoom.id,
            roomData,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to update room');
        }

        setPropertyRooms(prev => prev.map(r => 
          r.id === editingRoom.id ? { ...r, ...roomData } as PropertyRoom : r
        ));
        alert('Room updated successfully!');
      } else {
        // Add new room via API
        const response = await fetch('/api/admin/manage-room', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            action: 'create',
            roomData,
          }),
        });

        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to add room');
        }

        setPropertyRooms(prev => [...prev, result.room as PropertyRoom]);
        alert('Room added successfully!');
      }

      setShowRoomForm(false);
      resetRoomForm();
    } catch (error) {
      console.error('Error saving room:', error);
      alert('Failed to save room: ' + (error as Error).message);
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      // Get session for API authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        return;
      }

      const response = await fetch('/api/admin/manage-room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'delete',
          roomId,
        }),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete room');
      }

      setPropertyRooms(prev => prev.filter(r => r.id !== roomId));
      alert('Room deleted successfully!');
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room: ' + (error as Error).message);
    }
  };

  const handleRoomFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setRoomFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(id => id !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Get session for API authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Session expired. Please login again.');
        router.push('/');
        return;
      }

      const propertyData = {
        name: formData.name,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        area: formData.area,
        price: parseFloat(formData.price),
        security_deposit: formData.security_deposit ? parseFloat(formData.security_deposit) : null,
        available_months: formData.available_months ? parseInt(formData.available_months) : null,
        property_type: formData.property_type,
        gender_preference: formData.gender_preference,
        featured_image: formData.featured_image || null,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        google_maps_url: formData.google_maps_url || null,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        owner_name: formData.owner_name.trim() || null,
        owner_phone: formData.owner_phone.trim() || null,
        payment_instructions: formData.payment_instructions.trim() || null,
        verified: formData.verified,
        instant_book: formData.instant_book,
        secure_booking: formData.secure_booking,
        is_available: formData.is_available,
      };

      const response = await fetch('/api/admin/update-property', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          propertyId,
          propertyData,
          selectedAmenities,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to update property');
      }

      alert('Property updated successfully!');
      router.push('/admin/properties');
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Failed to update property');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ 
      background: 'linear-gradient(135deg, #DEF2F1 0%, #FEFFFF 50%, #DEF2F1 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <Link href="/admin/properties" className="hover:underline mb-2 inline-block" style={{ color: '#2B7A78' }}>
            ←
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Property</h1>
          <p className="text-gray-600 mt-2">Update property details</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                name="property_type"
                value={formData.property_type}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="PG">PG</option>
                <option value="Hostel">Hostel</option>
                <option value="Flat">Flat</option>
                <option value="Room">Room</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender Preference *
              </label>
              <select
                name="gender_preference"
                value={formData.gender_preference}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="Co-living">Co-living (Mixed)</option>
                <option value="Male">Male Only</option>
                <option value="Female">Female Only</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City *
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Area
              </label>
              <input
                type="text"
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Address *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Google Maps Location Section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Google Maps Location (Optional)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Add precise location information to help guests find the property easily.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Google Maps URL
                </label>
                <input
                  type="url"
                  name="google_maps_url"
                  value={formData.google_maps_url}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/maps?q=12.9716,77.5946"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Latitude
                  </label>
                  <input
                    type="number"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    step="any"
                    min="-90"
                    max="90"
                    placeholder="e.g., 12.9716"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Longitude
                  </label>
                  <input
                    type="number"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    step="any"
                    min="-180"
                    max="180"
                    placeholder="e.g., 77.5946"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price per Month (₹) *
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                min="0"
                step="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                name="security_deposit"
                value={formData.security_deposit}
                onChange={handleChange}
                min="0"
                step="1"
                placeholder="Leave empty for 2x monthly rent"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                If not specified, defaults to 2x monthly rent (₹{formData.price ? (parseFloat(formData.price) * 2).toLocaleString() : '0'})
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Months
              </label>
              <input
                type="number"
                name="available_months"
                value={formData.available_months}
                onChange={handleChange}
                min="1"
                max="60"
                step="1"
                placeholder="e.g., 12 for 1 year"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                How many months is this property available for booking?
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rating (0-5)
              </label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleChange}
                min="0"
                max="5"
                step="0.1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Featured Image URL
            </label>
            <input
              type="url"
              name="featured_image"
              value={formData.featured_image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Owner Details Section */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Owner Details (Shared After Booking Confirmation)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              These details will only be shared with users after successful payment confirmation.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Full Name
                </label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleChange}
                  placeholder="Property Owner"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Owner Phone Number
                </label>
                <input
                  type="tel"
                  name="owner_phone"
                  value={formData.owner_phone}
                  onChange={handleChange}
                  placeholder="+91 9876543210"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Instructions for Remaining Amount
                </label>
                <textarea
                  name="payment_instructions"
                  value={formData.payment_instructions}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Please contact the owner for payment details of the remaining amount."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Images</h3>

            <div className="mb-4 flex flex-col sm:flex-row gap-2">
              <input
                type="url"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                placeholder="Enter image URL"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <button
                type="button"
                onClick={handleAddImage}
                className="px-4 py-2 text-white font-semibold rounded-lg transition-all hover:shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: '#3AAFA9' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2B7A78'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#3AAFA9'}
              >
                <FaPlus /> Add Image
              </button>
            </div>

            {propertyImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {propertyImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="relative bg-gray-50 border border-gray-200 rounded-xl p-3"
                  >
                    <div className="relative h-32 sm:h-40 mb-2 rounded overflow-hidden">
                      <Image
                        src={image.image_url}
                        alt={`Property image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(image.id, 'up')}
                          disabled={index === 0}
                          className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ 
                            color: index === 0 ? '#9CA3AF' : '#2B7A78',
                            backgroundColor: index === 0 ? 'transparent' : 'rgba(43, 122, 120, 0.1)'
                          }}
                          title="Move up"
                        >
                          <FaArrowUp />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(image.id, 'down')}
                          disabled={index === propertyImages.length - 1}
                          className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                          style={{ 
                            color: index === propertyImages.length - 1 ? '#9CA3AF' : '#2B7A78',
                            backgroundColor: index === propertyImages.length - 1 ? 'transparent' : 'rgba(43, 122, 120, 0.1)'
                          }}
                          title="Move down"
                        >
                          <FaArrowDown />
                        </button>
                      </div>
                      <span className="text-sm text-gray-500 font-medium">Order: {index + 1}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteImage(image.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete image"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-2">📷</div>
                <p className="text-gray-500">No images added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add images to showcase your property</p>
              </div>
            )}
          </div>

          {/* Room Management Section */}
          <div className="border-t pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Room Management</h3>
              <button
                type="button"
                onClick={() => {
                  resetRoomForm();
                  setShowRoomForm(true);
                }}
                className="px-4 py-2 text-white font-semibold rounded-lg transition-all hover:shadow-lg flex items-center gap-2"
                style={{ backgroundColor: '#3AAFA9' }}
              >
                <FaPlus /> Add Room
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Manage rooms for this property. Each room can have its own pricing (price_per_person, security_deposit_per_person).
            </p>

            {/* Room Form */}
            {showRoomForm && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Number/Name *</label>
                    <input
                      type="text"
                      name="room_number"
                      value={roomFormData.room_number}
                      onChange={handleRoomFormChange}
                      placeholder="e.g., Room 1, Main Room"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                    <select
                      name="room_type"
                      value={roomFormData.room_type}
                      onChange={handleRoomFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="Standard">Standard</option>
                      <option value="Deluxe">Deluxe</option>
                      <option value="Premium">Premium</option>
                      <option value="Suite">Suite</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sharing Type</label>
                    <select
                      name="sharing_type"
                      value={roomFormData.sharing_type}
                      onChange={handleRoomFormChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    >
                      <option value="Single">Single</option>
                      <option value="Double Sharing">Double Sharing</option>
                      <option value="Triple Sharing">Triple Sharing</option>
                      <option value="Four Sharing">Four Sharing</option>
                      <option value="Private Room">Private Room</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Person (₹) *</label>
                    <input
                      type="number"
                      name="price_per_person"
                      value={roomFormData.price_per_person}
                      onChange={handleRoomFormChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Security Deposit per Person (₹)</label>
                    <input
                      type="number"
                      name="security_deposit_per_person"
                      value={roomFormData.security_deposit_per_person}
                      onChange={handleRoomFormChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Beds</label>
                    <input
                      type="number"
                      name="total_beds"
                      value={roomFormData.total_beds}
                      onChange={handleRoomFormChange}
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Beds</label>
                    <input
                      type="number"
                      name="available_beds"
                      value={roomFormData.available_beds}
                      onChange={handleRoomFormChange}
                      min="0"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-4 mt-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="has_attached_bathroom"
                      checked={roomFormData.has_attached_bathroom}
                      onChange={handleRoomFormChange}
                      className="rounded"
                    />
                    <span className="text-sm">Attached Bathroom</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="has_ac"
                      checked={roomFormData.has_ac}
                      onChange={handleRoomFormChange}
                      className="rounded"
                    />
                    <span className="text-sm">AC</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="has_balcony"
                      checked={roomFormData.has_balcony}
                      onChange={handleRoomFormChange}
                      className="rounded"
                    />
                    <span className="text-sm">Balcony</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      name="is_available"
                      checked={roomFormData.is_available}
                      onChange={handleRoomFormChange}
                      className="rounded"
                    />
                    <span className="text-sm">Available</span>
                  </label>
                </div>
                <div className="flex gap-2 mt-4">
                  <button
                    type="button"
                    onClick={handleSaveRoom}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    {editingRoom ? 'Update Room' : 'Save Room'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRoomForm(false);
                      resetRoomForm();
                    }}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Rooms List */}
            {propertyRooms.length > 0 ? (
              <div className="space-y-3">
                {propertyRooms.map((room) => (
                  <div
                    key={room.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">{room.room_number}</span>
                        <span className="text-sm text-gray-500">({room.room_type})</span>
                        {!room.is_available && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">Unavailable</span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {room.sharing_type} • ₹{room.price_per_person.toLocaleString()}/month • Deposit: ₹{room.security_deposit_per_person.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {room.available_beds}/{room.total_beds} beds available
                        {room.has_attached_bathroom && ' • Bathroom'}
                        {room.has_ac && ' • AC'}
                        {room.has_balcony && ' • Balcony'}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEditRoom(room)}
                        className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-2">🛏️</div>
                <p className="text-gray-500">No rooms added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add rooms with specific pricing for this property</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amenities
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {amenities.map((amenity) => (
                <label
                  key={amenity.id}
                  className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedAmenities.includes(amenity.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{
                    borderColor: selectedAmenities.includes(amenity.id) ? '#3AAFA9' : undefined,
                    backgroundColor: selectedAmenities.includes(amenity.id) ? 'rgba(58, 175, 169, 0.05)' : undefined
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(amenity.id)}
                    onChange={() => handleAmenityToggle(amenity.id)}
                    className="rounded focus:ring-2"
                    style={{ 
                      accentColor: '#3AAFA9',
                      '--tw-ring-color': '#3AAFA9'
                    } as any}
                  />
                  <span className="text-sm font-medium text-gray-700">{amenity.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="is_available"
                checked={formData.is_available}
                onChange={handleChange}
                className="rounded focus:ring-2"
                style={{ 
                  accentColor: '#3AAFA9',
                  '--tw-ring-color': '#3AAFA9'
                } as any}
              />
              <span className="text-sm font-medium text-gray-700">Property Available for Booking</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="verified"
                checked={formData.verified}
                onChange={handleChange}
                className="rounded focus:ring-2"
                style={{ 
                  accentColor: '#3AAFA9',
                  '--tw-ring-color': '#3AAFA9'
                } as any}
              />
              <span className="text-sm font-medium text-gray-700">Verified Property</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="instant_book"
                checked={formData.instant_book}
                onChange={handleChange}
                className="rounded focus:ring-2"
                style={{ 
                  accentColor: '#3AAFA9',
                  '--tw-ring-color': '#3AAFA9'
                } as any}
              />
              <span className="text-sm font-medium text-gray-700">Instant Book Available</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                name="secure_booking"
                checked={formData.secure_booking}
                onChange={handleChange}
                className="rounded focus:ring-2"
                style={{ 
                  accentColor: '#3AAFA9',
                  '--tw-ring-color': '#3AAFA9'
                } as any}
              />
              <span className="text-sm font-medium text-gray-700">Secure Booking</span>
            </label>
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-6 border-t">
            <Link
              href="/admin/properties"
              className="px-4 sm:px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 sm:px-6 py-2 text-white font-semibold rounded-lg transition-all disabled:opacity-50 hover:shadow-lg"
              style={{ backgroundColor: '#3AAFA9' }}
              onMouseEnter={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#2B7A78')}
              onMouseLeave={(e) => !submitting && (e.currentTarget.style.backgroundColor = '#3AAFA9')}
            >
              {submitting ? 'Updating...' : 'Update Property'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
