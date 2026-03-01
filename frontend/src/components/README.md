# Shared Components Documentation

Reusable UI components for Emergency Buffer Builder with Vault Noir design system.

## Design System: Vault Noir

### Colors
- Background: `#0A0F1E`
- Surface: `#111827`
- Card: `#1F2937`
- Border: `#374151`
- Accent (Cyan): `#00D4FF`
- Emerald (Safe): `#10B981`
- Warning: `#F59E0B`
- Critical: `#EF4444`

### Typography
- **Display Font**: DM Serif Display (headings)
- **Body Font**: Outfit (UI text)
- **Mono Font**: Space Mono (numbers, amounts)

---

## Components

### 1. StatCard

Display key statistics with icon and accent color glow.

**Props:**
- `title` (string) - Card title/label
- `value` (string|number) - Main statistic value
- `subtitle` (string) - Additional context text
- `icon` (Component) - Lucide icon component
- `accentColor` (string) - Hex color for border glow (default: #00D4FF)
- `isLoading` (boolean) - Show loading skeleton (default: false)

**Features:**
- ✅ Hover lift animation (translateY -4px)
- ✅ Border glow matching accent color
- ✅ Space Mono font for numeric values
- ✅ Loading skeleton state

**Example:**
```jsx
import { StatCard } from './components';
import { DollarSign } from 'lucide-react';

<StatCard
  title="Emergency Fund"
  value="$2,450.00"
  subtitle="67% of goal"
  icon={DollarSign}
  accentColor="#10B981"
  isLoading={false}
/>
```

---

### 2. RiskBadge

Display risk level with color-coded badge and pulsing animation.

**Props:**
- `level` (string) - Risk level: "safe" | "warning" | "critical"

**Features:**
- ✅ Color-coded: Safe (emerald), Warning (amber), Critical (red)
- ✅ Pulsing dot animation for critical level
- ✅ Icons: ✓ Safe, ⚠ Warning, 🔴 Critical
- ✅ Pill-shaped badge design

**Example:**
```jsx
import { RiskBadge } from './components';

<RiskBadge level="safe" />
<RiskBadge level="warning" />
<RiskBadge level="critical" />
```

---

### 3. Navbar

Fixed top navigation with logo, links, and user menu.

**Features:**
- ✅ Fixed top positioning
- ✅ Logo: 🛡️ Buffer
- ✅ Nav links: Dashboard, Transactions, Emergency Fund, Chatbot
- ✅ Active link highlighted with cyan underline
- ✅ User avatar dropdown with logout
- ✅ Mobile hamburger menu (responsive)
- ✅ Integrates with useAuth() hook

**Example:**
```jsx
import { Navbar } from './components';

function App() {
  return (
    <>
      <Navbar />
      {/* Your page content */}
    </>
  );
}
```

**Note:** Navbar automatically handles:
- Active route highlighting
- User authentication state
- Logout functionality
- Mobile responsiveness

---

### 4. ProtectedRoute

HOC that checks authentication before rendering children.

**Props:**
- `children` (ReactNode) - Components to render if authenticated

**Features:**
- ✅ Checks useAuth() for token
- ✅ Redirects to /login if not authenticated
- ✅ Shows centered spinner while loading
- ✅ Automatic auth state management

**Example:**
```jsx
import { ProtectedRoute } from './components';
import Dashboard from './pages/Dashboard';

<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

### 5. LoadingSpinner

Elegant rotating ring spinner in cyan.

**Props:**
- `size` (string) - Spinner size: "sm" | "md" | "lg" (default: "md")
- `color` (string) - Spinner color (default: #00D4FF)

**Sizes:**
- `sm`: 24px × 24px
- `md`: 40px × 40px
- `lg`: 64px × 64px

**Example:**
```jsx
import { LoadingSpinner } from './components';

<LoadingSpinner size="sm" />
<LoadingSpinner size="md" color="#10B981" />
<LoadingSpinner size="lg" />
```

---

### 6. EmptyState

Centered empty state with illustration and call-to-action.

**Props:**
- `icon` (Component) - Lucide icon component
- `title` (string) - Empty state title
- `message` (string) - Empty state description
- `actionLabel` (string) - CTA button label
- `onAction` (function) - CTA button click handler

**Features:**
- ✅ Dashed border container
- ✅ Centered layout
- ✅ Icon with circular background
- ✅ Call-to-action button with hover effect

**Example:**
```jsx
import { EmptyState } from './components';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={Inbox}
  title="No transactions yet"
  message="Start tracking your spending by adding your first transaction."
  actionLabel="Add Transaction"
  onAction={() => navigate('/add-transaction')}
/>
```

---

### 7. ErrorBoundary

React error boundary for graceful error handling.

**Features:**
- ✅ Catches JavaScript errors in component tree
- ✅ Displays user-friendly error message
- ✅ "Return to Home" button
- ✅ Logs errors to console

**Example:**
```jsx
import { ErrorBoundary } from './components';

<ErrorBoundary>
  <App />
</ErrorBoundary>
```

---

## Usage Patterns

### Barrel Import (Recommended)
```jsx
import { 
  StatCard, 
  RiskBadge, 
  Navbar, 
  LoadingSpinner,
  EmptyState 
} from './components';
```

### Individual Import
```jsx
import StatCard from './components/StatCard';
import RiskBadge from './components/RiskBadge';
```

---

## Styling Approach

All components use **inline styles** (no Tailwind, no CSS modules) to ensure:
- ✅ Zero external dependencies
- ✅ Consistent Vault Noir theme
- ✅ Easy customization via props
- ✅ No style conflicts

---

## Icons

All components use **Lucide React** icons:
```bash
npm install lucide-react
```

Common icons used:
- `Shield` - Logo
- `DollarSign`, `TrendingUp`, `Calendar` - Stats
- `CheckCircle`, `AlertTriangle`, `AlertCircle` - Risk badges
- `LayoutDashboard`, `ArrowLeftRight`, `Wallet`, `MessageCircle` - Navigation
- `Menu`, `X`, `LogOut`, `User` - UI controls

---

## Animation Keyframes

Components include CSS animations:
- `shimmer` - Loading skeleton animation
- `pulse-dot` - Pulsing dot for critical risk
- `spin` - Rotating spinner

All animations are defined inline with `<style>` tags for portability.

---

## Responsive Design

- **Navbar**: Hamburger menu on mobile (<768px)
- **StatCard**: Flexible width, works in grid layouts
- **EmptyState**: Max-width constraint with padding
- All components: Touch-friendly tap targets (min 44px)

---

## Accessibility

- ✅ Semantic HTML elements
- ✅ Keyboard navigation support
- ✅ Focus states on interactive elements
- ✅ ARIA labels where appropriate
- ✅ Color contrast meets WCAG AA standards

---

## Performance

- ✅ Minimal re-renders with React.memo where needed
- ✅ CSS animations use GPU-accelerated properties
- ✅ No heavy dependencies
- ✅ Lazy loading compatible

---

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
