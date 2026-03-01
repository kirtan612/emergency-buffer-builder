# Emergency Buffer Builder - Backend API

Production-ready FastAPI backend for the Emergency Buffer Builder fintech application.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL 14+
- pip or poetry

### Installation

1. **Create virtual environment**
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. **Install dependencies**
```bash
pip install -r requirements.txt
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your database credentials and secret key
```

4. **Setup database**
```bash
# Create PostgreSQL database
createdb emergency_buffer

# Or using psql
psql -U postgres
CREATE DATABASE emergency_buffer;
\q
```

5. **Run the application**
```bash
python main.py
# Or using uvicorn directly
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

6. **Access API documentation**
- Swagger UI: http://localhost:8000/api/docs
- ReDoc: http://localhost:8000/api/redoc
- Health Check: http://localhost:8000/

## 📁 Project Structure

```
backend/
├── main.py                    # FastAPI application entry point
├── database.py                # Database configuration and session management
├── models.py                  # SQLAlchemy models
├── schemas.py                 # Pydantic schemas for validation
├── auth.py                    # JWT authentication utilities
├── routers/
│   ├── __init__.py           # Router package
│   ├── auth.py               # Authentication endpoints
│   ├── transactions.py       # Transaction CRUD endpoints
│   ├── emergency_fund.py     # Emergency fund management
│   ├── dashboard.py          # Dashboard insights
│   └── chatbot.py            # AI chatbot endpoints
├── services/
│   ├── __init__.py           # Services package
│   ├── finance_logic.py      # Financial calculations
│   └── risk_engine.py        # Risk assessment logic
├── requirements.txt           # Python dependencies
├── .env                       # Environment variables (not in git)
├── .env.example              # Environment template
├── .gitignore                # Git ignore rules
├── API.md                    # Complete API documentation
└── README.md                 # This file
```

## 🗄️ Database Models

### User
- Stores student account information
- Fields: id, name, email, password_hash, monthly_allowance, created_at
- Relationships: transactions, emergency_fund, insights

### Transaction
- Records income and expenses
- Fields: id, user_id, amount, category, description, date, created_at
- Indexed on (user_id, date) for performance

### EmergencyFund
- Manages emergency savings vault
- Fields: user_id (PK), total_amount, locked_until
- One-to-one with User

### Insight
- Stores calculated financial metrics
- Fields: id, user_id, avg_daily_spending, survival_days, risk_level, calculated_at
- Updated after each transaction

## 🔐 Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/emergency_buffer

# JWT Authentication
SECRET_KEY=your-super-secret-key-here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080  # 7 days

# CORS
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Application
APP_NAME=Emergency Buffer Builder
APP_VERSION=1.0.0
DEBUG=True
```

## 🛠️ Development

### Database Migrations (Alembic)

```bash
# Initialize Alembic (first time only)
alembic init alembic

# Create a new migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

## 📊 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login and get JWT token

### Transactions
- `GET /api/v1/transactions` - Get user transactions (with limit)
- `POST /api/v1/transactions` - Add new transaction
- `DELETE /api/v1/transactions/{id}` - Delete transaction

### Emergency Fund
- `GET /api/v1/emergency-fund` - Get fund details with survival days
- `POST /api/v1/emergency-fund/deposit` - Deposit money (with optional lock)
- `POST /api/v1/emergency-fund/withdraw` - Withdraw from fund

### Dashboard
- `GET /api/v1/dashboard/insights` - Get comprehensive financial insights

### Chatbot
- `POST /api/v1/chatbot/message` - Send message to AI financial advisor

See [API.md](./API.md) for complete documentation with request/response examples.

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- SQL injection prevention via SQLAlchemy ORM
- CORS configuration
- Environment-based secrets
- Async database operations

## 🚀 Production Deployment

### Using Docker

```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### Using Gunicorn + Uvicorn

```bash
pip install gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

## 📝 License

MIT License - Built for students, by developers who care about financial literacy.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub or contact the development team.
