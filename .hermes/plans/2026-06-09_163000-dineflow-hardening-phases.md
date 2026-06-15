# DineFlow Hardening — Multi-Phase Implementation Plan

> **Audit Score:** 79/100 → Target: 88/100

**Goal:** Execute the top gaps identified in the codebase audit across 6 independently deployable phases, raising the overall score by ~9 points.

**Approach:** Each phase is independently deployable, verifiable, and prioritized by impact. Phases can be parallelized.

---

## Phase 1: 🔴 Performance & Quick Fixes
**Estimated uplift:** +2.0 pts | **Files touched:** 4

### Task 1.1: Convert `<img>` → `<Image>` in FoodCrossfadeGallery

**Files:**
- Modify: `frontend/components/FoodCrossfadeGallery.js`

**Changes:**
- Add `import Image from 'next/image'` (replace the existing `<img>` usage)
- Replace raw `<img>` with `<Image>` — add `width`/`height` or `fill` props
- The gallery uses fixed-aspect container (`aspect-[4/3]`) — use `fill` with `sizes` for responsive

```jsx
// Before (line 37-41)
<img
  src={images[index].src}
  alt={images[index].alt}
  className="w-full h-full object-cover"
/>

// After
<Image
  src={images[index].src}
  alt={images[index].alt}
  fill
  sizes="(max-width: 400px) 100vw, 400px"
  className="object-cover"
  priority
/>
```

**Verification:** Build passes: `cd frontend && npm run build`

---

### Task 1.2: Convert `<img>` → `<Image>` on Landing Page

**Files:**
- Modify: `frontend/app/(public)/page.js`

**Changes:**
- Add `import Image from 'next/image'` at the top
- Replace any `<img>` tag with `<Image>` using appropriate `width`/`height` or `fill` + `sizes`

**Verification:** Build passes.

---

### Task 1.3: Add Database Indexes for Frequently Queried Fields

**Files:**
- Modify: `backend/seed/indexes.js`

**Current indexes** (need to verify what exists — likely only unique email on User):

Add compound indexes for the most common query patterns:

```js
// User indexes
await User.collection.createIndex({ email: 1 }, { unique: true }); // already exists

// Order indexes
await Order.collection.createIndex({ userId: 1, createdAt: -1 });
await Order.collection.createIndex({ restaurantId: 1, status: 1 });

// Reservation indexes
await Reservation.collection.createIndex({ restaurantId: 1, reservationDate: 1 });
await Reservation.collection.createIndex({ userId: 1 });

// Table indexes
await Table.collection.createIndex({ restaurantId: 1, status: 1 });

// MenuItem indexes
await MenuItem.collection.createIndex({ restaurantId: 1, category: 1 });
```

**Verification:** ✅ Backend tests pass: `cd backend && npm test`

---

### Task 1.4: Fix Helmet Middleware Order in app.js

**Files:**
- Modify: `backend/app.js`

**Current order (lines 24-27):**
```js
app.use(express.json());
app.use(helmet());
app.use(globalRateLimiter);
app.use(csrfProtection);
```

**Fix:**
```js
app.use(helmet());
app.use(express.json());
app.use(globalRateLimiter);
app.use(csrfProtection);
```

**Rationale:** Security headers from `helmet()` should be applied as early as possible in the middleware chain, before request parsing.

**Verification:** ✅ Backend tests still pass.

---

## Phase 2: 🔴 Security & Validation Hardening
**Estimated uplift:** +1.5 pts | **Files touched:** 3

### Task 2.1: Staff Sub-Role Enum Validation

**Files:**
- Modify: `backend/routes/staff.js`

**Current** (lines 25-58): Staff creation destructures `role` from body but uses it as staff sub-role without validating against the Staff enum (`Waiter`, `Cashier`, `Kitchen Staff`, `Manager`).

**Changes:**
Add a validation chain for `role` field before the existing validators:

```js
body('role').isIn(['Waiter', 'Cashier', 'Kitchen Staff', 'Manager'])
  .withMessage('Staff role must be Waiter, Cashier, Kitchen Staff, or Manager'),
```

And update the destructuring to avoid confusion with User role:
```js
const { name, email, password, role: staffRole } = req.body;
// ...
staffDetails: { role: staffRole, restaurantId, restaurantCode }
```

**Verification:** ✅ `POST /api/staff` with invalid staff sub-role returns 400 with validation error.

---

### Task 2.2: Add CORS_ORIGIN Validation in env.js

**Files:**
- Modify: `backend/config/env.js`

**Current** (lines 8-16): Only `MONGO_URI` and `JWT_SECRET` are validated.

**Changes:**
Add `CORS_ORIGIN` as a validated env var with a default:

```js
const REQUIRED_VARS = ['MONGO_URI', 'JWT_SECRET'];
// ... keep existing validation ...

module.exports = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  PORT: parseInt(process.env.PORT, 10) || 5000,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
```

Also ensure `server.js` passes `CORS_ORIGIN` to `app.js` or reference `config.CORS_ORIGIN` in the cors middleware.

**Note:** Currently `server.js` doesn't pass config to `app.js`. The cors origin in app.js likely references `process.env.CORS_ORIGIN` directly. Need to either:
- Option A: Have app.js import config directly (already imports config in auth middleware)
- Option B: Pass config via app.set()

Let's go with Option A for consistency — import `config` in `app.js` and use `config.CORS_ORIGIN` in cors options.

**Verification:** ✅ Server fails to start if required vars missing; CORS uses configured origin.

---

### Task 2.3: Add Input Sanitization for Stored XSS

**Files:**
- Create: `backend/utils/sanitize.js`
- Modify: `backend/routes/restaurants.js` (apply to description, name)
- Modify: `backend/routes/auth.js` (apply to name)

**Create sanitization utility:**
```js
// backend/utils/sanitize.js
// Strip HTML tags and trim whitespace to prevent stored XSS

function stripHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

function sanitize(obj, fields) {
  const sanitized = { ...obj };
  for (const field of fields) {
    if (sanitized[field] !== undefined && typeof sanitized[field] === 'string') {
      sanitized[field] = stripHtml(sanitized[field]);
    }
  }
  return sanitized;
}

module.exports = { stripHtml, sanitize };
```

**Apply to restaurant routes:**
```js
const { sanitize } = require('../utils/sanitize');
// In PATCH /:id handler, before calling service:
req.body = sanitize(req.body, ['name', 'description', 'address']);
```

**Apply to auth routes:**
```js
// In PATCH /profile handler:
req.body = sanitize(req.body, ['name']);
```

**Verification:** ✅ Posting HTML tags in restaurant description stores a sanitized string.

---

## Phase 3: 🟡 Backend Testing Expansion
**Estimated uplift:** +1.5 pts | **Files touched:** 2

### Task 3.1: Order Integration Tests

**File:**
- Modify: `backend/tests/integration.test.js` (append new `describe` block)

Test scenarios to add:
```js
describe('Order Integration', () => {
  it('POST /api/orders creates an order for authenticated customer');
  it('POST /api/orders rejects order without items');
  it('POST /api/orders deducts wallet balance when paymentMethod=wallet');
  it('GET /api/orders returns scoped orders for customer');
  it('PUT /api/orders/:id/status updates order status');
  it('GET /api/orders rejects unauthenticated request');
});
```

**Implementation pattern** (follows existing setup in integration.test.js):
- Use `request(app)` with `.set('Authorization', Bearer ${token})`
- Auth rate limiter needs CSRF header for non-auth routes: `.set(csrf)` or skip auth limiter
- Create an Order via API and verify response shape, status code, and DB state

**Verification:** ✅ `cd backend && npx vitest run` — all tests pass, including new order tests.

---

### Task 3.2: Restaurant & Reservation Integration Tests

**File:**
- Modify: `backend/tests/integration.test.js` (append more `describe` blocks)

```js
describe('Restaurant Integration', () => {
  it('GET /api/restaurants returns public restaurant list');
  it('GET /api/restaurants/:id returns single restaurant');
  it('GET /api/restaurants/:id/menu returns menu items');
  it('PATCH /api/restaurants/:id rejects non-owner');
});

describe('Reservation Integration', () => {
  it('POST /api/reservations creates reservation for authenticated user');
  it('GET /api/reservations returns scoped reservations');
  it('PATCH /api/reservations/:id updates reservation status');
});
```

**Verification:** ✅ All integration tests pass.

---

## Phase 4: 🟡 React Query & Frontend Testing
**Estimated uplift:** +1.5 pts | **Files touched:** 3

### Task 4.1: Create useQueries.js with React Query Hooks

**File:**
- Create: `frontend/lib/hooks/useQueries.js`

**Context:** React Query is set up in `context.js` (QueryClientProvider) but no hooks exist — all data goes through Zustand.

Create the missing hooks as a bridge layer. These hooks wrap `api.js` and provide loading/error states for components that want react-query directly:

```js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api';

// Query keys
export const keys = {
  restaurants: ['restaurants'],
  restaurant: (id) => ['restaurants', id],
  menu: (id) => ['menu', id],
  orders: ['orders'],
  reservations: ['reservations'],
  tables: ['tables'],
  analytics: ['analytics'],
};

// Queries
export function useRestaurants() {
  return useQuery({
    queryKey: keys.restaurants,
    queryFn: api.getRestaurants,
    staleTime: 5 * 60 * 1000, // 5 min
  });
}

export function useRestaurant(id) {
  return useQuery({
    queryKey: keys.restaurant(id),
    queryFn: () => api.getRestaurant(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

export function useRestaurantMenu(id) {
  return useQuery({
    queryKey: keys.menu(id),
    queryFn: () => api.getRestaurantMenu(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Auth-required queries (pass token via select/context)
export function useOrders(token) {
  return useQuery({
    queryKey: keys.orders,
    queryFn: () => api.getOrders(token),
    enabled: !!token,
  });
}

export function useReservations(token) {
  return useQuery({
    queryKey: keys.reservations,
    queryFn: () => api.getReservations(token),
    enabled: !!token,
  });
}

export function useTables(token) {
  return useQuery({
    queryKey: keys.tables,
    queryFn: () => api.getTables(token),
    enabled: !!token,
  });
}

export function useAnalytics(token) {
  return useQuery({
    queryKey: keys.analytics,
    queryFn: () => api.analyticsSummary(token),
    enabled: !!token,
  });
}

// Mutations
export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, token }) => api.createOrder(data, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: keys.orders });
    },
  });
}
```

**Verification:** ✅ `cd frontend && npm run build` succeeds.

---

### Task 4.2: Add useQueries Hook Tests

**File:**
- Create: `frontend/__tests__/useQueries.test.js`

Using vitest + react-query test utilities:

```js
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRestaurants, useRestaurantMenu } from '../lib/hooks/useQueries';
import api from '../lib/api';

vi.mock('../lib/api', () => ({
  default: {
    getRestaurants: vi.fn(),
    getRestaurantMenu: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useRestaurants', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns restaurant data on success', async () => {
    api.getRestaurants.mockResolvedValue([{ _id: '1', name: 'Test' }]);
    const { result } = renderHook(() => useRestaurants(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual([{ _id: '1', name: 'Test' }]);
  });

  it('returns error on failure', async () => {
    api.getRestaurants.mockRejectedValue(new Error('Network error'));
    const { result } = renderHook(() => useRestaurants(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
```

**Verification:** ✅ `cd frontend && npx vitest run` — useQueries tests pass.

---

### Task 4.3: Page-Level Smoke Tests

**File:**
- Create: `frontend/__tests__/pages.test.jsx`

Test that key pages render without crashing (basic smoke test with mocked store):

```jsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createElement } from 'react';

// Mock stores and context
vi.mock('../app/context', () => ({
  useDineFlow: () => ({
    restaurants: [],
    menuItems: [],
    tables: [],
    orders: [],
    reservations: [],
    cart: [],
    loading: false,
    currentUser: { name: 'Test' },
  }),
  DineFlowProvider: ({ children }) => createElement('div', null, children),
}));

// Test each main page renders
// We'll add one describe block per portal
describe('Public pages render', () => {
  it('login page renders', async () => {
    const Page = (await import('../app/(public)/login/page')).default;
    const { container } = render(createElement(Page));
    expect(container).toBeTruthy();
  });
  it('register page renders', async () => {
    const Page = (await import('../app/(public)/register/page')).default;
    const { container } = render(createElement(Page));
    expect(container).toBeTruthy();
  });
});

describe('Customer portal renders', () => {
  it('customer dashboard renders', async () => {
    const Page = (await import('../app/customer/page')).default;
    const { container } = render(createElement(Page));
    expect(container).toBeTruthy();
  });
  it('customer explore renders', async () => {
    const Page = (await import('../app/customer/explore/page')).default;
    const { container } = render(createElement(Page));
    expect(container).toBeTruthy();
  });
});

describe('Owner portal renders', () => {
  it('owner dashboard renders', async () => {
    const Page = (await import('../app/owner/page')).default;
    const { container } = render(createElement(Page));
    expect(container).toBeTruthy();
  });
});
```

**Verification:** ✅ `cd frontend && npx vitest run` — page tests pass.

---

## Phase 5: 🟡 Code Quality & Refactoring
**Estimated uplift:** +1.5 pts | **Files touched:** 4-6

### Task 5.1: Merge SkeletonRow into Skeleton.js

**Files:**
- Modify: `frontend/components/Skeleton.js` (add SkeletonRow)
- Delete: `frontend/components/SkeletonRow.js` (after merge)
- Modify: `frontend/app/owner/page.js` (update import)

**Changes:**
Add to `Skeleton.js`:
```js
export function SkeletonRow({ rows = 3, className = '' }) {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-full bg-white/5 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
            <div className="h-2 w-1/2 bg-white/5 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
```

Update import in `owner/page.js`:
```js
// Before:
import { SkeletonRow } from '../../components/SkeletonRow';
// After:
import { SkeletonRow } from '../../components/Skeleton';
```

**Verification:** ✅ Build passes, owner dashboard still shows skeleton loading state.

---

### Task 5.2: Eliminate Remaining Hardcoded Magic Numbers

**Files:**
- Modify: `frontend/app/customer/cart/page.js` (already uses DEFAULTS — verify)
- Search for other hardcoded `8.5` (tax), `10` (service charge), `128.50` (wallet), `350` (points) across all pages

The cart page (line 21-23) already uses `DEFAULTS.TAX_RATE` and `DEFAULTS.SERVICE_CHARGE` — good. Check for:
- `frontend/app/(public)/register/page.js` — may hardcode wallet/loyalty defaults
- `frontend/components/customer/QuickBookingForm.js` — may hardcode guest limits
- `frontend/app/(public)/page.js` — may hardcode stats values

For each occurrence, replace with a reference to `constants.js`:
```js
import { DEFAULTS, STORAGE_KEYS } from '../../lib/constants';
```

**Verification:** ✅ No raw number > 1 appears in page logic (non-styling).

---

### Task 5.3: Add Prettier Config & Root Tooling

**Files:**
- Create: `.prettierrc` (project root)
- Modify: root `package.json` (add format script)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

Root `package.json` script:
```json
"scripts": {
  "format": "prettier --write \"**/*.js\" --ignore-path .gitignore",
  "format:check": "prettier --check \"**/*.js\" --ignore-path .gitignore"
}
```

**Verification:** ✅ `npx prettier --check .` runs without errors after formatting.

---

## Phase 6: 🟢 Design Polish — Light Mode CSS
**Estimated uplift:** +0.5 pts | **Files touched:** 2

### Task 6.1: Extract Light Mode CSS into Separate File

**Files:**
- Create: `frontend/styles/light-mode.css`
- Modify: `frontend/styles/globals.css` (remove light mode overrides)
- Modify: `frontend/app/layout.js` (import light-mode.css)

**Approach:**
Move all `.light` overrides from `globals.css` (lines 360–501+) into a dedicated `light-mode.css` file imported via the root layout. This:
1. Reduces `globals.css` from 534 → ~360 lines
2. Makes light mode a proper separate stylesheet
3. Enables conditional loading (e.g., only load when needed)

**light-mode.css:**
```css
/* frontend/styles/light-mode.css */
.light .text-white { color: #111827 !important; }
.light .text-gray-100 { color: #1f2937 !important; }
/* ... all other .light overrides ... */
```

In `app/layout.js`:
```js
import '../styles/globals.css';
import '../styles/light-mode.css';
```

**Verification:** ✅ Both dark and light mode render correctly after the split.

---

## Phase 7 (Optional): 🟢 CI/CD Pipeline
**Estimated uplift:** +0.5 pts | **Files touched:** 2-3

### Task 7.1: GitHub Actions CI

**File:**
- Create: `.github/workflows/ci.yml`

```yaml
name: CI
on: [push, pull_request]
jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
```

**Verification:** ✅ CI passes on push/PR.

---

## Summary of File Changes

| File | Change | Phase |
|------|--------|-------|
| `frontend/components/FoodCrossfadeGallery.js` | Modify (img→Image) | 1 |
| `frontend/app/(public)/page.js` | Modify (img→Image) | 1 |
| `backend/seed/indexes.js` | Modify (add indexes) | 1 |
| `backend/app.js` | Modify (helmet order) | 1 |
| `backend/routes/staff.js` | Modify (sub-role validation) | 2 |
| `backend/config/env.js` | Modify (CORS_ORIGIN) | 2 |
| `backend/utils/sanitize.js` | **Create** | 2 |
| `backend/routes/restaurants.js` | Modify (sanitize) | 2 |
| `backend/routes/auth.js` | Modify (sanitize) | 2 |
| `backend/tests/integration.test.js` | Modify (add tests) | 3 |
| `frontend/lib/hooks/useQueries.js` | **Create** | 4 |
| `frontend/__tests__/useQueries.test.js` | **Create** | 4 |
| `frontend/__tests__/pages.test.jsx` | **Create** | 4 |
| `frontend/components/Skeleton.js` | Modify (add SkeletonRow) | 5 |
| `frontend/components/SkeletonRow.js` | **Delete** | 5 |
| `frontend/app/owner/page.js` | Modify (import path) | 5 |
| Various pages | Modify (magic numbers → constants) | 5 |
| `.prettierrc` | **Create** | 5 |
| `package.json` (root) | Modify (scripts) | 5 |
| `frontend/styles/light-mode.css` | **Create** | 6 |
| `frontend/styles/globals.css` | Modify (remove light overrides) | 6 |
| `frontend/app/layout.js` | Modify (add light-mode.css import) | 6 |
| `.github/workflows/ci.yml` | **Create** | 7 |

## Verification Checklist

- [ ] **Phase 1:** `cd frontend && npm run build` passes; `cd backend && npm test` passes
- [ ] **Phase 2:** `POST /api/staff` with invalid sub-role returns 400; server validates CORS_ORIGIN
- [ ] **Phase 3:** `cd backend && npm test` — all integration tests pass (auth + order + restaurant + reservation)
- [ ] **Phase 4:** `cd frontend && npx vitest run` — all tests pass including new useQueries + page smoke tests
- [ ] **Phase 5:** `npx prettier --check .` passes; `cd frontend && npm run build` passes
- [ ] **Phase 6:** Dark mode unchanged; light mode CSS renders correctly
- [ ] **Phase 7:** CI green on push/PR

## Risks & Tradeoffs

| Risk | Mitigation |
|------|------------|
| useQueries.js duplicates Zustand data flow | Hooks are additive — pages can adopt gradually. No existing code breaks. |
| Sanitization strips legitimate HTML in descriptions | Restaurant descriptions shouldn't contain HTML. If needed, switch to allowlist (e.g., simple formatting tags). |
| Light mode CSS extraction could break layout | Only moves `.light` rules — no selectors changed. Visual regression risk is near-zero. |
| Integration tests increase CI time | ~5-10s per test file with mongodb-memory-server. Acceptable for current scale. |
| SkeletonRow delete could break if imported elsewhere | Verify no other imports exist before deleting. Search first. |

## Scoring Model

| Phase | Dimensions Impacted | Estimated Uplift |
|-------|--------------------|------------------|
| Phase 1: Quick Fixes | Performance (+4), Code Quality (+2) | +2.0 pts |
| Phase 2: Security Hardening | Security (+3), Backend Quality (+2) | +1.5 pts |
| Phase 3: Backend Tests | Backend Quality (+5) | +1.5 pts |
| Phase 4: React Query + Tests | Frontend Quality (+5) | +1.5 pts |
| Phase 5: Code Quality | Code Quality (+5) | +1.5 pts |
| Phase 6: Design Polish | Design & UX (+2) | +0.5 pts |
| Phase 7: CI Pipeline | Code Quality (+2) | +0.5 pts |
| **Total** | | **~+9.0 pts** → **88/100** |
