# API Service Layer Documentation

Complete API service layer for Emergency Buffer Builder fintech app.

## Configuration

The API base URL is configured via environment variable:
```
VITE_API_URL=http://localhost:8000
```

Default: `http://localhost:8000`

## Features

### Axios Instance
- ✅ 10-second timeout
- ✅ Automatic Bearer token attachment from localStorage
- ✅ Auto-redirect to /login on 401 (unauthorized)
- ✅ JSON content-type headers

### Request Interceptor
Automatically attaches JWT token to all requests:
```javascript
Authorization: Bearer <token>
```

### Response Interceptor
Handles 401 errors by:
1. Clearing localStorage (authToken, authUser)
2. Redirecting to /login page

## API Functions

### Auth API

#### `register(name, email, password, monthly_allowance)`
Register a new user account.

**Parameters:**
- `name` (string) - User's full name
- `email` (string) - User's email address
- `password` (string) - User's password
- `monthly_allowance` (number) - User's monthly budget

**Returns:** `{ access_token, user }`

**Example:**
```javascript
import { register } from './services/api';

const data = await register('John Doe', 'john@example.com', 'password123', 5000);
```

#### `login(email, password)`
Login with email and password.

**Parameters:**
- `email` (string) - User's email
- `password` (string) - User's password

**Returns:** `{ access_token, user }`

**Example:**
```javascript
import { login } from './services/api';

const data = await login('john@example.com', 'password123');
```

---

### Transaction API

#### `getTransactions(limit = 50)`
Get user's transaction history.

**Parameters:**
- `limit` (number, optional) - Max transactions to retrieve (default: 50)

**Returns:** Array of transaction objects

**Example:**
```javascript
import { getTransactions } from './services/api';

const transactions = await getTransactions(100);
```

#### `addTransaction({ amount, category, description, date })`
Add a new transaction (income or expense).

**Parameters:**
- `amount` (number) - Transaction amount (positive for income, negative for expense)
- `category` (string) - Transaction category
- `description` (string) - Transaction description
- `date` (string) - Transaction date (ISO format)

**Returns:** Created transaction object

**Example:**
```javascript
import { addTransaction } from './services/api';

const transaction = await addTransaction({
  amount: -45.50,
  category: 'Food',
  description: 'Lunch at cafe',
  date: '2024-02-24T12:00:00Z'
});
```

#### `deleteTransaction(id)`
Delete a transaction by ID.

**Parameters:**
- `id` (string|number) - Transaction ID

**Returns:** Deletion confirmation

**Example:**
```javascript
import { deleteTransaction } from './services/api';

await deleteTransaction(123);
```

---

### Dashboard API

#### `getDashboardInsights()`
Get dashboard insights and analytics.

**Returns:** Object containing:
- `avg_daily_spending` - Average daily spending
- `survival_days` - Days user can survive with current balance
- `risk_level` - Risk level (safe/warning/critical)
- `total_30d` - Total spending in last 30 days
- `emergency_fund` - Current emergency fund balance

**Example:**
```javascript
import { getDashboardInsights } from './services/api';

const insights = await getDashboardInsights();
console.log(insights.survival_days); // 45
console.log(insights.risk_level); // "safe"
```

---

### Emergency Fund API

#### `getEmergencyFund()`
Get emergency fund details and balance.

**Returns:** Emergency fund data (balance, goal, progress)

**Example:**
```javascript
import { getEmergencyFund } from './services/api';

const fund = await getEmergencyFund();
```

#### `addToEmergencyFund(amount)`
Add money to emergency fund.

**Parameters:**
- `amount` (number) - Amount to add

**Returns:** Updated emergency fund data

**Example:**
```javascript
import { addToEmergencyFund } from './services/api';

const updated = await addToEmergencyFund(500);
```

#### `withdrawFromEmergencyFund(amount)`
Withdraw money from emergency fund.

**Parameters:**
- `amount` (number) - Amount to withdraw

**Returns:** Updated emergency fund data

**Example:**
```javascript
import { withdrawFromEmergencyFund } from './services/api';

const updated = await withdrawFromEmergencyFund(200);
```

---

### Chatbot API

#### `sendChatMessage(message)`
Send a message to the financial assistant chatbot.

**Parameters:**
- `message` (string) - User's message

**Returns:** Object containing:
- `reply` - Chatbot's text response
- `context` - Additional context or data

**Example:**
```javascript
import { sendChatMessage } from './services/api';

const response = await sendChatMessage('How much can I spend today?');
console.log(response.reply);
```

---

## Usage Patterns

### Named Imports (Recommended)
```javascript
import { login, getTransactions, getDashboardInsights } from './services/api';

const data = await login(email, password);
const transactions = await getTransactions();
```

### Default Import
```javascript
import api from './services/api';

const data = await api.login(email, password);
const transactions = await api.getTransactions();
```

### With React Query
```javascript
import { useQuery } from '@tanstack/react-query';
import { getDashboardInsights } from './services/api';

function Dashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardInsights,
  });
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return <div>Survival Days: {data.survival_days}</div>;
}
```

### Error Handling
All functions throw errors with meaningful messages:

```javascript
try {
  await login(email, password);
} catch (error) {
  console.error(error.message); // "Login failed. Please check your credentials."
}
```

## Error Messages

- **Auth:** "Registration failed", "Login failed. Please check your credentials."
- **Transactions:** "Failed to fetch transactions", "Failed to add transaction", "Failed to delete transaction"
- **Dashboard:** "Failed to fetch dashboard insights"
- **Emergency Fund:** "Failed to fetch emergency fund data", "Failed to add to emergency fund", "Failed to withdraw from emergency fund"
- **Chatbot:** "Failed to send message to chatbot"

## Security

- ✅ JWT tokens stored in localStorage
- ✅ Automatic token attachment to requests
- ✅ Auto-logout on 401 errors
- ✅ 10-second timeout prevents hanging requests
- ✅ HTTPS recommended for production
