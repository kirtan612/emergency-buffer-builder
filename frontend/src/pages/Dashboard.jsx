import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  Wallet, 
  Calendar, 
  TrendingDown, 
  DollarSign,
  Plus,
  Bot,
  ArrowRight,
  ShoppingBag,
  Coffee,
  Home,
  Car,
  Utensils,
  CheckCircle,
  AlertTriangle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDashboardInsights } from '../services/api';
import StatCard from '../components/StatCard';
import RiskBadge from '../components/RiskBadge';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [animateNumbers, setAnimateNumbers] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardInsights,
  });

  useEffect(() => {
    if (data) {
      setTimeout(() => setAnimateNumbers(true), 100);
    }
  }, [data]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getRiskConfig = (level) => {
    const configs = {
      safe: {
        color: '#10B981',
        bgColor: 'rgba(16, 185, 129, 0.1)',
        icon: CheckCircle,
        message: 'Your emergency fund is healthy',
      },
      warning: {
        color: '#F59E0B',
        bgColor: 'rgba(245, 158, 11, 0.1)',
        icon: AlertTriangle,
        message: 'Your buffer is getting thin',
      },
      critical: {
        color: '#EF4444',
        bgColor: 'rgba(239, 68, 68, 0.1)',
        icon: AlertCircle,
        message: 'Emergency! Replenish your fund now',
      },
    };
    return configs[level?.toLowerCase()] || configs.safe;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: Utensils,
      shopping: ShoppingBag,
      transport: Car,
      housing: Home,
      coffee: Coffee,
    };
    return icons[category?.toLowerCase()] || DollarSign;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  // Styles
  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#0A0F1E',
    paddingBottom: '4rem',
  };

  const containerStyle = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '2rem 1.5rem',
  };

  const heroSectionStyle = {
    marginBottom: '2rem',
  };

  const greetingStyle = {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '2.5rem',
    color: '#F9FAFB',
    marginBottom: '0.5rem',
  };

  const dateStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1rem',
    color: '#6B7280',
    marginBottom: '1.5rem',
  };

  const riskBannerStyle = (config) => ({
    backgroundColor: config.bgColor,
    border: `1px solid ${config.color}40`,
    borderRadius: '1rem',
    padding: '1.25rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    animation: 'slideIn 0.5s ease-out',
  });

  const riskMessageStyle = (config) => ({
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1rem',
    fontWeight: '600',
    color: config.color,
    flex: 1,
  });

  const metricsGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const sectionStyle = {
    marginBottom: '2rem',
  };

  const sectionTitleStyle = {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '1.5rem',
    color: '#F9FAFB',
    marginBottom: '1rem',
  };

  const cardStyle = {
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '1rem',
    padding: '1.5rem',
    boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
  };

  const progressBarContainerStyle = {
    ...cardStyle,
    marginBottom: '2rem',
  };

  const progressLabelStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    color: '#9CA3AF',
    marginBottom: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
  };

  const progressBarBgStyle = {
    width: '100%',
    height: '12px',
    backgroundColor: '#374151',
    borderRadius: '6px',
    overflow: 'hidden',
    position: 'relative',
  };

  const progressBarFillStyle = (percentage, color) => ({
    height: '100%',
    width: `${Math.min(percentage, 100)}%`,
    background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
    borderRadius: '6px',
    transition: 'width 1s ease-out',
    position: 'relative',
    overflow: 'hidden',
  });

  const transactionItemStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    borderBottom: '1px solid #374151',
    transition: 'background-color 0.2s ease',
  };

  const transactionIconStyle = {
    width: '40px',
    height: '40px',
    borderRadius: '0.5rem',
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const transactionDetailsStyle = {
    flex: 1,
  };

  const transactionCategoryStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#F9FAFB',
    marginBottom: '0.25rem',
  };

  const transactionDescStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    color: '#6B7280',
  };

  const transactionAmountStyle = (isNegative) => ({
    fontFamily: "'Space Mono', monospace",
    fontSize: '1rem',
    fontWeight: '700',
    color: isNegative ? '#EF4444' : '#10B981',
  });

  const transactionDateStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.75rem',
    color: '#6B7280',
    marginLeft: '1rem',
  };

  const quickActionsStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginTop: '2rem',
  };

  const actionButtonStyle = {
    backgroundColor: '#1F2937',
    border: '1px solid #374151',
    borderRadius: '0.75rem',
    padding: '1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#F9FAFB',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textDecoration: 'none',
  };

  const viewAllLinkStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#00D4FF',
    textDecoration: 'none',
    marginTop: '1rem',
    cursor: 'pointer',
  };

  if (isLoading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <EmptyState
            icon={AlertCircle}
            title="Failed to load dashboard"
            message={error.message || 'Please try refreshing the page'}
            actionLabel="Refresh"
            onAction={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const riskConfig = getRiskConfig(data?.risk_level);
  const RiskIcon = riskConfig.icon;
  const survivalPercentage = ((data?.survival_days || 0) / 30) * 100;
  const survivalColor = data?.survival_days >= 20 ? '#10B981' : data?.survival_days >= 10 ? '#F59E0B' : '#EF4444';

  // Check if user is new (no transactions)
  const isNewUser = !data?.recent_transactions || data.recent_transactions.length === 0;

  return (
    <>
      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes shimmer {
            0% {
              background-position: -1000px 0;
            }
            100% {
              background-position: 1000px 0;
            }
          }
          .transaction-item:hover {
            background-color: #374151 !important;
          }
          .action-button:hover {
            border-color: #00D4FF !important;
            transform: translateY(-2px);
            box-shadow: 0 0 20px rgba(0, 212, 255, 0.2) !important;
          }
          .view-all-link:hover {
            color: #00B8E0 !important;
          }
          .progress-shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
            animation: shimmer 2s infinite;
          }
        `}
      </style>
      <div style={pageStyle}>
        <div style={containerStyle}>
          {/* Hero Section */}
          <div style={heroSectionStyle}>
            <h1 style={greetingStyle}>
              {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}
            </h1>
            <p style={dateStyle}>{getFormattedDate()}</p>

            {/* Risk Banner */}
            <div style={riskBannerStyle(riskConfig)}>
              <RiskIcon size={24} color={riskConfig.color} />
              <span style={riskMessageStyle(riskConfig)}>{riskConfig.message}</span>
              <RiskBadge level={data?.risk_level} />
            </div>
          </div>

          {/* Key Metrics */}
          <div style={metricsGridStyle}>
            <StatCard
              title="Emergency Fund"
              value={formatCurrency(data?.emergency_fund)}
              subtitle={`Goal: ${formatCurrency(data?.monthly_allowance * 3)}`}
              icon={Wallet}
              accentColor="#00D4FF"
              isLoading={isLoading}
            />
            <StatCard
              title="Survival Days"
              value={`${data?.survival_days || 0}`}
              subtitle="Days of runway"
              icon={Calendar}
              accentColor={survivalColor}
              isLoading={isLoading}
            />
            <StatCard
              title="Avg Daily Spend"
              value={formatCurrency(data?.avg_daily_spending)}
              subtitle="Last 30 days"
              icon={TrendingDown}
              accentColor="#F9FAFB"
              isLoading={isLoading}
            />
            <StatCard
              title="30-Day Total"
              value={formatCurrency(data?.total_30d_spending)}
              subtitle="Total expenses"
              icon={DollarSign}
              accentColor="#6B7280"
              isLoading={isLoading}
            />
          </div>

          {/* Survival Days Progress Bar */}
          <div style={progressBarContainerStyle}>
            <div style={progressLabelStyle}>
              <span style={{ fontWeight: '600', color: '#F9FAFB' }}>
                {data?.survival_days || 0} days of runway remaining
              </span>
              <span>{Math.round(survivalPercentage)}%</span>
            </div>
            <div style={progressBarBgStyle}>
              <div style={progressBarFillStyle(survivalPercentage, survivalColor)} className="progress-shimmer"></div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div style={sectionStyle}>
            <h2 style={sectionTitleStyle}>Recent Transactions</h2>
            <div style={cardStyle}>
              {isNewUser ? (
                <EmptyState
                  icon={DollarSign}
                  title="No transactions yet"
                  message="Start tracking your spending by adding your first transaction"
                  actionLabel="Add Transaction"
                  onAction={() => navigate('/add-transaction')}
                />
              ) : (
                <>
                  {data?.recent_transactions?.slice(0, 5).map((transaction, index) => {
                    const CategoryIcon = getCategoryIcon(transaction.category);
                    const isNegative = transaction.amount < 0;
                    return (
                      <div
                        key={index}
                        className="transaction-item"
                        style={{
                          ...transactionItemStyle,
                          borderBottom: index === 4 ? 'none' : '1px solid #374151',
                        }}
                      >
                        <div style={transactionIconStyle}>
                          <CategoryIcon size={20} color="#00D4FF" />
                        </div>
                        <div style={transactionDetailsStyle}>
                          <div style={transactionCategoryStyle}>
                            {transaction.category || 'Uncategorized'}
                          </div>
                          <div style={transactionDescStyle}>
                            {transaction.description || 'No description'}
                          </div>
                        </div>
                        <div style={transactionAmountStyle(isNegative)}>
                          {isNegative ? '-' : '+'}{formatCurrency(Math.abs(transaction.amount))}
                        </div>
                        <div style={transactionDateStyle}>
                          {formatDate(transaction.date)}
                        </div>
                      </div>
                    );
                  })}
                  <a
                    href="/add-transaction"
                    className="view-all-link"
                    style={viewAllLinkStyle}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate('/add-transaction');
                    }}
                  >
                    <span>View all transactions</span>
                    <ArrowRight size={16} />
                  </a>
                </>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div style={quickActionsStyle}>
            <a
              href="/add-transaction"
              className="action-button"
              style={actionButtonStyle}
              onClick={(e) => {
                e.preventDefault();
                navigate('/add-transaction');
              }}
            >
              <Plus size={20} color="#00D4FF" />
              <span>Add Transaction</span>
            </a>
            <a
              href="/emergency-fund"
              className="action-button"
              style={actionButtonStyle}
              onClick={(e) => {
                e.preventDefault();
                navigate('/emergency-fund');
              }}
            >
              <Wallet size={20} color="#10B981" />
              <span>Add to Fund</span>
            </a>
            <a
              href="/chatbot"
              className="action-button"
              style={actionButtonStyle}
              onClick={(e) => {
                e.preventDefault();
                navigate('/chatbot');
              }}
            >
              <Bot size={20} color="#F59E0B" />
              <span>Ask Advisor</span>
            </a>
          </div>

          {/* Support Section */}
          <div style={{
            background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginTop: '2rem'
          }}>
            <h3 style={{ fontFamily: '"DM Serif Display", serif', fontSize: '1.25rem', color: '#00D4FF', marginBottom: '1rem' }}>
              Need Help?
            </h3>
            <p style={{ fontFamily: 'Outfit', color: '#94A3B8', fontSize: '0.875rem', marginBottom: '1rem', lineHeight: '1.6' }}>
              Have questions or need support? I'm here to help!
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem' }}>📧</div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Email</div>
                  <a href="mailto:kirtanjogani3@gmail.com" style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.875rem', color: '#00D4FF', textDecoration: 'none' }}>
                    kirtanjogani3@gmail.com
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem' }}>📱</div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>Phone</div>
                  <a href="tel:+919374134341" style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.875rem', color: '#00D4FF', textDecoration: 'none' }}>
                    +91-9374134341
                  </a>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ fontSize: '1.5rem' }}>💳</div>
                <div>
                  <div style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#64748B', marginBottom: '0.25rem' }}>UPI</div>
                  <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '0.875rem', color: '#FFFFFF' }}>
                    emergencybuffer@paytm
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px', borderLeft: '3px solid #00D4FF' }}>
              <p style={{ fontFamily: 'Outfit', fontSize: '0.75rem', color: '#94A3B8', margin: 0 }}>
                <strong style={{ color: '#00D4FF' }}>Support Hours:</strong> Email 24/7 | Phone 9 AM - 9 PM IST (Mon-Sat)
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
