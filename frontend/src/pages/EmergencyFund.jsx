import { useState, useEffect } from 'react';
import { Vault, TrendingUp, TrendingDown, Lock, AlertCircle, CreditCard, Smartphone, ArrowRight, CheckCircle } from 'lucide-react';
import { 
  getEmergencyFund, 
  addToEmergencyFund, 
  withdrawFromEmergencyFund,
  getBankAccounts,
  getUPIIds 
} from '../services/api';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import RiskBadge from '../components/RiskBadge';

const EmergencyFund = () => {
  const [fundData, setFundData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Payment methods
  const [bankAccounts, setBankAccounts] = useState([]);
  const [upiIds, setUpiIds] = useState([]);
  
  // Form states
  const [depositAmount, setDepositAmount] = useState('');
  const [lockDays, setLockDays] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBankAccount, setSelectedBankAccount] = useState('');
  const [selectedUPI, setSelectedUPI] = useState('');
  const [showDepositForm, setShowDepositForm] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [depositStep, setDepositStep] = useState(1); // 1: amount, 2: payment method, 3: confirmation

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fund, banks, upis] = await Promise.all([
        getEmergencyFund(),
        getBankAccounts(),
        getUPIIds()
      ]);
      setFundData(fund);
      setBankAccounts(banks);
      setUpiIds(upis);
      
      // Auto-select primary payment methods
      const primaryBank = banks.find(b => b.is_primary === 'yes');
      const primaryUPI = upis.find(u => u.is_primary === 'yes');
      if (primaryBank) setSelectedBankAccount(primaryBank.id);
      if (primaryUPI) setSelectedUPI(primaryUPI.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDepositSubmit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!selectedUPI && upiIds.length > 0) {
      alert('Please select a UPI ID for payment');
      return;
    }

    try {
      setActionLoading(true);
      const lockDaysValue = lockDays ? parseInt(lockDays) : null;
      
      // In production, this would initiate payment gateway
      // For now, we'll simulate successful payment
      await addToEmergencyFund(parseFloat(depositAmount), lockDaysValue);
      
      // Reset form and refresh data
      setDepositAmount('');
      setLockDays('');
      setSelectedUPI('');
      setShowDepositForm(false);
      setDepositStep(1);
      await fetchAllData();
      
      alert('✅ Deposit successful! Your emergency fund has been updated.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleWithdrawSubmit = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    if (!selectedBankAccount && bankAccounts.length > 0) {
      alert('Please select a bank account for withdrawal');
      return;
    }

    if (parseFloat(withdrawAmount) > parseFloat(fundData?.total_amount || 0)) {
      alert('Insufficient balance in emergency fund');
      return;
    }

    try {
      setActionLoading(true);
      
      // In production, this would initiate bank transfer
      await withdrawFromEmergencyFund(parseFloat(withdrawAmount));
      
      // Reset form and refresh data
      setWithdrawAmount('');
      setSelectedBankAccount('');
      setShowWithdrawForm(false);
      await fetchAllData();
      
      alert('✅ Withdrawal initiated! Money will be transferred to your bank account within 24 hours.');
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', padding: '2rem', paddingTop: '3rem' }}>
        <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
          <div style={{
            background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            textAlign: 'center'
          }}>
            <AlertCircle size={48} style={{ color: '#EF4444', margin: '0 auto 1rem' }} />
            <p style={{ color: '#EF4444', fontSize: '1.125rem' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isLocked = fundData?.locked_until && new Date(fundData.locked_until) > new Date();
  const lockDate = isLocked ? new Date(fundData.locked_until).toLocaleDateString() : null;
  const hasPaymentMethods = bankAccounts.length > 0 || upiIds.length > 0;

  return (
    <div style={{ minHeight: '100vh', padding: '2rem', paddingTop: '3rem' }}>
      <div style={{ maxWidth: '80rem', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: '"DM Serif Display", serif',
            fontSize: '2.5rem',
            color: '#FFFFFF',
            marginBottom: '0.5rem'
          }}>
            Emergency Fund
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
            Build your financial safety net with secure payments
          </p>
        </div>

        {/* Main Stats Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '16px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
            {/* Total Balance */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Vault size={20} style={{ color: '#00D4FF' }} />
                <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Total Balance</span>
              </div>
              <p style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '2rem',
                color: '#00D4FF',
                fontWeight: 'bold'
              }}>
                ₹{parseFloat(fundData?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Survival Days */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Survival Days</span>
              </div>
              <p style={{
                fontFamily: '"Space Mono", monospace',
                fontSize: '2rem',
                color: '#10B981',
                fontWeight: 'bold'
              }}>
                {parseFloat(fundData?.survival_days || 0).toFixed(1)} days
              </p>
            </div>

            {/* Risk Level */}
            <div>
              <div style={{ marginBottom: '0.5rem' }}>
                <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Risk Level</span>
              </div>
              <RiskBadge level={fundData?.risk_level || 'Safe'} />
            </div>

            {/* Lock Status */}
            {isLocked && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Lock size={20} style={{ color: '#F59E0B' }} />
                  <span style={{ color: '#94A3B8', fontSize: '0.875rem' }}>Locked Until</span>
                </div>
                <p style={{ color: '#F59E0B', fontSize: '1.125rem', fontWeight: '600' }}>
                  {lockDate}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Methods Warning */}
        {!hasPaymentMethods && (
          <div style={{
            background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '12px',
            padding: '1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem'
          }}>
            <AlertCircle size={24} style={{ color: '#F59E0B', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ color: '#F59E0B', fontWeight: '600', marginBottom: '0.5rem' }}>
                No Payment Methods Added
              </p>
              <p style={{ color: '#94A3B8', fontSize: '0.875rem' }}>
                Add a bank account or UPI ID to deposit/withdraw money securely
              </p>
            </div>
            <Link
              to="/settings"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#FFFFFF',
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.875rem',
                fontWeight: '600',
                whiteSpace: 'nowrap'
              }}
            >
              Add Payment Method
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => {
              if (!hasPaymentMethods) {
                alert('Please add a payment method first');
                return;
              }
              setShowDepositForm(!showDepositForm);
              setShowWithdrawForm(false);
              setDepositStep(1);
            }}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            <TrendingUp size={20} />
            Deposit Money
          </button>

          <button
            onClick={() => {
              if (!hasPaymentMethods) {
                alert('Please add a bank account first');
                return;
              }
              setShowWithdrawForm(!showWithdrawForm);
              setShowDepositForm(false);
            }}
            disabled={isLocked}
            style={{
              background: isLocked ? '#1E293B' : 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: isLocked ? '#64748B' : '#FFFFFF',
              padding: '1rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: isLocked ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => !isLocked && (e.target.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            {isLocked ? <Lock size={20} /> : <TrendingDown size={20} />}
            {isLocked ? 'Fund Locked' : 'Withdraw Money'}
          </button>
        </div>

        {/* Deposit Form */}
        {showDepositForm && (
          <div style={{
            background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#10B981', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Deposit to Emergency Fund
            </h3>

            {/* Step 1: Amount */}
            {depositStep === 1 && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#94A3B8', marginBottom: '0.5rem' }}>
                    Amount (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="Enter amount"
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#0A0F1E',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '1rem'
                    }}
                  />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', color: '#94A3B8', marginBottom: '0.5rem' }}>
                    Lock Days (0-90, optional)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="90"
                    value={lockDays}
                    onChange={(e) => setLockDays(e.target.value)}
                    placeholder="Lock period in days"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      background: '#0A0F1E',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      color: '#FFFFFF',
                      fontSize: '1rem'
                    }}
                  />
                  <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Lock your fund to prevent early withdrawals and build discipline
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => setDepositStep(2)}
                    disabled={!depositAmount || parseFloat(depositAmount) <= 0}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: (!depositAmount || parseFloat(depositAmount) <= 0) ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      opacity: (!depositAmount || parseFloat(depositAmount) <= 0) ? 0.5 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    Continue <ArrowRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDepositForm(false);
                      setDepositStep(1);
                      setDepositAmount('');
                      setLockDays('');
                    }}
                    style={{
                      flex: 1,
                      background: '#1E293B',
                      color: '#94A3B8',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {depositStep === 2 && (
              <div>
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ color: '#FFFFFF', fontSize: '1.125rem', marginBottom: '1rem' }}>
                    Select Payment Method
                  </p>
                  
                  {/* UPI Options */}
                  {upiIds.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                        Pay via UPI
                      </p>
                      {upiIds.map((upi) => (
                        <div
                          key={upi.id}
                          onClick={() => setSelectedUPI(upi.id)}
                          style={{
                            background: selectedUPI === upi.id ? 'rgba(16, 185, 129, 0.1)' : '#0A0F1E',
                            border: selectedUPI === upi.id ? '2px solid #10B981' : '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            padding: '1rem',
                            marginBottom: '0.5rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem'
                          }}
                        >
                          <Smartphone size={24} style={{ color: '#00D4FF' }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ color: '#FFFFFF', fontFamily: '"Space Mono", monospace' }}>{upi.upi_id}</p>
                            <p style={{ color: '#64748B', fontSize: '0.75rem', textTransform: 'capitalize' }}>{upi.provider}</p>
                          </div>
                          {selectedUPI === upi.id && <CheckCircle size={20} style={{ color: '#10B981' }} />}
                        </div>
                      ))}
                    </div>
                  )}

                  {upiIds.length === 0 && (
                    <div style={{
                      background: '#0A0F1E',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      textAlign: 'center'
                    }}>
                      <p style={{ color: '#94A3B8', marginBottom: '0.5rem' }}>No UPI IDs added</p>
                      <Link to="/settings" style={{ color: '#00D4FF', fontSize: '0.875rem' }}>
                        Add UPI ID in Settings
                      </Link>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={handleDepositSubmit}
                    disabled={actionLoading || !selectedUPI}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                      color: '#FFFFFF',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: (actionLoading || !selectedUPI) ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600',
                      opacity: (actionLoading || !selectedUPI) ? 0.6 : 1
                    }}
                  >
                    {actionLoading ? 'Processing...' : `Pay ₹${depositAmount}`}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDepositStep(1)}
                    disabled={actionLoading}
                    style={{
                      flex: 1,
                      background: '#1E293B',
                      color: '#94A3B8',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      fontSize: '1rem',
                      fontWeight: '600'
                    }}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Withdraw Form */}
        {showWithdrawForm && (
          <div style={{
            background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '2rem',
            marginBottom: '2rem'
          }}>
            <h3 style={{ color: '#EF4444', fontSize: '1.5rem', marginBottom: '1.5rem' }}>
              Withdraw from Emergency Fund
            </h3>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', color: '#94A3B8', marginBottom: '0.5rem' }}>
                Amount (₹) *
              </label>
              <input
                type="number"
                step="0.01"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                required
                max={fundData?.total_amount}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#0A0F1E',
                  border: '1px solid rgba(148, 163, 184, 0.2)',
                  borderRadius: '8px',
                  color: '#FFFFFF',
                  fontSize: '1rem'
                }}
              />
              <p style={{ color: '#64748B', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Available: ₹{parseFloat(fundData?.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </p>
            </div>

            {/* Bank Account Selection */}
            {bankAccounts.length > 0 && (
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', color: '#94A3B8', marginBottom: '0.5rem' }}>
                  Withdraw to Bank Account *
                </label>
                {bankAccounts.map((bank) => (
                  <div
                    key={bank.id}
                    onClick={() => setSelectedBankAccount(bank.id)}
                    style={{
                      background: selectedBankAccount === bank.id ? 'rgba(239, 68, 68, 0.1)' : '#0A0F1E',
                      border: selectedBankAccount === bank.id ? '2px solid #EF4444' : '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '8px',
                      padding: '1rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem'
                    }}
                  >
                    <CreditCard size={24} style={{ color: '#00D4FF' }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ color: '#FFFFFF' }}>{bank.bank_name}</p>
                      <p style={{ color: '#64748B', fontSize: '0.875rem', fontFamily: '"Space Mono", monospace' }}>
                        {bank.account_number}
                      </p>
                    </div>
                    {selectedBankAccount === bank.id && <CheckCircle size={20} style={{ color: '#EF4444' }} />}
                  </div>
                ))}
              </div>
            )}

            {bankAccounts.length === 0 && (
              <div style={{
                background: '#0A0F1E',
                border: '1px solid rgba(148, 163, 184, 0.2)',
                borderRadius: '8px',
                padding: '1rem',
                textAlign: 'center',
                marginBottom: '1.5rem'
              }}>
                <p style={{ color: '#94A3B8', marginBottom: '0.5rem' }}>No bank accounts added</p>
                <Link to="/settings" style={{ color: '#00D4FF', fontSize: '0.875rem' }}>
                  Add Bank Account in Settings
                </Link>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={handleWithdrawSubmit}
                disabled={actionLoading || !selectedBankAccount || !withdrawAmount}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: (actionLoading || !selectedBankAccount || !withdrawAmount) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600',
                  opacity: (actionLoading || !selectedBankAccount || !withdrawAmount) ? 0.6 : 1
                }}
              >
                {actionLoading ? 'Processing...' : 'Confirm Withdrawal'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowWithdrawForm(false);
                  setWithdrawAmount('');
                  setSelectedBankAccount('');
                }}
                disabled={actionLoading}
                style={{
                  flex: 1,
                  background: '#1E293B',
                  color: '#94A3B8',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: actionLoading ? 'not-allowed' : 'pointer',
                  fontSize: '1rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div style={{
          background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
          border: '1px solid rgba(0, 212, 255, 0.2)',
          borderRadius: '12px',
          padding: '1.5rem'
        }}>
          <h4 style={{ color: '#00D4FF', fontSize: '1.125rem', marginBottom: '1rem' }}>
            💡 Emergency Fund Tips
          </h4>
          <ul style={{ color: '#94A3B8', lineHeight: '1.8', paddingLeft: '1.5rem' }}>
            <li>Aim for 3-6 months of expenses in your emergency fund</li>
            <li>Use UPI for instant deposits - money reflects immediately</li>
            <li>Withdrawals to bank account take 24 hours to process</li>
            <li>Lock your fund to prevent impulsive withdrawals</li>
            <li>Only use for genuine emergencies</li>
          </ul>
          
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(0, 212, 255, 0.1)', borderRadius: '8px', borderLeft: '3px solid #00D4FF' }}>
            <h5 style={{ color: '#00D4FF', fontSize: '1rem', marginBottom: '0.75rem' }}>Company UPI for Deposits</h5>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: '1.125rem', color: '#FFFFFF', marginBottom: '0.5rem' }}>
              emergencybuffer@paytm
            </div>
            <p style={{ fontSize: '0.875rem', color: '#94A3B8', marginBottom: '0.75rem' }}>
              Pay to this UPI ID from any UPI app (Paytm, PhonePe, GPay, etc.)
            </p>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              <div>📧 Support: kirtanjogani3@gmail.com</div>
              <div>📱 Phone: +91-9374134341 (9 AM - 9 PM IST)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyFund;
