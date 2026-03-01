import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, LayoutDashboard, ArrowLeftRight, Wallet, MessageCircle, Menu, X, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

/**
 * Navbar - Fixed top navigation with logo, links, and user menu
 */
const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/add-transaction', label: 'Transactions', icon: ArrowLeftRight },
    { path: '/emergency-fund', label: 'Emergency Fund', icon: Wallet },
    { path: '/chatbot', label: 'Chatbot', icon: MessageCircle },
    { path: '/settings', label: 'Settings', icon: SettingsIcon },
  ];

  const navbarStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#111827',
    borderBottom: '1px solid #374151',
    zIndex: 1000,
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: '64px',
  };

  const logoStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.25rem',
    color: '#F9FAFB',
    textDecoration: 'none',
    cursor: 'pointer',
  };

  const navLinksContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '2rem',
  };

  const navLinkStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '500',
    color: isActive ? '#00D4FF' : '#9CA3AF',
    textDecoration: 'none',
    padding: '0.5rem 0',
    borderBottom: isActive ? '2px solid #00D4FF' : '2px solid transparent',
    transition: 'all 0.2s ease',
    cursor: 'pointer',
  });

  const userMenuContainerStyle = {
    position: 'relative',
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    backgroundColor: '#00D4FF',
    color: '#0A0F1E',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    border: '2px solid #374151',
    transition: 'all 0.2s ease',
  };

  const dropdownStyle = {
    position: 'absolute',
    top: '48px',
    right: 0,
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    minWidth: '200px',
    padding: '0.5rem',
    display: isUserMenuOpen ? 'block' : 'none',
  };

  const dropdownItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    padding: '0.75rem 1rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#F9FAFB',
    cursor: 'pointer',
    borderRadius: '0.5rem',
    transition: 'background-color 0.2s ease',
    backgroundColor: 'transparent',
    border: 'none',
    width: '100%',
    textAlign: 'left',
  };

  const mobileMenuButtonStyle = {
    display: 'none',
    backgroundColor: 'transparent',
    border: 'none',
    color: '#F9FAFB',
    cursor: 'pointer',
    padding: '0.5rem',
  };

  const mobileMenuStyle = {
    position: 'fixed',
    top: '64px',
    left: 0,
    right: 0,
    backgroundColor: '#111827',
    borderBottom: '1px solid #374151',
    padding: '1rem',
    display: isMobileMenuOpen ? 'flex' : 'none',
    flexDirection: 'column',
    gap: '0.5rem',
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <>
      <style>
        {`
          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }
            .mobile-menu-button {
              display: block !important;
            }
          }
          .dropdown-item:hover {
            background-color: #374151 !important;
          }
          .nav-link:hover {
            color: #00D4FF !important;
          }
        `}
      </style>
      <nav style={navbarStyle}>
        <div style={containerStyle}>
          <Link to="/dashboard" style={logoStyle}>
            <Shield size={24} color="#00D4FF" />
            <span>Buffer</span>
          </Link>

          <div className="desktop-nav" style={navLinksContainerStyle}>
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="nav-link"
                  style={navLinkStyle(isActive)}
                >
                  <Icon size={16} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={userMenuContainerStyle}>
              <div
                style={avatarStyle}
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#00D4FF'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#374151'}
              >
                {getUserInitials()}
              </div>
              <div style={dropdownStyle}>
                <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #374151', marginBottom: '0.5rem' }}>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.875rem', fontWeight: '600', color: '#F9FAFB' }}>
                    {user?.name || 'User'}
                  </div>
                  <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', color: '#6B7280' }}>
                    {user?.email || 'user@example.com'}
                  </div>
                </div>
                <button
                  className="dropdown-item"
                  style={dropdownItemStyle}
                  onClick={handleLogout}
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            </div>

            <button
              className="mobile-menu-button"
              style={mobileMenuButtonStyle}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <div style={mobileMenuStyle}>
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                style={{
                  ...navLinkStyle(isActive),
                  padding: '0.75rem 1rem',
                  borderBottom: 'none',
                  borderLeft: isActive ? '3px solid #00D4FF' : '3px solid transparent',
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Icon size={16} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
      <div style={{ height: '64px' }}></div>
    </>
  );
};

export default Navbar;
