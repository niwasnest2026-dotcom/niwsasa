import SearchForm from '@/components/SearchForm';
import FeaturedProperties from '@/components/FeaturedProperties';
import { FaHome, FaShieldAlt, FaUsers, FaWifi, FaDumbbell } from 'react-icons/fa';

export default function Home() {
  return (
    <div>
      {/* Hero Section with Orange Gradient */}
      <section className="min-h-[85vh] flex items-center px-4 py-section relative overflow-hidden bg-gradient-hero">
        <div className="max-w-6xl mx-auto w-full relative z-10">
          {/* Hero Content */}
          <div className="text-center mb-12">
            <h1 className="text-page-title md:text-[48px] lg:text-[56px] text-white mb-6">
              Experience Vibrant
            </h1>
            <h2 className="text-page-title md:text-[48px] lg:text-[56px] mb-8">
              <span className="bg-gradient-to-r from-accent to-accent-light bg-clip-text text-transparent">
                Coliving
              </span>
              <span className="text-white"> at Niwas Nest</span>
            </h2>
            <p className="text-section-heading md:text-[20px] max-w-3xl mx-auto text-white/90 font-normal leading-relaxed">
              Live comfortably in modern, fully-furnished spaces made for students and young professionals. Connect, thrive, and make the most of your city life.
            </p>
          </div>

          {/* Search Form Card */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
              <SearchForm />
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-accent/20 blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-accent-light/10 blur-3xl"></div>
      </section>

      {/* Available Properties */}
      <section className="py-section px-4 bg-gradient-to-br from-accent to-accent-light">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-section-sm">
            <h2 className="text-page-title md:text-[42px] text-neutral-700 mb-4">
              Available Properties
            </h2>
            <p className="text-section-heading text-neutral-600">
              Browse our latest listings
            </p>
          </div>

          <FeaturedProperties />
        </div>
      </section>

      {/* Why Choose Section with Orange Gradient */}
      <section className="py-section px-4 bg-gradient-to-br from-primary-dark to-primary">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-section-sm">
            <h2 className="text-page-title md:text-[42px] text-white mb-4">
              Why Choose Niwas Nest?
            </h2>
            <p className="text-section-heading max-w-3xl mx-auto text-white/90">
              Modern, comfortable, and ready for you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
            {/* Community Vibes */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-accent">
                <FaUsers className="text-3xl text-primary" />
              </div>
              <h3 className="text-card-heading text-neutral-700 mb-4">Community Vibes</h3>
              <p className="text-body text-neutral-600 leading-relaxed">
                Meet fellow students and young pros in a friendly, inclusive environment.
              </p>
            </div>

            {/* All-Inclusive */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-accent">
                <FaHome className="text-3xl text-primary" />
              </div>
              <h3 className="text-card-heading text-neutral-700 mb-4">All-Inclusive</h3>
              <p className="text-body text-neutral-600 leading-relaxed">
                Enjoy fully furnished rooms, with utilities and housekeeping—all included.
              </p>
            </div>

            {/* Great Amenities */}
            <div className="bg-white rounded-2xl p-8 text-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 bg-accent">
                <FaShieldAlt className="text-3xl text-primary" />
              </div>
              <h3 className="text-card-heading text-neutral-700 mb-4">Great Amenities</h3>
              <p className="text-body text-neutral-600 leading-relaxed">
                Access gym, lounge, study area, and other top-notch facilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Most Popular Facilities */}
      <section className="py-section px-4 bg-gradient-to-br from-accent-light via-accent to-accent-light animate-gradient-shift" style={{
        backgroundSize: '400% 400%'
      }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-section-sm">
            <h2 className="text-page-title md:text-[42px] text-neutral-700 mb-4">
              Most Popular Facilities
            </h2>
            <p className="text-section-heading max-w-3xl mx-auto text-neutral-600">
              Modern, comfortable and ready for you
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-card-gap">
            {/* Fully Furnished Rooms */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-primary to-primary-dark">
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-white/20 backdrop-blur-sm">
                  <FaHome className="text-2xl text-white" />
                </div>
                <h3 className="text-card-heading text-white mb-4">Fully Furnished Rooms</h3>
                <p className="text-body text-white/90">
                  Modern, comfortable and ready for you.
                </p>
              </div>
            </div>

            {/* Awesome Gym */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-accent to-primary">
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-white/20 backdrop-blur-sm">
                  <FaDumbbell className="text-2xl text-neutral-700" />
                </div>
                <h3 className="text-card-heading text-neutral-700 mb-4">Awesome Gym</h3>
                <p className="text-body text-neutral-600">
                  Stay fit with our well-equipped gym.
                </p>
              </div>
            </div>

            {/* Study Lounge */}
            <div className="relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-accent-light to-accent">
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 bg-white/20 backdrop-blur-sm">
                  <FaWifi className="text-2xl text-primary" />
                </div>
                <h3 className="text-card-heading text-neutral-700 mb-4">Study Lounge</h3>
                <p className="text-body text-neutral-600">
                  Quiet workspace perfect for productivity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
