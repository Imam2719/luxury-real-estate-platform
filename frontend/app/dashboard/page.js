'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { 
  Calendar, DollarSign, Home, Package, CreditCard, X, 
  CheckCircle, Clock, XCircle, MapPin, Bed, Bath,
  TrendingUp, LogOut, Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

const API_BASE = 'http://127.0.0.1:8000';

export default function DashboardPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }

    fetchUserData();
    fetchBookings();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/users/me/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/bookings/`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        const bookingList = Array.isArray(data) ? data : (data.results || []);
        setBookings(bookingList);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`${API_BASE}/api/bookings/${bookingId}/cancel/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        toast.success('Booking canceled successfully');
        fetchBookings();
      } else {
        const data = await response.json();
        toast.error(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success('Logged out successfully');
    router.push('/');
  };

  const activeBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid').length;
  const totalSpent = bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
  const paidBookings = bookings.filter(b => b.status === 'paid').length;

  const getStatusIcon = (status) => {
    switch(status) {
      case 'paid': return <CheckCircle size={16} className="text-green-400" />;
      case 'confirmed': return <Clock size={16} className="text-blue-400" />;
      case 'pending': return <Clock size={16} className="text-yellow-400" />;
      case 'canceled': return <XCircle size={16} className="text-red-400" />;
      default: return <Clock size={16} className="text-gray-400" />;
    }
  };

  const getImageUrl = (path) => {
    if (!path) return '/placeholder.jpg';
    if (path.startsWith('http')) return path;
    return `${API_BASE}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 text-white">
        <Navbar />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full mb-4"
          />
          <div className="text-xl text-gray-400 animate-pulse">Loading your dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900">
      <Navbar />

   {/* Hero Section with User Info */}
<div className="relative overflow-hidden bg-gradient-to-br from-purple-950 via-slate-900 to-pink-950 backdrop-blur-2xl border-b border-white/10 min-h-[280px] flex items-center">
  <div className="absolute inset-0 opacity-40">
    <div className="absolute top-10 right-20 w-80 h-80 bg-purple-600/40 rounded-full blur-3xl" />
    <div className="absolute bottom-10 left-20 w-96 h-96 bg-pink-600/30 rounded-full blur-3xl" />
  </div>

  <div className="relative container mx-auto px-4 w-full">
    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
      
      {/* Left - User Profile */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-8 flex-1"
      >
        {/* Avatar Circle */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-75" />
          <div className="relative w-28 h-28 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center text-6xl shadow-2xl border-2 border-white/30">
            👤
          </div>
        </div>

        {/* User Info */}
        <div className="text-white">
          <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest">Welcome back</p>
          <h1 className="text-4xl md:text-5xl font-black mb-3">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-300 via-pink-300 to-purple-300">
              {user?.username}
            </span>
          </h1>
          <p className="text-gray-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            {user?.email}
          </p>
        </div>
      </motion.div>

      {/* Right - Quick Stats */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="flex gap-6"
      >
      </motion.div>
    </div>
  </div>
</div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: Home, color: 'from-blue-500 to-blue-600' },
            { label: 'Active Bookings', value: activeBookings, icon: Clock, color: 'from-green-500 to-green-600' },
            { label: 'Completed', value: paidBookings, icon: CheckCircle, color: 'from-emerald-500 to-emerald-600' },
            { label: 'Total Spent', value: `$${totalSpent.toLocaleString(undefined, {maximumFractionDigits: 0})}`, icon: TrendingUp, color: 'from-purple-500 to-pink-600' }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl p-6 hover:border-white/40 transition-all group"
            >
              <div className={`inline-block p-3 bg-gradient-to-br ${stat.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} className="text-white" />
              </div>
              <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className="text-2xl md:text-3xl font-bold text-white">{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookings Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-1">My Bookings</h2>
              <p className="text-gray-400">Manage your property bookings and payments</p>
            </div>
            {bookings.length > 0 && (
              <div className="px-4 py-2 bg-purple-500/20 border border-purple-500/50 rounded-lg text-sm text-purple-300 font-semibold">
                {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          {/* Empty State */}
          {bookings.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-3xl p-12 text-center"
            >
              <div className="inline-block p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl mb-6">
                <Package size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">No bookings yet</h3>
              <p className="text-gray-400 mb-8 max-w-md mx-auto">
                Explore our luxury properties and make your first booking to get started
              </p>
              <Link
                href="/"
                className="inline-block px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 rounded-xl font-semibold transition-all hover:scale-105"
              >
                Browse Properties
              </Link>
            </motion.div>
          ) : (
            /* Bookings Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {bookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden hover:border-purple-500/50 hover:scale-105 transition-all duration-300"
                >
                  {/* Image Section */}
                  <div className="relative h-48 bg-gradient-to-br from-purple-900/50 to-pink-900/50 overflow-hidden">
                    <Image
                      src={getImageUrl(booking.property_image)}
                      alt={booking.property_name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%232d2d44%22 width=%22400%22 height=%22300%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 dominant-baseline=%22middle%22 text-anchor=%22middle%22 font-size=%2248%22%3E🏠%3C/text%3E%3C/svg%3E';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      {getStatusIcon(booking.status)}
                      <span className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                        booking.status === 'paid' ? 'bg-green-500/30 text-green-300 border-green-500/50' :
                        booking.status === 'confirmed' ? 'bg-blue-500/30 text-blue-300 border-blue-500/50' :
                        booking.status === 'pending' ? 'bg-yellow-500/30 text-yellow-300 border-yellow-500/50' :
                        'bg-red-500/30 text-red-300 border-red-500/50'
                      }`}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>

                    {/* Price Overlay */}
                    <div className="absolute bottom-3 left-3 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                      ${parseFloat(booking.total_amount).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {/* Property Name */}
                    <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                      {booking.property_name || `Booking #${booking.id}`}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                      <MapPin size={16} className="text-purple-400 flex-shrink-0" />
                      <span className="line-clamp-1">{booking.property_location || 'Location'}</span>
                    </div>

                    {/* Property Details */}
                    <div className="flex gap-3 mb-4">
                      {booking.bedrooms && (
                        <div className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-lg">
                          <Bed size={14} className="text-purple-400" />
                          <span>{booking.bedrooms}bed</span>
                        </div>
                      )}
                      {booking.bathrooms && (
                        <div className="flex items-center gap-1 text-xs bg-white/10 px-2 py-1 rounded-lg">
                          <Bath size={14} className="text-pink-400" />
                          <span>{booking.bathrooms}bath</span>
                        </div>
                      )}
                    </div>

                    {/* Dates */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <Calendar size={14} className="text-purple-400" />
                        <span>
                          Booked: {new Date(booking.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      {booking.visit_date && (
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Clock size={14} className="text-green-400" />
                          <span>
                            Visit: {new Date(booking.visit_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <Link
                          href={`/payment/${booking.id}`}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 rounded-lg font-semibold text-white text-sm transition-all hover:scale-105 shadow-lg"
                        >
                          <CreditCard size={16} />
                          Pay
                        </Link>
                      )}
                      
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-red-500/30 hover:bg-red-500/40 text-red-300 rounded-lg font-semibold text-sm transition-all border border-red-500/50"
                        >
                          <X size={16} />
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>© 2025 Luxury Real Estate. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}