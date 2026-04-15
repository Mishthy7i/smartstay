import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Home from './pages/Home';
import Logout from './pages/Logout';
import StudentOnboarding from './pages/StudentOnboarding';
import LandlordOnboarding from './pages/LandlordOnboarding';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { user, loading } = useAuth();

  // Public route that redirects to home if already authenticated and onboarded
  const PublicRoute = ({ children }) => {
    if (loading) {
      return null;
    }
    if (user) {
      // If user is not onboarded, redirect to onboarding
      if (!user.is_onboarded) {
        const onboardingPath = user.role === 'landlord' ? '/onboarding/landlord' : '/onboarding/student';
        return <Navigate to={onboardingPath} replace />;
      }
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  // Onboarding route - requires auth but not onboarding completion
  const OnboardingRoute = ({ children }) => {
    if (loading) {
      return null;
    }
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    // Allow landlords to access onboarding even if already onboarded (for adding new properties)
    // Students who are already onboarded should go to home
    if (user.is_onboarded && user.role === 'student') {
      return <Navigate to="/home" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/onboarding/student"
        element={
          <OnboardingRoute>
            <StudentOnboarding />
          </OnboardingRoute>
        }
      />
      <Route
        path="/onboarding/landlord"
        element={
          <OnboardingRoute>
            <LandlordOnboarding />
          </OnboardingRoute>
        }
      />
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/logout"
        element={<Logout />}
      />
      <Route path="/" element={<Landing />} />
    </Routes>
  );
}

export default App;
