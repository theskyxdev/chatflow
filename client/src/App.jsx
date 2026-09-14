import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import useAuthStore from './store/useAuthStore';
import useThemeStore from './store/useThemeStore';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';
import ChatPage from './pages/Chat/ChatPage';
import ProfilePage from './pages/Profile/ProfilePage';
import SettingsPage from './pages/Settings/SettingsPage';

function App() {
  const { getCurrentUser, isAuthenticated } = useAuthStore();
  const { theme } = useThemeStore();

  useEffect(() => {
    // Initialize auth on app load
    getCurrentUser();
  }, [getCurrentUser]);

  return (
    <Router>
      <Toaster 
        position="top-right"
        theme={theme}
        richColors
      />
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={isAuthenticated ? <Navigate to="/chat" /> : <LoginPage />} 
        />
        <Route 
          path="/register" 
          element={isAuthenticated ? <Navigate to="/chat" /> : <RegisterPage />} 
        />
        <Route 
          path="/forgot-password" 
          element={<ForgotPasswordPage />} 
        />
        <Route 
          path="/reset-password/:token" 
          element={<ResetPasswordPage />} 
        />

        {/* Protected routes */}
        <Route 
          path="/chat" 
          element={<ProtectedRoute component={ChatPage} />} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute component={ProfilePage} />} 
        />
        <Route 
          path="/profile/:userId" 
          element={<ProtectedRoute component={ProfilePage} />} 
        />
        <Route 
          path="/settings" 
          element={<ProtectedRoute component={SettingsPage} />} 
        />

        {/* Redirect to chat by default */}
        <Route 
          path="/" 
          element={isAuthenticated ? <Navigate to="/chat" /> : <Navigate to="/login" />} 
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
