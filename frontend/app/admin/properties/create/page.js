'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import { motion } from 'framer-motion';
import { Home, Upload, X, Plus, DollarSign, Bed, Bath, Maximize, MapPin, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreatePropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [amenityInput, setAmenityInput] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    price: '',
    bedrooms: 1,
    bathrooms: 1,
    square_feet: '',
    amenities: [],
    status: 'active',
    category: '',
    image: null,
    featured: false
  });

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/auth/login');
      return;
    }
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/properties/categories/');
      const data = await response.json();
      
      let categoriesArray = [];
      
      if (Array.isArray(data)) {
        categoriesArray = data;
      } else if (data.results && Array.isArray(data.results)) {
        categoriesArray = data.results;
      } else if (typeof data === 'object') {
        categoriesArray = [data];
      }
      
      setCategories(flattenCategories(categoriesArray));
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to load categories');
    }
  };

  const flattenCategories = (categories, level = 0) => {
    if (!categories || !Array.isArray(categories)) {
      return [];
    }
    
    let result = [];
    
    categories.forEach(cat => {
      result.push({ ...cat, level });
      if (cat.children && Array.isArray(cat.children) && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, level + 1));
      }
    });
    
    return result;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()]
      });
      setAmenityInput('');
    }
  };

  const handleRemoveAmenity = (index) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    let token = localStorage.getItem('access_token');
    
    // ✅ Check if user is admin
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    if (!user || !user.is_admin) {
      toast.error('Only admins can create properties');
      router.push('/');
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('location', formData.location);
    data.append('price', formData.price || '0');
    data.append('bedrooms', formData.bedrooms || '1');
    data.append('bathrooms', formData.bathrooms || '1');
    
    if (formData.square_feet) {
      data.append('square_feet', formData.square_feet);
    }
    
    data.append('amenities', JSON.stringify(formData.amenities));
    data.append('status', formData.status);
    
    if (formData.category) {
      data.append('category', formData.category);
    }
    
    data.append('featured', formData.featured);
    
    if (formData.image) {
      data.append('image', formData.image);
    }

    const response = await fetch('http://127.0.0.1:8000/api/properties/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: data
    });

    if (response.status === 401) {
      // ✅ Token expired, try refresh
      const refreshToken = localStorage.getItem('refresh_token');
      const refreshResponse = await fetch('http://127.0.0.1:8000/api/users/token/refresh/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken })
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        localStorage.setItem('access_token', refreshData.access);
        token = refreshData.access;
        
        // Retry the request
        const retryResponse = await fetch('http://127.0.0.1:8000/api/properties/', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: data
        });

        if (retryResponse.ok) {
          toast.success('Property created successfully!');
          router.push('/admin/properties');
          return;
        }
      } else {
        toast.error('Session expired. Please login again.');
        router.push('/auth/login');
        return;
      }
    }

    if (response.ok) {
      toast.success('Property created successfully!');
      router.push('/admin/properties');
    } else {
      const error = await response.json();
      console.error('Error response:', error);
      toast.error(error.detail || JSON.stringify(error));
    }
  } catch (error) {
    console.error('Error:', error);
    toast.error('Network error: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Compact Header */}
          <div className="text-center mb-16">
            <motion.div
              className="inline-flex items-center justify-center mb-6"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-500/40">
                <Home size={40} className="text-purple-400" />
              </div>
            </motion.div>
            <h1 className="text-6xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400">
              Create Property
            </h1>
            <p className="text-gray-300 text-xl">Add a new luxury property to your portfolio</p>
          </div>

          <motion.form 
            onSubmit={handleSubmit} 
            className="max-w-6xl mx-auto space-y-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Compact Image Upload */}
            <div className="glass-dark p-8 rounded-3xl border border-purple-500/20">
              <label className="block text-lg font-bold mb-4 flex items-center gap-3">
                <Upload className="text-purple-400" size={24} />
                Property Image
              </label>
              {imagePreview ? (
                <div className="relative group inline-block">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="h-48 w-auto rounded-xl shadow-2xl border-2 border-purple-500/30"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData({ ...formData, image: null });
                    }}
                    className="absolute -top-3 -right-3 p-2 bg-red-500 rounded-full hover:bg-red-600 shadow-lg transform hover:scale-110 transition-transform"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer inline-flex items-center gap-3 px-8 py-4 bg-purple-500/20 hover:bg-purple-500/30 border-2 border-dashed border-purple-500/40 hover:border-purple-400/60 rounded-xl transition-all">
                  <Upload size={24} className="text-purple-400" />
                  <div className="text-left">
                    <p className="text-gray-200 font-semibold">Click to upload</p>
                    <p className="text-xs text-gray-500">PNG, JPG (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Property Details Section */}
            <div className="glass-dark p-8 rounded-3xl border border-purple-500/20 space-y-8">
              <h2 className="text-2xl font-bold text-purple-300 flex items-center gap-2">
                <Home size={28} />
                Property Details
              </h2>

              {/* Name & Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-bold mb-3 flex items-center gap-2 text-gray-200">
                    <Home size={20} className="text-purple-400" />
                    Property Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all text-lg"
                    placeholder="Sky Tower Penthouse"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-3 flex items-center gap-2 text-gray-200">
                    <MapPin size={20} className="text-purple-400" />
                    Location *
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all text-lg"
                    placeholder="New York City, USA"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-base font-bold mb-3 flex items-center gap-2 text-gray-200">
                  <FileText size={20} className="text-purple-400" />
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={5}
                  className="w-full px-6 py-4 bg-black/40 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all text-lg resize-none"
                  placeholder="Describe the luxury features and unique aspects of this property..."
                  required
                />
              </div>
            </div>

            {/* Property Specifications */}
            <div className="glass-dark p-8 rounded-3xl border border-purple-500/20 space-y-8">
              <h2 className="text-2xl font-bold text-purple-300">Property Specifications</h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <label className="block text-base font-bold mb-3 flex items-center gap-2 text-gray-200">
                    <DollarSign size={20} className="text-green-400" />
                    Price (USD) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-5 py-4 bg-black/40 border-2 border-green-500/30 rounded-xl focus:outline-none focus:border-green-400 focus:ring-4 focus:ring-green-400/10 transition-all text-lg font-semibold"
                    placeholder="5000000"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-3 flex items-center gap-2 text-gray-200">
                    <Bed size={20} className="text-blue-400" />
                    Bedrooms *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bedrooms}
                    onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value ? parseInt(e.target.value) : 1 })}
                    className="w-full px-5 py-4 bg-black/40 border-2 border-blue-500/30 rounded-xl focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-400/10 transition-all text-lg font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-3 flex items-center gap-2 text-gray-200">
                    <Bath size={20} className="text-cyan-400" />
                    Bathrooms *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.bathrooms}
                    onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value ? parseInt(e.target.value) : 1 })}
                    className="w-full px-5 py-4 bg-black/40 border-2 border-cyan-500/30 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-400/10 transition-all text-lg font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-base font-bold mb-3 flex items-center gap-2 text-gray-200">
                    <Maximize size={20} className="text-yellow-400" />
                    Square Feet
                  </label>
                  <input
                    type="number"
                    value={formData.square_feet}
                    onChange={(e) => setFormData({ ...formData, square_feet: e.target.value })}
                    className="w-full px-5 py-4 bg-black/40 border-2 border-yellow-500/30 rounded-xl focus:outline-none focus:border-yellow-400 focus:ring-4 focus:ring-yellow-400/10 transition-all text-lg font-semibold"
                    placeholder="3000"
                  />
                </div>
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-bold mb-3 text-gray-200">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all text-lg"
                  >
                    <option value="">Select Category (Optional)</option>
                    {categories.map((cat, idx) => (
                      <option key={`cat-${cat.id}-${cat.level}-${idx}`} value={cat.id}>
                        {'—'.repeat(cat.level)} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-base font-bold mb-3 text-gray-200">Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-6 py-4 bg-black/40 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all text-lg"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Amenities Section */}
            <div className="glass-dark p-8 rounded-3xl border border-purple-500/20 space-y-6">
              <h2 className="text-2xl font-bold text-purple-300">Amenities</h2>
              
              <div className="flex gap-4">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAmenity())}
                  className="flex-1 px-6 py-4 bg-black/40 border-2 border-purple-500/30 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-4 focus:ring-purple-400/10 transition-all text-lg"
                  placeholder="e.g., Swimming Pool, Gym, Spa"
                />
                <motion.button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-bold flex items-center gap-3 text-lg shadow-xl shadow-purple-500/30"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Plus size={24} />
                  Add
                </motion.button>
              </div>
              
              {formData.amenities.length > 0 && (
                <div className="flex flex-wrap gap-3">
                  {formData.amenities.map((amenity, index) => (
                    <motion.span
                      key={index}
                      className="px-6 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/40 rounded-full flex items-center gap-3 text-base font-semibold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                    >
                      {amenity}
                      <button
                        type="button"
                        onClick={() => handleRemoveAmenity(index)}
                        className="hover:text-red-400 transition-colors p-1 hover:bg-red-500/20 rounded-full"
                      >
                        <X size={18} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              )}
            </div>

            {/* Featured Property */}
            <motion.div 
              className="glass-dark p-6 rounded-3xl border-2 border-yellow-500/40 bg-yellow-500/5"
              whileHover={{ scale: 1.01 }}
            >
              <label className="flex items-center gap-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  className="w-7 h-7 bg-black/40 border-2 border-yellow-500/50 rounded-lg accent-yellow-500"
                />
                <span className="text-xl font-bold text-yellow-300">⭐ Mark as Featured Property</span>
              </label>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-6 pt-4">
              <motion.button
                type="submit"
                disabled={loading}
                className="flex-1 py-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl font-bold text-2xl shadow-2xl shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: loading ? 1 : 1.02, y: loading ? 0 : -3 }}
                whileTap={{ scale: loading ? 1 : 0.98 }}
              >
                {loading ? 'Creating Property...' : 'Create Property'}
              </motion.button>
              <motion.button
                type="button"
                onClick={() => router.push('/admin/properties')}
                className="px-16 py-6 bg-gray-600/30 border-2 border-gray-500/40 rounded-2xl hover:bg-gray-600/40 font-bold text-2xl transition-all"
                whileHover={{ scale: 1.02, y: -3 }}
                whileTap={{ scale: 0.98 }}
              >
                Cancel
              </motion.button>
            </div>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}