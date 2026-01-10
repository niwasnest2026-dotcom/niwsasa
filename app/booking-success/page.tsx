'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FaCheckCircle, FaHome, FaCalendarAlt, FaUser, FaPhone, FaEnvelope } from 'react-icons/fa';
import { supabase } from '@/lib/supabase';

interface BookingDetails {
  id: string;
  property_name: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_date: string;
  amount_paid: number;
  amount_due: number;
  sharing_type: string;
  price_per_person: number;
  security_deposit_per_person: number;
}

export default function BookingSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingId = searchParams.get('booking_id');
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        console.error('❌ No booking ID provided');
        setError('No booking ID provided');
        setLoading(false);
        return;
      }

      console.log('📖 Fetching booking:', bookingId);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          console.error('❌ No session found');
          setError('Please login to view booking details');
          setLoading(false);
          return;
        }

        console.log('✅ Session found, fetching booking...');

        const { data, error: fetchError } = await supabase
          .from('bookings')
          .select('*')
          .eq('id', bookingId)
          .single();

        if (fetchError) {
          console.error('❌ Fetch error:', fetchError);
          setError('Booking not found');
          setLoading(false);
          return;
        }

        if (!data) {
          console.error('❌ No booking data returned');
          setError('Booking not found');
          setLoading(false);
          return;
        }

        console.log('✅ Booking fetched successfully:', data);
        setBooking(data);
      } catch (err: any) {
        console.error('❌ Error:', err);
        setError(err.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-6">{error || 'Booking details not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-primary hover:bg-primary-dark text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full blur-2xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-600 rounded-full p-6 shadow-2xl">
                <FaCheckCircle className="text-5xl text-white" />
              </div>
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">
            Booking Confirmed! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Your booking has been successfully created
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
            <FaHome className="text-primary" />
            <span>Booking Details</span>
          </h2>

          <div className="space-y-6">
            {/* Property Info */}
            <div className="border-b pb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Property</h3>
              <p className="text-2xl font-bold text-gray-900">{booking.property_name}</p>
              <p className="text-gray-600 mt-1">Room Type: {booking.sharing_type}</p>
            </div>

            {/* Guest Info */}
            <div className="border-b pb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Guest Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <FaUser className="text-primary text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-gray-900 font-medium">{booking.guest_name}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-primary text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900 font-medium">{booking.guest_email}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <FaPhone className="text-primary text-lg" />
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900 font-medium">{booking.guest_phone}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Date */}
            <div className="border-b pb-6">
              <div className="flex items-center space-x-3">
                <FaCalendarAlt className="text-primary text-lg" />
                <div>
                  <p className="text-sm text-gray-500">Booking Date</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(booking.booking_date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase mb-4">Payment Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monthly Rent:</span>
                  <span className="font-semibold text-gray-900">₹{booking.price_per_person.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Security Deposit:</span>
                  <span className="font-semibold text-gray-900">₹{booking.security_deposit_per_person.toLocaleString()}</span>
                </div>
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="text-green-700 font-semibold">Amount Paid (20%):</span>
                  <span className="text-2xl font-bold text-green-600">₹{booking.amount_paid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-orange-700 font-semibold">Amount Due (80%):</span>
                  <span className="text-2xl font-bold text-orange-600">₹{booking.amount_due.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-8">
          <h3 className="text-xl font-bold text-blue-900 mb-4">📋 Next Steps</h3>
          <ol className="space-y-3 text-blue-900">
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">1</span>
              <span>You will receive a confirmation email shortly</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">2</span>
              <span>Pay the remaining 80% (₹{booking.amount_due.toLocaleString()}) directly to the property owner</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">3</span>
              <span>Contact the property owner to finalize move-in details</span>
            </li>
            <li className="flex items-start space-x-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">4</span>
              <span>Check your bookings page for more details</span>
            </li>
          </ol>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push('/bookings')}
            className="flex-1 bg-primary hover:bg-primary-dark text-white font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            View My Bookings
          </button>
          <button
            onClick={() => router.push('/')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-4 px-6 rounded-lg transition-colors"
          >
            Back to Home
          </button>
        </div>

        {/* Support Info */}
        <div className="text-center mt-8 text-gray-600">
          <p>Need help? Contact us at <span className="font-semibold text-primary">support@niwasnest.com</span></p>
        </div>
      </div>
    </div>
  );
}
