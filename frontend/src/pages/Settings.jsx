import { useState, useEffect } from 'react';
import { CreditCard, Smartphone, Shield, CheckCircle, XCircle, Clock, Trash2, Star } from 'lucide-react';
import {
  getBankAccounts,
  addBankAccount,
  verifyBankAccount,
  setPrimaryBankAccount,
  deleteBankAccount,
  getUPIIds,
  addUPIId,
  verifyUPIId,
  setPrimaryUPIId,
  deleteUPIId
} from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

const Settings = () => {
  const [activeTab, setActiveTab] = useState('bank');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Bank Account State
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showBankForm, setShowBankForm] = useState(false);
  const [bankForm, setBankForm] = useState({
    account_number: '',
    ifsc_code: '',
    account_holder_name: '',
    bank_name: ''
  });
  
  // UPI State
  const [upiIds, setUpiIds] = useState([]);
  const [showUpiForm, setShowUpiForm] = useState(false);
  const [upiForm, setUpiForm] = useState({
    upi_id: '',
    provider: 'paytm'
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'bank') {
        const accounts = await getBankAccounts();
        setBankAccounts(accounts);
      } else if (activeTab === 'upi') {
        const upis = await getUPIIds();
        setUpiIds(upis);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Bank Account Handlers
  const handleAddBankAccount = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await addBankAccount(bankForm);
      setBankForm({ account_number: '', ifsc_code: '', account_holder_name: '', bank_name: '' });
      setShowBankForm(false);
      await fetchData();
      alert('Bank account added successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyBank = async (accountId) => {
    try {
      setActionLoading(true);
      await verifyBankAccount(accountId);
      await fetchData();
      alert('Bank account verified successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPrimaryBank = async (accountId) => {
    try {
      setActionLoading(true);
      await setPrimaryBankAccount(accountId);
      await fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBank = async (accountId) => {
    if (!confirm('Are you sure you want to delete this bank account?')) return;
    try {
      setActionLoading(true);
      await deleteBankAccount(accountId);
      await fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  // UPI Handlers
  const handleAddUPI = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await addUPIId(upiForm);
      setUpiForm({ upi_id: '', provider: 'paytm' });
      setShowUpiForm(false);
      await fetchData();
      alert('UPI ID added successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyUPI = async (upiId) => {
    try {
      setActionLoading(true);
      await verifyUPIId(upiId);
      await fetchData();
      alert('UPI ID verified successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSetPrimaryUPI = async (upiId) => {
    try {
      setActionLoading(true);
      await setPrimaryUPIId(upiId);
      await fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUPI = async (upiId) => {
    if (!confirm('Are you sure you want to delete this UPI ID?')) return;
    try {
      setActionLoading(true);
      await deleteUPIId(upiId);
      await fetchData();
    } catch (error) {
      alert(error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      verified: { bg: '#10B981', icon: CheckCircle },
      pending: { bg: '#F59E0B', icon: Clock },
      failed: { bg: '#EF4444', icon: XCircle }
    };
    const config = styles[status] || styles.pending;
    const Icon = config.icon;
    
    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.75rem',
        background: `${config.bg}20`,
        color: config.bg,
        borderRadius: '12px',
        fontSize: '0.75rem',
        fontWeight: '600'
      }}>
        <Icon size={14} />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </div>
    );
  };

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
            Payment Settings
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '1rem' }}>
            Manage your bank accounts and UPI IDs for secure transactions
          </p>
        </div>

        {/* Trust Badges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Shield size={24} style={{ color: '#10B981' }} />
            <div>
              <p style={{ color: '#10B981', fontSize: '0.875rem', fontWeight: '600' }}>Bank-grade Security</p>
              <p style={{ color: '#64748B', fontSize: '0.75rem' }}>256-bit encryption</p>
            </div>
          </div>
          
          <div style={{
            background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
            border: '1px solid rgba(0, 212, 255, 0.3)',
            borderRadius: '12px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <CheckCircle size={24} style={{ color: '#00D4FF' }} />
            <div>
              <p style={{ color: '#00D4FF', fontSize: '0.875rem', fontWeight: '600' }}>Verified Payments</p>
              <p style={{ color: '#64748B', fontSize: '0.75rem' }}>Secure transactions</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '2rem',
          borderBottom: '1px solid rgba(148, 163, 184, 0.2)'
        }}>
          <button
            onClick={() => setActiveTab('bank')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'bank' ? '2px solid #00D4FF' : '2px solid transparent',
              color: activeTab === 'bank' ? '#00D4FF' : '#94A3B8',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <CreditCard size={20} />
            Bank Accounts
          </button>
          
          <button
            onClick={() => setActiveTab('upi')}
            style={{
              padding: '1rem 1.5rem',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'upi' ? '2px solid #00D4FF' : '2px solid transparent',
              color: activeTab === 'upi' ? '#00D4FF' : '#94A3B8',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Smartphone size={20} />
            UPI IDs
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {/* Bank Accounts Tab */}
            {activeTab === 'bank' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: '#FFFFFF', fontSize: '1.5rem' }}>Your Bank Accounts</h2>
                  <button
                    onClick={() => setShowBankForm(!showBankForm)}
                    style={{
                      background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
                      color: '#FFFFFF',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    {showBankForm ? 'Cancel' : '+ Add Bank Account'}
                  </button>
                </div>

                {/* Add Bank Form */}
                {showBankForm && (
                  <div style={{
                    background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ color: '#00D4FF', marginBottom: '1rem' }}>Add New Bank Account</h3>
                    <form onSubmit={handleAddBankAccount}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <input
                          type="text"
                          placeholder="Account Number"
                          value={bankForm.account_number}
                          onChange={(e) => setBankForm({...bankForm, account_number: e.target.value})}
                          required
                          style={{
                            padding: '0.75rem',
                            background: '#0A0F1E',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="IFSC Code"
                          value={bankForm.ifsc_code}
                          onChange={(e) => setBankForm({...bankForm, ifsc_code: e.target.value.toUpperCase()})}
                          required
                          maxLength={11}
                          style={{
                            padding: '0.75rem',
                            background: '#0A0F1E',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Account Holder Name"
                          value={bankForm.account_holder_name}
                          onChange={(e) => setBankForm({...bankForm, account_holder_name: e.target.value})}
                          required
                          style={{
                            padding: '0.75rem',
                            background: '#0A0F1E',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF'
                          }}
                        />
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={bankForm.bank_name}
                          onChange={(e) => setBankForm({...bankForm, bank_name: e.target.value})}
                          required
                          style={{
                            padding: '0.75rem',
                            background: '#0A0F1E',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF'
                          }}
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        style={{
                          marginTop: '1rem',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: '#FFFFFF',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          opacity: actionLoading ? 0.6 : 1
                        }}
                      >
                        {actionLoading ? 'Adding...' : 'Add Account'}
                      </button>
                    </form>
                  </div>
                )}

                {/* Bank Accounts List */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {bankAccounts.length === 0 ? (
                    <div style={{
                      background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '2rem',
                      textAlign: 'center'
                    }}>
                      <CreditCard size={48} style={{ color: '#64748B', margin: '0 auto 1rem' }} />
                      <p style={{ color: '#94A3B8' }}>No bank accounts added yet</p>
                    </div>
                  ) : (
                    bankAccounts.map((account) => (
                      <div
                        key={account.id}
                        style={{
                          background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
                          border: account.is_primary === 'yes' ? '1px solid rgba(0, 212, 255, 0.5)' : '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          position: 'relative'
                        }}
                      >
                        {account.is_primary === 'yes' && (
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#00D4FF',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            <Star size={14} fill="#00D4FF" />
                            Primary
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                          <div>
                            <h3 style={{ color: '#FFFFFF', fontSize: '1.125rem', marginBottom: '0.5rem' }}>
                              {account.bank_name}
                            </h3>
                            <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                              {account.account_holder_name}
                            </p>
                            <p style={{ color: '#64748B', fontSize: '0.875rem', fontFamily: '"Space Mono", monospace' }}>
                              {account.account_number} • {account.ifsc_code}
                            </p>
                          </div>
                          {getStatusBadge(account.is_verified)}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {account.is_verified === 'pending' && (
                            <button
                              onClick={() => handleVerifyBank(account.id)}
                              disabled={actionLoading}
                              style={{
                                background: '#10B981',
                                color: '#FFFFFF',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}
                            >
                              Verify
                            </button>
                          )}
                          {account.is_primary === 'no' && (
                            <button
                              onClick={() => handleSetPrimaryBank(account.id)}
                              disabled={actionLoading}
                              style={{
                                background: '#1E293B',
                                color: '#94A3B8',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}
                            >
                              Set as Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteBank(account.id)}
                            disabled={actionLoading}
                            style={{
                              background: 'transparent',
                              color: '#EF4444',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: '1px solid #EF4444',
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* UPI Tab */}
            {activeTab === 'upi' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2 style={{ color: '#FFFFFF', fontSize: '1.5rem' }}>Your UPI IDs</h2>
                  <button
                    onClick={() => setShowUpiForm(!showUpiForm)}
                    style={{
                      background: 'linear-gradient(135deg, #00D4FF 0%, #0099CC 100%)',
                      color: '#FFFFFF',
                      padding: '0.75rem 1.5rem',
                      borderRadius: '8px',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: '600'
                    }}
                  >
                    {showUpiForm ? 'Cancel' : '+ Add UPI ID'}
                  </button>
                </div>

                {/* Add UPI Form */}
                {showUpiForm && (
                  <div style={{
                    background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
                    border: '1px solid rgba(0, 212, 255, 0.3)',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '1.5rem'
                  }}>
                    <h3 style={{ color: '#00D4FF', marginBottom: '1rem' }}>Add New UPI ID</h3>
                    <form onSubmit={handleAddUPI}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        <input
                          type="text"
                          placeholder="UPI ID (e.g., user@paytm)"
                          value={upiForm.upi_id}
                          onChange={(e) => setUpiForm({...upiForm, upi_id: e.target.value.toLowerCase()})}
                          required
                          style={{
                            padding: '0.75rem',
                            background: '#0A0F1E',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF'
                          }}
                        />
                        <select
                          value={upiForm.provider}
                          onChange={(e) => setUpiForm({...upiForm, provider: e.target.value})}
                          style={{
                            padding: '0.75rem',
                            background: '#0A0F1E',
                            border: '1px solid rgba(148, 163, 184, 0.2)',
                            borderRadius: '8px',
                            color: '#FFFFFF'
                          }}
                        >
                          <option value="paytm">Paytm</option>
                          <option value="phonepe">PhonePe</option>
                          <option value="gpay">Google Pay</option>
                          <option value="bhim">BHIM</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        disabled={actionLoading}
                        style={{
                          marginTop: '1rem',
                          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                          color: '#FFFFFF',
                          padding: '0.75rem 1.5rem',
                          borderRadius: '8px',
                          border: 'none',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          opacity: actionLoading ? 0.6 : 1
                        }}
                      >
                        {actionLoading ? 'Adding...' : 'Add UPI ID'}
                      </button>
                    </form>
                  </div>
                )}

                {/* UPI IDs List */}
                <div style={{ display: 'grid', gap: '1rem' }}>
                  {upiIds.length === 0 ? (
                    <div style={{
                      background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
                      border: '1px solid rgba(148, 163, 184, 0.2)',
                      borderRadius: '12px',
                      padding: '2rem',
                      textAlign: 'center'
                    }}>
                      <Smartphone size={48} style={{ color: '#64748B', margin: '0 auto 1rem' }} />
                      <p style={{ color: '#94A3B8' }}>No UPI IDs added yet</p>
                    </div>
                  ) : (
                    upiIds.map((upi) => (
                      <div
                        key={upi.id}
                        style={{
                          background: 'linear-gradient(135deg, #0A0F1E 0%, #070C18 100%)',
                          border: upi.is_primary === 'yes' ? '1px solid rgba(0, 212, 255, 0.5)' : '1px solid rgba(148, 163, 184, 0.2)',
                          borderRadius: '12px',
                          padding: '1.5rem',
                          position: 'relative'
                        }}
                      >
                        {upi.is_primary === 'yes' && (
                          <div style={{
                            position: 'absolute',
                            top: '1rem',
                            right: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.25rem',
                            color: '#00D4FF',
                            fontSize: '0.75rem',
                            fontWeight: '600'
                          }}>
                            <Star size={14} fill="#00D4FF" />
                            Primary
                          </div>
                        )}
                        
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                          <div>
                            <h3 style={{ color: '#FFFFFF', fontSize: '1.125rem', marginBottom: '0.5rem', fontFamily: '"Space Mono", monospace' }}>
                              {upi.upi_id}
                            </h3>
                            <p style={{ color: '#94A3B8', fontSize: '0.875rem', textTransform: 'capitalize' }}>
                              {upi.provider}
                            </p>
                          </div>
                          {getStatusBadge(upi.is_verified)}
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {upi.is_verified === 'pending' && (
                            <button
                              onClick={() => handleVerifyUPI(upi.id)}
                              disabled={actionLoading}
                              style={{
                                background: '#10B981',
                                color: '#FFFFFF',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}
                            >
                              Verify
                            </button>
                          )}
                          {upi.is_primary === 'no' && (
                            <button
                              onClick={() => handleSetPrimaryUPI(upi.id)}
                              disabled={actionLoading}
                              style={{
                                background: '#1E293B',
                                color: '#94A3B8',
                                padding: '0.5rem 1rem',
                                borderRadius: '6px',
                                border: 'none',
                                cursor: actionLoading ? 'not-allowed' : 'pointer',
                                fontSize: '0.75rem',
                                fontWeight: '600'
                              }}
                            >
                              Set as Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteUPI(upi.id)}
                            disabled={actionLoading}
                            style={{
                              background: 'transparent',
                              color: '#EF4444',
                              padding: '0.5rem 1rem',
                              borderRadius: '6px',
                              border: '1px solid #EF4444',
                              cursor: actionLoading ? 'not-allowed' : 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: '600',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.25rem'
                            }}
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Settings;
