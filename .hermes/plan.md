# DineFlow: 70% → 85% Production Hardening Plan (JS-Only)

> **Constraint**: All existing `.js` files remain JavaScript — no TypeScript migration.  
> **Target**: +15 points across 7 categories to hit 85/100  
> **Total**: ~30 file changes across 5 phases

---

## Scoring Breakdown

| Category | Current | Target | Delta | Phase |
|---|---|---|---|---|
| **Security** | 65 | 82 | **+17** | Phase 1 |
| **Backend** | 70 | 83 | **+13** | Phase 2 |
| **Code Quality** | 65 | 78 | **+13** | Phase 3 |
| **Frontend** | 68 | 78 | **+10** | Phase 3 |
| **Design & UX** | 78 | 85 | **+7** | Phase 4 |
| **Architecture** | 75 | 82 | **+7** | Phase 2 |
| **Performance** | 70 | 78 | **+8** | Phase 4 |
| **TOTAL** | **70** | **~85** | **+15** | |

---

## Phase 1 — Security Hardening (+5 pts, blocking)

### 1.1 Helmet.js — Security Headers

**Install**: `npm install helmet` in `backend/`

**MODIFY** [`backend/server.js`](file:///d:/rocky/js/practice/backend/server.js)
- Add `const helmet = require('helmet');`
- Add `app.use(helmet());` before other middleware
- This sets: CSP, X-Frame-Options, X-Content-Type-Options, HSTS, X-DNS-Prefetch-Control, etc.

### 1.2 Restrict CORS

**MODIFY** [`backend/server.js`](file:///d:/rocky/js/practice/backend/server.js)
- Replace `app.use(cors())` with:
```js
const cors = require('cors');
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
```
- Add `CORS_ORIGIN` to [`backend/.env.example`](file:///d:/rocky/js/practice/backend/.env.example)

### 1.3 Rate Limiting

**Install**: `npm install express-rate-limit` in `backend/`

**MODIFY** [`backend/server.js`](file:///d:/rocky/js/practice/backend/server.js)
```js
const rateLimit = require('express-rate-limit');
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 min
  max: 20,                     // 20 attempts per window
  message: { message: 'Too many attempts, try again later' },
});
app.use('/api/auth', authLimiter);
```

Add a general limiter:
```js
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
});
app.use(globalLimiter);
```

### 1.4 Input Validation

**Install**: `npm install express-validator` in `backend/`

**MODIFY** [`backend/routes/auth.js`](file:///d:/rocky/js/practice/backend/routes/auth.js)
- Add validation chains to `POST /register`:
  - `name`: `isLength({ min: 1 })`
  - `email`: `isEmail()`
  - `password`: `isLength({ min: 6 })`
  - `role`: `isIn(['customer', 'staff', 'owner'])`
- Add validation middleware that returns 400 with field errors

**MODIFY** [`backend/routes/orders.js`](file:///d:/rocky/js/practice/backend/routes/orders.js)
- Validate `items` is a non-empty array, `total` is positive number

**MODIFY** [`backend/routes/tables.js`](file:///d:/rocky/js/practice/backend/routes/tables.js)
- Validate `tableNumber`, `capacity` required and numeric

**MODIFY** [`backend/routes/staff.js`](file:///d:/rocky/js/practice/backend/routes/staff.js)
- Validate `email`, `name` required

**NEW** [`backend/middleware/validate.js`](file:///d:/rocky/js/practice/backend/middleware/validate.js)
```js
const { validationResult } = require('express-validator');
module.exports = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() });
  }
  next();
};
```

### 1.5 Standardize Error Responses

**MODIFY** [`backend/middleware/errorHandler.js`](file:///d:/rocky/js/practice/backend/middleware/errorHandler.js)
- Ensure every error response has shape `{ message, errors?, status }`
- Remove the `res.status(444)` anomaly in auth.js

### 1.6 Audit All Routes for Auth

**VERIFY** each backend route:
- `GET /restaurants` — public ✓
- `GET /restaurants/:id/menu` — public ✓  
- `POST /register`, `POST /login` — public ✓
- All mutation routes — require auth ✓
- `GET /tables` — requires auth ✓ (no anonymous browsing)

---

## Phase 2 — Backend Architecture (+6 pts)

### 2.1 Extract Service Layer

Creates separation between HTTP handling and business logic.

**NEW** [`backend/services/authService.js`](file:///d:/rocky/js/practice/backend/services/authService.js)
- Move: user lookup, password hashing, JWT signing, wallet topup logic
- Functions: `registerUser()`, `loginUser()`, `topUpWallet()`, `updateProfile()`

**NEW** [`backend/services/orderService.js`](file:///d:/rocky/js/practice/backend/services/orderService.js)
- Move: order creation with wallet deduction, order querying with scoping

**NEW** [`backend/services/restaurantService.js`](file:///d:/rocky/js/practice/backend/services/restaurantService.js)
- Move: restaurant CRUD, menu item management

**MODIFY** Routes to call services instead of inline logic:
- [`backend/routes/auth.js`](file:///d:/rocky/js/practice/backend/routes/auth.js) → 50% smaller
- [`backend/routes/orders.js`](file:///d:/rocky/js/practice/backend/routes/orders.js) → 40% smaller
- [`backend/routes/restaurants.js`](file:///d:/rocky/js/practice/backend/routes/restaurants.js) → 40% smaller

### 2.2 Add Pagination to List Endpoints

**MODIFY** [`backend/routes/orders.js`](file:///d:/rocky/js/practice/backend/routes/orders.js)
```js
const page = parseInt(req.query.page) || 1;
const limit = parseInt(req.query.limit) || 20;
const skip = (page - 1) * limit;
const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
const total = await Order.countDocuments(query);
res.json({ data: orders, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
```

Apply same pattern to:
- [`backend/routes/reservations.js`](file:///d:/rocky/js/practice/backend/routes/reservations.js)
- [`backend/routes/tables.js`](file:///d:/rocky/js/practice/backend/routes/tables.js)
- [`backend/routes/staff.js`](file:///d:/rocky/js/practice/backend/routes/staff.js)

### 2.3 Docker Setup

**NEW** [`Dockerfile.backend`](file:///d:/rocky/js/practice/Dockerfile.backend)
**NEW** [`Dockerfile.frontend`](file:///d:/rocky/js/practice/Dockerfile.frontend)
**NEW** [`docker-compose.yml`](file:///d:/rocky/js/practice/docker-compose.yml)
- Services: backend, frontend, mongodb
- Environment variables wired through docker-compose

### 2.4 Environment Validation

**NEW** [`backend/config/env.js`](file:///d:/rocky/js/practice/backend/config/env.js)
- Validate `MONGO_URI`, `JWT_SECRET`, `PORT`, `CORS_ORIGIN` on startup
- Throw clear error with instructions if any are missing

---

## Phase 3 — Frontend & Code Quality (+7 pts)

### 3.1 ESLint + Prettier Setup

**NEW** [`frontend/.eslintrc.json`](file:///d:/rocky/js/practice/frontend/.eslintrc.json)
- Use `next/core-web-vitals` as base
- Add rules for: `no-unused-vars`, `react-hooks/exhaustive-deps`, `no-console`

**NEW** [`frontend/.prettierrc`](file:///d:/rocky/js/practice/frontend/.prettierrc)
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 120,
  "tabWidth": 2
}
```

**NEW** [`backend/.eslintrc.json`](file:///d:/rocky/js/practice/backend/.eslintrc.json)
**NEW** [`backend/.prettierrc`](file:///d:/rocky/js/practice/backend/.prettierrc)

Add lint scripts to both `package.json` files.

### 3.2 Split the Store into Domains

**Current**: [`frontend/lib/store.js`](file:///d:/rocky/js/practice/frontend/lib/store.js) — 415-line monolith

**NEW** [`frontend/lib/stores/authStore.js`](file:///d:/rocky/js/practice/frontend/lib/stores/authStore.js)
- `token`, `currentUser`, `activeRole`, `login`, `register`, `logout`, `updateProfile`

**NEW** [`frontend/lib/stores/dataStore.js`](file:///d:/rocky/js/practice/frontend/lib/stores/dataStore.js)
- `restaurants`, `menuItems`, `tables`, `reservations`, `orders`, `analytics`
- `hydrate`, `createReservation`, `checkout`, `updateTableStatus`, `updateOrderStatus`

**NEW** [`frontend/lib/stores/uiStore.js`](file:///d:/rocky/js/practice/frontend/lib/stores/uiStore.js)
- `cart`, `selectedTableId`, `sidebarCollapsed`, `addToCart`, `removeFromCart`, etc.

**MODIFY** [`frontend/app/context.js`](file:///d:/rocky/js/practice/frontend/app/context.js) — re-export from all 3 stores

### 3.3 Split Mega-Pages

**MODIFY** [`frontend/app/customer/page.js`](file:///d:/rocky/js/practice/frontend/app/customer/page.js) (277 lines)
Extract remaining inline sections into:
- [`frontend/components/customer/CategoryBar.js`](file:///d:/rocky/js/practice/frontend/components/customer/CategoryBar.js)
- [`frontend/components/customer/PopularRestaurants.js`](file:///d:/rocky/js/practice/frontend/components/customer/PopularRestaurants.js)
- [`frontend/components/customer/RecommendedDishes.js`](file:///d:/rocky/js/practice/frontend/components/customer/RecommendedDishes.js)
- [`frontend/components/customer/QuickBooking.js`](file:///d:/rocky/js/practice/frontend/components/customer/QuickBooking.js)

**MODIFY** [`frontend/app/owner/page.js`](file:///d:/rocky/js/practice/frontend/app/owner/page.js) (210 lines)
Extract:
- [`frontend/components/owner/SalesChart.js`](file:///d:/rocky/js/practice/frontend/components/owner/SalesChart.js)
- [`frontend/components/owner/CoversChart.js`](file:///d:/rocky/js/practice/frontend/components/owner/CoversChart.js)
- [`frontend/components/owner/MenuCRUDPanel.js`](file:///d:/rocky/js/practice/frontend/components/owner/MenuCRUDPanel.js)

### 3.4 Barrel Exports

**NEW** [`frontend/components/index.js`](file:///d:/rocky/js/practice/frontend/components/index.js)
```js
export { default as BackButton } from './BackButton';
export { default as ConfirmDialog } from './ConfirmDialog';
export { default as FormField } from './FormField';
export { default as Toast } from './Toast';
export { default as Navbar } from './Navbar';
export { default as Sidebar } from './Sidebar';
export { default as FloorPlan } from './FloorPlan';
export { default as MobileDrawer } from './MobileDrawer';
// ... etc
```
This allows cleaner imports: `import { BackButton, Toast } from '@/components'`

### 3.5 Git Hooks (Husky)

**Install**: `npm install --save-dev husky lint-staged` in root

**NEW** `.husky/pre-commit`
- Run `lint-staged` on staged JS files
- Run `npm run build` on frontend to catch build errors early

### 3.6 Add react-query for Server Data

**Install**: `npm install @tanstack/react-query` in `frontend/`

**MODIFY** [`frontend/app/context.js`](file:///d:/rocky/js/practice/frontend/app/context.js)
- Wrap app with `QueryClientProvider`

**MODIFY** [`frontend/lib/store.js`](file:///d:/rocky/js/practice/frontend/lib/store.js) `hydrate()`
- Replace raw `fetch` calls with `queryClient.prefetchQuery()` where possible
- Keep Zustand for UI state only, use react-query for server state

**NEW** [`frontend/lib/hooks/useRestaurants.js`](file:///d:/rocky/js/practice/frontend/lib/hooks/useRestaurants.js)
```js
import { useQuery } from '@tanstack/react-query';
import api from '../api';
export function useRestaurants() {
  return useQuery({ queryKey: ['restaurants'], queryFn: api.getRestaurants });
}
```

**NEW** [`frontend/lib/hooks/useOrders.js`](file:///d:/rocky/js/practice/frontend/lib/hooks/useOrders.js)
**NEW** [`frontend/lib/hooks/useTables.js`](file:///d:/rocky/js/practice/frontend/lib/hooks/useTables.js)
**NEW** [`frontend/lib/hooks/useReservations.js`](file:///d:/rocky/js/practice/frontend/lib/hooks/useReservations.js)

This provides: auto-refetch, caching, stale-while-revalidate, loading/error states for free.

### 3.7 Reset the `callAPI` Pattern

With react-query handling server state, simplify store:
**MODIFY** [`frontend/lib/store.js`](file:///d:/rocky/js/practice/frontend/lib/store.js)
- Remove `callAPI` helper (react-query replaces it)
- Remove raw API calls from store methods
- Store becomes pure UI state + optimistic updates

---

## Phase 4 — Design, UX & Performance (+5 pts)

### 4.1 Error Pages (404, 500)

**NEW** [`frontend/app/not-found.js`](file:///d:/rocky/js/practice/frontend/app/not-found.js)
- Custom 404 with DineFlow branding, search suggestions, home button

**NEW** [`frontend/app/error.js`](file:///d:/rocky/js/practice/frontend/app/error.js)
- Error boundary with retry button, error details in dev mode

### 4.2 Light Mode Support

**MODIFY** [`frontend/styles/globals.css`](file:///d:/rocky/js/practice/frontend/styles/globals.css)
- Add `.light` class overrides using CSS variables
- Flip `--color-bg-dark`, `--color-panel-dark`, `--color-border-dark`

**MODIFY** [`frontend/app/context.js`](file:///d:/rocky/js/practice/frontend/context.js)
- Add `useTheme` hook that toggles `light` class on `<html>`

**MODIFY** Navbar — add sun/moon toggle icon button

### 4.3 Accessibility Pass

**MODIFY** Key interactive components:
- [`frontend/components/Navbar.js`](file:///d:/rocky/js/practice/frontend/components/Navbar.js) — add `aria-label` to nav, buttons
- [`frontend/components/MobileDrawer.js`](file:///d:/rocky/js/practice/frontend/components/MobileDrawer.js) — add `aria-modal`, `role="dialog"`, focus trap
- [`frontend/components/Toast.js`](file:///d:/rocky/js/practice/frontend/components/Toast.js) — add `role="alert"`, `aria-live="polite"`
- [`frontend/components/ConfirmDialog.js`](file:///d:/rocky/js/practice/frontend/components/ConfirmDialog.js) — add `role="alertdialog"`, focus trap
- [`frontend/components/FormField.js`](file:///d:/rocky/js/practice/frontend/components/FormField.js) — add `aria-describedby` for errors, `htmlFor` on labels

- All pages: add `skip-to-content` link, tabIndex management

### 4.4 Image Optimization

**MODIFY** All `<img>` tags across frontend → `<Image>` from `next/image`
This affects 15+ files but can be done incrementally:
- Priority: Restaurant covers, menu item images, avatar images
- Add `width`, `height`, `placeholder="blur"` where possible
- Configure `remotePatterns` in [`frontend/next.config.js`](file:///d:/rocky/js/practice/frontend/next.config.js) for unsplash.com

### 4.5 Bundle Analysis

**NEW** Analyze bundle with:
```bash
npm install --save-dev @next/bundle-analyzer
```
Configure in [`frontend/next.config.js`](file:///d:/rocky/js/practice/frontend/next.config.js)
- Identify large dependencies (recharts, framer-motion)
- Lazy-load recharts with `next/dynamic` only on pages that use it (owner dashboard, analytics)

### 4.6 Reduced Motion Support

**MODIFY** [`frontend/styles/globals.css`](file:///d:/rocky/js/practice/frontend/styles/globals.css)
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Phase 5 — Testing Infrastructure (+4 pts)

### 5.1 Backend Unit Tests

**Install**: `npm install --save-dev vitest supertest` in `backend/`

**NEW** [`backend/tests/auth.test.js`](file:///d:/rocky/js/practice/backend/tests/auth.test.js)
- Test registration with valid/invalid data
- Test login with correct/incorrect credentials
- Test wallet topup

**NEW** [`backend/tests/orders.test.js`](file:///d:/rocky/js/practice/backend/tests/orders.test.js)
- Test order creation with/without wallet balance
- Test order status transitions

**NEW** [`backend/tests/restaurants.test.js`](file:///d:/rocky/js/practice/backend/tests/restaurants.test.js)
- Test menu listing, restaurant listing

### 5.2 Frontend Component Tests

**Install**: `npm install --save-dev vitest @testing-library/react @testing-library/jest-dom` in `frontend/`

**NEW** [`frontend/__tests__/Toast.test.jsx`](file:///d:/rocky/js/practice/frontend/__tests__/Toast.test.jsx)
**NEW** [`frontend/__tests__/FormField.test.jsx`](file:///d:/rocky/js/practice/frontend/__tests__/FormField.test.jsx)
**NEW** [`frontend/__tests__/validation.test.js`](file:///d:/rocky/js/practice/frontend/__tests__/validation.test.js)
**NEW** [`frontend/__tests__/store.test.js`](file:///d:/rocky/js/practice/frontend/__tests__/store.test.js)

### 5.3 E2E Smoke Test

**Install**: `npm install --save-dev @playwright/test` in root

**NEW** [`e2e/login.spec.js`](file:///d:/rocky/js/practice/e2e/login.spec.js)
- Visit `/login`, fill form, submit, verify redirect to dashboard

**NEW** [`e2e/register.spec.js`](file:///d:/rocky/js/practice/e2e/register.spec.js)
- Visit `/register`, create account, verify redirect

**NEW** [`e2e/proxy.spec.js`](file:///d:/rocky/js/practice/e2e/proxy.spec.js)
- Visit `/customer` without token → should redirect to `/login`

---

## Execution Order Summary

| Phase | Est. Files | Priority | Est. Effort |
|---|---|---|---|
| **Phase 1**: Security Hardening | ~8 files | 🔴 Critical | 2-3 hrs |
| **Phase 2**: Backend Architecture | ~12 files | 🔴 Critical | 4-6 hrs |
| **Phase 3**: Frontend & Code Quality | ~20 files | 🟡 High | 6-8 hrs |
| **Phase 4**: Design, UX & Perf | ~15 files | 🟡 High | 4-6 hrs |
| **Phase 5**: Testing | ~10 files | 🟢 Medium | 4-6 hrs |
| **TOTAL** | **~65 file changes** | | **20-29 hrs** |

---

## Scoring Impact (Without TypeScript)

| Category | Before | After | Why |
|---|---|---|---|
| Security | 65 | 82 | Helmet, rate limit, cors, validation |
| Backend | 70 | 83 | Service layer, pagination, validation |
| Code Quality | 65 | 78 | ESLint, store split, barrel exports, hooks |
| Frontend | 68 | 78 | react-query, store split, page split |
| Design & UX | 78 | 85 | Error pages, a11y, light mode, reduced motion |
| Architecture | 75 | 82 | Service layer, docker, env validation |
| Performance | 70 | 78 | next/image, bundle analysis, lazy loading |
| **OVERALL** | **70** | **~81** | *(+11, limited by no TS)* |

Without TypeScript, hitting 85 is extremely difficult — TS migration alone is worth +4-5 points across code quality, frontend, and architecture. If you reconsider TS later, that +4 points would push 81 → 85.

---

## Quick Wins (Do First)

These 5 items deliver ~60% of the value in ~20% of the time:

1. **Helmet + CORS restrict + Rate limit** (Phase 1.1-1.3) — 3 npm installs, ~10 lines each
2. **Express-validator on auth routes** (Phase 1.4) — prevents injection/bad data
3. **Store split into 3 files** (Phase 3.2) — 1 hour for massive maintainability gain
4. **Error pages + a11y basics** (Phase 4.1, 4.3) — visible UX improvement
5. **react-query hooks** (Phase 3.6) — eliminates manual fetch orchestration
