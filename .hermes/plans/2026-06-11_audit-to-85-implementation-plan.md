# DineFlow: 79→85 Production Hardening Plan (Phase 2)

> **Based on full codebase audit — June 11, 2026**
> **Current Score: 79/100 → Target: 85/100**
> **All code stays JS (no TS migration)**

---

## Scoring Model

| Phase | Dimensions Impacted | Est. Uplift |
|-------|--------------------|-------------|
| Phase 1: Bug Fixes & Quick Wins | Code Quality (+2), Backend (+1), Frontend (+1) | +1.2 pts |
| Phase 2: Backend Hardening | Backend (+4), Security (+2) | +2.0 pts |
| Phase 3: Frontend Quality | Frontend (+5), Design (+2) | +2.3 pts |
| Phase 4: Performance & Infrastructure | Performance (+6), Architecture (+2) | +1.8 pts |
| Phase 5: Security Deepening | Security (+4) | +1.2 pts |
| **Total** | | **~+8.5 pts → 87/100** |

---

## Phase 1 — 🔴 Bug Fixes & Quick Wins (+1.2 pts, ~30 min)

### 1.1 Fix Hardcoded Tax Math

**File:** `frontend/lib/data-service.js` line 177
**Current:** `const total = subtotal * 1.185;`
**Fix:** Import `DEFAULTS.TAX_RATE` and `DEFAULTS.SERVICE_CHARGE` from constants, compute properly:
```js
const taxRate = DEFAULTS.TAX_RATE / 100;    // 0.085
const serviceRate = DEFAULTS.SERVICE_CHARGE / 100; // 0.10
const total = subtotal * (1 + taxRate + serviceRate);
```

### 1.2 Fix Restaurant POST Route Bug

**File:** `backend/routes/restaurants.js` lines 70-73
**Issue:** `POST /` tries `restaurantService.getById(req.params.id)` — but `req.params.id` is undefined on POST to `/`, so it always falls through to create. The upsert intent is unclear and broken.
**Fix:** Remove the upsert logic entirely — POST should only create:
```js
router.post('/',
  authMiddleware,
  requireRole('owner'),
  body('name').optional().trim().notEmpty(),
  body('address').optional().trim().notEmpty(),
  body('cuisines').optional().isArray(),
  validate,
  async (req, res, next) => {
    try {
      const restaurant = await restaurantService.createRestaurant(req.body);
      res.status(201).json(restaurant);
    } catch (err) {
      next(err);
    }
  }
);
```

### 1.3 Fix Magic Numbers in orderService.js

**File:** `backend/services/orderService.js` lines 44-46
**Current:** `subtotal: total / 1.185`, `tax: total * 0.085`, `serviceCharge: total * 0.1`
**Fix:** Should compute from the actual items' prices, not derive from total backwards. Use:
```js
subtotal: items.reduce((s, i) => s + i.price * i.quantity, 0),
tax: parseFloat((subtotal * 0.085).toFixed(2)),
serviceCharge: parseFloat((subtotal * 0.10).toFixed(2)),
total: parseFloat((subtotal * 1.185).toFixed(2)),
```
(Or import from constants if they should be configurable per-restaurant)

### 1.4 Add Priority Prop to Above-Fold Images

**Files:**
- `frontend/app/(public)/page.js` — landing page hero images in `FoodCrossfadeGallery` and featured restaurant cards
- `frontend/app/customer/page.js` — menu item images in recommended dishes

**Fix:** Add `priority={true}` to the first 1-2 `<Image>` components visible above the fold. This tells Next.js to preload them.

---

## Phase 2 — 🟡 Backend Hardening (+2.0 pts, ~2-3 hrs)

### 2.1 Extract Mock Data from Analytics Route

**File:** `backend/routes/analytics.js`
**Issue:** `last30DaysSales()` uses `Math.sin` to generate fake data. `coversByDayOfWeek()` is hardcoded. `summary` route adds live DB counts to hardcoded baselines (`128 + ordersCount`).
**Fix:** Two options:
- **Option A (Recommended):** Compute from real data using MongoDB aggregation:
  ```js
  async function last30DaysSales() {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const pipeline = [
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, sales: { $sum: '$total' } } },
      { $sort: { _id: 1 } },
    ];
    const results = await Order.aggregate(pipeline);
    return results.map(r => ({ date: r._id, sales: r.sales }));
  }
  ```
- **Option B (Faster):** Remove the mock functions entirely and return only real DB counts in the summary endpoint, document that chart endpoints return placeholder data.

### 2.2 Move Tables/Staff Logic to Service Layer

**Files:**
- `backend/routes/tables.js` — `updateTableHandler`, `POST /` creation logic
- `backend/routes/staff.js` — staff CRUD logic

**Fix:**
- **NEW** `backend/services/tableService.js`
  - `getTables(restaurantId)`
  - `updateTable(tableId, fields)`
  - `createTable(data)`
  - `deleteTable(tableId)`
- **NEW** `backend/services/staffService.js`
  - `getStaffByRestaurant(restaurantId)`
  - `addStaff(data)`
  - `removeStaff(staffId)`
- Routes become thin wrappers calling these services

### 2.3 Add Test Coverage for Reservations & Tables

**File:** `backend/tests/integration.test.js` (append new describe blocks)

**New tests:**
- `POST /api/reservations` — create with valid data, reject without auth
- `PATCH /api/reservations/:id` — update status
- `GET /api/tables` — list tables, reject without restaurantId for customers
- `POST /api/tables` — create table (owner only), reject for customers
- `PATCH /api/tables/:id/status` — update table status

### 2.4 Add Cache-Control Headers

**File:** `backend/app.js`
**Fix:** Add an Express middleware before routes for public endpoints:
```js
app.use('/api/restaurants', (req, res, next) => {
  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  next();
});
```
This caches restaurant listings for 5 minutes (browser) / 10 minutes (CDN).

---

## Phase 3 — 🟡 Frontend Quality (+2.3 pts, ~3-5 hrs)

### 3.1 fix fetchWithAuth 5xx Retry Pattern

**File:** `frontend/lib/api.js` lines 26-29
**Current:**
```js
catch (err) {
  if (err.status >= 500) return doFetch();  // dangerous retry
  throw err;
}
```
**Fix:** Remove automatic retry on 5xx for mutating methods. Either:
- Remove entirely and let React Query handle retries
- Or add a retry whitelist (GET only):
```js
catch (err) {
  if (err.status >= 500 && options.method === undefined) return doFetch();
  throw err;
}
```

### 3.2 Add Empty States

**Files:**
- `frontend/app/customer/page.js` — when no restaurants match filter
- `frontend/app/owner/staff/page.js` — when no staff members
- `frontend/app/owner/menu/page.js` — when no menu items
- `frontend/app/staff/orders/page.js` — when no orders

**Create a shared component:** `frontend/components/EmptyState.js`
```jsx
export default function EmptyState({ icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-4">
      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm text-center">{description}</p>
      {action}
    </div>
  );
}
```

### 3.3 Add Per-Portal Error Boundaries

**Files:**
- `frontend/app/customer/error.js` — NEW
- `frontend/app/owner/error.js` — NEW
- `frontend/app/staff/error.js` — NEW

Each should show the portal's navigation context + retry button, rather than a generic crash screen.

### 3.4 Expand Frontend Test Coverage

**New test files:**
- `frontend/__tests__/Cart.test.jsx` — test addToCart, removeFromCart, clearCart
- `frontend/__tests__/authStore.test.js` — test login/logout/store hydration (mock localStorage)
- `frontend/__tests__/Toast.test.jsx` — test toast render, auto-dismiss
- `frontend/__tests__/EmptyState.test.jsx` — render with/without action

**Existing tests to strengthen:**
- `MenuItemCard.test.jsx` — add test for `onAdd` callback with item data
- `useTheme.test.js` — add test for toggleTheme

### 3.5 Fix <Image> Dimensions

**File scan result:** Find all `<Image>` usages missing `width`/`height` props and add them.

**Target files:**
- `frontend/app/(public)/page.js` — `Image` in TiltCard content, restaurant cards
- `frontend/app/customer/page.js` — menu item images
- `frontend/components/customer/RestaurantCard.js` — restaurant cover images

### 3.6 Split Landing Page

**File:** `frontend/app/(public)/page.js` — currently 558 lines

**Extract into:**
- `frontend/components/landing/HeroSection.js`
- `frontend/components/landing/FeaturedRestaurants.js`
- `frontend/components/landing/StatsBar.js`
- `frontend/components/landing/ExperienceTabs.js`
- `frontend/components/landing/FeatureGrid.js`
- `frontend/components/landing/FAQSection.js`

---

## Phase 4 — 🟡 Performance & Infrastructure (+1.8 pts, ~2-3 hrs)

### 4.1 Run Bundle Analysis

```bash
cd frontend && ANALYZE=true npm run build
```
Review the generated `analyze.html` for large dependencies. Common targets:
- **recharts** (~150KB) — lazy-load with `next/dynamic` on owner dashboard only
- **framer-motion** (~80KB) — already used everywhere, acceptable
- **lucide-react** — tree-shaken via `optimizePackageImports`, verify it's working

**File:** `frontend/app/owner/page.js`
```js
import dynamic from 'next/dynamic';
const SalesChart = dynamic(() => import('../../components/owner/SalesChart'), { ssr: false });
```

### 4.2 Add PWA Manifest

**New files:**
- `frontend/public/manifest.json` — PWA manifest with app name, icons, theme color
- `frontend/public/icons/` — app icons at 192x192 and 512x512

**Modify:** `frontend/app/layout.js` — add `<link rel="manifest" href="/manifest.json" />`

### 4.3 Add Reduced Motion Support

**File:** `frontend/styles/globals.css` — append:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4.4 Set Performance Budgets

**File:** `frontend/next.config.js` — this is aspirational (Next.js doesn't natively enforce budgets, but document them):
```js
// Performance budgets (manual):
// - Initial JS < 200KB (gzip'd)
// - Lighthouse Performance > 90
// - First Contentful Paint < 1.5s
// - Largest Contentful Paint < 2.5s
```

---

## Phase 5 — 🔵 Security Deepening (+1.2 pts, ~2-3 hrs)

### 5.1 Add Account Lockout on Failed Logins

**File:** `backend/services/authService.js`
**New model field on User:** `failedLoginAttempts: { type: Number, default: 0 }`, `lockoutUntil: { type: Date }`
**Logic in `loginUser()`:**
```js
if (user.lockoutUntil && user.lockoutUntil > new Date()) {
  throw Object.assign(new Error('Account locked. Try again later.'), { status: 429 });
}
if (!isMatch) {
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  if (user.failedLoginAttempts >= 5) {
    user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 min
    user.failedLoginAttempts = 0;
  }
  await user.save();
  throw Object.assign(new Error('Invalid credentials'), { status: 400 });
}
// On success, reset
user.failedLoginAttempts = 0;
user.lockoutUntil = null;
```

### 5.2 Add Session Invalidation on Password Change

**File:** `backend/models/User.js`
**Add field:** `passwordChangedAt: { type: Date }`
**In `pre('save')` hook:** When password is modified, set `passwordChangedAt = new Date()`
**In `authMiddleware`:** Check that the JWT's `iat` is after the user's `passwordChangedAt`
```js
if (user.passwordChangedAt && decoded.iat < user.passwordChangedAt.getTime() / 1000) {
  return res.status(401).json({ message: 'Token expired, please login again' });
}
```

### 5.3 Add Email Verification Stub

**File:** `backend/routes/auth.js`
**New route:** `POST /auth/verify-email`
**New User field:** `emailVerified: { type: Boolean, default: false }`, `emailVerificationToken: { type: String }`
**In `registerUser()`:** Generate a verification token, save it. In production this would send an email. For now, expose a `GET /auth/verify/:token` endpoint that marks `emailVerified = true`.

---

## Summary of File Changes

| File | Change | Phase |
|------|--------|-------|
| `frontend/lib/data-service.js` | Modify (fix tax math) | 1 |
| `backend/routes/restaurants.js` | Modify (fix POST route) | 1 |
| `backend/services/orderService.js` | Modify (fix magic numbers) | 1 |
| `frontend/app/(public)/page.js` | Modify (add priority prop, split into sections) | 1, 3 |
| `backend/routes/analytics.js` | Modify (replace mock data with real aggregations) | 2 |
| `backend/services/tableService.js` | **NEW** | 2 |
| `backend/services/staffService.js` | **NEW** | 2 |
| `backend/routes/tables.js` | Modify (thin wrapper) | 2 |
| `backend/routes/staff.js` | Modify (thin wrapper) | 2 |
| `backend/tests/integration.test.js` | Modify (add table/reservation tests) | 2 |
| `backend/app.js` | Modify (add Cache-Control headers) | 2 |
| `frontend/lib/api.js` | Modify (fix 5xx retry) | 3 |
| `frontend/components/EmptyState.js` | **NEW** | 3 |
| `frontend/app/customer/page.js` | Modify (add empty states) | 3 |
| `frontend/app/owner/staff/page.js` | Modify (add empty states) | 3 |
| `frontend/app/owner/menu/page.js` | Modify (add empty states) | 3 |
| `frontend/app/staff/orders/page.js` | Modify (add empty states) | 3 |
| `frontend/app/customer/error.js` | **NEW** | 3 |
| `frontend/app/owner/error.js` | **NEW** | 3 |
| `frontend/app/staff/error.js` | **NEW** | 3 |
| `frontend/__tests__/Cart.test.jsx` | **NEW** | 3 |
| `frontend/__tests__/authStore.test.js` | **NEW** | 3 |
| `frontend/__tests__/Toast.test.jsx` | **NEW** | 3 |
| `frontend/__tests__/EmptyState.test.jsx` | **NEW** | 3 |
| `frontend/__tests__/MenuItemCard.test.jsx` | Modify (strengthen) | 3 |
| `frontend/components/landing/HeroSection.js` | **NEW** | 3 |
| `frontend/components/landing/FeaturedRestaurants.js` | **NEW** | 3 |
| `frontend/components/landing/StatsBar.js` | **NEW** | 3 |
| `frontend/components/landing/ExperienceTabs.js` | **NEW** | 3 |
| `frontend/components/landing/FeatureGrid.js` | **NEW** | 3 |
| `frontend/components/landing/FAQSection.js` | **NEW** | 3 |
| `frontend/app/owner/page.js` | Modify (dynamic import recharts) | 4 |
| `frontend/public/manifest.json` | **NEW** | 4 |
| `frontend/public/icons/` (192x192, 512x512) | **NEW** | 4 |
| `frontend/app/layout.js` | Modify (add manifest link) | 4 |
| `frontend/styles/globals.css` | Modify (reduced motion) | 4 |
| `backend/models/User.js` | Modify (add lockout fields, passwordChangedAt) | 5 |
| `backend/services/authService.js` | Modify (lockout logic, password change check) | 5 |
| `backend/middleware/auth.js` | Modify (check passwordChangedAt) | 5 |
| `backend/routes/auth.js` | Modify (add verify-email routes) | 5 |

---

## Risks & Tradeoffs

| Risk | Mitigation |
|------|------------|
| **Real aggregation queries (Phase 2.1)** could be slow on large datasets | Add MongoDB indexes on `createdAt`, scope queries to owner's restaurantId, add `.explain()` before shipping |
| **Account lockout (Phase 5.1)** could lock out legitimate users who forget passwords | Return 429 with a clear retry-after header, don't lock out permanently (15 min window) |
| **PasswordChangedAt check (Phase 5.2)** will force-logout all existing sessions when deployed | Deploy at end of a maintenance window, document to users, or set `passwordChangedAt = null` for existing users initially |
| **Landing page split (Phase 3.6)** touches a high-visibility file | Verify build passes after each extraction, test rendering in browser |
| **Service layer extraction (Phase 2.2)** could introduce regressions if existing routes have quirks | Write/run tests before and after to verify same behavior |

---

## Verification Checklist

- [ ] **Phase 1:** `npm run build` passes on frontend after all changes
- [ ] **Phase 1:** Backend starts without errors, POST /restaurants works correctly
- [ ] **Phase 2:** `cd backend && npm test` passes (all 18 existing + new tests)
- [ ] **Phase 2:** Analytics endpoint returns real aggregated data, not Math.sin
- [ ] **Phase 3:** `cd frontend && vitest run` passes (all existing + new tests)
- [ ] **Phase 3:** Empty states render on customer dashboard when no restaurants match
- [ ] **Phase 3:** Error boundaries catch crashes without breaking the full app
- [ ] **Phase 4:** `ANALYZE=true npm run build` generates report (verify file exists)
- [ ] **Phase 4:** Manifest loads in browser DevTools → Application → Manifest
- [ ] **Phase 5:** Login with wrong password 5x → receives 429 "Account locked"
- [ ] **Phase 5:** Changing password invalidates old JWTs immediately
- [ ] **Final:** `npm run build` passes on frontend, backend starts, all tests pass

---

## Phase Execution Order

```
Phase 1 ──► Phase 2 ──► Phase 3 ──► Phase 4 ──► Phase 5
(Bugs)      (Backend)    (Frontend)   (Perf)       (Security)
```

Phases are **independently deployable** — each can be developed, tested, and shipped without waiting for the next. The ordering prioritizes quick wins first, backend foundation before frontend, and security last (lowest regression risk).
