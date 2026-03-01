import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AddTransaction from './pages/AddTransaction';
import EmergencyFund from './pages/EmergencyFund';
import Chatbot from './pages/Chatbot';
import Settings from './pages/Settings';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Layout wrapper to conditionally show Navbar
function Layout({ children }) {
  const location = useLocation();
  const publicRoutes = ['/login', '/register', '/'];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <>
      {!isPublicRoute && <Navbar />}
      {children}
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <Layout>
              <Routes>
                {/* Landing Page */}
                <Route path="/" element={<Landing />} />
                
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/add-transaction"
                  element={
                    <ProtectedRoute>
                      <AddTransaction />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/emergency-fund"
                  element={
                    <ProtectedRoute>
                      <EmergencyFund />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/chatbot"
                  element={
                    <ProtectedRoute>
                      <Chatbot />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <Settings />
                    </ProtectedRoute>
                  }
                />

                {/* 404 Fallback */}
                <Route 
                  path="*" 
                  element={
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      minHeight: '100vh',
                      backgroundColor: '#0A0F1E',
                      color: '#F9FAFB',
                      padding: '2rem',
                      textAlign: 'center',
                    }}>
                      <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: '5rem', marginBottom: '1rem' }}>404</h1>
                      <p style={{ fontFamily: "'Outfit', sans-serif", color: '#6B7280', marginBottom: '2rem' }}>Page not found</p>
                      <button
                        onClick={() => window.location.href = '/'}
                        style={{
                          backgroundColor: '#00D4FF',
                          color: '#0A0F1E',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '0.75rem',
                          border: 'none',
                          fontFamily: "'Outfit', sans-serif",
                          fontWeight: '600',
                          cursor: 'pointer',
                        }}
                      >
                        Back to Home
                      </button>
                    </div>
                  } 
                />
              </Routes>
            </Layout>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
