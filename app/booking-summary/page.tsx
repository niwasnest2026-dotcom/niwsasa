'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import RazorpayPayment from '@/components/RazorpayPayment';
import { FaMapMarkerAlt, FaRupeeSign, FaUser, FaEnvelope, FaPhone } from 'react-icons/fa';

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  price: number;
  security_deposit: number;
  featured_image: string;
  owner_name: string;
  owner_phone: string;
}

interface Room {
  id: string;
  room_number: string;
  room_type: string;
  sharing_type: string;
  price_per_person: number;
  security_deposit_per_person: number;
  total_beds: number;
  available_beds: number;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  has_ac: boolean;
}

export default function BookingSummaryPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get('propertyId');

  const [property, setProperty] = useState<Property | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [moveInDate, setMoveInDate] = useState('');
  const [duration, setDuration] = useState(1); // Duration in months
  const [moveOutDate, setMoveOutDate] = useState('');
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (!propertyId) {
      router.push('/listings');
      return;
    }

    if (!user) {
      router.push('/login');
      return;
    }

    // Initialize user details
    setUserDetails({
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
      email: user.email || '',
      phone: user.user_metadata?.phone || ''
    });

    fetchProperty();

    // Set default move-in date to today
    const today = new Date();
    setMoveInDate(today.toISOString().split('T')[0]);
  }, [propertyId, user, router]);

  // Calculate move-out date when move-in date or duration changes
  useEffect(() => {
    if (moveInDate && duration) {
      const moveIn = new Date(moveInDate);
      const moveOut = new Date(moveIn);
      moveOut.setMonth(moveOut.getMonth() + duration);
      setMoveOutDate(moveOut.toISOString().split('T')[0]);
    }
  }, [moveInDate, duration]);

  const fetchProperty = async () => {
    try {
      // Fetch property details
      const { data: propertyData, error: propertyError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (propertyError) throw propertyError;
      setProperty(propertyData);

      // Fetch available rooms for this property
      const { data: roomsData, error: roomsError } = await supabase
        .from('property_rooms')
        .select('*')
        .eq('property_id', propertyId)
        .eq('is_available', true)
        .gt('available_beds', 0)
        .order('price_per_person', { ascending: true });

      if (roomsError) throw roomsError;
      setRooms(roomsData || []);

      // Auto-select first room if only one available
      if (roomsData && roomsData.length === 1) {
        setSelectedRoom(roomsData[0]);
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      router.push('/listings');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (paymentId: string, newBookingId: string) => {
    setPaymentSuccess(true);
    setBookingId(newBookingId);
  };

  const handlePaymentError = (error: string) => {
    alert(error);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <button
            onClick={() => router.push('/listings')}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  if (paymentSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Booking Confirmed! 🎉</h1>
          <p className="text-gray-600 mb-6">
            Your booking has been confirmed. Our team will contact you with property details shortly.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/bookings')}
              className="w-full bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              View My Bookings
            </button>
            <button
              onClick={() => router.push('/listings')}
              className="w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Browse More Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Summary</h1>
          <p className="text-gray-600">Review your booking details and complete payment</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Property Details */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <img
              src={property.featured_image || '/placeholder-property.jpg'}
              alt={property.name}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{property.name}</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center text-gray-600">
                  <FaMapMarkerAlt className="mr-3" />
                  <span>{property.address}, {property.city}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <FaRupeeSign className="mr-3" />
                  <span>Monthly Rent: ₹{property.price.toLocaleString()}</span>
                </div>
                
                {property.security_deposit > 0 && (
                  <div className="flex items-center text-gray-600">
                    <FaRupeeSign className="mr-3" />
                    <span>Security Deposit: ₹{property.security_deposit.toLocaleString()}</span>
                  </div>
                )}
              </div>

              {/* Owner Contact */}
              {(property.owner_name || property.owner_phone) && (
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Owner Contact</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    {property.owner_name && <div>Name: {property.owner_name}</div>}
                    {property.owner_phone && (
                      <div className="flex items-center">
                        <FaPhone className="mr-2" />
                        <span>{property.owner_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Booking Form & Payment */}
          <div className="space-y-6">
            {/* User Details Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Your Details</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaUser className="inline mr-2" />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={userDetails.name}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaEnvelope className="inline mr-2" />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={userDetails.email}
                    onChange={(e) => setUserDetails(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter your email"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <FaPhone className="inline mr-2" />
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={userDetails.phone}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                      if (value.length <= 10) {
                        setUserDetails(prev => ({ ...prev, phone: value }));
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Enter 10-digit phone number"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    required
                  />
                  {userDetails.phone && userDetails.phone.length !== 10 && (
                    <p className="text-red-500 text-sm mt-1">Phone number must be exactly 10 digits</p>
                  )}
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Move-in Date *
                  </label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration (Months) *
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                      <option key={month} value={month}>
                        {month} {month === 1 ? 'Month' : 'Months'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Move-out Date (Auto-calculated)
                  </label>
                  <input
                    type="date"
                    value={moveOutDate}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically calculated based on move-in date and duration
                  </p>
                </div>
              </div>
            </div>

            {/* Room Selection */}
            {rooms.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Select Room *</h3>

                {rooms.length === 0 ? (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-800">No rooms currently available for this property.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                          selectedRoom?.id === room.id
                            ? 'border-primary bg-orange-50'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              Room {room.room_number} - {room.room_type}
                            </h4>
                            <p className="text-sm text-gray-600">{room.sharing_type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-primary">₹{room.price_per_person.toLocaleString()}/month</p>
                            {room.security_deposit_per_person > 0 && (
                              <p className="text-xs text-gray-500">Deposit: ₹{room.security_deposit_per_person.toLocaleString()}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-4 text-xs text-gray-600">
                          {room.has_attached_bathroom && <span>✓ Attached Bathroom</span>}
                          {room.has_ac && <span>✓ AC</span>}
                          {room.has_balcony && <span>✓ Balcony</span>}
                          <span className="ml-auto">
                            {room.available_beds}/{room.total_beds} beds available
                          </span>
                        </div>
                      </div>
                    ))}
                    {!selectedRoom && (
                      <p className="text-red-500 text-sm">Please select a room to proceed with payment</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Payment Section */}
            {selectedRoom && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Payment Details</h3>

                <div className="mb-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-orange-800 mb-2">Advance Payment (20%)</h4>
                    <p className="text-sm text-orange-700">
                      Pay 20% advance now. Remaining 80% to be paid directly to property owner.
                    </p>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Room:</span>
                      <span className="font-medium">Room {selectedRoom.room_number} - {selectedRoom.sharing_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Monthly Rent:</span>
                      <span>₹{selectedRoom.price_per_person.toLocaleString()}</span>
                    </div>
                    {selectedRoom.security_deposit_per_person > 0 && (
                      <div className="flex justify-between text-gray-600">
                        <span>Security Deposit:</span>
                        <span>₹{selectedRoom.security_deposit_per_person.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span>Advance Payment (20%):</span>
                      <span className="text-primary">₹{Math.round(selectedRoom.price_per_person * 0.2).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <RazorpayPayment
                  amount={Math.round(selectedRoom.price_per_person * 0.2)}
                  propertyId={property.id}
                  roomId={selectedRoom.id}
                  propertyName={`${property.name} - Room ${selectedRoom.room_number}`}
                  userDetails={userDetails}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}