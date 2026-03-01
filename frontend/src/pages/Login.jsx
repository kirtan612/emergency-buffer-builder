import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, TrendingUp, Wallet, Bot, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { login } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await login(email, password);
      authLogin(response.access_token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    backgroundColor: '#0A0F1E',
    opacity: fadeIn ? 1 : 0,
    transform: fadeIn ? 'translateY(0)' : 'translateY(20px)',
    transition: 'all 0.6s ease-out',
  };

  const leftPanelStyle = {
    flex: '0 0 40%',
    background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
    padding: '4rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  };

  const dotPatternStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: 'radial-gradient(circle, #374151 1px, transparent 1px)',
    backgroundSize: '30px 30px',
    opacity: 0.3,
    animation: 'float 20s ease-in-out infinite',
  };

  const logoContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '2rem',
    position: 'relative',
    zIndex: 1,
  };

  const logoStyle = {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '2rem',
    color: '#F9FAFB',
  };

  const taglineStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.125rem',
    color: '#9CA3AF',
    marginBottom: '3rem',
    position: 'relative',
    zIndex: 1,
  };

  const featureStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
    marginBottom: '1.5rem',
    position: 'relative',
    zIndex: 1,
  };

  const featureIconStyle = {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const featureTitleStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1rem',
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: '0.25rem',
  };

  const featureDescStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#6B7280',
    lineHeight: '1.5',
  };

  const rightPanelStyle = {
    flex: '0 0 60%',
    padding: '4rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const formContainerStyle = {
    width: '100%',
    maxWidth: '440px',
  };

  const headingStyle = {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '2.5rem',
    color: '#F9FAFB',
    marginBottom: '0.5rem',
  };

  const subheadingStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1rem',
    color: '#9CA3AF',
    marginBottom: '2rem',
  };

  const errorBannerStyle = {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '0.75rem',
    padding: '1rem',
    marginBottom: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    animation: 'shake 0.5s ease-in-out',
  };

  const errorTextStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#EF4444',
  };

  const inputGroupStyle = {
    marginBottom: '1.5rem',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: '0.5rem',
  };

  const inputWrapperStyle = {
    position: 'relative',
  };

  const inputIconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6B7280',
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem 0.875rem 3rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#F9FAFB',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const checkboxContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '1.5rem',
  };

  const checkboxStyle = {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
    accentColor: '#00D4FF',
  };

  const checkboxLabelStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#9CA3AF',
    cursor: 'pointer',
  };

  const buttonStyle = {
    width: '100%',
    background: 'linear-gradient(135deg, #00D4FF 0%, #00B8E0 100%)',
    color: '#0A0F1E',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1rem',
    fontWeight: '600',
    padding: '1rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: isLoading ? 0.7 : 1,
  };

  const linkContainerStyle = {
    textAlign: 'center',
    marginTop: '1.5rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#9CA3AF',
  };

  const linkStyle = {
    color: '#00D4FF',
    textDecoration: 'none',
    fontWeight: '600',
    marginLeft: '0.25rem',
  };

  const features = [
    {
      icon: Wallet,
      title: 'Emergency Fund Builder',
      description: 'Build your financial safety net with smart savings goals',
    },
    {
      icon: TrendingUp,
      title: 'Spending Tracker',
      description: 'Track every rupee and understand your spending patterns',
    },
    {
      icon: Bot,
      title: 'AI Financial Advisor',
      description: 'Get personalized advice to improve your financial health',
    },
  ];

  return (
    <>
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-10px); }
            75% { transform: translateX(10px); }
          }
          input:focus {
            border-color: #00D4FF !important;
            box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1) !important;
          }
          button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.5) !important;
          }
          a:hover {
            color: #00B8E0 !important;
          }
          @media (max-width: 968px) {
            .left-panel {
              display: none !important;
            }
            .right-panel {
              flex: 1 !important;
            }
          }
        `}
      </style>
      <div style={containerStyle}>
        {/* Left Panel - Decorative */}
        <div className="left-panel" style={leftPanelStyle}>
          <div style={dotPatternStyle}></div>
          
          <div style={logoContainerStyle}>
            <Shield size={40} color="#00D4FF" />
            <span style={logoStyle}>Buffer</span>
          </div>

          <p style={taglineStyle}>Your Financial Safety Net</p>

          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} style={featureStyle}>
                <div style={featureIconStyle}>
                  <Icon size={24} color="#00D4FF" />
                </div>
                <div>
                  <div style={featureTitleStyle}>{feature.title}</div>
                  <div style={featureDescStyle}>{feature.description}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Panel - Login Form */}
        <div className="right-panel" style={rightPanelStyle}>
          <div style={formContainerStyle}>
            <h1 style={headingStyle}>Welcome Back</h1>
            <p style={subheadingStyle}>Sign in to access your financial dashboard</p>

            {error && (
              <div style={errorBannerStyle}>
                <AlertCircle size={20} color="#EF4444" />
                <span style={errorTextStyle}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Email Address</label>
                <div style={inputWrapperStyle}>
                  <Mail size={18} style={inputIconStyle} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    style={inputStyle}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Password</label>
                <div style={inputWrapperStyle}>
                  <Lock size={18} style={inputIconStyle} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    style={inputStyle}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  id="remember"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={checkboxStyle}
                  disabled={isLoading}
                />
                <label htmlFor="remember" style={checkboxLabelStyle}>
                  Remember me
                </label>
              </div>

              <button type="submit" style={buttonStyle} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="#0A0F1E" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div style={linkContainerStyle}>
              Don't have an account?
              <Link to="/register" style={linkStyle}>
                Create one now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
