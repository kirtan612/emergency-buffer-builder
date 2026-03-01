/**
 * LoadingSpinner - Elegant rotating ring spinner
 * @param {string} size - Spinner size: "sm" | "md" | "lg"
 * @param {string} color - Spinner color (default: #00D4FF)
 */
const LoadingSpinner = ({ size = 'md', color = '#00D4FF' }) => {
  const sizes = {
    sm: { width: '24px', height: '24px', borderWidth: '3px' },
    md: { width: '40px', height: '40px', borderWidth: '4px' },
    lg: { width: '64px', height: '64px', borderWidth: '5px' },
  };

  const spinnerSize = sizes[size] || sizes.md;

  const spinnerStyle = {
    width: spinnerSize.width,
    height: spinnerSize.height,
    border: `${spinnerSize.borderWidth} solid #374151`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  };

  return (
    <>
      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>
      <div style={spinnerStyle}></div>
    </>
  );
};

export default LoadingSpinner;
