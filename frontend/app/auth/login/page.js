'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { LogIn, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Step 1: Login করুন
      console.log('🔐 Attempting login...');
      const response = await fetch('http://127.0.0.1:8000/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Login successful');
        
        // Step 2: Tokens save করুন
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        console.log('✅ Tokens saved');

        // Step 3: User data fetch করুন
        const userResponse = await fetch('http://127.0.0.1:8000/api/users/me/', {
          headers: { 'Authorization': `Bearer ${data.access}` }
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          console.log('✅ User data fetched');
          console.log('   - Username:', userData.username);
          console.log('   - is_admin:', userData.is_admin);
          console.log('   - is_staff:', userData.is_staff);
          
          // Step 4: User data localStorage এ save করুন
          localStorage.setItem('user', JSON.stringify(userData));

          toast.success(`Welcome back, ${userData.username}! ✨`);

          // Step 5: Admin কিনা তা check করে redirect করুন
          if (userData.is_admin === true || userData.is_staff === true) {
            console.log('🎉 Admin detected → Redirecting to /admin');
            router.push('/admin');
          } else {
            console.log('👤 Regular user → Redirecting to /dashboard');
            router.push('/dashboard');
          }
        } else {
          console.error('❌ Failed to fetch user data');
          setErrors({ submit: 'Failed to load user profile' });
        }
      } else {
        console.error('❌ Login failed:', data);
        setErrors({ submit: data.detail || 'Invalid username or password' });
      }
    } catch (error) {
      console.error('❌ Network error:', error);
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    focus: { scale: 1.01, boxShadow: '0 0 20px rgba(168, 85, 247, 0.3)' },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <div className="flex items-center justify-center min-h-screen px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md relative"
        >
          {/* Background Blurs */}
          <div className="absolute -top-40 -left-20 w-80 h-80 bg-purple-600/30 rounded-full blur-3xl opacity-20 -z-10" />
          <div className="absolute -bottom-40 -right-20 w-80 h-80 bg-pink-600/30 rounded-full blur-3xl opacity-20 -z-10" />

          {/* Card */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-3xl p-8 shadow-2xl">
            
            {/* Header */}
            <div className="text-center mb-10">
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg"
              >
                <LogIn size={32} className="text-white" />
              </motion.div>
              
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                Welcome Back
              </h1>
              <p className="text-gray-400">Sign in to explore luxury properties</p>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3 backdrop-blur"
              >
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{errors.submit}</p>
              </motion.div>
            )}

            {/* Form */}
            <div className="space-y-6">
              
              {/* Username Field */}
              <motion.div
                variants={inputVariants}
                whileFocus="focus"
              >
                <label className="block text-sm font-semibold text-gray-300 mb-3 ml-1">
                  Username
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Mail size={20} className="text-purple-400 group-focus-within:text-purple-300 transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={formData.username}
                    onChange={(e) => {
                      setFormData({ ...formData, username: e.target.value });
                      if (errors.username) setErrors({ ...errors, username: '' });
                    }}
                    className={`w-full pl-14 pr-4 py-3.5 bg-white/5 backdrop-blur-sm border ${
                      errors.username ? 'border-red-500/50' : 'border-white/20 hover:border-white/30'
                    } rounded-xl focus:outline-none focus:border-purple-500/70 focus:bg-white/10 transition-all placeholder:text-gray-500 text-white`}
                    placeholder="Enter username"
                    disabled={loading}
                  />
                </div>
                {errors.username && (
                  <p className="text-red-400 text-xs mt-2 ml-1">{errors.username}</p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                variants={inputVariants}
                whileFocus="focus"
              >
                <label className="block text-sm font-semibold text-gray-300 mb-3 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Lock size={20} className="text-purple-400 group-focus-within:text-purple-300 transition-colors" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => {
                      setFormData({ ...formData, password: e.target.value });
                      if (errors.password) setErrors({ ...errors, password: '' });
                    }}
                    className={`w-full pl-14 pr-14 py-3.5 bg-white/5 backdrop-blur-sm border ${
                      errors.password ? 'border-red-500/50' : 'border-white/20 hover:border-white/30'
                    } rounded-xl focus:outline-none focus:border-purple-500/70 focus:bg-white/10 transition-all placeholder:text-gray-500 text-white`}
                    placeholder="Enter password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors disabled:opacity-50"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-2 ml-1">{errors.password}</p>
                )}
              </motion.div>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3.5 mt-8 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-700 disabled:to-pink-700 rounded-xl font-semibold text-white transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-purple-500/50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </motion.button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              <span className="text-xs text-gray-500 px-2">OR</span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Link to Register */}
            <p className="text-center text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link
                href="/auth/register"
                className="text-purple-400 font-semibold hover:text-purple-300 hover:underline transition-colors"
              >
                Create one now
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}