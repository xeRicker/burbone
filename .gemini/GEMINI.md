# PROJECT SYSTEM SPECIFICATION

This document defines the required architecture, design system, and implementation rules.
All generated code MUST follow this specification strictly.

---

## 1. CORE PHILOSOPHY

- Apple-inspired minimalism
- Liquid Glass visual language
- Depth through translucency
- Precision over decoration
- Performance-first implementation
- RSC-first architecture
- Zero unnecessary client-side JavaScript

---

## 2. TECH STACK (STRICT)

All generated code MUST use this stack:

| Layer            | Technology                          | Rules |
|------------------|-------------------------------------|-------|
| Framework        | Next.js 15 (App Router)             | RSC by default |
| Language         | TypeScript (strict)                 | No `any`, no unsafe casting |
| Styling          | Tailwind CSS 4                      | Use `@theme` tokens |
| Animations       | motion                              | `import { motion } from "motion/react"` |
| Icons            | Lucide React                        | `strokeWidth={1.5}` only |
| Font             | Inter (SF Pro fallback)             | via `next/font/google` |
| State            | Zustand                             | Minimal stores |
| Data Fetching    | @tanstack/react-query               | Server prefetching |
| ORM              | Drizzle ORM                         | Fully typed |
| Database         | MySQL                               | Accessed via API routes |
| Hosting          | Vercel                              | Edge-ready when possible |

DO NOT:
- Use framer-motion
- Use styled-components
- Use CSS modules
- Use inline styles
- Use alternative animation libraries
- Use other icon libraries
- Use Redux or Context for global state unless explicitly requested

---

## 3. ARCHITECTURE RULES

### Server Components First

- All components are Server Components by default
- Add `"use client"` ONLY when:
  - animation is required
  - interactivity is required
  - local state is required

### Performance Constraints

- No layout shift
- No hydration mismatch
- No unnecessary re-renders
- Avoid heavy client bundles
- Use streaming when possible

---

## 4. DESIGN SYSTEM — LIQUID GLASS

This project follows Apple-style Liquid Glass principles.

### Visual Foundation

- Translucent layers
- backdrop-blur required for glass panels
- Blur range: 12px–40px
- Border radius: 12–20px
- Soft internal gradient overlays
- Subtle 1px white/black alpha borders when needed

### Shadows

- Soft only
- Max 20% opacity
- No harsh drop shadows
- Prefer layered depth instead of heavy shadow

### Typography

- No heavy bold (avoid >600 weight)
- Prefer 400–500
- Slight negative tracking on large headings (-0.02em)
- Tight leading (1.1–1.2 for display sizes)
- Generous whitespace

### Icons

- Lucide only
- strokeWidth={1.5}
- No filled icons
- Default size: 18–20px
- Optical alignment with text baseline

---

## 5. ANIMATION SYSTEM (STRICT)

All animations MUST use:

import { motion } from "motion/react"

Rules:

- Duration: 150–300ms
- Easing: cubic-bezier(0.4, 0, 0.2, 1)
- No bounce
- No exaggerated spring
- No elastic effects
- Use opacity + transform only
- Avoid layout animations unless essential
- Animations must feel subtle and premium

Do NOT:
- Use dramatic entrance animations
- Use scale > 1.05
- Use rotation unless explicitly requested
- Animate width/height causing layout reflow

---

## 6. COMPONENT DESIGN RULES

- Minimal UI
- Generous spacing (8pt grid system)
- No visual clutter
- Avoid unnecessary borders
- Avoid nested glass panels unless depth is required
- Interactive states must be subtle

Hover example:
- Slight brightness shift
- Subtle translateY(-1px)
- Optional soft glow

---

## 7. CODE QUALITY

- Clean, production-ready code
- No commented-out logic
- No unused imports
- Fully typed
- No console.logs
- No placeholder logic

---

## 8. OUTPUT REQUIREMENTS

When generating components:

- Provide complete component code
- Follow stack strictly
- Respect Liquid Glass principles
- Keep code elegant and minimal
- Avoid overengineering

## 9. VIBE CODING ARCHITECTURE RULES

This project is 100% AI-generated and AI-maintained.

Code must be optimized for:
- AI readability
- Context caching
- Minimal cognitive overhead
- Maximum modularity

---

### File Structure Rules

- One component per file
- One responsibility per file
- No multi-purpose files
- No files longer than ~200 lines
- Avoid deeply nested folder structures
- Prefer flat, predictable structure

Example:

/app
  /dashboard
    page.tsx
    layout.tsx
/components
  /ui
    button.tsx
    card.tsx
  /glass
    glass-panel.tsx
/hooks
  use-auth.ts
  use-theme.ts
/lib
  utils.ts
  constants.ts
  validators.ts

---

### Reusability Rules

- Never duplicate logic
- Extract repeated UI into components immediately
- Extract repeated logic into hooks
- Extract repeated utilities into /lib
- If something is used 2+ times → abstract it

---

### Code Simplicity Rules

- No over-engineering
- No complex generics unless truly necessary
- No clever patterns
- No meta-programming
- No dynamic imports unless required
- No hidden side effects
- No implicit behavior

Code must be obvious.

---

### Comments Policy

- No explanatory comments
- No tutorial-style comments
- No obvious comments
- Only allow comments if:
  - something is non-obvious
  - there is a critical architectural constraint

Default: no comments.

---

### Naming Conventions

- Clear, predictable names
- No abbreviations
- No single-letter variables
- No cute names
- Prefer explicit over short

Bad:
  btn, dataObj, x

Good:
  primaryButton
  userProfile
  dashboardMetrics

---

### State Management Rules

- Local state preferred
- Zustand only for real global state
- No derived state duplication
- No unnecessary selectors
- Keep stores small and focused

---

### Performance Rules

- Avoid unnecessary re-renders
- No inline object creation inside JSX when avoidable
- No unnecessary useMemo/useCallback
- No premature optimization
- Avoid heavy client components

---

### DRY Enforcement

If similar code appears more than twice:
→ Refactor.

If similar layout appears more than twice:
→ Extract layout wrapper.

If similar animation appears more than twice:
→ Create shared animation preset.

---

### Predictability Over Cleverness

The AI must always choose:
- boring
- obvious
- explicit
- readable

over:
- smart
- magical
- compact
- tricky

---

### Forbidden Patterns

- Massive index.ts barrels everywhere
- Deep prop drilling
- Anonymous default exports
- 500-line components
- Utility dumping ground files
- Re-export chains longer than 2 levels