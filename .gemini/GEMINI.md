# GEMINI.md

## 1. REGUŁY NADRZĘDNE

Jedyne źródło prawdy projektu. Każdy kod MUSI być zgodny.
- Niejasność → pytaj. Sprzeczność → wskaż. Nigdy nie zgaduj.

---

## 2. MYŚLENIE

Przed implementacją przeanalizuj CAŁĄ wiadomość:
1. Wypisz polecenia JAWNE + WYNIKAJĄCE z kontekstu.
2. Sprawdź zależności i wpływ na istniejący kod.

WNIOSKUJ sam (bez pytania): skeleton, empty state, error boundary, toast po CRUD, responsywność, disabled/loading na przyciskach.
PYTAJ: logika biznesowa, nowe funkcjonalności, zmiany DB, wybór między równoważnymi rozwiązaniami.

---

## 3. WORKFLOW (6 ETAPÓW)

1. **Analiza** — polecenia, sprzeczności, wpływ → PRZEJŚCIE / PYTANIE
2. **Pliki** — modyfikacja / tworzenie / usunięcie / kolizje
3. **Plan** — kolejność, zakres, pokrycie poleceń
4. **Implementacja** — pełne pliki (>150 linii: diff z kontekstem)
5. **Weryfikacja** — checklist: polecenia ✓, tokeny ✓, 8dp ✓, WCAG AA ✓, touch 48px ✓, responsive ✓, TS strict ✓, stany UX ✓, brak natywnego UI ✓
6. **Kompilacja** — npx tsc --noEmit → npm run build → npm run dev. ZERO błędów = GOTOWE. Błędy = napraw łańcuchowo do zera.

---

## 4. TECH STACK

Next.js 15 App Router | TypeScript strict | Tailwind CSS 4 | motion/react | Zustand | TanStack Query | Drizzle | MySQL | Vercel | Material Symbols Rounded | Inter | clsx + tailwind-merge

Konwencje:
- Domyślnie Server Components. 'use client' tylko: stan, efekty, handlery, browser API.
- Fetch: SC + Drizzle. Client: TanStack Query.
- Każda route: loading.tsx (skeleton), error.tsx ('use client' + retry).

Zakazane: framer-motion (używaj motion/react), styled-components, CSS modules, inline styles, any, var, bg-[#hex], text-white, text-black, bg-gray-.

---

## 5. STRUKTURA

    src/
    ├── app/
    │   ├── (auth)/login/page.tsx, layout.tsx
    │   ├── (dashboard)/
    │   │   ├── layout.tsx, page.tsx, loading.tsx, error.tsx
    │   │   ├── supply-lists/  (page, loading, new/page, [id]/page)
    │   │   ├── products/      (page, loading, [id]/page)
    │   │   ├── locations/     (page, loading, [id]/page)
    │   │   ├── employees/     (page, loading, [id]/page)
    │   │   └── settings/page.tsx
    │   ├── layout.tsx, not-found.tsx
    ├── components/
    │   ├── ui/         (button, icon-button, fab, card, dialog, input, textarea,
    │   │                select, combobox, checkbox, radio, switch, slider,
    │   │                date-picker, time-picker, calendar, chip, badge, tooltip,
    │   │                snackbar, skeleton, table, tabs, accordion, progress-bar,
    │   │                spinner, pagination, breadcrumbs, avatar, empty-state,
    │   │                search-bar, file-upload, context-menu, popover, divider, icon)
    │   ├── navigation/ (sidebar, navigation-rail, bottom-nav, top-app-bar)
    │   ├── features/   (supply-list-table, supply-list-form, product-picker,
    │   │                product-card, location-card, employee-card, kpi-card,
    │   │                recent-activity)
    │   └── layouts/    (page-header)
    ├── lib/
    │   ├── db/         (index, schema/*, queries/*)
    │   ├── utils/      (cn, format, date)
    │   └── constants/  (navigation)
    ├── stores/         (supply-list-store, ui-store)
    ├── hooks/          (use-supply-lists, use-products, use-locations,
    │                    use-employees, use-media-query)
    └── types/          (product, supply-list, location, employee, common)

---

## 6. KOLORY — DARK ONLY

Wyłącznie ciemny motyw. Seed: neonowy pomarańczowy.
TYLKO tokeny w kodzie. NIGDY surowe wartości, text-white/black, bg-gray-.

    @import "tailwindcss";

    @theme {
      /* PRIMARY — neon orange */
      --color-primary: #FF8C42;
      --color-primary-hover: #FFA060;
      --color-primary-active: #E07830;
      --color-primary-muted: #FFB88A;
      --color-primary-subtle: #2D1A0A;

      /* ACCENT — complementary blue */
      --color-accent: #42B4FF;
      --color-accent-hover: #60C4FF;
      --color-accent-active: #2898E0;
      --color-accent-muted: #8AD4FF;
      --color-accent-subtle: #0A1926;

      /* SURFACES */
      --color-bg-base: #0E0B0A;
      --color-bg-raised: #1A1412;
      --color-bg-overlay: #241C1A;
      --color-bg-elevated: #2E2522;
      --color-bg-highest: #3A302C;
      --color-bg-input: #161110;

      /* TEXT */
      --color-text-primary: #F0DDD6;
      --color-text-secondary: #B8A49C;
      --color-text-muted: #7A6B64;
      --color-text-disabled: #4A3F3B;
      --color-text-on-primary: #1A0800;
      --color-text-on-accent: #001428;
      --color-text-on-success: #002208;
      --color-text-on-warning: #221A00;
      --color-text-on-error: #220404;

      /* BORDER */
      --color-border-subtle: #261E1C;
      --color-border-default: #3A302C;
      --color-border-hover: #5A4E48;
      --color-border-focus: #FF8C42;

      /* SUCCESS */
      --color-success: #66D97A;
      --color-success-hover: #7AE68C;
      --color-success-active: #52C266;
      --color-success-muted: #A3E8B0;
      --color-success-subtle: #122216;
      --color-success-border: #2D5C36;

      /* WARNING */
      --color-warning: #FFD166;
      --color-warning-hover: #FFDC85;
      --color-warning-active: #E0B84D;
      --color-warning-muted: #FFE49E;
      --color-warning-subtle: #262010;
      --color-warning-border: #5C4D20;

      /* ERROR */
      --color-error: #FF6B6B;
      --color-error-hover: #FF8585;
      --color-error-active: #E05252;
      --color-error-muted: #FFAAAA;
      --color-error-subtle: #261212;
      --color-error-border: #5C2020;

      /* INFO */
      --color-info: #64B5F6;
      --color-info-hover: #82C6F8;
      --color-info-active: #4AA0E0;
      --color-info-muted: #A8D5FA;
      --color-info-subtle: #0E1926;
      --color-info-border: #1E3A5C;

      /* INTERACTIVE OVERLAYS */
      --color-hover-overlay: rgba(255, 140, 66, 0.08);
      --color-active-overlay: rgba(255, 140, 66, 0.12);
      --color-focus-ring: #FF8C42;
      --color-selected-bg: #2D1A0A;
      --color-drag-overlay: rgba(255, 140, 66, 0.16);

      /* SPECIAL */
      --color-scrim: rgba(0, 0, 0, 0.6);
      --color-skeleton: #2E2522;
      --color-divider: #261E1C;
      --color-scrollbar-thumb: #3A302C;
      --color-scrollbar-thumb-hover: #5A4E48;
      --color-glow-primary: rgba(255, 106, 0, 0.25);
      --color-glow-accent: rgba(66, 180, 255, 0.20);
    }

### Mapowanie kolorów

- CTA główne → primary. Drugie CTA → accent.
- Tło: base (strona) → raised (karty, sidebar) → overlay (modal, dropdown) → elevated → highest.
- Input tło → bg-input. Border: default → hover → focus (primary).
- Tekst: primary (główny) → secondary (label, meta) → muted (placeholder, hint) → disabled.
- Status: success/warning/error/info — każdy ma: base, hover, active, muted, subtle (tło badge), border.
- Hover na elementach: hover-overlay (pseudo ::before). Selected: selected-bg.

---

## 7. TYPOGRAFIA

Czcionka: Inter. Wagi: 400, 500, 600, 700.

| Rola | Size | Weight | Użycie |
|---|---|---|---|
| xs | 11px | 500 | badge, caption (minimum!) |
| sm | 12px | 400 | chipy, meta, timestamps |
| base | 14px | 400 | body, tabele, listy |
| md | 16px | 400 | body prominent, input |
| lg | 18px | 500 | podtytuły, nagłówki kart |
| xl | 20px | 600 | nagłówki sekcji |
| 2xl | 24px | 600 | tytuły stron |
| 3xl | 30px | 700 | hero |

Tekst ZAWSZE z tokenów: text-primary, text-secondary, text-muted, text-disabled.

---

## 8. SPACING / SIATKA / SHAPES

Spacing: wielokrotności 4px (pref. 8px). Zakazane: 5/7/9/13/15px.
- Karty: padding 16–24px. Gap: 8–12px. Sekcje: 24–32px.
- Margines strony: 16 mobile / 24 tablet / 32 desktop.
- Grid: 4 kol mobile / 8 tablet / 12 desktop. Max-width: 1200–1440px.

Radius: 4px (badge) | 8px (input, chip) | 12px (karty, btn) | 16px (duże karty) | 24px (dialog) | 9999px (avatar, pill).

Elevacja tonalna: base → raised → overlay → elevated → highest. Cień tylko wspomagająco.

---

## 9. ANIMACJE

motion/react. Import: import { motion } from "motion/react".

- Enter: opacity 0→1, scale 0.92→1, 250–350ms, ease-out: cubic-bezier(0.2, 0, 0, 1).
- Exit: odwrotnie, 150–250ms, ease-in: cubic-bezier(0.3, 0, 0.8, 0.15).
- Max 2 właściwości naraz. Stagger: 30–50ms. Nigdy linear (wyjątek: progress, spinner).
- Zawsze prefers-reduced-motion.

---

## 10. CUSTOM UI — ZERO NATYWNEGO WYGLĄDU

KAŻDY element interaktywny budowany od podstaw. ŻADEN nie używa domyślnego wyglądu przeglądarki.

Reset w globals.css:

    input, button, textarea, select {
      font: inherit; color: inherit; background: none;
      border: none; outline: none; appearance: none;
    }
    ::-webkit-scrollbar { width: 8px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--color-scrollbar-thumb); border-radius: 9999px; }
    ::-webkit-scrollbar-thumb:hover { background: var(--color-scrollbar-thumb-hover); }

Dotyczy: button, input, textarea, select (custom dropdown), checkbox, radio, switch, slider, date-picker (NIE input[type=date]), time-picker, file-upload, dialog (portal + focus trap), accordion, scrollbar, progress, table, tooltip, context-menu.

### Stany KAŻDEGO interaktywnego komponentu

| Stan | Styl |
|---|---|
| hover | overlay hover-overlay LUB token *-hover |
| focus-visible | ring 2px border-focus offset 2px |
| active | token *-active |
| disabled | opacity 38%, pointer-events: none |
| loading | spinner, interakcja zablokowana |
| error | border + tekst error |
| selected | bg selected-bg |

Touch target ≥ 48px.

### Styl komponentów (wytyczne, nie sztywne wymiary)

**Button**: filled (primary/accent/success/error/warning bg, text-on-* tekst) | tonal (primary-subtle bg, primary tekst) | outlined (border-default) | text/ghost (transparent). Radius: rounded-md lub rounded-full. Label: text-base weight 500.

**Card**: bg-raised, border-subtle, rounded-md/lg. Klikalna → hover-overlay.

**Input/Textarea**: bg-input, border-default→hover→focus. Label: text-secondary text-sm w500. Placeholder: text-muted. Error: border error + tekst pod polem.

**Select**: trigger jak input. Dropdown: bg-overlay, rounded-sm. Option hover: hover-overlay. Selected: selected-bg + primary.

**Checkbox**: unchecked: border-default. Checked: bg primary, checkmark text-on-primary. Focus: ring.

**Radio**: unselected: border-default. Selected: border + dot primary.

**Switch**: off: bg-highest, thumb bg-elevated. On: bg primary, thumb text-on-primary.

**Slider**: track bg-highest, filled primary, thumb primary. Hover: glow-primary.

**Date/Time Picker**: własny komponent, NIGDY input[type=date/time]. Wybrany dzień: bg primary. Dziś: border primary. Poza miesiącem: text-disabled. Panel: bg-overlay.

**Dialog**: scrim 60%, bg-overlay, rounded-xl, focus trap, ESC zamyka. Mobile <600px: fullscreen.

**Table**: header bg-raised text-secondary, row hover hover-overlay, selected selected-bg, divider border-subtle. Mobile: scroll-x + sticky 1st col.

**Tabs**: inactive text-secondary, active text-primary + border-bottom 2px primary.

**Snackbar**: bg-elevated, auto-dismiss 4s (10s z akcją), slide up + fade.

**Badge**: -subtle bg + kolor statusu tekst, text-xs w600, rounded-full.

**Progress**: track bg-highest, fill primary, rounded-full, linear animation OK.

**File upload**: border dashed border-default. Drag-over: border primary, bg primary-subtle.

---

## 11. RESPONSYWNOŚĆ

| Breakpoint | Range | Nav |
|---|---|---|
| compact | 0–599 | Bottom nav |
| medium | 600–839 | Navigation rail |
| expanded | 840–1199 | Sidebar collapsed |
| large | 1200+ | Sidebar expanded |

Karty: 1→2→3–4 kol. Dialog: fullscreen→centered. Table: scroll→full. FAB: fixed→inline.

---

## 12. FORMAT DANYCH (PL)

Waluta: 1 250,00 zł. Procent: 12,5%. Data: DD.MM.YYYY. Czas: HH:MM 24h. Relatywne: 5 min temu. Duże: 1,2k (tooltip pełna). Tel: +48 123 456 789.

---

## 13. STANY SPECJALNE

**Skeleton**: kształt = docelowy komponent, pulse 600ms, kolor skeleton. Nie mieszaj z danymi.
**Empty state**: ikona (text-muted) + tytuł (text-lg) + opis (text-secondary) + akcja (button primary).
**Błąd sieci**: snackbar + retry. Krytyczny: fullscreen empty state.
**Walidacja**: border error + tekst error pod polem, on blur + on submit.

---

## 14. IKONY

Material Symbols Rounded: opsz 24, wght 400, GRAD 0, fill 0 (default) / 1 (active).
Rozmiary: 16 (chip/badge) | 20 (input) | 24 (standard) | 40–48 (empty state).
Kolor: currentColor (dziedziczony z tokenu tekstu).

---

## 15. PUŁAPKI KOMPILACJI

Rzeczy których LLM często nie wie lub myli:

**Next.js 15 async params** — params i searchParams w page/layout są Promise:

    // ŹLE
    function Page({ params }: { params: { id: string } })
    // DOBRZE
    async function Page({ params }: { params: Promise<{ id: string }> }) {
      const { id } = await params
    }

**Tailwind v4** — @import "tailwindcss" (nie @tailwind directives). Tokeny w @theme {}. Brak tailwind.config.ts.

**error.tsx** — MUSI mieć 'use client'.

**Procedura naprawy**: przeczytaj CAŁY błąd → znajdź root cause → napraw → npx tsc --noEmit → powtórz do zera → npm run build → npm run dev → pokaż output.