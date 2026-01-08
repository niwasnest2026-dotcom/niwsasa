'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaCheckCircle, FaHome, FaCalendarAlt, FaRupeeSign, FaPhone, FaEnvelope, FaUser, FaMapMarkerAlt } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface BookingDetails {
  id: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  sharing_type: string;
  price_per_person: number;
  total_amount: number;
  amount_paid: number;
  amount_due: number;
  payment_status: string;
  booking_status: string;
  booking_date: string;
  payment_id: string;
  properties: {
    id: string;
    name: string;
    address: string;
    city: string;
    featured_image: string;
    owner_name: string;
    owner_phone: string;
  };
}

function BookingSuccessContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!bookingId) {
      router.push('/');
      return;
    }

    fetchBookingDetails();
  }, [user, bookingId, router]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from('bookings')
        .select(`
          *,
          properties (
            id,
            name,
            address,
            city,
            featured_image,
            owner_name,
            owner_phone
          )
        `)
        .eq('id', bookingId)
        .eq('user_id', user?.id)
        .single();

      if (fetchError) throw fetchError;

      if (!data) {
        throw new Error('Booking not found');
      }

      setBooking(data as any);
    } catch (err: any) {
      console.error('Error fetching booking:', err);
      setError(err.message || 'Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-blue-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'Unable to load booking details'}</p>
          <Link
            href="/bookings"
            className="inline-block bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
          >
            View All Bookings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Success Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <FaCheckCircle className="text-5xl text-green-500" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h1>
            <p className="text-green-100">Your payment has been successfully processed</p>
          </div>

          {/* Booking ID */}
          <div className="px-6 py-4 bg-gray-50 border-b">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Booking ID</span>
              <span className="font-mono font-semibold text-gray-900">{booking.id.slice(0, 8).toUpperCase()}</span>
            </div>
          </div>

          {/* Property Details */}
          <div className="p-6">
            <div className="flex gap-4 mb-6">
              {booking.properties.featured_image && (
                <img
                  src={booking.properties.featured_image}
                  alt={booking.properties.name}
                  className="w-32 h-32 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{booking.properties.name}</h2>
                <div className="flex items-center text-gray-600 mb-2">
                  <FaMapMarkerAlt className="mr-2" />
                  <span>{booking.properties.address}, {booking.properties.city}</span>
                </div>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                  {booking.booking_status === 'booked' ? 'Confirmed' : booking.booking_status}
                </div>
              </div>
            </div>

            {/* Guest Details */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Guest Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-gray-700">
                    <FaUser className="mr-3 text-gray-400" />
                    <span>{booking.guest_name}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaEnvelope className="mr-3 text-gray-400" />
                    <span>{booking.guest_email}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <FaPhone className="mr-3 text-gray-400" />
                    <span>{booking.guest_phone}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Room Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium text-gray-900">{booking.sharing_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-medium text-gray-900">₹{booking.price_per_person.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Booking Date:</span>
                    <span className="font-medium text-gray-900">{new Date(booking.booking_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium text-gray-900">₹{booking.total_amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Amount Paid (20% Advance):</span>
                  <span className="font-semibold">₹{booking.amount_paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-orange-600 border-t border-orange-200 pt-2">
                  <span className="font-medium">Remaining Amount Due:</span>
                  <span className="font-bold text-lg">₹{booking.amount_due.toLocaleString()}</span>
                </div>
              </div>
              {booking.payment_id && (
                <div className="mt-3 pt-3 border-t border-orange-200 text-xs text-gray-500">
                  Payment ID: {booking.payment_id}
                </div>
              )}
            </div>

            {/* Owner Contact */}
            {(booking.properties.owner_name || booking.properties.owner_phone) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">Property Owner Contact</h3>
                <div className="space-y-2 text-sm">
                  {booking.properties.owner_name && (
                    <div className="flex items-center">
                      <FaUser className="mr-3 text-blue-600" />
                      <span className="text-gray-700">{booking.properties.owner_name}</span>
                    </div>
                  )}
                  {booking.properties.owner_phone && (
                    <div className="flex items-center">
                      <FaPhone className="mr-3 text-blue-600" />
                      <span className="text-gray-700">{booking.properties.owner_phone}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-blue-700 mt-3">
                  The property owner will contact you shortly with check-in details and remaining payment instructions.
                </p>
              </div>
            )}

            {/* Important Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-900 mb-2 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Important Information
              </h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• You have paid 20% advance booking amount</li>
                <li>• Remaining 80% amount (₹{booking.amount_due.toLocaleString()}) must be paid directly to the property owner</li>
                <li>• The owner will contact you shortly for check-in arrangements</li>
                <li>• Keep your booking ID handy for reference</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-2 gap-4">
              <Link
                href="/bookings"
                className="flex items-center justify-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark transition-all shadow-md hover:shadow-lg"
              >
                <FaCalendarAlt className="mr-2" />
                View All Bookings
              </Link>
              <Link
                href="/listings"
                className="flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary hover:text-white transition-all"
              >
                <FaHome className="mr-2" />
                Browse More Properties
              </Link>
            </div>
          </div>
        </div>

        {/* Confirmation Email Notice */}
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <FaEnvelope className="text-3xl text-primary mx-auto mb-3" />
          <p className="text-gray-600">
            A confirmation email has been sent to <span className="font-semibold text-gray-900">{booking.guest_email}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <BookingSuccessContent />
    </Suspense>
  );
}
