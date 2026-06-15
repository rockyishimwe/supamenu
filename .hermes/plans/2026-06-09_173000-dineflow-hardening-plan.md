# DineFlow Hardening — Implementation Plan

> **For Hermes:** Execute this plan phase-by-phase, completing all steps in a phase before reporting status.
>
> **Goal:** Address the top 10 priority issues identified in the codebase audit — security, error handling, testing, frontend robustness, and auth improvement.
>
> **Approach:** Front-loaded security fixes first, then API cleanup, then testing, then UI polish, then advanced auth. Each phase is independently deployable.
>
> **Tech Stack:** Node.js/Express (backend), Next.js 16 App Router + Zustand + React Query (frontend), MongoDB/Mongoose, Vitest + Supertest (testing)
>
> **Verification anchor:** After each phase, run `cd backend && npm test` (and `cd frontend && npm test` if frontend files changed).

---

## Phase 1: Security Hardening (Staff Password + Error Leakage)

### Task 1.1: Require owner-set password in staff creation

**Objective:** Remove the hardcoded default password `'changeme123'` and require the owner to provide a password when creating staff members.

**Files:**
- Modify: `backend/routes/staff.js:25-34` (validation chain)
- Modify: `backend/routes/staff.js:35-49` (route handler)

**Step 1: Add password to validation chain**

In `routes/staff.js`, change the POST validator from:
```js
body('name').trim().notEmpty().withMessage('Name is required'),
body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
```
to:
```js
body('name').trim().notEmpty().withMessage('Name is required'),
body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
```

**Step 2: Use provided password in route handler**

Change:
```js
password: password || 'changeme123',
```
to:
```js
password, // password is required and validated above
```

**Verification:**
- Run: `cd backend && npm test` (existing auth tests should still pass)
- Manual: POST `/api/staff` without password → expect 400 validation error
- Manual: POST `/api/staff` with password `'short'` → expect 400 (min 8)
- Manual: POST `/api/staff` with password `'correct-horse-battery-staple'` → expect 201

---

### Task 1.2: Centralize error handling — stop leaking `err.message` in catch blocks

**Objective:** Replace all `catch (err) { res.status(NNN).json({ message: '...', error: err.message }) }` patterns with calls to `next(err)` so the centralized `errorHandler` middleware sanitizes 500s (hides internals) and passes through 4xx messages cleanly.

**Pattern to replace (appears 14+ times across 6 files):**
```js
} catch (err) {
  res.status(500).json({ message: 'Server error', error: err.message });
}
```

**Pattern to use instead:**
```js
} catch (err) {
  next(err);
}
```

**Files to modify:**

| File | Lines | Pattern |
|------|-------|---------|
| `backend/routes/orders.js` | 37-40, 91-94, 125-128 | Has `err.message` leaks |
| `backend/routes/tables.js` | 27-29, 52-54, 98-101 | `error: err.message` |
| `backend/routes/reservations.js` | 24-27, 68-70, 102-104, 128-131 | Same pattern |
| `backend/routes/restaurants.js` | (all catch blocks) | Same pattern |
| `backend/routes/analytics.js` | 49-51, 57-59, 65-67, 96-98 | Same pattern |
| `backend/routes/staff.js` | 20-21, 46-48, 57-59 | Less egregious but consistent |

**Step 1: Audit each occurrence**

For each file, read every `catch` block. Three cases:

1. **Catch that sets res.status directly** (most common): Replace the body with `return next(err)` or `next(err)`.

2. **Catch that extracts `err.status`** (auth.js pattern — already safe): These use `err.status || 500` and pass the error's own message. These are **already acceptable** because they propagate 4xx messages correctly. BUT: if a 500 happens, `err.message` will be an internal detail. Change to `next(err)` to let errorHandler sanitize.

3. **Routes with both validation and error**: The express-validator `validate` middleware already handles 400s. Only the route's own try/catch needs the `next(err)` change.

**Step 1a: Make sure every route handler has `(req, res, next)` signature**

Some routes only have `(req, res)` — they need `next` added.

Example fix in `routes/orders.js:89`:
```js
async (req, res, next) => {
  try {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}
```

**Step 2: Verify errorHandler handles all cases**

Current `errorHandler.js` already:
- Logs the error
- Returns generic 'Internal server error' for 500s
- Passes through 4xx messages
- Includes validation errors if present

This is already correct. The only change is that routes must call `next(err)` instead of manually setting responses.

**Verification:**
- Run: `cd backend && npm test`
- Manual: POST `/api/auth/login` with wrong password → expect `{ message: "Invalid credentials" }` (still passes through)
- Manual: Trigger a 500 (e.g., malformed MongoDB query via injection-lite test) → expect `{ message: "Internal server error" }` (sanitized)

---

### Task 1.3: Add security headers and CSP configuration

**Objective:** Review and tighten Helmet CSP and add HSTS.

**Files:**
- Check: `backend/server.js` (where helmet is configured)

**Step 1: Read current helmet config in server.js**

Run: `grep -n helmet backend/server.js`

**Step 2: Add strict CSP if missing**

```js
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'https://*'],
      connectSrc: ["'self'", 'https://api.example.com'],
    },
  })
);
```

(Adjust based on actual server.js setup — likely helmet is already applied with defaults.)

**Verification:**
- Run: `curl -I http://localhost:5000/api/health | grep -i content-security-policy`

---

## Phase 2: API Cleanup

### Task 2.1: Remove duplicate `/auth/me` route

**Objective:** `routes/auth.js` has `/me` (line 116) and `/profile` (line 125) that do the same thing. Remove the `/me` duplicate to keep a single canonical endpoint.

**Files:**
- Modify: `backend/routes/auth.js:116-123` (remove `/me` block)
- Update: `backend/swagger.js` if `/auth/me` is documented there
- Update: Any frontend code referencing `/auth/me` → change to `/auth/profile`

**Step 1: Check frontend references**

```bash
grep -r "/auth/me" frontend/
```
If frontend calls `/auth/me`, update those to `/auth/profile`.

**Step 2: Remove `/me` block from auth.js**

Delete lines 116-123 (the `GET /me` handler).

**Step 3: Remove Swagger doc for `/auth/me`**

If `swagger.js` documents `/auth/me`, remove that section. Keep `/auth/profile` and its PATCH variant.

**Verification:**
- Run: `cd backend && npm test`
- Manual: GET `/api/auth/me` → 404 (no longer exists)
- Manual: GET `/api/auth/profile` → 200 (works, returns user)

---

### Task 2.2: Standardize role-check pattern across all routes

**Objective:** Replace inline `if (req.user.role !== 'owner')` guard clauses with the existing `requireRole` middleware for consistency.

**Files:**
- Check: `backend/middleware/auth.js` — does `requireRole` exist?
   - If yes: export it and use it
   - If no: Create a `requireRole(...roles)` middleware
- Modify: `backend/routes/staff.js:13,30,53` (inline role checks)
- Modify: `backend/routes/tables.js:79,106` (inline role checks)
- Modify: `backend/routes/reservations.js:13,81,120` (inline role checks)

**Step 1: Verify/create `requireRole` middleware**

Check `backend/middleware/auth.js` for an existing `requireRole` function. If it exists, add it to the module exports. If not, add:

```js
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
}
```

Export it alongside `authMiddleware`.

**Step 2: Apply to routes**

Replace inline checks like:
```js
if (req.user.role !== 'owner') return res.status(403).json({ message: 'Access denied' });
```
with middleware:
```js
router.get('/', authMiddleware, requireRole('admin'), async (req, res) => { ... });
```

For routes that check `req.user.role === 'customer'` for scoping, keep those inline (they're data-scoping logic, not authorization).

**Verification:**
- Run: `cd backend && npm test`
- Manual: Staff user tries to POST `/api/staff` → 403
- Manual: Owner user tries to POST `/api/staff` → 201 (or validation error)

---

## Phase 3: Backend Testing (Integration Tests)

### Task 3.1: Set up test MongoDB helper

**Objective:** Create a test helper that provisions a test MongoDB (via mongodb-memory-server) and provides a createApp() factory for integration tests.

**Files:**
- Create: `backend/tests/helpers/setup.js`
- Install: `npm install --save-dev mongodb-memory-server` (if not present)

**Step 1: Create test helper**

```js
const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const express = require('express');

let mongoServer;

async function setupTestDB() {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}

async function teardownTestDB() {
  await mongoose.disconnect();
  await mongoServer?.stop();
}

function createApp() {
  const app = express();
  app.use(express.json());
  // Mount routes needed by the test
  return app;
}

module.exports = { setupTestDB, teardownTestDB, createApp };
```

**Verification:**
- Run: A simple test that calls `setupTestDB()`, creates a model, saves it, finds it, then `teardownTestDB()`

---

### Task 3.2: Write orders integration test

**Objective:** Test the full order lifecycle: create → query → update status — hitting a real MongoDB instance.

**Files:**
- Create: `backend/tests/orders.test.js`

**Step 1: Write test**

```js
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
let app;
let token;
let orderId;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());

  // Import after env is set
  process.env.JWT_SECRET = 'test-secret-key';
  const User = require('../models/User');
  const user = await User.create({
    name: 'Test Customer',
    email: 'test@test.com',
    password: 'password123',
    role: 'customer',
  });

  // Generate token
  const jwt = require('jsonwebtoken');
  token = jwt.sign({ id: user._id, role: 'customer' }, process.env.JWT_SECRET);

  app = express();
  app.use(express.json());
  app.use('/api/orders', require('../routes/orders'));
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer?.stop();
});

describe('Orders API', () => {
  it('POST /api/orders - create order', async () => {
    const res = await request(app)
      .post('/api/orders')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{ menuItemId: 'abc123', name: 'Burger', quantity: 2, price: 12.99 }],
        total: 25.98,
        paymentMethod: 'wallet',
      });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.items).toHaveLength(1);
    expect(res.body.total).toBe(25.98);
    orderId = res.body._id;
  });

  it('GET /api/orders - list orders', async () => {
    const res = await request(app)
      .get('/api/orders')
      .set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.data).toBeInstanceOf(Array);
    expect(res.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('PATCH /api/orders/:id/status - update order status', async () => {
    const res = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'preparing' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('preparing');
  });
});
```

**Verification:**
- Run: `cd backend && npx vitest run tests/orders.test.js`
- Expected: 3 tests passed

---

### Task 3.3: Write reservations integration test

**Objective:** Test the full reservation lifecycle: create → query → cancel — hitting a real MongoDB instance. Uses mongodb-memory-server (shared from helper).

**Files:**
- Create: `backend/tests/reservations.test.js`

**Step 1: Write test** (similar structure to orders test, but with reservation-specific endpoints and at minimum: create reservation, list reservations for customer, cancel reservation).

**Verification:**
- Run: `cd backend && npx vitest run tests/reservations.test.js`
- Expected: 3-4 tests passed

---

## Phase 4: Frontend Polish

### Task 4.1: Add loading/error states to pages using React Query data

**Objective:** Pages like Owner dashboard, Explore page, and Staff dashboard reference data that comes from `useDineFlow()` (which wraps Zustand stores). The stores get populated by `data-service.js`. Add explicit `isLoading`/`isError` handling where data might be missing instead of rendering empty content.

**Note:** The frontend uses a `useDineFlow()` context hook (from `app/context.js`) that pulls from Zustand stores. The stores are populated by `data-service.js`'s `loadLiveData()` or `loadDemoData()`. This is **not** React Query on the page level — it's store-based. React Query hooks exist in `useQueries.js` but aren't wired into the page components currently.

**Files to inspect first (context.js):**
- Understand how `useDineFlow()` exposes data. If it returns `{ restaurants, menuItems, tables, ... }`, check if there are loading flags.

**Step 1: Audit the data flow**

Read `app/context.js` to see how `useDineFlow()` is constructed. If it exposes loading/settled state:

```js
const { restaurants, loading, error } = useDineFlow();
```

If loading is not exposed, the simplest approach: add a `loading` flag to the `dataStore` (Zustand) that gets set `true` at start of `loadLiveData()`/`loadDemoData()` and `false` when done. Then expose it through context.

**Step 2: Add loading guard to key pages**

Example pattern for `frontend/app/owner/page.js`:
```jsx
const { restaurants, menuItems, tables, loading } = useDineFlow();

if (loading) {
  return (
    <div className="space-y-6">
      <SkeletonRow />
      <SkeletonChart />
      <SkeletonChart />
    </div>
  );
}
```

**Pages to update:**
- `frontend/app/(public)/page.js` — LandingPage (462 lines)
- `frontend/app/customer/explore/page.js` — Explore page
- `frontend/app/owner/page.js` — Owner dashboard (already has SkeletonRow, SkeletonChart — verify they render)
- `frontend/app/staff/page.js` — Staff dashboard (has `if (!tables || !orders) return <SkeletonRow />` — already good!)

**Verification:**
- Run: `cd frontend && npm test`
- Visual: Load the app in demo mode → pages should render loading skeletons while data hydrates

---

### Task 4.2: Centralize tax/service calculation

**Objective:** The Cart page (`frontend/app/customer/cart/page.js`) hardcodes:
```js
const tax = subtotal * 0.085;
const service = subtotal * 0.1;
```
These constants should come from `frontend/lib/constants.js` and be reused consistently.

**Files:**
- Modify: `frontend/lib/constants.js` — add TAX_RATE, SERVICE_CHARGE_RATE
- Modify: `frontend/app/customer/cart/page.js` — import and use constants

**Step 1: Add rates to constants.js**

```js
export const DEFAULTS = {
  // ... existing ...
  TAX_RATE: 0.085,         // 8.5%
  SERVICE_CHARGE_RATE: 0.1, // 10%
};
```

**Step 2: Update Cart page**

```js
import { DEFAULTS } from '../../../lib/constants';
// ...
const tax = subtotal * DEFAULTS.TAX_RATE;
const service = subtotal * DEFAULTS.SERVICE_CHARGE_RATE;
```

Also check if the backend calculates tax/service anywhere (look for `1.185` magic number in `data-service.js:177` — that's `1 + 0.085 + 0.1`):
```js
const total = subtotal * 1.185;
```
Replace with:
```js
const total = subtotal * (1 + DEFAULTS.TAX_RATE + DEFAULTS.SERVICE_CHARGE_RATE);
```
But since `data-service.js` is frontend code using `constants.js`, import accordingly.

**Verification:**
- Run: `cd frontend && npm test`
- Manual: Add items to cart, go to cart page → tax and service charge should match expected rates

---

### Task 4.3: Add Suspense boundaries around data-fetching areas

**Objective:** Wrap sections that depend on async data with React Suspense + fallback skeletons.

**Files:**
- Modify: `frontend/app/owner/page.js` — add `<Suspense fallback={<SkeletonChart />}>` around analytics chart section
- Modify: `frontend/app/customer/explore/page.js` — add Suspense around restaurant list section

**Step 1: Identify async-dependent sections**

The owner dashboard renders analytics charts (line 130+ of owner/page.js) and restaurant list/menu. Wrap each chart section:

```jsx
import { Suspense } from 'react';

// In OwnerDashboard:
<Suspense fallback={<SkeletonChart />}>
  <AreaChart data={salesData}>...</AreaChart>
</Suspense>
```

(Note: React Query doesn't use Suspense by default. If using `useQuery` with `suspense: true` or React 19's `use()` hook, this works natively. Otherwise, the existing `isLoading || !data` pattern is more appropriate. Choose the approach based on the actual page data flow.)

**Step 2: For store-based data (Zustand), use loading state checks**

If the page reads from Zustand stores rather than React Query hooks, add:
```jsx
if (!data || data.length === 0) {
  return <SkeletonChart />;
}
```

**Verification:**
- Visual: Pages should show skeletons/chart loading indicators while data hydrates
- No console errors from missing data

---

## Phase 5: Auth Enhancement (Refresh Token Rotation)

### Task 5.1: Create RefreshToken model

**Objective:** Store refresh tokens in MongoDB to enable rotation and revocation.

**Files:**
- Create: `backend/models/RefreshToken.js`

**Step 1: Create model**

```js
const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  token: { type: String, required: true, index: true },
  expiresAt: { type: Date, required: true },
  revoked: { type: Boolean, default: false },
  replacedBy: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

// TTL index: auto-delete expired tokens
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
```

**Verification:**
- Run: `cd backend && node -e "require('./models/RefreshToken'); console.log('Model OK')"`

---

### Task 5.2: Add refresh token logic to authService

**Objective:** Generate short-lived access tokens (15 min) + long-lived refresh tokens (7 days) on login/register. Add token rotation endpoint.

**Files:**
- Modify: `backend/services/authService.js`

**Step 1: Add token generation functions**

```js
const crypto = require('crypto');
const RefreshToken = require('../models/RefreshToken');

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_DAYS = 7;

function generateAccessToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

async function generateRefreshToken(user) {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_DAYS);

  await RefreshToken.create({
    userId: user._id,
    token: rawToken,
    expiresAt,
  });

  return rawToken;
}
```

**Step 2: Update `loginUser` to return both tokens**

```js
async function loginUser({ email, password, role }) {
  // ... existing validation ...
  const accessToken = generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  return {
    accessToken,
    refreshToken,
    user: formatUser(user),
  };
}
```

**Step 3: Add `refreshToken` service function**

```js
async function refreshTokens(rawToken) {
  const stored = await RefreshToken.findOne({ token: rawToken, revoked: false });
  if (!stored) throw Object.assign(new Error('Invalid refresh token'), { status: 401 });
  if (stored.expiresAt < new Date()) throw Object.assign(new Error('Refresh token expired'), { status: 401 });

  // Rotation: revoke old, issue new
  const user = await User.findById(stored.userId);
  if (!user) throw Object.assign(new Error('User not found'), { status: 404 });

  stored.revoked = true;
  await stored.save();

  const accessToken = generateAccessToken(user);
  const newRefreshToken = await generateRefreshToken(user);

  return { accessToken, refreshToken: newRefreshToken, user: formatUser(user) };
}
```

**Verification:**
- Run: `cd backend && npm test`
- Manual: Login → get both tokens → call refresh endpoint with refresh token → get new pair

---

### Task 5.3: Add refresh and logout routes

**Objective:** New endpoints: `POST /auth/refresh` and `POST /auth/logout`.

**Files:**
- Modify: `backend/routes/auth.js`

**Step 1: Add refresh route**

```js
/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [refreshToken]
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200:
 *         description: Tokens refreshed
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh',
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
  validate,
  async (req, res, next) => {
    try {
      const result = await authService.refreshTokens(req.body.refreshToken);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
);
```

**Step 2: Add logout route**

```js
/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Revoke all refresh tokens for the user
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200:
 *         description: Logged out
 */
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    await RefreshToken.updateMany(
      { userId: req.user.id, revoked: false },
      { revoked: true }
    );
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});
```

**Step 3: Update frontend to use new token structure**

The frontend's `api.js` and `authStore.js` currently expect `{ token, user }` from login. Update to expect `{ accessToken, refreshToken, user }`.

In `frontend/lib/api.js`, after login:
```js
// Store refreshToken alongside accessToken
localStorage.setItem('dineflow_refresh_token', data.refreshToken);
return { token: data.accessToken, user: data.user, refreshToken: data.refreshToken };
```

In `frontend/lib/stores/authStore.js`, add:
```js
saveLocal('dineflow_refresh_token', data.refreshToken);
```

**Verification:**
- Run: `cd backend && npm test`
- Manual: login → get both tokens → POST `/auth/refresh` with refresh token → get new pair
- Manual: POST `/auth/logout` with valid access token → then try to use old refresh token → 401

---

### Task 5.4: Update Swagger docs for new auth endpoints

**Objective:** Add OpenAPI documentation for `/auth/refresh` and `/auth/logout` in `backend/swagger.js`.

**Files:**
- Modify: `backend/swagger.js`

**Step 1:** Add the two new endpoints to the Swagger paths, using the existing `components/schemas` that already exist.

**Verification:**
- Navigate to `http://localhost:5000/api-docs` → should show the new endpoints

---

## Summary of File Changes

| File | Change Type | Phase |
|------|-------------|-------|
| `backend/routes/staff.js` | Modify validation + remove default password | 1 |
| `backend/routes/orders.js` | Add `next` param, use `next(err)` | 1 |
| `backend/routes/tables.js` | Use `next(err)` | 1 |
| `backend/routes/reservations.js` | Use `next(err)` | 1 |
| `backend/routes/restaurants.js` | Use `next(err)` | 1 |
| `backend/routes/analytics.js` | Use `next(err)` | 1 |
| `backend/routes/staff.js` | Use `next(err)` | 1 |
| `backend/routes/auth.js` | Remove `/me` route | 2 |
| `backend/middleware/auth.js` | Add `requireRole()` | 2 |
| `backend/routes/*.js` | Apply `requireRole` where inline checks exist | 2 |
| `backend/tests/helpers/setup.js` | Create test helper | 3 |
| `backend/tests/orders.test.js` | Create integration test | 3 |
| `backend/tests/reservations.test.js` | Create integration test | 3 |
| `frontend/app/owner/page.js` | Add loading guards + loading indicator | 4 |
| `frontend/app/customer/explore/page.js` | Add loading guards | 4 |
| `frontend/app/(public)/page.js` | Add loading guards | 4 |
| `frontend/lib/constants.js` | Add TAX_RATE, SERVICE_CHARGE_RATE | 4 |
| `frontend/app/customer/cart/page.js` | Use Constants instead of magic numbers | 4 |
| `frontend/lib/data-service.js` | Use Constants for tax rate | 4 |
| `backend/models/RefreshToken.js` | Create new model | 5 |
| `backend/services/authService.js` | Add refresh token logic | 5 |
| `backend/routes/auth.js` | Add `/refresh`, `/logout` endpoints | 5 |
| `frontend/lib/api.js` | Use `accessToken`/`refreshToken` | 5 |
| `frontend/lib/stores/authStore.js` | Persist refresh token | 5 |
| `backend/swagger.js` | Document new endpoints | 5 |

## Risks & Tradeoffs

| Risk | Mitigation |
|------|------------|
| Refresh token rotation breaks existing sessions | Backward-compatible: old login still returns `{ token, user }`; new login returns `{ accessToken, refreshToken, user }`. Deploy and test auth flow before cutting over completely. |
| `mongodb-memory-server` adds 200MB+ to node_modules | It's a devDependency — production builds are unaffected. If CI disk space is tight, use `--ci --ignore-scripts`. |
| Changing error propagation from `res.status(500).json(...)` to `next(err)` could miss some error shapes | The existing `errorHandler` already handles all standard cases. Add a `console.warn` in dev mode during the transition. |
| Light-mode `!important` CSS degradation | Out of scope for this plan. Flagged as a future project. |

## Verification Checklist

- [ ] Phase 1: `cd backend && npm test` passes
- [ ] Phase 1: Staff creation requires password (manual test)
- [ ] Phase 1: 500 errors return generic message (manual test)
- [ ] Phase 2: `/auth/me` returns 404, `/auth/profile` works
- [ ] Phase 2: Staff routes return 403 for non-owner roles
- [ ] Phase 3: `npx vitest run tests/orders.test.js` — 3 passed
- [ ] Phase 3: `npx vitest run tests/reservations.test.js` — 3 passed
- [ ] Phase 4: Frontend pages show loading skeletons during data fetch
- [ ] Phase 4: Tax calculation matches constant values
- [ ] Phase 5: Login returns `accessToken` + `refreshToken`
- [ ] Phase 5: `POST /auth/refresh` returns new token pair
- [ ] Phase 5: `POST /auth/logout` revokes all tokens
- [ ] Phase 5: Swagger shows new auth endpoints
