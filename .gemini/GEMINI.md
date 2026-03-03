# GEMINI.md — Źródło Prawdy Projektu

> Jedyne źródło prawdy. Każdy kod MUSI być zgodny z tym plikiem.
> Niejasność → pytaj. Sprzeczność → wskaż. Nigdy nie zgaduj.

---

## 1. MULTI-AGENT WORKFLOW

### 🔍 Agent 1 — ANALITYK
Przed jakimkolwiek kodem:
1. Wypisz polecenia **JAWNE** + **WYNIKAJĄCE** z kontekstu.
2. Zidentyfikuj pliki do modyfikacji / tworzenia / usunięcia.
3. Sprawdź sprzeczności z tym plikiem i istniejącym kodem.

**Pytaj zawsze**: logika biznesowa, nowe encje DB, wybór między równoważnymi architekturami, zmiany schematu.
**Nie pytaj nigdy**: skeleton, empty state, error boundary, toast po CRUD, responsywność, disabled/loading, walidacja.

### 🏗️ Agent 2 — ARCHITEKT
1. Zaproponuj plan w punktach (pliki, kolejność, zakres).
2. Zidentyfikuj komponenty do reuse vs nowe.
3. Zaznacz zależności.
4. **Nie implementuj** — tylko plan.

### 💻 Agent 3 — IMPLEMENTATOR
1. Implementuj zgodnie z planem.
2. Pliki < 150 linii → pełny plik. Pliki > 150 linii → diff z min. 10 liniami kontekstu.
3. Mini-checklist po każdym pliku: tokeny ✓ | M3 ✓ | TS strict ✓ | stany UX ✓ | touch 48px ✓.

### ✅ Agent 4 — WERYFIKATOR + KOMPILATOR
Checklist:
- [ ] Wszystkie polecenia zrealizowane
- [ ] Zero surowych hex / text-white / bg-gray-*
- [ ] M3 spacing, shapes, typography
- [ ] WCAG AA (4.5:1 tekst, 3:1 UI)
- [ ] Touch target ≥ 48px
- [ ] Responsive (compact/medium/expanded/large)
- [ ] TypeScript strict (zero `any`, zero `var`)
- [ ] Stany UX (loading, error, empty, disabled)
- [ ] Zero natywnego wyglądu przeglądarki
- [ ] prefers-reduced-motion

Kompilacja: `npx tsc --noEmit` → `npm run build` → `npm run dev`. ZERO błędów = GOTOWE.

---

## 2. TECH STACK

**Core**: Next.js 15 App Router (React 19) | TypeScript strict | Tailwind CSS 4 | motion/react

**Data & State**: Zustand | TanStack Query v5 | Drizzle ORM | JSON (dev) → MySQL (prod)

**Hosting**: GitHub → Vercel | MySQL (produkcja)

**UI**: Material Symbols Rounded (variable font) | Inter | clsx + tailwind-merge → `cn()`

**Opcjonalne**: `@radix-ui/react-*` | `react-hook-form` + `zod` | `date-fns` | `sharp`

### Zakazane
- ❌ `framer-motion` → używaj `motion/react`
- ❌ `styled-components`, CSS modules, inline styles
- ❌ `@mui/material`, `antd`, `chakra-ui`
- ❌ `any`, `var`, surowe hex w klasach, `text-white`, `text-black`, `bg-gray-*`
- ❌ `input[type=date]`, `input[type=time]`, `input[type=color]`

---

## 3. KONWENCJE NEXT.JS 15
```typescript
// ✅ async params
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}
// ❌ ŹLE
export default function Page({ params }: { params: { id: string } }) {}
```

- **Server Components domyślnie.** `'use client'` tylko gdy: `useState`, `useEffect`, event handlery, browser API, TanStack Query.
- **Każda route**: `loading.tsx` (skeleton) + `error.tsx` (`'use client'` + retry).
- **Env vars**: `DATABASE_PROVIDER=json|mysql`, `DATABASE_URL`, `NEXTAUTH_SECRET`.

---

## 4. STRUKTURA PROJEKTU
```
src/
├── app/
│   ├── (auth)/login/page.tsx, layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx, page.tsx, loading.tsx, error.tsx
│   │   ├── supply-lists/ (page, loading, new/page, [id]/page)
│   │   ├── products/     (page, loading, [id]/page)
│   │   ├── locations/    (page, loading, [id]/page)
│   │   ├── employees/    (page, loading, [id]/page)
│   │   └── settings/page.tsx
│   ├── api/
│   └── layout.tsx, not-found.tsx
├── components/
│   ├── ui/
│   │   button, icon-button, fab, card, dialog, text-field, select, combobox,
│   │   checkbox, radio, switch, slider, date-picker, time-picker, chip, badge,
│   │   tooltip, snackbar, skeleton, table, tabs, accordion, progress,
│   │   pagination, breadcrumbs, avatar, empty-state, search-bar, file-upload,
│   │   menu, context-menu, popover, divider, icon
│   ├── navigation/
│   │   navigation-drawer, navigation-rail, navigation-bar, top-app-bar
│   ├── features/
│   │   supply-list-table, supply-list-form, product-picker, product-card,
│   │   location-card, employee-card, kpi-card, recent-activity
│   └── layouts/page-header
├── lib/
│   ├── db/ (index — provider switch, schema/, queries/)
│   ├── utils/ (cn, format, date)
│   └── constants/ (navigation)
├── stores/ (ui-store, supply-list-store)
├── hooks/ (use-supply-lists, use-products, use-locations, use-employees,
│            use-media-query, use-snackbar)
└── types/ (product, supply-list, location, employee, common)
```

---

## 5. M3 — SYSTEM KOLORÓW (DARK ONLY)

Seed: **neonowy pomarańczowy** (#FF8C42). Wyłącznie ciemny motyw.
```css
@import "tailwindcss";

@theme {
  /* PRIMARY — neon orange */
  --color-primary:                  #FF8C42;
  --color-primary-hover:            #FFA060;
  --color-primary-active:           #E07830;
  --color-primary-muted:            #FFB88A;
  --color-primary-subtle:           #2D1A0A;
  --color-on-primary:               #1A0800;
  --color-primary-container:        #3D1F00;
  --color-on-primary-container:     #FFDCC2;

  /* SECONDARY — blue */
  --color-secondary:                #42B4FF;
  --color-secondary-hover:          #60C4FF;
  --color-secondary-active:         #2898E0;
  --color-secondary-muted:          #8AD4FF;
  --color-secondary-subtle:         #0A1926;
  --color-on-secondary:             #001428;
  --color-secondary-container:      #003A5C;
  --color-on-secondary-container:   #C8E8FF;

  /* TERTIARY — warm yellow */
  --color-tertiary:                 #FFD166;
  --color-on-tertiary:              #221A00;
  --color-tertiary-container:       #3D3000;
  --color-on-tertiary-container:    #FFEEA8;

  /* SURFACES */
  --color-bg-base:       #0E0B0A;
  --color-bg-raised:     #1A1412;
  --color-bg-overlay:    #241C1A;
  --color-bg-elevated:   #2E2522;
  --color-bg-highest:    #3A302C;
  --color-bg-input:      #161110;

  /* TEXT */
  --color-text-primary:    #F0DDD6;
  --color-text-secondary:  #B8A49C;
  --color-text-muted:      #7A6B64;
  --color-text-disabled:   #4A3F3B;

  /* BORDER */
  --color-border-subtle:  #261E1C;
  --color-border-default: #3A302C;
  --color-border-hover:   #5A4E48;
  --color-border-focus:   #FF8C42;

  /* SUCCESS */
  --color-success:        #66D97A;  --color-success-hover:  #7AE68C;
  --color-success-active: #52C266;  --color-success-muted:  #A3E8B0;
  --color-success-subtle: #122216;  --color-success-border: #2D5C36;
  --color-on-success:     #002208;

  /* WARNING */
  --color-warning:        #FFD166;  --color-warning-hover:  #FFDC85;
  --color-warning-active: #E0B84D;  --color-warning-muted:  #FFE49E;
  --color-warning-subtle: #262010;  --color-warning-border: #5C4D20;
  --color-on-warning:     #221A00;

  /* ERROR */
  --color-error:        #FF6B6B;  --color-error-hover:  #FF8585;
  --color-error-active: #E05252;  --color-error-muted:  #FFAAAA;
  --color-error-subtle: #261212;  --color-error-border: #5C2020;
  --color-on-error:     #220404;

  /* INFO */
  --color-info:        #64B5F6;  --color-info-hover:  #82C6F8;
  --color-info-active: #4AA0E0;  --color-info-muted:  #A8D5FA;
  --color-info-subtle: #0E1926;  --color-info-border: #1E3A5C;

  /* INTERACTIVE */
  --color-hover-overlay:  rgba(255, 140, 66, 0.08);
  --color-active-overlay: rgba(255, 140, 66, 0.12);
  --color-focus-ring:     #FF8C42;
  --color-selected-bg:    #2D1A0A;
  --color-drag-overlay:   rgba(255, 140, 66, 0.16);

  /* SPECIAL */
  --color-scrim:                 rgba(0, 0, 0, 0.6);
  --color-skeleton:              #2E2522;
  --color-divider:               #261E1C;
  --color-scrollbar-thumb:       #3A302C;
  --color-scrollbar-thumb-hover: #5A4E48;
  --color-glow-primary:          rgba(255, 106, 0, 0.25);
  --color-glow-secondary:        rgba(66, 180, 255, 0.20);

  /* M3 ELEVATION OVERLAYS (dark tonal) */
  --elevation-1: rgba(255, 140, 66, 0.05);
  --elevation-2: rgba(255, 140, 66, 0.08);
  --elevation-3: rgba(255, 140, 66, 0.11);
  --elevation-4: rgba(255, 140, 66, 0.12);
  --elevation-5: rgba(255, 140, 66, 0.14);

  /* M3 SHAPE SCALE */
  --radius-xs:   4px;
  --radius-sm:   8px;
  --radius-md:   12px;
  --radius-lg:   16px;
  --radius-xl:   28px;
  --radius-full: 9999px;
}
```

### Mapowanie kolorów

| Element | Token |
|---|---|
| CTA główne | `primary` / `on-primary` |
| CTA drugoplanowe | `secondary` / `on-secondary` |
| Akcent/highlight | `tertiary` |
| Strona (bg) | `bg-base` |
| Karty, sidebar | `bg-raised` |
| Modal, dropdown | `bg-overlay` |
| Input bg | `bg-input` |
| Tekst główny | `text-primary` |
| Label, meta | `text-secondary` |
| Placeholder | `text-muted` |
| Status badge tło | `*-subtle` |
| Hover | `hover-overlay` via `::before` |
| Zaznaczone | `selected-bg` |

---

## 6. M3 — TYPOGRAFIA

Czcionka: **Inter**. Wagi: 400, 500, 600, 700.

| Rola M3 | Size | Line-h | Weight | Użycie |
|---|---|---|---|---|
| display-large | 57px | 64px | 400 | Hero |
| display-medium | 45px | 52px | 400 | Duże sekcje |
| headline-large | 32px | 40px | 400 | h1 stron |
| headline-medium | 28px | 36px | 400 | h2 |
| headline-small | 24px | 32px | 400 | h3 |
| title-large | 22px | 28px | 400 | Tytuły kart, dialog |
| title-medium | 16px | 24px | 500 | Podtytuły, nav items |
| title-small | 14px | 20px | 500 | Chip label |
| body-large | 16px | 24px | 400 | Główna treść |
| body-medium | 14px | 20px | 400 | Tabele, listy, formularze |
| body-small | 12px | 16px | 400 | Meta, timestamps |
| label-large | 14px | 20px | 500 | Przyciski, tab labels |
| label-medium | 12px | 16px | 500 | Badge, chip |
| label-small | 11px | 16px | 500 | Caption (minimum!) |

---

## 7. M3 — KSZTAŁTY

| Token M3 | Radius | Komponenty |
|---|---|---|
| shape-none | 0px | Divider, tabela |
| shape-extra-small | 4px | Badge, tooltip |
| shape-small | 8px | Text field filled, menu, snackbar |
| shape-medium | 12px | Card, chip, button, FAB small |
| shape-large | 16px | Nav drawer, duże karty, FAB standard |
| shape-extra-large | 28px | Dialog, bottom sheet, large FAB, date picker |
| shape-full | 9999px | Avatar, pill chip, progress bar |

---

## 8. M3 — ANIMACJE

Import: `import { motion, AnimatePresence, useReducedMotion } from "motion/react"`

### Easing curves

| Krzywa | Wartość | Użycie |
|---|---|---|
| standard | `cubic-bezier(0.2, 0, 0, 1)` | Większość przejść |
| emphasized-decelerate | `cubic-bezier(0.05, 0.7, 0.1, 1.0)` | Enter ekranów |
| emphasized-accelerate | `cubic-bezier(0.3, 0, 0.8, 0.15)` | Exit ekranów |
| standard-decelerate | `cubic-bezier(0, 0, 0, 1)` | Elementy enter |
| standard-accelerate | `cubic-bezier(0.3, 0, 1, 1)` | Elementy exit |

### Duration

| Token | ms | Użycie |
|---|---|---|
| short-3 | 150ms | Checkbox, switch |
| short-4 | 200ms | Button, FAB exit |
| medium-2 | 300ms | **Standard (domyślny)** |
| medium-3 | 350ms | Bottom sheet enter |
| medium-4 | 400ms | Dialog enter |
| long-1 | 450ms | Page transitions |

### Wzorce
```typescript
// Enter
const enterVariants = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1,
    transition: { duration: 0.3, ease: [0.05, 0.7, 0.1, 1.0] } }
}

// Exit
const exitVariants = {
  exit: { opacity: 0, scale: 0.92,
    transition: { duration: 0.2, ease: [0.3, 0, 0.8, 0.15] } }
}

// Slide up (snackbar, bottom sheet)
const slideUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.05, 0.7, 0.1, 1.0] } },
  exit:    { opacity: 0, y: 16,
    transition: { duration: 0.2, ease: [0.3, 0, 0.8, 0.15] } }
}

// Stagger
const stagger = { visible: { transition: { staggerChildren: 0.04 } } }
```

### Zasady
- Max **2 właściwości** naraz.
- Stagger: 30–50ms.
- `linear` TYLKO dla: progress, spinner, skeleton.
- Zawsze `prefers-reduced-motion`: wyłącz transform, zostaw fade ≤200ms.

---

## 9. SPACING & SIATKA

Spacing: wielokrotności **4px**, preferowane **8px**. Zakazane: 5, 7, 9, 13, 15px.

| Element | Wartość |
|---|---|
| Padding kart | 16–20px mobile / 20–24px desktop |
| Gap w kartach | 8–12px |
| Gap między sekcjami | 24–32px |
| Margines strony | 16px / 24px / 32px |
| Max-width | 1200–1440px |

### Grid M3

| Breakpoint | Kolumny | Marginesy |
|---|---|---|
| compact 0–599px | 4 | 16px |
| medium 600–839px | 8 | 24px |
| expanded 840–1199px | 12 | 24px |
| large 1200px+ | 12 | 32px |

---

## 10. RESPONSYWNOŚĆ & NAWIGACJA M3

| Breakpoint | Nawigacja M3 |
|---|---|
| compact 0–599px | Navigation Bar (bottom, 3–5 items) |
| medium 600–839px | Navigation Rail (80px szer.) |
| expanded 840–1199px | Navigation Drawer collapsed (72px) |
| large 1200px+ | Navigation Drawer expanded (256px) |

- Karty: 1 → 2 → 3–4 kol.
- Dialog: fullscreen compact → centered medium+.
- Table: scroll-x + sticky col → full.
- FAB: fixed bottom-right → inline.

---

## 11. IKONY — MATERIAL SYMBOLS ROUNDED
```html
<!-- app/layout.tsx -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
```

| opsz | Kontekst |
|---|---|
| 16 | Badge, chip |
| 20 | Input prefix |
| 24 | Standard (nav, button) |
| 48 | Empty state |

- `FILL 0` inactive, `FILL 1` active
- Kolor: `currentColor`
- Dekoracyjne: `aria-hidden="true"`

---

## 12. KOMPONENTY M3

### Stany każdego komponentu

| Stan | Styl |
|---|---|
| hover | `::before` z `hover-overlay` LUB token `*-hover` |
| focus-visible | ring 2px `border-focus` offset 2px |
| active/pressed | token `*-active` |
| disabled | opacity 38%, `pointer-events-none` |
| loading | spinner, interakcja zablokowana |
| error | border + tekst `error` |
| selected | `selected-bg` |

Touch target: **48×48px** minimum.

### Button (5 wariantów)

| Wariant | Tło | Tekst | Użycie |
|---|---|---|---|
| Filled | `bg-primary` | `text-on-primary` | Główna CTA |
| Filled Tonal | `bg-primary-container` | `text-on-primary-container` | Drugoplanowa |
| Outlined | transparent | `text-primary` + `border-border-default` | Mniej ważna |
| Text | transparent | `text-primary` | Inline |
| Elevated | `bg-bg-elevated` + elevation-1 | `text-primary` | Ghost wyróżniony |

Kształt: `rounded-full`. Label: `label-large`. Height: 40px. Padding H: 24px.

### Card (3 warianty)

- **Elevated**: `bg-bg-raised` + elevation-1
- **Filled**: `bg-bg-elevated`
- **Outlined**: `bg-bg-raised border-border-subtle`

Kształt: `rounded-xl` (16px). Klikalna → `hover-overlay`.

### FAB

| Wariant | Size | Radius |
|---|---|---|
| Small | 40px | 12px |
| Standard | 56px | 16px |
| Large | 96px | 28px |
| Extended | 56px h | 16px |

Container: `bg-primary-container text-on-primary-container`.
Elevation: elevation-3 (rest) → elevation-4 (hover).

### Text Field

- **Filled**: `bg-bg-input rounded-t-md` + border-bottom. Float label.
- **Outlined**: `border-border-default rounded-md` + notch.

Height: 56px. Error: `body-small text-error` pod polem.

### Navigation Bar (compact)

Height: 80px. Active: `text-primary` + pill `bg-secondary-subtle` 64×32px `rounded-full` FILL 1.
Inactive: `text-text-secondary` FILL 0. Label: `label-medium` zawsze widoczny.

### Navigation Rail (medium)

Width: 80px. Active indicator: `rounded-full w-14 h-8 bg-secondary-subtle`.

### Navigation Drawer (expanded)

Width: 256px / 72px collapsed. `bg-bg-raised`.
Active: `bg-secondary-subtle text-primary rounded-r-full`.

### Dialog

`bg-bg-overlay rounded-[28px]`. Max-width 560px.
Headline (`headline-small`) → Body (`body-medium`) → Actions.
Scrim `rgba(0,0,0,0.6)`. Focus trap. ESC zamyka.
Mobile: **Bottom Sheet**.

### Chips

Height: 32px. `rounded-lg`. Active: `bg-secondary-subtle border-secondary`.
4 typy: Assist | Filter | Input | Suggestion.

### Snackbar

`bg-bg-elevated rounded-sm`. Slide up + fade. 4s / 10s z akcją. Kolejkuj w `ui-store`.

### Tabs

- **Primary**: 3px border-bottom `primary`. Active `text-primary`.
- **Secondary**: `bg-primary-subtle` fill. Stosuj wewnątrz kart.

### Badge

Dot: 6×6px `bg-error rounded-full`. Z liczbą: `rounded-full bg-error text-on-error label-small`.

### Progress

- **Linear**: track `bg-bg-highest` h-4px, fill `bg-primary`, `rounded-full`.
- **Circular**: SVG stroke `primary`.

### Table

Header: `bg-bg-raised text-text-secondary label-medium`. Row hover: `hover-overlay`.
Mobile: scroll-x + sticky 1st col.

---

## 13. CUSTOM UI — ZERO NATYWNEGO WYGLĄDU
```css
/* globals.css */
*, *::before, *::after { box-sizing: border-box; }

input, button, textarea, select {
  font: inherit; color: inherit; background: none;
  border: none; outline: none; appearance: none; -webkit-appearance: none;
}

::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb {
  background: var(--color-scrollbar-thumb); border-radius: 9999px;
}
::-webkit-scrollbar-thumb:hover { background: var(--color-scrollbar-thumb-hover); }

::selection { background: var(--color-primary-subtle); color: var(--color-primary); }
* { -webkit-tap-highlight-color: transparent; }
```

---

## 14. DOSTĘPNOŚĆ (WCAG AA)

- Kontrast: **4.5:1** tekst, **3:1** UI.
- Focus: `focus-visible` ring (nie `:focus`).
- Touch: **48×48px** minimum.
- `role`, `aria-label`, `aria-expanded`, `aria-selected` na interaktywnych.
- Dialog: `role="dialog"` + `aria-modal="true"` + focus trap.
- Live region snackbar: `aria-live="polite"`.
- Keyboard: Tab, Enter, Space, Escape, strzałki.

---

## 15. FORMAT DANYCH (PL)

| Typ | Format | Narzędzie |
|---|---|---|
| Waluta | `1 250,00 zł` | `Intl.NumberFormat` 'pl-PL' PLN |
| Procent | `12,5%` | |
| Data | `DD.MM.YYYY` | date-fns `format` + locale pl |
| Data relatywna | `5 min temu` | `formatDistanceToNow` pl |
| Czas | `HH:MM` 24h | |
| Duże liczby | `1,2k` / `2,5M` | tooltip z pełną wartością |
| Telefon | `+48 123 456 789` | |

---

## 16. STANY UX

**Skeleton**: kształt = docelowy komponent. `bg-skeleton` pulse 600ms linear.

**Empty State**: ikona 48px `text-text-muted` + `title-large` + `body-medium text-text-secondary` + Filled CTA.

**Błąd sieci**: Snackbar + Retry. Krytyczny: fullscreen empty state.

**Walidacja**: on blur + on submit. Error: `border-error` + `body-small text-error` pod polem.

**Optimistic updates**: TanStack Query `useMutation` z `onMutate` + rollback.

---

## 17. BAZA DANYCH — DEV/PROD
```typescript
// lib/db/index.ts
const provider = process.env.DATABASE_PROVIDER ?? 'json'
export const db = provider === 'mysql'
  ? createMySQLClient()   // Drizzle + mysql2
  : createJSONClient()    // /data/*.json
```

- **Dev**: `DATABASE_PROVIDER=json` — pliki `/data/` (nie commituj danych wrażliwych).
- **Prod**: `DATABASE_PROVIDER=mysql` + `DATABASE_URL` na Vercel.
- Jeden schemat Drizzle dla obu.
- Migracje: `drizzle-kit generate` → `drizzle-kit migrate` (MySQL only).

---

## 18. PUŁAPKI KOMPILACJI
```typescript
// ✅ Next.js 15 — async params
async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
}

// ✅ error.tsx — MUSI 'use client'
'use client'
export default function Error({ error, reset }: { error: Error; reset: () => void }) {}

// ✅ motion/react — NIE framer-motion
import { motion, AnimatePresence, useReducedMotion } from "motion/react"

// ✅ Tailwind v4 — bez tailwind.config.ts
// globals.css: @import "tailwindcss"; + @theme {}

// ✅ TanStack Query v5
const mutation = useMutation({
  mutationFn: updateProduct,
  onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
})

// ✅ TypeScript strict
// tsconfig.json: "strict": true, "noUncheckedIndexedAccess": true
```

---

## 19. ZAKAZANE WZORCE UX — NIGDY NIE RÓB TEGO

Poniższe wzorce są **bezwzględnie zakazane** niezależnie od kontekstu.
Bot musi sam wykryć sytuację i zastosować poprawny wzorzec — bez pytania.

### Natywne okna przeglądarki — ZAKAZ ABSOLUTNY

❌ `window.prompt()`, `window.alert()`, `window.confirm()` — nigdy, pod żadnym pozorem.
❌ `input[type=color]` — przeglądarka pyta o hex, to niedopuszczalne w UI.
❌ `input[type=date]`, `input[type=time]` — natywny wygląd, różny na każdej przeglądarce.
❌ `<select>` z natywnym wyglądem — zawsze własny komponent dropdown.
❌ `<dialog>` HTML — zawsze własny Dialog z portalem i focus trapem.

**Zamiast tego zawsze:**

| Sytuacja | Rozwiązanie |
|---|---|
| Potwierdzenie akcji (usuń, zatwierdź) | Dialog M3 z Filled + Outlined button |
| Formularz dodawania/edycji | Dialog lub dedykowana strona `/new`, `/[id]/edit` |
| Wybór koloru | Własny color picker: siatka predefiniowanych kolorów + opcjonalny hex input z podglądem |
| Wybór daty | Własny `DatePicker` (komponent kalendarza) |
| Wybór czasu | Własny `TimePicker` (kółka godzin/minut lub input z maskowaniem) |
| Wybór z listy | Własny `Select` lub `Combobox` z animowanym dropdown |
| Alert / powiadomienie | Snackbar (nie-krytyczny) lub Dialog (krytyczny) |

### Color Picker — standard dla projektu

Każde miejsce gdzie użytkownik wybiera kolor MUSI używać tego wzorca:
1. Siatka predefiniowanych kolorów (min. 12 opcji, zgodnych z paletą projektu).
2. Zaznaczony kolor: border 2px `border-focus` + checkmark icon.
3. Opcjonalnie: pole tekstowe hex z live podglądem (walidacja formatu `#RRGGBB`).
4. Nigdy nie pytaj użytkownika o surowy hex jako jedyną opcję.

---

## 20. PROPORCJE I ROZMIARY ELEMENTÓW

### Szerokości — zasada kontekstu

Element NIGDY nie powinien być szerszy niż jego zawartość tego wymaga.
`w-full` jest poprawne tylko wewnątrz ograniczonego kontenera.

| Typ elementu | Szerokość |
|---|---|
| Przycisk (button) | `w-auto` — dopasowany do labela + padding. Nigdy `w-full` w desktopowym UI. |
| Input / Text field | `w-full` wewnątrz kolumny formularza (ograniczonej szerokością). |
| Formularz (dialog/panel) | Max `max-w-sm` (384px) do `max-w-lg` (512px). Nigdy fullwidth na desktopie. |
| Karta (card) | Szerokość = kolumna gridu. Nigdy ręcznie ustawiana stała szerokość px. |
| Tabela | `w-full` wewnątrz kontenera strony. |
| Dropdown / Select | Szerokość = trigger element (nie szersza bez powodu). |
| Dialog | `max-w-[560px] w-full` — responsywny ale ograniczony. |
| Snackbar | `max-w-[568px] w-full` — od lewej krawędzi na mobile, wyśrodkowany desktop. |
| Sidebar / Drawer | Stała szerokość: 256px expanded / 72px collapsed. |
| Top App Bar | Zawsze `w-full`. |
| Strona (page content) | `max-w-[1440px] mx-auto` z marginesami strony. |

### Wysokości — zasada minimalności

- Nie ustawiaj stałej wysokości (`h-[800px]`) na kontenerach z dynamiczną zawartością.
- Używaj `min-h` zamiast `h` dla sekcji które mogą rosnąć.
- Przyciski: stała wysokość `h-10` (40px) lub `h-14` (56px dla text field), nie więcej.
- Wiersze tabeli: `h-14` (56px) standardowy, `h-12` (48px) kompaktowy.
- Nav items: min `h-12` (48px) touch target.

### Rozciąganie na desktop — najczęstszy błąd

Jeśli element wygląda normalnie na mobile ale **za szeroki / zbyt rozciągnięty na desktopie** — to znaczy że brakuje `max-w-*` lub element powinien być w gridzie.

Checklist przed dodaniem `w-full`:
- [ ] Czy ten element jest wewnątrz ograniczonego kontenera? Jeśli tak — OK.
- [ ] Czy na ekranie 1440px też będzie wyglądał dobrze? Jeśli nie — dodaj `max-w-*`.
- [ ] Czy to formularz / dialog? → `max-w-sm` do `max-w-lg`, wyśrodkowany.
- [ ] Czy to lista kart? → grid z `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.

### Responsywny grid kart — wzorzec
```tsx
// ✅ Zawsze tak dla kart/kafelków
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  {items.map(item => <Card key={item.id} {...item} />)}
</div>

// ❌ Nigdy tak
<div className="flex flex-wrap gap-4">
  {items.map(item => <Card key={item.id} className="w-full" {...item} />)}
</div>
```

### Formularze — wzorzec szerokości
```tsx
// ✅ Formularz w dialogu / panelu bocznym
<form className="flex flex-col gap-4 w-full max-w-md mx-auto">
  <TextField label="Nazwa" className="w-full" />
  <div className="flex gap-3 justify-end">
    <Button variant="outlined">Anuluj</Button>
    <Button variant="filled">Zapisz</Button>  {/* NIE w-full */}
  </div>
</form>

// ❌ Błąd — przyciski akcji na pełną szerokość na desktopie
<Button className="w-full">Zapisz</Button>
```

---

### Procedura naprawy błędów

1. Przeczytaj **CAŁY** błąd.
2. Znajdź **root cause**, nie symptom.
3. Napraw → `npx tsc --noEmit` → powtarzaj do zera.
4. `npm run build` → zero błędów.
5. `npm run dev` → test w przeglądarce.
6. Pokaż pełny output.