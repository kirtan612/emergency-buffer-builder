import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Save,
  AlertTriangle,
  CheckCircle,
  Utensils,
  Bus,
  BookOpen,
  Gamepad2,
  Heart,
  ShoppingBag,
  Home,
  Lightbulb,
  Smartphone,
  Briefcase,
  Calendar,
  DollarSign,
  TrendingDown,
  ArrowRight,
} from 'lucide-react';
import { getDashboardInsights, addTransaction, getTransactions } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const AddTransaction = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Form state
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Fetch dashboard data for impact preview
  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardInsights,
  });

  // Fetch recent transactions for quick-add
  const { data: recentTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => getTransactions(3),
  });

  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: addTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries(['dashboard']);
      queryClient.invalidateQueries(['transactions']);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    },
  });

  const categories = [
    { value: 'food', label: 'Food & Dining', icon: Utensils },
    { value: 'transport', label: 'Transport', icon: Bus },
    { value: 'education', label: 'Education', icon: BookOpen },
    { value: 'entertainment', label: 'Entertainment', icon: Gamepad2 },
    { value: 'healthcare', label: 'Healthcare', icon: Heart },
    { value: 'shopping', label: 'Shopping', icon: ShoppingBag },
    { value: 'housing', label: 'Housing', icon: Home },
    { value: 'utilities', label: 'Utilities', icon: Lightbulb },
    { value: 'subscriptions', label: 'Subscriptions', icon: Smartphone },
    { value: 'other', label: 'Other', icon: Briefcase },
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!amount || parseFloat(amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!category) {
      newErrors.category = 'Please select a category';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await addTransactionMutation.mutateAsync({
        amount: -Math.abs(parseFloat(amount)), // Negative for expense
        category,
        description: description || `${category} expense`,
        date: new Date(date).toISOString(),
      });
    } catch (error) {
      setErrors({ submit: error.message || 'Failed to add transaction' });
    }
  };

  const handleQuickAdd = (transaction) => {
    setCategory(transaction.category);
    setDescription(transaction.description);
    setAmount(Math.abs(transaction.amount).toString());
  };

  const handleAddAnother = () => {
    setAmount('');
    setCategory('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowSuccess(false);
    setErrors({});
  };

  // Smart suggestions
  const getSmartSuggestions = () => {
    const suggestions = [];
    const amountValue = parseFloat(amount);

    if (amountValue && dashboardData?.avg_daily_spending) {
      if (amountValue > dashboardData.avg_daily_spending * 1.5) {
        suggestions.push({
          type: 'warning',
          message: 'This is above your daily average',
          icon: AlertTriangle,
          color: '#F59E0B',
        });
      }
    }

    if (category === 'entertainment' && amountValue > 500) {
      suggestions.push({
        type: 'tip',
        message: 'Consider if this aligns with your goals',
        icon: AlertTriangle,
        color: '#F59E0B',
      });
    }

    return suggestions;
  };

  // Calculate impact preview
  const calculateImpact = () => {
    if (!amount || !dashboardData) return null;

    const amountValue = parseFloat(amount);
    const newBalance = (dashboardData.emergency_fund || 0) - amountValue;
    const newSurvivalDays = Math.floor(
      newBalance / (dashboardData.avg_daily_spending || 1)
    );

    const impactColor =
      newSurvivalDays >= 20 ? '#10B981' : newSurvivalDays >= 10 ? '#F59E0B' : '#EF4444';

    return {
      survivalDays: newSurvivalDays,
      color: impactColor,
      change: (dashboardData.survival_days || 0) - newSurvivalDays,
    };
  };

  const suggestions = getSmartSuggestions();
  const impact = calculateImpact();
  const selectedCategory = categories.find((c) => c.value === category);

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#0A0F1E',
    paddingBottom: '4rem',
  };

  const containerStyle = {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  };

  const headerStyle = {
    marginBottom: '2rem',
  };

  const titleStyle = {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '2.5rem',
    color: '#F9FAFB',
    marginBottom: '0.5rem',
  };

  const subtitleStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1rem',
    color: '#6B7280',
  };

  const cardStyle = {
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '1rem',
    padding: '2rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    marginBottom: '1.5rem',
  };

  const formGroupStyle = {
    marginBottom: '1.5rem',
  };

  const labelStyle = {
    display: 'block',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: '0.5rem',
  };

  const amountInputStyle = {
    width: '100%',
    backgroundColor: '#111827',
    border: errors.amount ? '2px solid #EF4444' : '2px solid #00D4FF',
    borderRadius: '0.75rem',
    padding: '1rem 1rem 1rem 3rem',
    fontFamily: "'Space Mono', monospace",
    fontSize: '2rem',
    fontWeight: '700',
    color: '#F9FAFB',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const inputIconStyle = {
    position: 'absolute',
    left: '1rem',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#00D4FF',
  };

  const inputStyle = {
    width: '100%',
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#F9FAFB',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const categoryGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '0.75rem',
  };

  const categoryButtonStyle = (isSelected) => ({
    backgroundColor: isSelected ? 'rgba(0, 212, 255, 0.1)' : '#111827',
    border: isSelected ? '2px solid #00D4FF' : '1px solid #374151',
    borderRadius: '0.75rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    fontWeight: '500',
    color: isSelected ? '#00D4FF' : '#9CA3AF',
  });

  const errorStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    color: '#EF4444',
    marginTop: '0.25rem',
  };

  const suggestionStyle = (color) => ({
    backgroundColor: `${color}20`,
    border: `1px solid ${color}40`,
    borderRadius: '0.75rem',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  });

  const suggestionTextStyle = (color) => ({
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: color,
    flex: 1,
  });

  const impactPreviewStyle = (color) => ({
    backgroundColor: `${color}20`,
    border: `1px solid ${color}40`,
    borderRadius: '0.75rem',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  });

  const impactLabelStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#9CA3AF',
  };

  const impactValueStyle = (color) => ({
    fontFamily: "'Space Mono', monospace",
    fontSize: '1.5rem',
    fontWeight: '700',
    color: color,
  });

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
    cursor: addTransactionMutation.isPending ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    opacity: addTransactionMutation.isPending ? 0.7 : 1,
  };

  const successToastStyle = {
    position: 'fixed',
    top: '5rem',
    right: '1.5rem',
    backgroundColor: '#1F2937',
    border: '1px solid #10B981',
    borderRadius: '0.75rem',
    padding: '1.25rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    minWidth: '320px',
    animation: 'slideInRight 0.3s ease-out',
    zIndex: 1000,
  };

  const quickAddChipStyle = {
    backgroundColor: '#111827',
    border: '1px solid #374151',
    borderRadius: '9999px',
    padding: '0.5rem 1rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    color: '#9CA3AF',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
  };

  return (
    <>
      <style>
        {`
          @keyframes slideInRight {
            from {
              opacity: 0;
              transform: translateX(100px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          input:focus, textarea:focus {
            border-color: #00D4FF !important;
            box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1) !important;
          }
          .category-button:hover {
            border-color: #00D4FF !important;
            transform: translateY(-2px);
          }
          .quick-add-chip:hover {
            border-color: #00D4FF !important;
            color: #00D4FF !important;
          }
          button:hover:not(:disabled) {
            transform: translateY(-2px);
            box-shadow: 0 0 30px rgba(0, 212, 255, 0.5) !important;
          }
        `}
      </style>
      <div style={pageStyle}>
        <div style={containerStyle}>
          {/* Header */}
          <div style={headerStyle}>
            <h1 style={titleStyle}>Log an Expense</h1>
            <p style={subtitleStyle}>Every rupee tracked is a step toward security</p>
          </div>

          {/* Quick Add Chips */}
          {recentTransactions && recentTransactions.length > 0 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={labelStyle}>Quick Add (Recent)</label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {recentTransactions.slice(0, 3).map((transaction, index) => {
                  const CategoryIcon = categories.find(
                    (c) => c.value === transaction.category
                  )?.icon || Briefcase;
                  return (
                    <button
                      key={index}
                      className="quick-add-chip"
                      style={quickAddChipStyle}
                      onClick={() => handleQuickAdd(transaction)}
                    >
                      <CategoryIcon size={14} />
                      <span>{transaction.category}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Transaction Form */}
          <form onSubmit={handleSubmit}>
            <div style={cardStyle}>
              {/* Amount */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Amount (₹)</label>
                <div style={{ position: 'relative' }}>
                  <DollarSign size={24} style={inputIconStyle} />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                    style={amountInputStyle}
                    step="0.01"
                    min="0"
                  />
                </div>
                {errors.amount && <div style={errorStyle}>{errors.amount}</div>}
              </div>

              {/* Smart Suggestions */}
              {suggestions.map((suggestion, index) => {
                const SuggestionIcon = suggestion.icon;
                return (
                  <div key={index} style={suggestionStyle(suggestion.color)}>
                    <SuggestionIcon size={20} color={suggestion.color} />
                    <span style={suggestionTextStyle(suggestion.color)}>
                      {suggestion.message}
                    </span>
                  </div>
                );
              })}

              {/* Category */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Category</label>
                <div style={categoryGridStyle}>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.value}
                        type="button"
                        className="category-button"
                        style={categoryButtonStyle(category === cat.value)}
                        onClick={() => setCategory(cat.value)}
                      >
                        <Icon size={24} />
                        <span>{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
                {errors.category && <div style={errorStyle}>{errors.category}</div>}
              </div>

              {/* Description */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Description (Optional)</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g., Lunch at cafe"
                  style={inputStyle}
                />
              </div>

              {/* Date */}
              <div style={formGroupStyle}>
                <label style={labelStyle}>Date</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Impact Preview */}
              {impact && (
                <div style={impactPreviewStyle(impact.color)}>
                  <div>
                    <div style={impactLabelStyle}>After this expense:</div>
                    <div style={impactValueStyle(impact.color)}>
                      {impact.survivalDays} days
                    </div>
                    <div style={{ ...impactLabelStyle, fontSize: '0.75rem' }}>
                      {impact.change > 0 && `-${impact.change} days`}
                    </div>
                  </div>
                  <TrendingDown size={32} color={impact.color} />
                </div>
              )}

              {/* Submit Error */}
              {errors.submit && (
                <div style={{ ...errorStyle, marginTop: '1rem', fontSize: '0.875rem' }}>
                  {errors.submit}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button type="submit" style={buttonStyle} disabled={addTransactionMutation.isPending}>
              {addTransactionMutation.isPending ? (
                <>
                  <LoadingSpinner size="sm" color="#0A0F1E" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Save Expense</span>
                </>
              )}
            </button>
          </form>

          {/* Success Toast */}
          {showSuccess && (
            <div style={successToastStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <CheckCircle size={24} color="#10B981" />
                <div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '1rem',
                      fontWeight: '600',
                      color: '#F9FAFB',
                    }}
                  >
                    Transaction Added!
                  </div>
                  <div
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.875rem',
                      color: '#6B7280',
                    }}
                  >
                    Your expense has been logged
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleAddAnother}
                  style={{
                    flex: 1,
                    backgroundColor: '#111827',
                    border: '1px solid #374151',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.875rem',
                    color: '#F9FAFB',
                    cursor: 'pointer',
                  }}
                >
                  Add Another
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  style={{
                    flex: 1,
                    backgroundColor: '#00D4FF',
                    border: 'none',
                    borderRadius: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#0A0F1E',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.25rem',
                  }}
                >
                  <span>Dashboard</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AddTransaction;
