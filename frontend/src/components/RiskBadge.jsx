import { CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';

/**
 * RiskBadge - Display risk level with color-coded badge and pulsing animation
 * @param {string} level - Risk level: "safe" | "warning" | "critical"
 */
const RiskBadge = ({ level = 'safe' }) => {
  const normalizedLevel = level.toLowerCase();

  const configs = {
    safe: {
      color: '#10B981',
      bgColor: 'rgba(16, 185, 129, 0.15)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      label: 'Safe',
      icon: CheckCircle,
      pulse: false,
    },
    warning: {
      color: '#F59E0B',
      bgColor: 'rgba(245, 158, 11, 0.15)',
      borderColor: 'rgba(245, 158, 11, 0.3)',
      label: 'Warning',
      icon: AlertTriangle,
      pulse: false,
    },
    critical: {
      color: '#EF4444',
      bgColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: 'rgba(239, 68, 68, 0.3)',
      label: 'Critical',
      icon: AlertCircle,
      pulse: true,
    },
  };

  const config = configs[normalizedLevel] || configs.safe;
  const Icon = config.icon;

  const badgeStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    borderRadius: '9999px',
    backgroundColor: config.bgColor,
    border: `1px solid ${config.borderColor}`,
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '600',
    color: config.color,
    position: 'relative',
  };

  const dotStyle = {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: config.color,
    animation: config.pulse ? 'pulse-dot 2s ease-in-out infinite' : 'none',
  };

  return (
    <>
      <style>
        {`
          @keyframes pulse-dot {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.5;
              transform: scale(1.2);
            }
          }
        `}
      </style>
      <div style={badgeStyle}>
        <div style={dotStyle}></div>
        <Icon size={16} />
        <span>{config.label}</span>
      </div>
    </>
  );
};

export default RiskBadge;
