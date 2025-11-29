// ============ IMPROVED REGISTER PAGE ============
// File: app/auth/register/page.js

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, User, Phone, MapPin, Eye, EyeOff, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password_confirm: '',
    phone: '',
    address: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 6) newErrors.password = 'Minimum 6 characters';
    if (formData.password !== formData.password_confirm) {
      newErrors.password_confirm = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/users/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/auth/login?registered=true');
      } else {
        setErrors({
          submit: data.username?.[0] || data.email?.[0] || 'Registration failed'
        });
      }
    } catch (error) {
      setErrors({ submit: 'Network error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = { focus: { scale: 1.01, boxShadow: '0 0 15px rgba(168, 85, 247, 0.25)' } };

  const fields = [
    { name: 'username', label: 'Username', icon: User, type: 'text', placeholder: '           Choose username', required: true },
    { name: 'email', label: 'Email', icon: Mail, type: 'email', placeholder: '          your@email.com', required: true },
    { name: 'password', label: 'Password', icon: Lock, type: 'password', placeholder: '          Min 6 characters', required: true, toggle: true, show: showPassword, setShow: setShowPassword },
    { name: 'password_confirm', label: 'Confirm Password', icon: Lock, type: 'password', placeholder: '          Confirm password', required: true, toggle: true, show: showConfirm, setShow: setShowConfirm },
    { name: 'phone', label: 'Phone', icon: Phone, type: 'tel', placeholder: '           +880 1234567890', required: false },
    { name: 'address', label: 'Address', icon: MapPin, type: 'text', placeholder: '         Your address', required: false },
  ];

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
            <div className="text-center mb-8">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -5 }}
                className="inline-block p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-6 shadow-lg"
              >
                <UserPlus size={32} className="text-white" />
              </motion.div>
              
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300">
                Create Account
              </h1>
              <p className="text-gray-400">Join our luxury community</p>
            </div>

            {/* Error Alert */}
            {errors.submit && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3"
              >
                <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{errors.submit}</p>
              </motion.div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {fields.map((field) => (
                <motion.div key={field.name} variants={inputVariants} whileFocus="focus">
                  <label className="block text-xs font-semibold text-gray-300 mb-2 ml-1">
                    {field.label} {field.required ? '*' : '(Optional)'}
                  </label>
                  <div className="relative group">
                    <field.icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-400 group-focus-within:text-purple-300 transition-colors pointer-events-none" />
                    <input
                      type={field.toggle && field.show ? 'text' : field.type}
                      value={formData[field.name]}
                      onChange={(e) => {
                        setFormData({ ...formData, [field.name]: e.target.value });
                        if (errors[field.name]) setErrors({ ...errors, [field.name]: '' });
                      }}
                      className={`w-full pl-11 ${field.toggle ? 'pr-11' : 'pr-4'} py-3 bg-white/5 backdrop-blur-sm border ${
                        errors[field.name] ? 'border-red-500/50' : 'border-white/20 hover:border-white/30'
                      } rounded-lg focus:outline-none focus:border-purple-500/70 focus:bg-white/10 transition-all text-sm placeholder:text-gray-500 text-white`}
                      placeholder={field.placeholder}
                      disabled={loading}
                    />
                    {field.toggle && (
                      <button
                        type="button"
                        onClick={() => field.setShow(!field.show)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-purple-400 transition-colors"
                        disabled={loading}
                      >
                        {field.show ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    )}
                  </div>
                  {errors[field.name] && (
                    <p className="text-red-400 text-xs mt-1 ml-1">{errors[field.name]}</p>
                  )}
                </motion.div>
              ))}

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 mt-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-purple-700 disabled:to-pink-700 rounded-xl font-semibold text-white transition-all disabled:opacity-60 shadow-lg hover:shadow-purple-500/50"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <Check size={20} />
                    <span>Create Account</span>
                  </div>
                )}
              </motion.button>
            </div>

            {/* Link to Login */}
            <p className="text-center text-gray-400 text-sm mt-6">
              Already have an account?{' '}
              <Link
                href="/auth/login"
                className="text-purple-400 font-semibold hover:text-purple-300 hover:underline transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}