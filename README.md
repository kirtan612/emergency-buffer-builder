# Emergency Buffer Builder 

A comprehensive financial management application for students to track expenses, build emergency funds, and receive AI-powered financial advice.

##  Features

- **Transaction Tracking**: Track income and expenses across 10 categories
- **Emergency Fund Management**: Build and manage your financial safety net with optional lock periods
- **Real-time Insights**: Automatic calculation of survival days and risk levels
- **Smart Chatbot**: Rule-based financial advisor with behavioral finance principles
- **Dashboard Analytics**: Comprehensive overview with spending trends and category breakdowns
- **Risk Assessment**: Critical/Warning/Safe levels based on your financial health

##  Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Python** 3.11+ ([Download](https://www.python.org/downloads/))
- **PostgreSQL** 15+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/downloads))

### Verify Installation

```bash
node --version    # Should be 18.x or higher
python --version  # Should be 3.11.x or higher
psql --version    # Should be 15.x or higher
```

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd emergency-buffer-builder
```

### 2. Setup Database

**Option A: Using psql command**
```bash
psql -h localhost -U postgres -f setup-database.sql
```

**Option B: Manual setup**
```bash
psql -h localhost -U postgres
CREATE DATABASE emergency_buffer;
\q
```

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/emergency_buffer
SECRET_KEY=emergency-buffer-super-secret-key-change-in-production-2024
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 4. Install Dependencies

**Backend:**
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
cd ..
```

**Frontend:**
```bash
cd frontend
npm install
cd ..
```

### 5. Start Development Servers



**Option B: Manual start**

Terminal 1 (Backend):
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Terminal 2 (Frontend):
```bash
cd frontend
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/api/docs
- **Alternative Docs**: http://localhost:8000/api/redoc

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/auth/register` | Register new user | No |
| POST | `/api/v1/auth/login` | Login user | No |
| GET | `/api/v1/auth/me` | Get current user profile | Yes |
| PUT | `/api/v1/auth/me` | Update user profile | Yes |
| POST | `/api/v1/auth/logout` | Logout user | Yes |

### Transactions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/transactions` | Get transactions (with filters) | Yes |
| POST | `/api/v1/transactions` | Create transaction | Yes |
| DELETE | `/api/v1/transactions/{id}` | Delete transaction | Yes |
| GET | `/api/v1/transactions/categories/summary` | Get spending by category | Yes |

### Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/dashboard` | Get dashboard overview | Yes |
| GET | `/api/v1/dashboard/trends` | Get spending trends | Yes |

### Emergency Fund
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/v1/emergency-fund` | Get fund status | Yes |
| POST | `/api/v1/emergency-fund/deposit` | Deposit to fund | Yes |
| POST | `/api/v1/emergency-fund/withdraw` | Withdraw from fund | Yes |

### Chatbot
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/v1/chatbot/message` | Send message to chatbot | Yes |
| GET | `/api/v1/chatbot/suggestions` | Get initial suggestions | Yes |

## 🔧 Environment Variables Reference

### Backend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | - | Yes |
| `SECRET_KEY` | JWT secret key | - | Yes |
| `ALGORITHM` | JWT algorithm | HS256 | No |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiry (minutes) | 10080 (7 days) | No |
| `ALLOWED_ORIGINS` | CORS allowed origins | - | Yes |
| `APP_NAME` | Application name | Emergency Buffer Builder | No |
| `APP_VERSION` | Application version | 1.0.0 | No |
| `DEBUG` | Debug mode | True | No |

### Frontend Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `VITE_API_URL` | Backend API base URL | - | Yes |
| `VITE_APP_NAME` | Application name | Emergency Buffer Builder | No |
| `VITE_APP_VERSION` | Application version | 1.0.0 | No |

##  Project Structure

```
emergency-buffer-builder/
├── backend/
│   ├── routers/           # API endpoints
│   │   ├── auth.py
│   │   ├── transactions.py
│   │   ├── dashboard.py
│   │   ├── emergency_fund.py
│   │   └── chatbot.py
│   ├── services/          # Business logic
│   │   ├── finance_logic.py
│   │   ├── risk_engine.py
│   │   └── chat_engine.py
│   ├── models.py          # Database models
│   ├── schemas.py         # Pydantic schemas
│   ├── auth.py            # JWT utilities
│   ├── database.py        # Database config
│   ├── main.py            # FastAPI app
│   ├── requirements.txt   # Python dependencies
│   └── .env               # Environment variables
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── context/       # React context
│   │   ├── App.jsx        # Main app component
│   │   └── main.jsx       # Entry point
│   ├── package.json       # Node dependencies
│   └── .env               # Environment variables
├── run-dev.sh             # Startup script (Unix)
├── run-dev.bat            # Startup script (Windows)
├── setup-database.sql     # Database setup
└── README.md              # This file
```

##  Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run all tests
python test_api.py

# Test chatbot
python test_chatbot.py
```

### Frontend Tests

```bash
cd frontend
npm run test
```


##  Common Issues & Solutions

### Issue: CORS Error

**Symptom**: Frontend can't connect to backend, CORS errors in browser console

**Solution**:
1. Check `ALLOWED_ORIGINS` in `backend/.env` includes your frontend URL
2. Restart backend server after changing `.env`
3. Clear browser cache

```env
# backend/.env
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Issue: 401 Unauthorized

**Symptom**: API returns 401 errors, "Could not validate credentials"

**Solution**:
1. Token expired (7 days) - Login again
2. Token invalid - Clear localStorage and login
3. SECRET_KEY changed - All users need to re-login

```javascript
// Clear token in browser console
localStorage.removeItem('token');
// Then login again
```

### Issue: Database Connection Failed

**Symptom**: Backend crashes with "could not connect to server"

**Solution**:
1. Check PostgreSQL is running:
   ```bash
   # Check status
   pg_isready -h localhost -p 5432
   
   # Start PostgreSQL
   # macOS: brew services start postgresql
   # Linux: sudo systemctl start postgresql
   # Windows: Start from Services
   ```

2. Verify DATABASE_URL in `backend/.env`:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres:password@localhost:5432/emergency_buffer
   ```

3. Check database exists:
   ```bash
   psql -h localhost -U postgres -l | grep emergency_buffer
   ```

### Issue: Module Not Found

**Symptom**: Python import errors or npm module errors

**Solution**:

Backend:
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

Frontend:
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Issue: Port Already in Use

**Symptom**: "Address already in use" error

**Solution**:

Windows:
```bash
# Find process on port 8000
netstat -ano | findstr :8000
# Kill process
taskkill /PID <PID> /F

# Find process on port 5173
netstat -ano | findstr :5173
taskkill /PID <PID> /F
```

macOS/Linux:
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Issue: JWT Token Errors

**Symptom**: "Invalid token" or "Token has expired"

**Solution**:
1. Tokens expire after 7 days - Login again
2. If SECRET_KEY changed, all tokens are invalid
3. Clear localStorage and re-login:

```javascript
// In browser console
localStorage.clear();
window.location.href = '/login';
```

##  Security Notes

### Development
- Default SECRET_KEY is for development only
- DEBUG mode is enabled
- CORS allows localhost origins

### Production
1. **Change SECRET_KEY**: Generate a secure key
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Set DEBUG=False** in backend/.env

3. **Update ALLOWED_ORIGINS** to production domains

4. **Use HTTPS** for all connections

5. **Implement rate limiting** (see `backend/routers/auth.py` comments)

6. **Setup token blacklist** for logout (see `backend/AUTH_SYSTEM.md`)


```

### Frontend (React + Vite)

**Build for production:**
```bash
cd frontend
npm run build
```



##  License

MIT License - Built for students learning financial literacy.

##  Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

##  Support

### Contact Information
- **Founder**: Kirtan Jogani
- **Email**: kirtanjogani3@gmail.com
- **Phone**: +91-9374134341



##  Learning Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [JWT.io](https://jwt.io/) - JWT debugger

---

Built by Kirtan Jogani for students learning financial literacy.

**Emergency Buffer Builder** - Your Financial Safety Net  
Contact: kirtanjogani3@gmail.com | +91-9374134341
