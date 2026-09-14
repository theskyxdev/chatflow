import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import api from '../../config/api';
import MainLayout from '../../components/layout/MainLayout';
import { updateProfileSchema } from '../../utils/validation';

function ProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, updateProfile, uploadAvatar } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(updateProfileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const targetUserId = userId || currentUser?._id;
        
        if (!targetUserId) return;

        const { data } = await api.get(`/users/${targetUserId}`);
        setProfile(data.user);
        setIsOwnProfile(data.user._id === currentUser?._id);
        
        if (data.user._id === currentUser?._id) {
          reset({
            name: data.user.name,
            username: data.user.username,
            bio: data.user.bio,
          });
        }
      } catch (error) {
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser, reset]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    setIsUploadingAvatar(true);

    // Preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      const result = await uploadAvatar(file);
      if (result.success) {
        toast.success('Profile picture updated successfully!');
        // Update profile state with new avatar
        setProfile(prev => ({ ...prev, avatarUrl: currentUser.avatarUrl }));
      } else {
        toast.error(result.error || 'Failed to upload image');
        setAvatarPreview(null);
      }
    } catch (error) {
      toast.error('Failed to upload image');
      setAvatarPreview(null);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const onSubmit = async (data) => {
    const result = await updateProfile(data);
    if (result.success) {
      toast.success('Profile updated successfully!');
      setIsEditing(false);
      // Update local profile state
      setProfile(prev => ({ ...prev, ...data }));
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <MainLayout user={currentUser} theme={theme} onThemeToggle={toggleTheme}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading profile...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!profile) {
    return (
      <MainLayout user={currentUser} theme={theme} onThemeToggle={toggleTheme}>
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 mb-4">Profile not found</p>
            <button onClick={() => navigate('/chat')} className="btn btn-primary">
              Go to Chat
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout user={currentUser} theme={theme} onThemeToggle={toggleTheme}>
      <div className="max-w-2xl mx-auto">
        {/* Back to Chat Button */}
        <div className="mb-4">
          <button
            onClick={() => navigate('/chat')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Chat
          </button>
        </div>

        <div className="card p-8">
          {/* Profile Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <img
                src={avatarPreview || profile.avatarUrl || 'https://via.placeholder.com/128'}
                alt={profile.name}
                className="w-32 h-32 rounded-full border-4 border-primary-200 dark:border-primary-800 object-cover"
              />
              {isOwnProfile && (
                <label className="absolute bottom-0 right-0 p-2 bg-primary-600 rounded-full cursor-pointer hover:bg-primary-700 transition shadow-lg">
                  {isUploadingAvatar ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <h1 className="text-3xl font-bold mt-4">{profile.name}</h1>
            <p className="text-gray-500 dark:text-gray-400">@{profile.username}</p>

            <div className="flex gap-4 mt-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-800 rounded-lg">
                <span className="text-lg">{profile.isOnline ? '🟢' : '🔘'}</span>
                <span className="text-sm font-medium">
                  {profile.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
          </div>

          {isEditing && isOwnProfile ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                  Name
                </label>
                <input
                  {...register('name')}
                  type="text"
                  id="name"
                  className="input"
                  placeholder="Your full name"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label htmlFor="username" className="block text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  {...register('username')}
                  type="text"
                  id="username"
                  className="input"
                  placeholder="username"
                />
                {errors.username && <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>}
              </div>

              <div>
                <label htmlFor="bio" className="block text-sm font-medium mb-2">
                  Bio
                </label>
                <textarea
                  {...register('bio')}
                  id="bio"
                  rows="4"
                  className="input"
                  placeholder="Tell us about yourself..."
                />
                {errors.bio && <p className="text-red-500 text-sm mt-1">{errors.bio.message}</p>}
              </div>

              <div className="flex gap-3">
                <button type="submit" disabled={isSubmitting} className="btn btn-primary flex-1">
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset({
                      name: profile.name,
                      username: profile.username,
                      bio: profile.bio,
                    });
                  }}
                  className="btn btn-secondary flex-1"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="bg-gray-50 dark:bg-dark-800 rounded-lg p-4 mb-6">
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  {profile.bio || 'No bio yet. Add one to tell others about yourself!'}
                </p>
              </div>

              <div className="flex gap-3">
                {isOwnProfile ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-primary flex-1"
                    >
                      Edit Profile
                    </button>
                    <button
                      onClick={() => navigate('/chat')}
                      className="btn btn-secondary flex-1"
                    >
                      Go to Chat
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => navigate('/chat')}
                    className="btn btn-primary w-full"
                  >
                    Start Chat
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default ProfilePage;
