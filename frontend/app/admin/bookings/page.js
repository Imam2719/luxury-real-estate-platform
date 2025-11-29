'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, XCircle, Clock, DollarSign, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminBookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const url = filter === 'all' 
        ? 'http://127.0.0.1:8000/api/bookings/'
        : `http://127.0.0.1:8000/api/bookings/?status=${filter}`;
        
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      const bookingsList = Array.isArray(data) ? data : (data.results || []);
      setBookings(bookingsList);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/bookings/${bookingId}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Booking status updated to ${newStatus}`);
        fetchBookings();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    paid: bookings.filter(b => b.status === 'paid').length,
    canceled: bookings.filter(b => b.status === 'canceled').length,
    revenue: bookings
      .filter(b => b.status === 'paid')
      .reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-12"
        >
          {/* Header Section */}
          <div className="text-center space-y-4 pt-8 pb-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400"
            >
              Manage Bookings
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-300"
            >
              View and manage all property bookings
            </motion.p>
          </div>

          {/* Stats Cards */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-16"
          >
            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-dark p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Calendar size={28} className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold">{stats.total}</div>
                <div className="text-sm text-gray-400 font-medium">Total Bookings</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-dark p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-yellow-500/20 rounded-xl">
                  <Clock size={28} className="text-yellow-400" />
                </div>
                <div className="text-3xl font-bold">{stats.pending}</div>
                <div className="text-sm text-gray-400 font-medium">Pending</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-dark p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <CheckCircle size={28} className="text-blue-400" />
                </div>
                <div className="text-3xl font-bold">{stats.confirmed}</div>
                <div className="text-sm text-gray-400 font-medium">Confirmed</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-dark p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-green-500/20 rounded-xl">
                  <DollarSign size={28} className="text-green-400" />
                </div>
                <div className="text-3xl font-bold">{stats.paid}</div>
                <div className="text-sm text-gray-400 font-medium">Paid</div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ scale: 1.05, y: -5 }}
              className="glass-dark p-6 rounded-2xl border border-white/10 backdrop-blur-lg shadow-xl"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="p-3 bg-red-500/20 rounded-xl">
                  <XCircle size={28} className="text-red-400" />
                </div>
                <div className="text-3xl font-bold">{stats.canceled}</div>
                <div className="text-sm text-gray-400 font-medium">Canceled</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Revenue Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="glass-dark p-8 rounded-3xl border border-white/10 backdrop-blur-lg shadow-2xl mt-12"
          >
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-green-400" />
                  <div className="text-sm text-gray-400 font-medium">Total Revenue</div>
                </div>
                <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                  ${stats.revenue.toFixed(2)}
                </div>
                <div className="text-sm text-gray-500">From paid bookings</div>
              </div>
              <div className="p-6 bg-green-500/10 rounded-2xl">
                <DollarSign size={80} className="text-green-400 opacity-30" />
              </div>
            </div>
          </motion.div>

          {/* Filter Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-200">Filter Bookings</h2>
            <div className="flex flex-wrap gap-4">
              {['all', 'pending', 'confirmed', 'paid', 'canceled'].map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(status)}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                    filter === status
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50'
                      : 'glass-dark border border-white/10 hover:border-purple-400/50'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Bookings Table */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-dark rounded-3xl overflow-hidden border border-white/10 shadow-2xl mt-12"
          >
            <div className="p-6 bg-black/30 border-b border-white/10">
              <h2 className="text-2xl font-bold text-gray-200">All Bookings</h2>
              <p className="text-sm text-gray-400 mt-1">Total {bookings.length} bookings found</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-black/20">
                  <tr>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">Booking ID</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">Property</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">User</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">Date</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">Amount</th>
                    <th className="px-6 py-5 text-left text-sm font-semibold text-gray-300">Status</th>
                    <th className="px-6 py-5 text-right text-sm font-semibold text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, index) => (
                    <motion.tr 
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="border-t border-white/10 hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-5">
                        <div className="font-mono text-purple-400 font-semibold">#{booking.id}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-200">{booking.property_name || 'N/A'}</div>
                          <div className="text-sm text-gray-400">{booking.property_location || 'N/A'}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-gray-300">
                        <div className="font-medium">User #{booking.user}</div>
                      </td>
                      <td className="px-6 py-5 text-gray-300">
                        <div className="text-sm">{new Date(booking.created_at).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="font-bold text-lg text-purple-400">
                          ${parseFloat(booking.total_amount).toFixed(2)}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                          booking.status === 'paid' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          booking.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                          booking.status === 'pending' ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex gap-2 justify-end">
                          {booking.status === 'pending' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStatusChange(booking.id, 'confirmed')}
                              className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 text-sm font-semibold border border-blue-500/30"
                            >
                              Confirm
                            </motion.button>
                          )}
                          {booking.status !== 'canceled' && booking.status !== 'paid' && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleStatusChange(booking.id, 'canceled')}
                              className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 text-sm font-semibold border border-red-500/30"
                            >
                              Cancel
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {bookings.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 mt-12"
            >
              <div className="inline-block p-8 bg-white/5 rounded-full mb-6">
                <Calendar size={80} className="text-gray-400 opacity-30" />
              </div>
              <p className="text-2xl font-semibold text-gray-400">No bookings found</p>
              <p className="text-gray-500 mt-2">Try adjusting your filters</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}