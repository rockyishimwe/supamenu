# DineFlow Implementation Plan: Background Images + Animations

## Current State Analysis
- **Auth pages** (Landing, Login, Register, Forgot Password): Already have `BackgroundCarousel` component with rotating Unsplash images and overlay
- **Dashboard pages** (Customer, Owner, Staff): Only have subtle `bg-dots-pattern` and radial gradient blobs - no full-screen background images
- **Animations**: PageTransition component exists with basic variants, but many components lack hover effects, micro-interactions, and entrance animations
- **Theme**: Dark mode works (after hydration fix), CSS variables defined in `globals.css`

---

## Phase 1: Background Images for Dashboard Pages

### 1.1 Create Dashboard-Specific Background Components
Create contextual background carousels for each dashboard type:

| Dashboard | Image Theme | Component |
|-----------|-------------|-----------|
| Customer | Food, dining atmosphere, cozy restaurants | `CustomerBackground` |
| Owner | Restaurant management, analytics, kitchen | `OwnerBackground` |
| Staff | Kitchen workflow, table service, POS | `StaffBackground` |

### 1.2 Implementation Steps
1. Create `/components/customer/CustomerBackground.js` - food/restaurant atmosphere images
2. Create `/components/owner/OwnerBackground.js` - professional/restaurant management images  
3. Create `/components/staff/StaffBackground.js` - kitchen/service workflow images
3. Update each layout file to include the background component
4. Add `BackgroundCarousel` as wrapper for consistent overlay/fade behavior

### 1.3 Files to Modify
- `app/customer/layout.js` - Add CustomerBackground
- `app/owner/layout.js` - Add OwnerBackground  
- `app/staff/layout.js` - Add StaffBackground

---

## Phase 2: Animation Enhancements

### 2.1 Extend PageTransition Variants
Add new animation variants to `/components/PageTransition.js`:
- `fadeIn` - simple fade
- `slideUp` - from bottom
- `slideDown` - from top  
- `scaleIn` - pop in
- `staggerItem` - for lists with custom delay
- `hoverLift` - for cards/buttons
- `hoverGlow` - subtle glow on hover
- `tapScale` - press feedback

### 2.2 Component-Level Animations

#### Customer Dashboard (`app/customer/page.js`)
- [ ] Animate category chips on hover (scale + glow)
- [ ] RestaurantCard: add hover lift + image zoom
- [ ] Menu item cards: hover shine effect + button pop
- [ ] QuickBookingForm: field focus animations
- [ ] WelcomeBanner: wallet balance count-up animation

#### Owner Dashboard (`app/owner/page.js`)
- [ ] KPI cards: staggered entrance + hover lift
- [ ] Charts: animate on scroll into view (use `whileInView`)
- [ ] Menu items list: slide-in from left
- [ ] Invite code card: copy button feedback animation
- [ ] MiniCalendar: day hover highlight

#### Staff Dashboard
- [ ] Order cards: status-based animations (pulse for pending)
- [ ] Table grid: hover reveal actions
- [ ] Real-time updates: smooth transitions

### 2.3 Global Micro-Interactions
- [ ] Button hover: `whileHover={{ scale: 1.02 }}` + `whileTap={{ scale: 0.98 }}`
- [ ] Input focus: border glow + label float
- [ ] Card hover: `y: -4`, `boxShadow` increase
- [ ] Nav items: underline slide animation
- [ ] Toast notifications: slide in + progress bar
- [ ] Modal/Dialog: backdrop blur + scale entrance

---

## Phase 3: Visual Polish & Effects

### 3.1 Background Pattern System
Add to `globals.css`:
- `bg-dots-pattern` - subtle dot grid (already exists)
- `bg-grid-pattern` - fine grid lines
- `bg-mesh-gradient` - animated mesh gradients
- `bg-noise` - subtle film grain overlay

### 3.2 Scroll-Triggered Animations
- Use `framer-motion`'s `whileInView` for sections
- Add `viewport={{ once: true, margin: '-100px' }}`

### 3.3 Loading & State Animations
- Skeleton loaders with shimmer (already has `SkeletonRow`)
- Page transition between routes (layout.tsx level)
- Form submission: button loading spinner + success checkmark

---

## Phase 4: Implementation Priority & Scoring

| Task | Effort | Impact | Priority |
|------|--------|--------|----------|
| Dashboard backgrounds (3 layouts) | Low | High | **P0** |
| PageTransition variant extensions | Low | High | **P0** |
| Button/card hover micro-interactions | Low | High | **P0** |
| Customer dashboard card animations | Medium | High | **P1** |
| Owner dashboard chart animations | Medium | Medium | **P1** |
| Staff dashboard animations | Medium | Medium | **P1** |
| Scroll-triggered section animations | Medium | Medium | **P2** |
| Mesh gradient backgrounds | Low | Low | **P2** |
| Form field animations | Low | Medium | **P2** |
| Page-to-page transitions | Medium | Low | **P3** |

---

## Target Score Improvement

| Category | Current | Target | Delta |
|----------|---------|--------|-------|
| Frontend Testing & Quality | 6/10 | 8/10 | +2 |
| State Management | 7/10 | 8/10 | +1 |
| Code Quality & Maintainability | 7/10 | 8/10 | +1 |
| **Overall** | **81/100** | **87/100** | **+6** |

---

## Next Steps
1. **Start Phase 1**: Create 3 dashboard background components + integrate into layouts
2. **Phase 2**: Extend PageTransition, add hover variants
3. **Phase 3**: Apply animations to customer dashboard (highest visibility)
4. **Phase 4**: Owner/staff dashboards
5. **Phase 5**: Global polish, scroll animations

---

## Notes
- All code in **JavaScript only** (no TypeScript)
- Use existing `framer-motion` dependency
- Leverage existing CSS variables (`--color-primary`, `--color-bg-dark`, etc.)
- Maintain dark/light mode compatibility
- Test on mobile (responsive backgrounds)
- Keep bundle size impact minimal (lazy load where needed)