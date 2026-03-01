import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, TrendingUp, Wallet, Bot, Mail, Lock, User, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { register } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [monthlyAllowance, setMonthlyAllowance] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [fadeIn, setFadeIn] = useState(false);

  const navigate = useNavigate();
  const { login: authLogin } = useAuth();

  useEffect(() => {
    setFadeIn(true);
  }, []);

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: '', color: '#374151' };
    
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z0-9]/.test(password)) strength += 10;

    if (strength < 40) return { strength, label: 'Weak', color: '#EF4444' };
    if (strength < 70) return { strength, label: 'Fair', color: '#F59E0B' };
    return { strength, label: 'Strong', color: '#10B981' };
  };

  const passwordStrength = getPasswordStrength();

  const validateForm = () => {
    if (!name || !email || !password || !monthlyAllowance) {
      setError('Please fill in all fields');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    const allowance = parseFloat(monthlyAllowance);
    if (isNaN(allowance) || allowance <= 0) {
      setError('Please enter a valid monthly allowance');
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
      const response = await register(name, email, password, parseFloat(monthlyAllowance));
      authLogin(response.access_token, response.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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
    overflowY: 'auto',
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

  const helperTextStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    color: '#6B7280',
    marginTop: '0.25rem',
    fontStyle: 'italic',
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

  const passwordStrengthContainerStyle = {
    marginTop: '0.5rem',
  };

  const strengthBarBgStyle = {
    width: '100%',
    height: '4px',
    backgroundColor: '#374151',
    borderRadius: '2px',
    overflow: 'hidden',
  };

  const strengthBarFillStyle = {
    height: '100%',
    width: `${passwordStrength.strength}%`,
    backgroundColor: passwordStrength.color,
    transition: 'all 0.3s ease',
  };

  const strengthLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginTop: '0.25rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    color: passwordStrength.color,
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

        {/* Right Panel - Register Form */}
        <div className="right-panel" style={rightPanelStyle}>
          <div style={formContainerStyle}>
            <h1 style={headingStyle}>Create Account</h1>
            <p style={subheadingStyle}>Start building your financial safety net today</p>

            {error && (
              <div style={errorBannerStyle}>
                <AlertCircle size={20} color="#EF4444" />
                <span style={errorTextStyle}>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Full Name</label>
                <div style={inputWrapperStyle}>
                  <User size={18} style={inputIconStyle} />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    style={inputStyle}
                    disabled={isLoading}
                  />
                </div>
              </div>

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
                {password && (
                  <div style={passwordStrengthContainerStyle}>
                    <div style={strengthBarBgStyle}>
                      <div style={strengthBarFillStyle}></div>
                    </div>
                    <div style={strengthLabelStyle}>
                      {passwordStrength.strength >= 70 && <CheckCircle size={12} />}
                      <span>Password strength: {passwordStrength.label}</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Monthly Allowance</label>
                <div style={inputWrapperStyle}>
                  <DollarSign size={18} style={inputIconStyle} />
                  <input
                    type="number"
                    value={monthlyAllowance}
                    onChange={(e) => setMonthlyAllowance(e.target.value)}
                    placeholder="5000"
                    style={inputStyle}
                    disabled={isLoading}
                    min="0"
                    step="0.01"
                  />
                </div>
                <p style={helperTextStyle}>
                  We use this to calculate your savings goals and spending limits
                </p>
              </div>

              <button type="submit" style={buttonStyle} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="#0A0F1E" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div style={linkContainerStyle}>
              Already have an account?
              <Link to="/login" style={linkStyle}>
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
