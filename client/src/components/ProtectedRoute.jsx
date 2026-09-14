import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';

function ProtectedRoute({ component: Component }) {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Component />;
}

export default ProtectedRoute;
