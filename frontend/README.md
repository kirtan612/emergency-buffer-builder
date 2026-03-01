# Emergency Buffer Builder - Frontend

A dark luxury fintech app for students to build their emergency fund.

## 🎨 Design Philosophy: Vault Noir

Dark, trustworthy, modern, and student-friendly interface with a premium feel.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📦 Dependencies

- **react-router-dom** - Client-side routing
- **axios** - HTTP client for API calls
- **react-icons** - Icon library
- **@tanstack/react-query** - Data fetching and caching

## 🎨 Theme Variables (Vault Noir)

```css
--bg-primary: #0A0F1E
--bg-surface: #111827
--bg-card: #1F2937
--accent-cyan: #00D4FF
--accent-emerald: #10B981
--warning: #F59E0B
--critical: #EF4444
--text-primary: #F9FAFB
--text-muted: #6B7280
--border: #374151
```

## 🔤 Typography

- **Display**: DM Serif Display (headings)
- **Body**: Outfit (main text)
- **Mono**: Space Mono (numbers, code)

## 🛣️ Routes

- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard (protected)
- `/add-transaction` - Add income/expense (protected)
- `/emergency-fund` - Emergency fund tracker (protected)
- `/chatbot` - Financial assistant (protected)

## 🔐 Authentication

JWT tokens stored in localStorage. Protected routes redirect to `/login` if not authenticated.

## 🏗️ Project Structure

```
src/
├── components/
│   ├── ErrorBoundary.jsx
│   └── ProtectedRoute.jsx
├── context/
│   └── AuthContext.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── AddTransaction.jsx
│   ├── EmergencyFund.jsx
│   └── Chatbot.jsx
├── App.jsx
├── main.jsx
└── index.css
```

## 🛡️ Features

- Error boundaries for graceful error handling
- Protected routes with authentication
- React Query for efficient data fetching
- Dark-themed custom scrollbars
- Responsive design ready
- Production-ready configuration
