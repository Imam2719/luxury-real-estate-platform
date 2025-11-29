'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MapPin, Bed, Bath, Square, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import ThreeDPreview from '@/components/property/ThreeDPreview';
import toast from 'react-hot-toast';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://127.0.0.1:8000';

export default function PropertyDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [property, setProperty] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingDate, setBookingDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    if (!slug) return;

    fetch(`${API_BASE}/api/properties/${slug}/`)
      .then(r => r.json())
      .then(data => setProperty(data))
      .catch(err => {
        console.error('Property fetch error:', err);
        toast.error('Failed to load property');
      });

    fetch(`${API_BASE}/api/properties/${slug}/recommendations/`)
      .then(r => {
        if (!r.ok) throw new Error(`API error: ${r.status}`);
        return r.json();
      })
      .then(data => setRecommendations(data || []))
      .catch(err => console.error('Recommendations error:', err))
      .finally(() => setLoading(false));
  }, [slug]);

  const getImageUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const handleBooking = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      toast.error("Please login first!");
      router.push('/auth/login');
      return;
    }

    if (!bookingDate) {
      toast.error("Please select a visit date");
      return;
    }

    setBookingLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/bookings/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          property: property.id,
          visit_date: bookingDate
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("🎉 Booking successful! Redirecting to dashboard...");
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        if (data.visit_date) {
          toast.error(`Date error: ${data.visit_date[0]}`);
        } else if (data.property) {
          toast.error(`Property error: ${data.property[0]}`);
        } else if (data.detail) {
          toast.error(data.detail);
        } else {
          toast.error("Failed to create booking");
        }
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-2xl text-purple-400">
      <div className="animate-spin">⏳ Loading...</div>
    </div>
  );
  
  if (!property) return (
    <div className="min-h-screen bg-black flex items-center justify-center text-4xl text-red-500">
      ❌ Property Not Found
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Hero Section with Property Info */}
      <div className="pt-32 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Property Header */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
              {property.name}
            </h1>
            
            <div className="flex items-center justify-center gap-2 text-gray-400 mb-6">
              <MapPin size={20} className="text-purple-400" />
              <span className="text-lg">{property.location}</span>
              {property.featured && <Star size={20} fill="gold" className="text-yellow-400 ml-2" />}
            </div>

            <div className="text-5xl md:text-7xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-6">
              ${property.price ? (parseFloat(property.price) / 1000000).toFixed(2) : 'Price TBD'}M
            </div>

            {/* Property Stats */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-purple-500/40 shadow-lg"
              >
                <Bed className="inline mr-2 text-purple-400" size={20} />
                <span className="font-semibold">{property.bedrooms || 0} Bedrooms</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-purple-500/40 shadow-lg"
              >
                <Bath className="inline mr-2 text-purple-400" size={20} />
                <span className="font-semibold">{property.bathrooms || 0} Bathrooms</span>
              </motion.div>
              
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm px-6 py-3 rounded-xl border border-purple-500/40 shadow-lg"
              >
                <Square className="inline mr-2 text-purple-400" size={20} />
                <span className="font-semibold">{property.square_feet || 'N/A'} sqft</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Main Content: 2D Image Left, 3D Preview Right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Left: 2D Property Image */}
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="order-1"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-2xl border border-purple-500/30 overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-purple-800/60 to-pink-800/40 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-sm font-medium">Property Gallery</span>
                </div>
                <div className="p-4">
                  <div className="max-h-[350px] overflow-hidden rounded-xl">
                    <Image
                      src={getImageUrl(property.image)}
                      alt={property.name || 'Property listing image'}
                      width={800}
                      height={500}
                      className="w-full h-auto object-cover shadow-lg"
                      priority
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                  </div>
                  
                  {/* Description */}
                  <div className="mt-4 p-4 bg-black/40 rounded-lg border border-purple-500/20">
                    <h3 className="text-lg font-semibold text-purple-300 mb-2">About This Property</h3>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      {property.description || "Premium luxury property in prime location with stunning views and modern amenities."}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: 3D Virtual Tour */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="order-2"
            >
              <div className="bg-gradient-to-br from-gray-900/80 to-gray-800/80 backdrop-blur-lg rounded-2xl border border-purple-500/30 overflow-hidden shadow-2xl">
                <div className="bg-gradient-to-r from-purple-800/60 to-pink-800/40 px-4 py-3 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500 animate-pulse"></div>
                  <span className="text-sm font-medium">3D Virtual Tour</span>
                  <Star className="ml-auto" size={16} fill="gold" stroke="gold" />
                </div>
                <div className="p-4">
                  <div className="h-[280px]">
                    <ThreeDPreview modelUrl="/property.glb" />
                  </div>
                </div>
                
                {/* Booking Section */}
                <div className="p-4">
                  <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-sm p-4 rounded-xl border border-purple-500/50">
                    <h3 className="text-lg font-semibold text-purple-300 mb-3">Schedule a Visit</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="date"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        required
                        disabled={bookingLoading}
                        className="flex-1 px-4 py-3 bg-black/60 border border-purple-500/50 rounded-lg text-white focus:border-purple-400 focus:outline-none disabled:opacity-50"
                      />
                      <button
                        onClick={handleBooking}
                        disabled={bookingLoading}
                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg font-semibold hover:scale-105 transition-transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {bookingLoading ? 'Booking...' : 'Book Visit'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Similar Properties Section */}
          {recommendations.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-16"
            >
              <div className="text-center mb-10">
                <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
                  Similar Properties
                </h2>
                <p className="text-gray-400 text-sm">Powered by DFS Algorithm</p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index }}
                  >
                    <Link href={`/properties/${rec.slug}`}>
                      <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-purple-500/30 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20 transition-all duration-300 group cursor-pointer">
                        <div className="h-48 relative overflow-hidden">
                          <Image
                            src={getImageUrl(rec.image)}
                            alt={rec.name || 'Recommended property'}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.jpg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-white group-hover:text-purple-400 transition-colors truncate mb-1">
                            {rec.name}
                          </h3>
                          <p className="text-gray-400 text-xs truncate mb-2 flex items-center gap-1">
                            <MapPin size={12} />
                            {rec.location}
                          </p>
                          <p className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                            ${rec.price ? (parseFloat(rec.price) / 1000000).toFixed(1) : 'TBD'}M
                          </p>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}