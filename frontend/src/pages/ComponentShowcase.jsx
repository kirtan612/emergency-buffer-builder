import { useState } from 'react';
import { 
  StatCard, 
  RiskBadge, 
  LoadingSpinner, 
  EmptyState 
} from '../components';
import { 
  DollarSign, 
  TrendingUp, 
  Calendar, 
  Wallet,
  Inbox 
} from 'lucide-react';

/**
 * ComponentShowcase - Demo page showing all shared components
 * This page is for development/testing purposes
 */
const ComponentShowcase = () => {
  const [isLoading, setIsLoading] = useState(false);

  const pageStyle = {
    minHeight: '100vh',
    backgroundColor: '#0A0F1E',
    padding: '2rem',
  };

  const containerStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
  };

  const sectionStyle = {
    marginBottom: '3rem',
  };

  const titleStyle = {
    fontFamily: "'DM Serif Display', serif",
    fontSize: '2rem',
    color: '#F9FAFB',
    marginBottom: '1rem',
  };

  const subtitleStyle = {
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1rem',
    color: '#9CA3AF',
    marginBottom: '2rem',
  };

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  };

  const flexStyle = {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: '2rem',
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Component Showcase</h1>
        <p style={subtitleStyle}>
          Vault Noir Design System - All shared components
        </p>

        {/* StatCard Section */}
        <section style={sectionStyle}>
          <h2 style={{ ...titleStyle, fontSize: '1.5rem' }}>StatCard</h2>
          <div style={gridStyle}>
            <StatCard
              title="Emergency Fund"
              value="$2,450.00"
              subtitle="67% of goal"
              icon={DollarSign}
              accentColor="#10B981"
              isLoading={isLoading}
            />
            <StatCard
              title="Daily Average"
              value="$45.20"
              subtitle="Last 30 days"
              icon={TrendingUp}
              accentColor="#00D4FF"
              isLoading={isLoading}
            />
            <StatCard
              title="Survival Days"
              value="54"
              subtitle="At current rate"
              icon={Calendar}
              accentColor="#F59E0B"
              isLoading={isLoading}
            />
            <StatCard
              title="Total Balance"
              value="$3,890.50"
              subtitle="Available funds"
              icon={Wallet}
              accentColor="#EF4444"
              isLoading={isLoading}
            />
          </div>
          <button
            onClick={() => setIsLoading(!isLoading)}
            style={{
              backgroundColor: '#1F2937',
              color: '#00D4FF',
              border: '1px solid #374151',
              padding: '0.5rem 1rem',
              borderRadius: '0.5rem',
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
            }}
          >
            Toggle Loading State
          </button>
        </section>

        {/* RiskBadge Section */}
        <section style={sectionStyle}>
          <h2 style={{ ...titleStyle, fontSize: '1.5rem' }}>RiskBadge</h2>
          <div style={flexStyle}>
            <RiskBadge level="safe" />
            <RiskBadge level="warning" />
            <RiskBadge level="critical" />
          </div>
        </section>

        {/* LoadingSpinner Section */}
        <section style={sectionStyle}>
          <h2 style={{ ...titleStyle, fontSize: '1.5rem' }}>LoadingSpinner</h2>
          <div style={flexStyle}>
            <div>
              <p style={{ ...subtitleStyle, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Small</p>
              <LoadingSpinner size="sm" />
            </div>
            <div>
              <p style={{ ...subtitleStyle, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Medium</p>
              <LoadingSpinner size="md" />
            </div>
            <div>
              <p style={{ ...subtitleStyle, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Large</p>
              <LoadingSpinner size="lg" />
            </div>
            <div>
              <p style={{ ...subtitleStyle, marginBottom: '0.5rem', fontSize: '0.875rem' }}>Custom Color</p>
              <LoadingSpinner size="md" color="#10B981" />
            </div>
          </div>
        </section>

        {/* EmptyState Section */}
        <section style={sectionStyle}>
          <h2 style={{ ...titleStyle, fontSize: '1.5rem' }}>EmptyState</h2>
          <EmptyState
            icon={Inbox}
            title="No transactions yet"
            message="Start tracking your spending by adding your first transaction. It only takes a moment!"
            actionLabel="Add Transaction"
            onAction={() => alert('Navigate to add transaction page')}
          />
        </section>
      </div>
    </div>
  );
};

export default ComponentShowcase;
