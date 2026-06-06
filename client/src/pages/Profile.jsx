import React, { useState, useRef } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { MdPerson, MdEmail, MdLock, MdPhotoCamera } from 'react-icons/md';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const fileInputRef = useRef();

  // Profile forms
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size limit: 2MB limit for base64 to avoid huge database rows
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be under 2MB in size');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicture(reader.result); // Base64 url
      toast.success('Image loaded successfully. Save changes to store it.');
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email) {
      toast.error('Name and email cannot be empty');
      return;
    }

    if (password && password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    const payload = { name, email, profilePicture };
    if (password) {
      payload.password = password;
    }

    const res = await updateProfile(payload);
    setLoading(false);

    if (res.success) {
      toast.success('Profile details updated successfully!');
      // Reset password fields
      setPassword('');
      setConfirmPassword('');
    } else {
      toast.error(res.message);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-black text-slate-800 dark:text-white tracking-tight">
          User Profile & Settings
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
          Customize your profile, adjust your avatar, and manage passwords.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Avatar picture card */}
        <Card className="lg:col-span-1 flex flex-col items-center justify-center text-center p-8 h-fit">
          <div className="relative group cursor-pointer mb-5" onClick={triggerFileSelect}>
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile Avatar"
                className="w-32 h-32 rounded-3xl object-cover ring-4 ring-brand-500/20 group-hover:opacity-85 transition-opacity"
              />
            ) : (
              <div className="w-32 h-32 bg-brand-500/10 dark:bg-brand-500/20 rounded-3xl flex items-center justify-center text-brand-600 dark:text-brand-400 font-black text-4xl group-hover:opacity-85 transition-opacity">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
            )}
            
            {/* Hover overlay icon camera */}
            <div className="absolute inset-0 bg-slate-900/40 rounded-3xl opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-200">
              <MdPhotoCamera className="w-7 h-7" />
            </div>

            {/* Hidden Input file */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              accept="image/*"
              className="hidden"
            />
          </div>

          <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-100">
            {user?.name || 'User'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 mb-5">
            {user?.email || 'user@example.com'}
          </p>

          <Button variant="outline" size="sm" onClick={triggerFileSelect}>
            Choose Picture
          </Button>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-normal">
            Supports JPEG, PNG or SVG images.<br />Max size allowed: 2MB
          </p>
        </Card>

        {/* Right column: Edit Details Form */}
        <Card className="lg:col-span-2">
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-6">
            Account Information
          </h3>

          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<MdPerson className="w-5 h-5" />}
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<MdEmail className="w-5 h-5" />}
                required
              />
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850/80 pt-5 mt-5">
              <h4 className="text-xs font-bold text-slate-400 dark:text-slate-555 uppercase tracking-wider mb-4">
                Update Password (Leave blank to keep current)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="New Password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<MdLock className="w-5 h-5" />}
                  placeholder="••••••••"
                />
                <Input
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  icon={<MdLock className="w-5 h-5" />}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-850">
              <Button type="submit" loading={loading} className="px-6">
                Save Changes
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
