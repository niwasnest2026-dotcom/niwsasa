'use client';

import { FaMapMarkerAlt, FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import Link from 'next/link';

export default function EmptyStatePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full">
        {/* Main Content */}
        <div className="text-center mb-12">
          {/* Icon */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-200 rounded-full blur-2xl opacity-50"></div>
              <div className="relative bg-gradient-to-br from-orange-400 to-orange-600 rounded-full p-8 shadow-2xl">
                <FaMapMarkerAlt className="text-5xl text-white" />
              </div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Coming Soon!
          </h1>
          
          {/* Subheading */}
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            We're setting up amazing coliving spaces in your area. Properties will be available very soon.
          </p>

          {/* Description */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-orange-100">
            <p className="text-gray-700 mb-6">
              Niwas Nest is curating premium, fully-furnished coliving spaces designed for students and young professionals. Our team is working hard to bring you the best options in your location.
            </p>
            
            {/* Features List */}
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Modern, Fully-Furnished Rooms</h3>
                  <p className="text-gray-600 text-sm">All amenities included - no hidden costs</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Vibrant Community</h3>
                  <p className="text-gray-600 text-sm">Connect with like-minded students and professionals</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 mt-1">
                  <FaCheckCircle className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Premium Amenities</h3>
                  <p className="text-gray-600 text-sm">Gym, study lounge, common areas, and more</p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span>Back to Home</span>
              <FaArrowRight className="text-lg" />
            </Link>
            
            <a
              href="mailto:support@niwasnest.com"
              className="inline-flex items-center justify-center space-x-2 px-8 py-4 bg-white border-2 border-orange-500 text-orange-600 font-bold rounded-xl hover:bg-orange-50 transition-all shadow-lg"
            >
              <span>Get Notified</span>
              <FaArrowRight className="text-lg" />
            </a>
          </div>

          {/* Footer Message */}
          <p className="text-gray-500 text-sm mt-8">
            Have questions? Contact us at <span className="font-semibold text-orange-600">support@niwasnest.com</span>
          </p>
        </div>
      </div>
    </div>
  );
}
