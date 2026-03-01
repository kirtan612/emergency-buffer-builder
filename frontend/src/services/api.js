import axios from 'axios';

/**
 * Base API URL from environment variables
 * Defaults to localhost:8000 if not set
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

/**
 * Axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to attach Bearer token to all requests
 */
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor to handle 401 errors (unauthorized)
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear authentication data
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
      
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================
// AUTH API FUNCTIONS
// ============================================

/**
 * Register a new user account
 * @param {string} name - User's full name
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @param {number} monthly_allowance - User's monthly allowance/budget
 * @returns {Promise<{access_token: string, user: object}>} Access token and user data
 * @throws {Error} Registration failed error
 */
export const register = async (name, email, password, monthly_allowance) => {
  try {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      monthly_allowance,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Registration failed. Please try again.';
    throw new Error(message);
  }
};

/**
 * Login with email and password
 * @param {string} email - User's email address
 * @param {string} password - User's password
 * @returns {Promise<{access_token: string, user: object}>} Access token and user data
 * @throws {Error} Login failed error
 */
export const login = async (email, password) => {
  try {
    const response = await apiClient.post('/auth/login', {
      email,
      password,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Login failed. Please check your credentials.';
    throw new Error(message);
  }
};

// ============================================
// TRANSACTION API FUNCTIONS
// ============================================

/**
 * Get user's transaction history
 * @param {number} limit - Maximum number of transactions to retrieve (default: 50)
 * @returns {Promise<Array>} Array of transaction objects
 * @throws {Error} Failed to fetch transactions error
 */
export const getTransactions = async (limit = 50) => {
  try {
    const response = await apiClient.get('/transactions', {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch transactions.';
    throw new Error(message);
  }
};

/**
 * Add a new transaction (income or expense)
 * @param {object} transactionData - Transaction details
 * @param {number} transactionData.amount - Transaction amount (positive for income, negative for expense)
 * @param {string} transactionData.category - Transaction category
 * @param {string} transactionData.description - Transaction description
 * @param {string} transactionData.date - Transaction date (ISO format)
 * @returns {Promise<object>} Created transaction object
 * @throws {Error} Failed to add transaction error
 */
export const addTransaction = async ({ amount, category, description, date }) => {
  try {
    const response = await apiClient.post('/transactions', {
      amount,
      category,
      description,
      date,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to add transaction.';
    throw new Error(message);
  }
};

/**
 * Delete a transaction by ID
 * @param {string|number} id - Transaction ID to delete
 * @returns {Promise<object>} Deletion confirmation
 * @throws {Error} Failed to delete transaction error
 */
export const deleteTransaction = async (id) => {
  try {
    const response = await apiClient.delete(`/transactions/${id}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to delete transaction.';
    throw new Error(message);
  }
};

// ============================================
// DASHBOARD API FUNCTIONS
// ============================================

/**
 * Get dashboard insights and analytics
 * @returns {Promise<object>} Dashboard data including:
 *   - avg_daily_spending: Average daily spending amount
 *   - survival_days: Number of days user can survive with current balance
 *   - risk_level: Risk level (safe/warning/critical)
 *   - total_30d_spending: Total spending in last 30 days
 *   - emergency_fund: Current emergency fund balance
 *   - recent_transactions: Last 5 transactions
 *   - fund_progress_percent: Progress toward 3-month emergency fund goal
 * @throws {Error} Failed to fetch dashboard insights error
 */
export const getDashboardInsights = async () => {
  try {
    const response = await apiClient.get('/dashboard');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch dashboard insights.';
    throw new Error(message);
  }
};

// ============================================
// EMERGENCY FUND API FUNCTIONS
// ============================================

/**
 * Get emergency fund details and balance
 * @returns {Promise<object>} Emergency fund data including balance, goal, and progress
 * @throws {Error} Failed to fetch emergency fund error
 */
export const getEmergencyFund = async () => {
  try {
    const response = await apiClient.get('/emergency-fund');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch emergency fund data.';
    throw new Error(message);
  }
};

/**
 * Add money to emergency fund
 * @param {number} amount - Amount to add to emergency fund
 * @param {number} lock_days - Optional number of days to lock the fund (0-90)
 * @returns {Promise<object>} Updated emergency fund data
 * @throws {Error} Failed to add to emergency fund error
 */
export const addToEmergencyFund = async (amount, lock_days = null) => {
  try {
    const payload = { amount };
    if (lock_days !== null) {
      payload.lock_days = lock_days;
    }
    const response = await apiClient.post('/emergency-fund/deposit', payload);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to add to emergency fund.';
    throw new Error(message);
  }
};

/**
 * Withdraw money from emergency fund
 * @param {number} amount - Amount to withdraw from emergency fund
 * @returns {Promise<object>} Updated emergency fund data
 * @throws {Error} Failed to withdraw from emergency fund error
 */
export const withdrawFromEmergencyFund = async (amount) => {
  try {
    const response = await apiClient.post('/emergency-fund/withdraw', {
      amount,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to withdraw from emergency fund.';
    throw new Error(message);
  }
};

// ============================================
// CHATBOT API FUNCTIONS
// ============================================

/**
 * Send a message to the financial assistant chatbot
 * @param {string} message - User's message to the chatbot
 * @returns {Promise<object>} Chatbot response including:
 *   - reply: Chatbot's text response
 *   - context: Additional context or data
 * @throws {Error} Failed to send chat message error
 */
export const sendChatMessage = async (message) => {
  try {
    const response = await apiClient.post('/chatbot/message', {
      message,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to send message to chatbot.';
    throw new Error(message);
  }
};

// ============================================
// BANK ACCOUNT API FUNCTIONS
// ============================================

/**
 * Get all bank accounts for the current user
 * @returns {Promise<Array>} Array of bank account objects
 */
export const getBankAccounts = async () => {
  try {
    const response = await apiClient.get('/bank-accounts');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch bank accounts.';
    throw new Error(message);
  }
};

/**
 * Add a new bank account
 * @param {object} accountData - Bank account details
 * @returns {Promise<object>} Created bank account
 */
export const addBankAccount = async (accountData) => {
  try {
    const response = await apiClient.post('/bank-accounts', accountData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to add bank account.';
    throw new Error(message);
  }
};

/**
 * Verify a bank account
 * @param {string} accountId - Bank account ID
 * @returns {Promise<object>} Verified bank account
 */
export const verifyBankAccount = async (accountId) => {
  try {
    const response = await apiClient.post(`/bank-accounts/${accountId}/verify`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to verify bank account.';
    throw new Error(message);
  }
};

/**
 * Set a bank account as primary
 * @param {string} accountId - Bank account ID
 * @returns {Promise<object>} Success message
 */
export const setPrimaryBankAccount = async (accountId) => {
  try {
    const response = await apiClient.post(`/bank-accounts/${accountId}/set-primary`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to set primary account.';
    throw new Error(message);
  }
};

/**
 * Delete a bank account
 * @param {string} accountId - Bank account ID
 * @returns {Promise<object>} Success message
 */
export const deleteBankAccount = async (accountId) => {
  try {
    const response = await apiClient.delete(`/bank-accounts/${accountId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to delete bank account.';
    throw new Error(message);
  }
};

// ============================================
// UPI API FUNCTIONS
// ============================================

/**
 * Get all UPI IDs for the current user
 * @returns {Promise<Array>} Array of UPI ID objects
 */
export const getUPIIds = async () => {
  try {
    const response = await apiClient.get('/upi');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch UPI IDs.';
    throw new Error(message);
  }
};

/**
 * Add a new UPI ID
 * @param {object} upiData - UPI ID details
 * @returns {Promise<object>} Created UPI ID
 */
export const addUPIId = async (upiData) => {
  try {
    const response = await apiClient.post('/upi', upiData);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to add UPI ID.';
    throw new Error(message);
  }
};

/**
 * Verify a UPI ID
 * @param {string} upiId - UPI ID
 * @returns {Promise<object>} Verified UPI ID
 */
export const verifyUPIId = async (upiId) => {
  try {
    const response = await apiClient.post(`/upi/${upiId}/verify`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to verify UPI ID.';
    throw new Error(message);
  }
};

/**
 * Set a UPI ID as primary
 * @param {string} upiId - UPI ID
 * @returns {Promise<object>} Success message
 */
export const setPrimaryUPIId = async (upiId) => {
  try {
    const response = await apiClient.post(`/upi/${upiId}/set-primary`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to set primary UPI.';
    throw new Error(message);
  }
};

/**
 * Delete a UPI ID
 * @param {string} upiId - UPI ID
 * @returns {Promise<object>} Success message
 */
export const deleteUPIId = async (upiId) => {
  try {
    const response = await apiClient.delete(`/upi/${upiId}`);
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to delete UPI ID.';
    throw new Error(message);
  }
};

// ============================================
// WALLET API FUNCTIONS
// ============================================

/**
 * Get company UPI ID for deposits
 * @returns {Promise<object>} Company UPI details and instructions
 */
export const getCompanyUPI = async () => {
  try {
    const response = await apiClient.get('/wallet/company-upi');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch company UPI.';
    throw new Error(message);
  }
};

/**
 * Request deposit to wallet
 * @param {number} amount - Amount to deposit
 * @param {string} upi_reference - UPI transaction reference
 * @returns {Promise<object>} Deposit request confirmation
 */
export const requestDeposit = async (amount, upi_reference) => {
  try {
    const response = await apiClient.post('/wallet/deposit/request', {
      amount,
      upi_reference,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to request deposit.';
    throw new Error(message);
  }
};

/**
 * Request withdrawal from wallet
 * @param {number} amount - Amount to withdraw
 * @param {string} upi_id - UPI ID (UUID) to withdraw to
 * @returns {Promise<object>} Withdrawal request confirmation
 */
export const requestWithdrawal = async (amount, upi_id) => {
  try {
    const response = await apiClient.post('/wallet/withdraw/request', {
      amount,
      upi_id,
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to request withdrawal.';
    throw new Error(message);
  }
};

/**
 * Get wallet transaction history
 * @param {number} limit - Maximum number of transactions
 * @param {number} offset - Pagination offset
 * @returns {Promise<object>} Transaction history
 */
export const getWalletTransactions = async (limit = 50, offset = 0) => {
  try {
    const response = await apiClient.get('/wallet/transactions', {
      params: { limit, offset },
    });
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch wallet transactions.';
    throw new Error(message);
  }
};

/**
 * Get pending wallet requests
 * @returns {Promise<object>} Pending deposits and withdrawals
 */
export const getPendingWalletRequests = async () => {
  try {
    const response = await apiClient.get('/wallet/pending');
    return response.data;
  } catch (error) {
    const message = error.response?.data?.detail || 'Failed to fetch pending requests.';
    throw new Error(message);
  }
};

// ============================================
// DEFAULT EXPORT - API OBJECT
// ============================================

/**
 * Default export containing all API functions
 */
const api = {
  // Auth
  register,
  login,
  
  // Transactions
  getTransactions,
  addTransaction,
  deleteTransaction,
  
  // Dashboard
  getDashboardInsights,
  
  // Emergency Fund
  getEmergencyFund,
  addToEmergencyFund,
  withdrawFromEmergencyFund,
  
  // Chatbot
  sendChatMessage,
  
  // Bank Accounts
  getBankAccounts,
  addBankAccount,
  verifyBankAccount,
  setPrimaryBankAccount,
  deleteBankAccount,
  
  // UPI
  getUPIIds,
  addUPIId,
  verifyUPIId,
  setPrimaryUPIId,
  deleteUPIId,
  
  // Wallet
  getCompanyUPI,
  requestDeposit,
  requestWithdrawal,
  getWalletTransactions,
  getPendingWalletRequests,
};

export default api;
