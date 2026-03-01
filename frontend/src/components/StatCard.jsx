import { useState } from 'react';

/**
 * StatCard - Display key statistics with icon and accent color
 * @param {string} title - Card title/label
 * @param {string|number} value - Main statistic value
 * @param {string} subtitle - Additional context text
 * @param {React.Component} icon - Lucide icon component
 * @param {string} accentColor - Hex color for border glow
 * @param {boolean} isLoading - Show loading skeleton
 */
const StatCard = ({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  accentColor = '#00D4FF',
  isLoading = false 
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const cardStyle = {
    backgroundColor: '#1F2937',
    border: `1px solid ${isHovered ? accentColor : '#374151'}`,
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: isHovered 
      ? `0 4px 24px rgba(0,0,0,0.4), 0 0 20px ${accentColor}40`
      : '0 4px 24px rgba(0,0,0,0.4)',
    transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    position: 'relative',
    overflow: 'hidden',
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '1rem',
  };

  const titleStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    fontWeight: '500',
  };

  const iconContainerStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '0.5rem',
    backgroundColor: `${accentColor}20`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const valueStyle = {
    fontFamily: "'Space Mono', monospace",
    fontSize: '2rem',
    fontWeight: '700',
    color: '#F9FAFB',
    marginBottom: '0.5rem',
    letterSpacing: '-0.025em',
  };

  const subtitleStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#9CA3AF',
  };

  const skeletonStyle = {
    background: 'linear-gradient(90deg, #374151 25%, #4B5563 50%, #374151 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 1.5s infinite',
    borderRadius: '0.5rem',
  };

  if (isLoading) {
    return (
      <div style={cardStyle}>
        <style>
          {`
            @keyframes shimmer {
              0% { background-position: 200% 0; }
              100% { background-position: -200% 0; }
            }
          `}
        </style>
        <div style={headerStyle}>
          <div style={{ ...skeletonStyle, width: '100px', height: '14px' }}></div>
          <div style={{ ...skeletonStyle, width: '40px', height: '40px', borderRadius: '0.5rem' }}></div>
        </div>
        <div style={{ ...skeletonStyle, width: '150px', height: '32px', marginBottom: '0.5rem' }}></div>
        <div style={{ ...skeletonStyle, width: '120px', height: '14px' }}></div>
      </div>
    );
  }

  return (
    <div 
      style={cardStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={headerStyle}>
        <div style={titleStyle}>{title}</div>
        {Icon && (
          <div style={iconContainerStyle}>
            <Icon size={20} color={accentColor} />
          </div>
        )}
      </div>
      <div style={valueStyle}>{value}</div>
      {subtitle && <div style={subtitleStyle}>{subtitle}</div>}
    </div>
  );
};

export default StatCard;
