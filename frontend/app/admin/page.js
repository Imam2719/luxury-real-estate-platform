'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Home, Calendar, Users, Settings, TrendingUp, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalBookings: 0,
    totalUsers: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      console.log('❌ No token found');
      router.push('/auth/login');
      return;
    }

    // ✅ Check if user is admin
    const checkAdmin = () => {
      try {
        const userStr = localStorage.getItem('user');
        
        if (!userStr) {
          console.log('❌ No user data in localStorage');
          router.push('/auth/login');
          return;
        }

        const user = JSON.parse(userStr);
        console.log('👤 User:', user.username);
        console.log('📋 is_admin:', user.is_admin);
        console.log('📋 is_staff:', user.is_staff);

        if (user.is_admin === true || user.is_staff === true) {
          console.log('✅ Admin access granted');
          setAuthorized(true);
          fetchStats();
        } else {
          console.log('❌ User is not an admin, redirecting...');
          toast.error('Only admins can access this page');
          router.push('/dashboard');
        }
      } catch (error) {
        console.error('❌ Error checking admin:', error);
        router.push('/auth/login');
      }
    };

    checkAdmin();
  }, [router]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('access_token');
      
      const propertiesRes = await fetch('http://127.0.0.1:8000/api/properties/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const propertiesData = await propertiesRes.json();
      
      const bookingsRes = await fetch('http://127.0.0.1:8000/api/bookings/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const bookingsData = await bookingsRes.json();
      
      const properties = propertiesData.results || [];
      const bookings = Array.isArray(bookingsData) ? bookingsData : (bookingsData.results || []);
      
      const revenue = bookings.reduce((sum, b) => sum + parseFloat(b.total_amount || 0), 0);
      
      setStats({
        totalProperties: properties.length,
        totalBookings: bookings.length,
        totalUsers: 0,
        revenue: revenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-red-400 text-2xl">❌ Admin Access Denied</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Header Section */}
          <div className="text-center mb-16">
            <motion.div 
              className="inline-flex items-center justify-center gap-4 mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Settings size={56} className="text-purple-400" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
              Admin Panel
            </h1>
            <p className="text-gray-300 text-lg md:text-xl">Manage your real estate platform with ease</p>
          </div>

          {/* Stats Grid - Enhanced Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
            <motion.div 
              className="glass-dark p-8 rounded-2xl border border-blue-500/20 hover:border-blue-400/40 transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Home size={40} className="text-blue-400 group-hover:scale-110 transition-transform" />
                <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-blue-400 animate-pulse"></div>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">{stats.totalProperties}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Total Properties</div>
            </motion.div>
            
            <motion.div 
              className="glass-dark p-8 rounded-2xl border border-green-500/20 hover:border-green-400/40 transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Calendar size={40} className="text-green-400 group-hover:scale-110 transition-transform" />
                <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">{stats.totalBookings}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Total Bookings</div>
            </motion.div>
            
            <motion.div 
              className="glass-dark p-8 rounded-2xl border border-yellow-500/20 hover:border-yellow-400/40 transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex items-center justify-between mb-4">
                <TrendingUp size={40} className="text-yellow-400 group-hover:scale-110 transition-transform" />
                <div className="h-12 w-12 rounded-full bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">${stats.revenue.toFixed(2)}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Total Revenue</div>
            </motion.div>

            <motion.div 
              className="glass-dark p-8 rounded-2xl border border-purple-500/20 hover:border-purple-400/40 transition-all duration-300 group"
              whileHover={{ scale: 1.05, y: -8 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <Package size={40} className="text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                  <div className="h-2 w-2 rounded-full bg-purple-400 animate-pulse"></div>
                </div>
              </div>
              <div className="text-4xl font-bold mb-2">{stats.totalProperties}</div>
              <div className="text-gray-400 text-sm uppercase tracking-wide">Active Listings</div>
            </motion.div>
          </div>

          {/* Quick Actions - Enhanced */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-3">
              Quick Actions
            </h2>
            <p className="text-gray-400 text-lg">Manage your platform efficiently</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <Link href="/admin/properties">
              <motion.div 
                className="glass-dark p-10 rounded-2xl border border-purple-500/20 hover:border-purple-400/50 cursor-pointer group relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Home size={56} className="text-purple-400 mb-6 group-hover:scale-125 transition-all duration-300 relative z-10" />
                <h3 className="text-2xl font-bold mb-3 group-hover:text-purple-400 transition-colors relative z-10">
                  Manage Properties
                </h3>
                <p className="text-gray-400 relative z-10">Create, edit, or delete properties</p>
              </motion.div>
            </Link>

            <Link href="/admin/bookings">
              <motion.div 
                className="glass-dark p-10 rounded-2xl border border-green-500/20 hover:border-green-400/50 cursor-pointer group relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Calendar size={56} className="text-green-400 mb-6 group-hover:scale-125 transition-all duration-300 relative z-10" />
                <h3 className="text-2xl font-bold mb-3 group-hover:text-green-400 transition-colors relative z-10">
                  Manage Bookings
                </h3>
                <p className="text-gray-400 relative z-10">View and manage all bookings</p>
              </motion.div>
            </Link>

            <a href="http://127.0.0.1:8000/admin/" target="_blank" rel="noopener noreferrer">
              <motion.div 
                className="glass-dark p-10 rounded-2xl border border-yellow-500/20 hover:border-yellow-400/50 cursor-pointer group relative overflow-hidden"
                whileHover={{ scale: 1.05, y: -10 }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Settings size={56} className="text-yellow-400 mb-6 group-hover:scale-125 transition-all duration-300 relative z-10" />
                <h3 className="text-2xl font-bold mb-3 group-hover:text-yellow-400 transition-colors relative z-10">
                  Django Admin
                </h3>
                <p className="text-gray-400 relative z-10">Access full Django admin panel</p>
              </motion.div>
            </a>
          </div>
        </motion.div>
      </div>

      <footer className="py-10 px-4 border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400 text-sm">© 2025 Luxury Real Estate Admin Panel</p>
        </div>
      </footer>
    </div>
  );
}