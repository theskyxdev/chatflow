import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import useAuthStore from '../../store/useAuthStore';
import useThemeStore from '../../store/useThemeStore';
import MainLayout from '../../components/layout/MainLayout';
import { changePasswordSchema } from '../../utils/validation';

function SettingsPage() {
  const { user, changePassword, logout } = useAuthStore();
  const { theme, toggleTheme, soundEnabled, toggleSound, notificationsEnabled, toggleNotifications } = useThemeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
  });

  const onSubmitPassword = async (data) => {
    setIsSubmitting(true);
    const result = await changePassword({
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    });

    if (result.success) {
      toast.success('Password changed successfully');
      reset();
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    if (confirm('Are you sure you want to logout?')) {
      await logout();
      toast.success('Logged out successfully');
    }
  };

  return (
    <MainLayout user={user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Appearance Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Appearance</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
              <div>
                <p className="font-medium">Dark mode</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {theme === 'dark' ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <button
                onClick={toggleTheme}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  theme === 'dark' ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Notifications</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
              <div>
                <p className="font-medium">Sound notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {soundEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <button
                onClick={toggleSound}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  soundEnabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    soundEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-800 rounded-lg">
              <div>
                <p className="font-medium">Push notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {notificationsEnabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
              <button
                onClick={toggleNotifications}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  notificationsEnabled ? 'bg-primary-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Security</h2>
          
          <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                Current password
              </label>
              <input
                {...register('currentPassword')}
                type="password"
                id="currentPassword"
                className="input"
                placeholder="Enter current password"
              />
              {errors.currentPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.currentPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
                New password
              </label>
              <input
                {...register('newPassword')}
                type="password"
                id="newPassword"
                className="input"
                placeholder="Enter new password"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.newPassword.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm password
              </label>
              <input
                {...register('confirmPassword')}
                type="password"
                id="confirmPassword"
                className="input"
                placeholder="Confirm new password"
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full"
            >
              {isSubmitting ? 'Updating...' : 'Update password'}
            </button>
          </form>
        </div>

        {/* Account Settings */}
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Account</h2>
          
          <div className="space-y-3">
            <button
              onClick={handleLogout}
              className="w-full btn bg-red-600 hover:bg-red-700 text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default SettingsPage;
