import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import api from '../../config/api';
import { resetPasswordSchema } from '../../utils/validation';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post(`/auth/reset-password/${token}`, {
        password: data.password,
      });
      toast.success('Password reset successfully');
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to reset password';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-950 dark:to-dark-900 p-4">
        <div className="w-full max-w-md">
          <div className="card p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-600">Invalid reset link</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              The password reset link is invalid or has expired.
            </p>
            <Link to="/forgot-password" className="btn btn-primary w-full">
              Request new link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-950 dark:to-dark-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">ChatFlow</h1>
          <p className="text-gray-600 dark:text-gray-400">Create a new password</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Reset password</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                New Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="input"
                placeholder="Enter new password"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must contain uppercase, lowercase, and a number
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
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
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Resetting...' : 'Reset password'}
            </button>
          </form>

          {/* Back to login link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
