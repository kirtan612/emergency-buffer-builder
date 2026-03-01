/**
 * EmptyState - Centered empty state with illustration and call-to-action
 * @param {React.Component} icon - Lucide icon component
 * @param {string} title - Empty state title
 * @param {string} message - Empty state description
 * @param {string} actionLabel - CTA button label
 * @param {function} onAction - CTA button click handler
 */
const EmptyState = ({ 
  icon: Icon, 
  title, 
  message, 
  actionLabel, 
  onAction 
}) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4rem 2rem',
    textAlign: 'center',
  };

  const dashedBoxStyle = {
    border: '2px dashed #374151',
    borderRadius: '1rem',
    padding: '3rem 2rem',
    maxWidth: '500px',
    width: '100%',
    backgroundColor: 'rgba(31, 41, 55, 0.3)',
  };

  const iconContainerStyle = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 1.5rem',
  };

  const titleStyle = {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.5rem',
    color: '#F9FAFB',
    marginBottom: '0.75rem',
  };

  const messageStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#9CA3AF',
    lineHeight: '1.6',
    marginBottom: '2rem',
  };

  const buttonStyle = {
    backgroundColor: '#00D4FF',
    color: '#0A0F1E',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '600',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.75rem',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
  };

  return (
    <div style={containerStyle}>
      <div style={dashedBoxStyle}>
        {Icon && (
          <div style={iconContainerStyle}>
            <Icon size={40} color="#00D4FF" strokeWidth={1.5} />
          </div>
        )}
        <h3 style={titleStyle}>{title}</h3>
        <p style={messageStyle}>{message}</p>
        {actionLabel && onAction && (
          <button
            style={buttonStyle}
            onClick={onAction}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#00B8E0';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#00D4FF';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
};

export default EmptyState;
