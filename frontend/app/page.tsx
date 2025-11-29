'use client';

import { useEffect, useState } from 'react';
import { motion, useScroll, useMotionValueEvent } from 'framer-motion';
import { MapPin, Bed, Bath, Star, ChevronRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import PropertyFilter from '@/components/property/PropertyFilter';

// API Base URL
const API_BASE_URL = 'http://127.0.0.1:8000/api';

export default function PropertiesPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { scrollY } = useScroll();
  const [headerHidden, setHeaderHidden] = useState(false);

  // Hide header on scroll down, show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 180) {
      setHeaderHidden(true);
    } else {
      setHeaderHidden(false);
    }
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async (queryParams = '') => {
    try {
      setLoading(true);
      setError(null);
      
      const url = queryParams 
        ? `${API_BASE_URL}/properties/?${queryParams}` 
        : `${API_BASE_URL}/properties/`;
      
      console.log('🔍 Fetching from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Data received:', data);
      
      const propertyList = data.results || data || [];
      setProperties(propertyList);
      setFilteredProperties(propertyList);
      
    } catch (err: any) {
      console.error('❌ Fetch error:', err);
      setError(err.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredProperties(properties);
      return;
    }
    
    const filtered = properties.filter((property) =>
      property.name?.toLowerCase().includes(query.toLowerCase()) ||
      property.location?.toLowerCase().includes(query.toLowerCase())
    );
    
    setFilteredProperties(filtered);
  };

  const handleFilter = (filters: any) => {
    const params = new URLSearchParams();
    
    if (filters.minPrice) params.append('price__gte', filters.minPrice);
    if (filters.maxPrice) params.append('price__lte', filters.maxPrice);
    if (filters.bedrooms) params.append('bedrooms__gte', filters.bedrooms);
    if (filters.bathrooms) params.append('bathrooms__gte', filters.bathrooms);
    if (filters.status && filters.status !== '') params.append('status', filters.status);
    
    fetchProperties(params.toString());
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      
      {/* Spacer for fixed navbar */}
      <div className="h-20" />

      {/* Header Section */}
      <motion.div
        variants={{
          visible: { y: 0 },
          hidden: { y: "-100%" }
        }}
        animate={headerHidden ? "hidden" : "visible"}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="relative z-30 bg-black/90 backdrop-blur-xl border-b border-purple-500/20 sticky top-20"
      >
        <div className="max-w-7xl mx-auto px-6 py-12">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="text-5xl md:text-6xl font-extrabold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-purple-600"
          >
            Find Your Dream Property
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            <PropertyFilter onSearch={handleSearch} onFilter={handleFilter} />
          </motion.div>
        </div>
      </motion.div>

      {/* Properties Grid */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-dark p-8 rounded-2xl text-center max-w-2xl mx-auto mb-12 border border-red-500/30"
          >
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-red-400 mb-3">Connection Error</h3>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="space-y-3 text-left text-sm text-gray-400">
              <p>⚠️ Make sure backend is running:</p>
              <code className="block bg-black/50 p-3 rounded">
                cd backend<br/>
                python manage.py runserver
              </code>
              <p>🔗 Backend should be accessible at: <span className="text-purple-400">http://127.0.0.1:8000/api/properties/</span></p>
            </div>
            <button
              onClick={() => fetchProperties()}
              className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg hover:scale-105 transition-transform"
            >
              Retry Connection
            </button>
          </motion.div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="text-center py-32">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <p className="text-3xl animate-pulse text-purple-400">Loading luxury properties...</p>
          </div>
        )}

        {/* Properties Grid */}
        {!loading && !error && (
          <>
            {filteredProperties.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-32"
              >
                <div className="text-8xl mb-6">🏠</div>
                <h3 className="text-3xl font-bold mb-4 text-gray-400">No properties found</h3>
                <p className="text-gray-500 mb-8">Try adjusting your search filters</p>
                <button
                  onClick={() => {
                    setFilteredProperties(properties);
                    fetchProperties();
                  }}
                  className="px-8 py-3 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors"
                >
                  Clear Filters
                </button>
              </motion.div>
            ) : (
              <>
                <div className="mb-8 text-gray-400 text-center">
                  Showing {filteredProperties.length} {filteredProperties.length === 1 ? 'property' : 'properties'}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {filteredProperties.map((property: any, index: number) => (
                    <PropertyCard key={property.id} property={property} index={index} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10 text-center text-gray-500 text-sm">
        <p>© 2025 Luxury Real Estate. All rights reserved.</p>
        <p className="mt-2">Built with Django REST Framework + Next.js + Three.js</p>
      </footer>
    </div>
  );
}

// Property Card Component
function PropertyCard({ property, index }: { property: any; index: number }) {
  const imageUrl = property.image 
    ? (property.image.startsWith('http') ? property.image : `http://127.0.0.1:8000${property.image}`)
    : '/placeholder.jpg';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ y: -10, scale: 1.02 }}
    >
      <Link href={`/properties/${property.slug}`}>
        <div className="group relative h-80 rounded-2xl overflow-hidden glass-dark border border-white/10 hover:border-purple-500/70 transition-all duration-500 cursor-pointer shadow-2xl hover:shadow-purple-500/30">
          {/* Image */}
          <div className="absolute inset-0">
            <img
              src={imageUrl}
              alt={property.name || 'Property'}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
          </div>

          {/* Featured Badge */}
          {property.featured && (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-purple-600 to-pink-600 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 shadow-xl z-10">
              <Star size={14} fill="white" />
              FEATURED
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-4 right-4 z-10">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              property.status === 'active' 
                ? 'bg-green-500/30 text-green-300 border border-green-500/50' 
                : property.status === 'sold'
                ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                : 'bg-gray-500/30 text-gray-300 border border-gray-500/50'
            }`}>
              {property.status?.toUpperCase() || 'AVAILABLE'}
            </span>
          </div>

          {/* Content */}
          <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-purple-300 transition-colors">
              {property.name}
            </h3>
            
            <p className="text-sm text-gray-300 flex items-center gap-2 mb-4">
              <MapPin size={14} className="flex-shrink-0" />
              <span className="line-clamp-1">{property.location}</span>
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
              <span className="flex items-center gap-1">
                <Bed size={16} className="text-purple-400" />
                {property.bedrooms}
              </span>
              <span className="flex items-center gap-1">
                <Bath size={16} className="text-pink-400" />
                {property.bathrooms}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                ${(property.price / 1000000).toFixed(2)}M
              </span>
              <span className="text-purple-400 text-sm font-medium flex items-center gap-1 group-hover:translate-x-2 transition-transform">
                View <ChevronRight size={16} />
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}