'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Pause, Play, Eye, EyeOff, CheckCircle, Home } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminPropertiesPage() {
  const router = useRouter();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/properties/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProperties(data.results || []);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load properties');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (slug, newStatus) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/properties/${slug}/`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        toast.success(`Property status changed to ${newStatus}`);
        fetchProperties();
      } else {
        toast.error('Failed to update status');
      }
    } catch (error) {
      toast.error('Error updating status');
    }
  };

  const handleDelete = async (slug, name) => {
    if (!confirm(`Are you sure you want to permanently DELETE "${name}"? This action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(`http://127.0.0.1:8000/api/properties/${slug}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        toast.success('Property deleted successfully');
        fetchProperties();
      } else {
        toast.error('Failed to delete property');
      }
    } catch (error) {
      toast.error('Error deleting property');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex items-center justify-center">
        <div className="text-white text-2xl animate-pulse">Loading properties...</div>
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
          <div className="text-center mb-12">
            <motion.div
              className="inline-flex items-center justify-center gap-4 mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Home size={48} className="text-purple-400" />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
              Manage Properties
            </h1>
            <p className="text-gray-300 text-lg mb-8">Create, edit, and control all properties</p>

            <motion.a
              href="/admin/properties/create"
              target="_blank"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <Plus size={24} />
              Create New Property
            </motion.a>
          </div>

          {/* Properties Grid/Table */}
          {properties.length > 0 ? (
            <motion.div
              className="glass-dark rounded-3xl overflow-hidden border border-purple-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-sm">
                    <tr>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider text-purple-300">Image</th>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider text-purple-300">Property</th>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider text-purple-300">Location</th>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider text-purple-300">Price</th>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider text-purple-300">Status</th>
                      <th className="px-6 py-5 text-left text-sm font-bold uppercase tracking-wider text-purple-300">Featured</th>
                      <th className="px-6 py-5 text-right text-sm font-bold uppercase tracking-wider text-purple-300">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map((property, index) => (
                      <motion.tr
                        key={property.id}
                        className="border-t border-purple-500/10 hover:bg-purple-500/5 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        {/* Image Column */}
                        <td className="px-6 py-5">
                          {property.image ? (
                            <div className="relative group">
                              <img
                                src={`http://127.0.0.1:8000${property.image}`}
                                alt={property.name}
                                className="w-20 h-20 object-cover rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            </div>
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center text-3xl">
                              🏠
                            </div>
                          )}
                        </td>

                        {/* Property Info */}
                        <td className="px-6 py-5">
                          <div className="font-bold text-lg mb-1">{property.name}</div>
                          <div className="text-sm text-gray-400 flex items-center gap-3">
                            <span className="px-2 py-1 bg-blue-500/10 rounded-md">
                              🛏️ {property.bedrooms} beds
                            </span>
                            <span className="px-2 py-1 bg-blue-500/10 rounded-md">
                              🚿 {property.bathrooms} baths
                            </span>
                          </div>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="text-purple-400">📍</span>
                            {property.location}
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-6 py-5">
                          <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                            ${(property.price / 1000000).toFixed(1)}M
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide ${
                            property.status === 'active' 
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30' 
                              : property.status === 'sold' 
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                              : 'bg-gray-500/20 text-gray-300 border border-gray-500/30'
                          }`}>
                            {property.status}
                          </span>
                        </td>

                        {/* Featured */}
                        <td className="px-6 py-5">
                          {property.featured ? (
                            <div className="flex items-center gap-2 text-yellow-400">
                              <CheckCircle size={24} className="animate-pulse" />
                              <span className="font-semibold">Yes</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 text-lg">—</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-5">
                          <div className="flex gap-2 justify-end">
                            {/* Status Controls */}
                            {property.status === 'active' && (
                              <motion.button
                                onClick={() => handleStatusChange(property.slug, 'inactive')}
                                className="p-3 bg-yellow-500/20 text-yellow-300 rounded-xl hover:bg-yellow-500/30 border border-yellow-500/30 transition-all"
                                title="Pause"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Pause size={18} />
                              </motion.button>
                            )}

                            {property.status === 'inactive' && (
                              <motion.button
                                onClick={() => handleStatusChange(property.slug, 'active')}
                                className="p-3 bg-green-500/20 text-green-300 rounded-xl hover:bg-green-500/30 border border-green-500/30 transition-all"
                                title="Resume"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <Play size={18} />
                              </motion.button>
                            )}

                            {property.status !== 'sold' && (
                              <motion.button
                                onClick={() => handleStatusChange(property.slug, 'sold')}
                                className="p-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-500/30 transition-all"
                                title="Mark as Sold"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <EyeOff size={18} />
                              </motion.button>
                            )}

                            {/* Edit */}
                            <motion.a
                              href={`http://127.0.0.1:8000/admin/properties/property/${property.id}/change/`}
                              target="_blank"
                              className="p-3 bg-blue-500/20 text-blue-300 rounded-xl hover:bg-blue-500/30 border border-blue-500/30 transition-all"
                              title="Edit"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Edit size={18} />
                            </motion.a>

                            {/* Delete */}
                            <motion.button
                              onClick={() => handleDelete(property.slug, property.name)}
                              className="p-3 bg-red-500/20 text-red-300 rounded-xl hover:bg-red-500/30 border border-red-500/30 transition-all"
                              title="Delete Permanently"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Trash2 size={18} />
                            </motion.button>

                            {/* View */}
                            <motion.a
                              href={`/properties/${property.slug}`}
                              target="_blank"
                              className="p-3 bg-purple-500/20 text-purple-300 rounded-xl hover:bg-purple-500/30 border border-purple-500/30 transition-all"
                              title="View"
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Eye size={18} />
                            </motion.a>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="glass-dark rounded-3xl p-16 text-center border border-purple-500/20"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-8xl mb-6">🏠</div>
              <h2 className="text-3xl font-bold mb-4 text-gray-300">No properties found</h2>
              <p className="text-gray-400 mb-8 text-lg">Get started by creating your first property</p>
              <motion.a
                href="/admin/properties/create"
                target="_blank"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-semibold text-lg shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all"
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus size={24} />
                Create First Property
              </motion.a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}