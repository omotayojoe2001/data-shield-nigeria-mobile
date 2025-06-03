
import React, { useState } from 'react';
import { User, Camera, Lock, Phone, Mail, Save, Eye, EyeOff, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const ProfileScreen = () => {
  const { user, profile, updateProfile, signOut } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      const { error } = await updateProfile({
        full_name: formData.full_name,
        phone: formData.phone
      });

      if (error) throw error;
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.new_password !== formData.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.new_password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      // In demo mode, just show success
      toast.success('Password updated successfully!');
      setFormData(prev => ({
        ...prev,
        current_password: '',
        new_password: '',
        confirm_password: ''
      }));
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePhotoUpload = () => {
    // Demo functionality - in real app this would open image picker
    toast.success('Profile photo updated! (Demo)');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 px-6 pt-12 pb-8 rounded-b-3xl shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-white text-2xl font-bold">Profile Settings</h1>
            <p className="text-blue-200">Manage your account information</p>
          </div>
          <button 
            onClick={handleSignOut}
            className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <LogOut size={20} className="text-red-300" />
          </button>
        </div>

        {/* Profile Photo Section */}
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center">
                <User size={40} className="text-white" />
              </div>
              <button 
                onClick={handleProfilePhotoUpload}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
              >
                <Camera size={16} className="text-white" />
              </button>
            </div>
            <div>
              <h3 className="text-white text-xl font-bold">{formData.full_name || 'User'}</h3>
              <p className="text-blue-200">{user?.email}</p>
              <button 
                onClick={handleProfilePhotoUpload}
                className="text-cyan-300 text-sm hover:text-cyan-200 transition-colors"
              >
                Change profile photo
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="px-6 mt-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <User size={20} className="mr-2" />
            Personal Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-blue-700 font-medium mb-2">Full Name</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                className="w-full px-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
              />
            </div>

            <div>
              <label className="block text-blue-700 font-medium mb-2">Email Address</label>
              <div className="relative">
                <Mail size={20} className="absolute left-3 top-3 text-blue-400" />
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-xl bg-blue-50 text-blue-600"
                />
              </div>
              <p className="text-sm text-blue-600 mt-1">Email cannot be changed</p>
            </div>

            <div>
              <label className="block text-blue-700 font-medium mb-2">Phone Number</label>
              <div className="relative">
                <Phone size={20} className="absolute left-3 top-3 text-blue-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+234 801 234 5678"
                />
              </div>
            </div>

            <button 
              onClick={handleProfileUpdate}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Save size={18} />
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Password Change */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center">
            <Lock size={20} className="mr-2" />
            Change Password
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-blue-700 font-medium mb-2">Current Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.current_password}
                  onChange={(e) => handleInputChange('current_password', e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-blue-400 hover:text-blue-600"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-blue-700 font-medium mb-2">New Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => handleInputChange('new_password', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            <div>
              <label className="block text-blue-700 font-medium mb-2">Confirm New Password</label>
              <div className="relative">
                <Lock size={20} className="absolute left-3 top-3 text-blue-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => handleInputChange('confirm_password', e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <button 
              onClick={handlePasswordChange}
              disabled={loading || !formData.current_password || !formData.new_password || !formData.confirm_password}
              className="w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <Lock size={18} />
              <span>{loading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </div>

        {/* Logout Button */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-red-200">
          <button 
            onClick={handleSignOut}
            className="w-full flex items-center justify-center space-x-3 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-2xl font-semibold hover:shadow-lg transition-all duration-300"
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;
