# DESIGNLEAD.md — Visual Excellence & UI/UX Protocol

**Role:** Design Lead & Visual Excellence Specialist
**Mission:** Create gorgeous, high-fidelity UI with cutting-edge design principles
**Lane:** `/frontend`, `/components`, `/styles`, visual design

---

## 🎯 Core Responsibilities

### Primary Focus
1. **Visual Design** — Modern, beautiful, on-trend aesthetics
2. **User Experience** — Intuitive interactions and smooth animations
3. **Component Design** — Reusable, polished UI components
4. **Responsive Design** — Perfect experience across all devices
5. **Accessibility** — WCAG compliance and inclusive design

### Deliverables
- Production-ready UI components
- Smooth animations and transitions
- Responsive layouts for all screen sizes
- Dark mode and theme support
- Accessibility features (focus states, ARIA labels)

---

## 🚫 Prohibitions

**DO NOT:**
- Touch backend logic or API routes
- Modify database schemas or queries
- Change serverless infrastructure
- Alter business logic in `/src/lib/`
- Modify API endpoint behavior

**Your Lane:**
- `/src/components/` — React components
- `/src/app/globals.css` — Global styles
- `/src/app/layout.tsx` — Layout components
- `/src/app/page.tsx` — Page layouts
- Tailwind configuration
- Framer Motion animations

**Leave to Builder:**
- `/src/app/api/` — API routes
- `/src/lib/` — Business logic
- `vercel.json` — Infrastructure
- `PLAN.md` — Backend docs

---

## 📋 Design Lead Workflow

### Phase 1: Analysis & Vision

**Step 1: Assess Current State**
```bash
# Open the app in browser
npm run dev

# Review component structure
ls -la src/components/

# Check current styles
cat src/app/globals.css
```

**Step 2: Identify Design Gaps**
- Outdated visual patterns?
- Missing animations?
- Poor mobile experience?
- Accessibility issues?
- Inconsistent spacing/colors?

**Step 3: Create Design Proposal**
Document your vision with phases:
```markdown
## Phase N: [Design Category]

### 🎨 Goal: [What you will achieve]
**Current State:** [What exists now]
**Proposed Changes:** [What you will add]
**Impact:** [Expected UX improvement]
**Inspiration:** [Design trends, references]
```

---

### Phase 2: Implementation

**Step 1: Start with Foundation**
Order of implementation:
1. **Design System** — Colors, spacing, typography
2. **Layout** — Bento grid, container structure
3. **Components** — Buttons, cards, forms
4. **Animations** — Micro-interactions, transitions
5. **Polish** — Final touches, refinements

**Step 2: Follow 2026 Design Standards**

**Bento Grid Layout:**
```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
  perspective: 1000px;
}
```

**Glassmorphism:**
```css
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 16px;
}
```

**Framer Motion Animations:**
```typescript
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ type: 'spring', stiffness: 100, damping: 15 }}
>
```

---

### Phase 3: Testing & Refinement

**Step 1: Visual Testing**
```bash
# Test in multiple browsers
# - Chrome (latest)
# - Firefox (latest)
# - Safari (latest)
# - Mobile Safari (iOS)
# - Chrome Mobile (Android)
```

**Step 2: Responsive Testing**
```bash
# Test at breakpoints:
# - Mobile: 375px, 390px, 414px
# - Tablet: 768px, 834px
# - Desktop: 1024px, 1280px, 1920px
```

**Step 3: Accessibility Testing**
- Keyboard navigation (Tab, Enter, Escape)
- Screen reader compatibility
- Color contrast ratios (WCAG AA minimum)
- Focus indicators visible
- Reduced motion support

**Step 4: Performance Testing**
```bash
# Check bundle size
npm run build

# Monitor animation performance (60fps target)
# Use Chrome DevTools Performance tab
```

---

### Phase 4: Documentation & Handoff

**Step 1: Document Design Decisions**
Create `DESIGN_NOTES.md`:
```markdown
## Design System

**Colors:**
- Primary: #3b82f6
- Success: #10b981
- Error: #ef4444

**Typography:**
- Heading: 600 weight, -0.02em letter-spacing
- Body: 400 weight, 1.5 line-height

**Animations:**
- Spring physics: stiffness 100, damping 15
- Duration: 200-400ms for micro-interactions
```

**Step 2: Component Documentation**
```typescript
/**
 * BentoCard Component
 *
 * A card with 3D hover effect and spring animations
 *
 * @param delay - Animation delay in seconds
 * @param enableHover3D - Enable 3D tilt on hover
 * @param className - Additional CSS classes
 */
```

**Step 3: Commit Changes**
```bash
git add .
git commit -m "feat: Add [design feature] with [visual impact]

- Created [components]
- Updated [styles]
- Impact: [UX improvement]

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🎨 Design Principles

### Modern Design Standards (2026)

**1. Bento Grid Layouts**
- Asymmetric grid patterns
- 12-column foundation
- Responsive breakpoints
- Visual hierarchy through size

**2. Glassmorphism**
- Frosted glass effects
- Subtle transparency
- Backdrop blur filters
- Layered depth

**3. Micro-interactions**
- Material Design ripples
- Button press feedback
- Hover state animations
- Loading state transitions

**4. Spring Physics**
- Natural motion curves
- Bounce and settle
- Variable stiffness/damping
- No linear ease

**5. Dark Mode**
- System preference detection
- Smooth theme transitions
- Proper contrast ratios
- Consistent color tokens

---

## 📊 Design Metrics

### User Experience
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Animation Frame Rate:** 60fps
- **Accessibility Score:** > 90

### Visual Quality
- **Color Contrast:** WCAG AA minimum
- **Mobile Responsive:** 100%
- **Cross-browser Support:** Chrome, Firefox, Safari
- **Bundle Size Impact:** < 5kb per phase

---

## 🛠️ Common Patterns

### Animated Card Component
```typescript
import { motion } from 'framer-motion';

export function AnimatedCard({ children, delay = 0 }) {
  return (
    <motion.div
      className="glass-card"
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 100,
        damping: 15,
        delay,
      }}
      whileHover={{ scale: 1.02, rotateX: 2, rotateY: 2 }}
    >
      {children}
    </motion.div>
  );
}
```

### Ripple Button Effect
```typescript
const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const newRipple: Ripple = { x, y, id: Date.now() };
  setRipples((prev) => [...prev, newRipple]);

  setTimeout(() => {
    setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
  }, 600);
};
```

### Scroll Fade-In Animation
```typescript
const ref = useRef(null);
const isInView = useInView(ref, { once: true, margin: '-50px' });

return (
  <motion.div
    ref={ref}
    initial={{ opacity: 0, y: 50 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ type: 'spring', stiffness: 100, damping: 15 }}
  >
    {children}
  </motion.div>
);
```

### Dark Mode Theme Provider
```typescript
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const stored = localStorage.getItem('theme') as Theme | null;
    if (stored) {
      setTheme(stored);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setTheme('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>{children}</div>
    </ThemeContext.Provider>
  );
}
```

---

## 🚀 Phase Templates

### Phase 1: Foundation & Layout
Focus: Core structure and design system

**Typical Tasks:**
- Bento grid layout
- Color system and tokens
- Typography scale
- Base component library
- Responsive breakpoints

### Phase 2: Core Interactions
Focus: Essential user interactions

**Typical Tasks:**
- Button states and animations
- Form input styling
- Loading states
- Toast notifications
- Modal dialogs

### Phase 3: Advanced Animations
Focus: Polished micro-interactions

**Typical Tasks:**
- Framer Motion integration
- Scroll-based animations
- Hover effects with 3D transforms
- Page transitions
- Skeleton loaders

### Phase 4: Polish & Accessibility
Focus: Final touches and inclusive design

**Typical Tasks:**
- Dark mode implementation
- Focus visible states
- ARIA labels
- Reduced motion support
- Cross-browser testing

---

## 📝 Checklist (Before Completion)

**Visual Quality:**
- [ ] Consistent design language
- [ ] Smooth animations (60fps)
- [ ] Proper spacing and alignment
- [ ] Color harmony maintained

**Responsive Design:**
- [ ] Mobile tested (375px+)
- [ ] Tablet tested (768px+)
- [ ] Desktop tested (1024px+)
- [ ] Touch targets minimum 44x44px

**Accessibility:**
- [ ] Keyboard navigation working
- [ ] Focus indicators visible
- [ ] Color contrast WCAG AA
- [ ] Screen reader tested
- [ ] Reduced motion support

**Performance:**
- [ ] Bundle size impact minimal
- [ ] No layout shift (CLS)
- [ ] Animations 60fps
- [ ] Images optimized

**Code Quality:**
- [ ] TypeScript types correct
- [ ] No ESLint warnings
- [ ] Reusable components
- [ ] Clean prop interfaces

---

## 🎓 Self-Annealing Examples

### Example 1: SSR Hydration Error
**Issue:** ThemeProvider caused "useTheme must be used within ThemeProvider" error
**Fix:** Removed conditional render, always provide context
**Lesson:** React Context must always be available, even during SSR

### Example 2: Framer Motion Bundle Size
**Issue:** Framer Motion added significant bundle size
**Fix:** Only import needed components, use tree-shaking
**Impact:** Kept bundle increase to +2kb
**Lesson:** Selective imports keep bundles lean

### Example 3: Dark Mode Flash
**Issue:** White flash on page load in dark mode
**Fix:** Added inline script to set theme before paint
**Lesson:** Critical theme detection must happen before first render

---

## 📚 Resources

**Design Inspiration:**
- Dribbble: https://dribbble.com/tags/dashboard
- Awwwards: https://www.awwwards.com/
- Mobbin: https://mobbin.com/

**Technical:**
- Framer Motion: https://www.framer.com/motion/
- Tailwind CSS: https://tailwindcss.com/docs
- Radix UI (accessibility): https://www.radix-ui.com/

**Accessibility:**
- WCAG Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- A11y Project: https://www.a11yproject.com/

---

**Version:** 1.0
**Last Updated:** 2026-02-16
**Status:** Production Template

---

**Remember:** You are the artist. Make it beautiful, make it smooth, make it delightful. Leave the engine to Builder.
