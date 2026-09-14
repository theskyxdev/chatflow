import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import useAuthStore from '../../store/useAuthStore';
import { registerSchema } from '../../utils/validation';

function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data) => {
    const result = await registerUser(data);
    if (result.success) {
      toast.success('Account created successfully');
      navigate('/chat');
    } else {
      toast.error(result.error);
    }
  };

  const handleOAuth = (provider) => {
    setIsOAuthLoading(true);
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 dark:from-dark-950 dark:to-dark-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">ChatFlow</h1>
          <p className="text-gray-600 dark:text-gray-400">Join our community</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create account</h2>

          {/* Register form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Full Name
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                className="input"
                placeholder="Enter full name"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
              )}
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
                placeholder="Enter username"
              />
              {errors.username && (
                <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                id="email"
                className="input"
                placeholder="Enter email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                id="password"
                className="input"
                placeholder="Enter password (min 8 characters)"
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
              )}
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Must contain uppercase, lowercase, and a number
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary w-full"
            >
              {isLoading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-dark-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-dark-900 text-gray-500">Or sign up with</span>
            </div>
          </div>

          {/* OAuth buttons */}
          <div className="space-y-2">
            <button
              onClick={() => handleOAuth('google')}
              disabled={isOAuthLoading || isLoading}
              className="btn btn-secondary w-full"
            >
              Google
            </button>
            <button
              onClick={() => handleOAuth('github')}
              disabled={isOAuthLoading || isLoading}
              className="btn btn-secondary w-full"
            >
              GitHub
            </button>
          </div>

          {/* Login link */}
          <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
