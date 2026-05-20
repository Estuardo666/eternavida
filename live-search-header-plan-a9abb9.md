# Live Search Global Header — Implementation Plan

Implement a Best Buy / macOS-style live search bar in the global public header, powered by Framer Motion animations, debounced queries, and a dedicated lightweight public API. Results are limited to product titles and category names only.

---

## 1. Overview

| Item | Value |
|---|---|
| **Scope** | Public frontend only |
| **Location** | Global header (`PublicHeader`) |
| **Search targets** | `Product.name` + `Category.name` only |
| **Dropdown limits** | 10 products + 3 categories |
| **Debounce** | 300 ms |
| **Enter behavior** | Navigates to `/productos?q={query}` |
| **Animation style** | macOS/Best Buy — smooth expand, staggered list items, opacity + translateY, subtle scale on focus |
| **Tech** | Framer Motion 12, React 19, Next.js 16, Tailwind CSS 4, TypeScript strict |

---

## 2. Files to Create

### 2.1 API Layer

```
src/app/api/search/route.ts
```
- **Method**: `GET`
- **Query params**: `q` (string, required, min 1 char after trim)
- **Behavior**:
  - If `q` is empty or `< 2` chars after trim → return `{ products: [], categories: [] }`
  - Search `Product.name` with `mode: "insensitive"` and `isActive: true`
  - Search `Category.name` with `mode: "insensitive"` and `isActive: true`
  - Limit products to **10**, categories to **3**
  - Return shape:
    ```ts
    {
      products: Array<{
        id: string;
        slug: string;
        name: string;
        brand: string;
        price: number;
        discountPrice: number | null;
        mediaUrl: string | null;
        href: string; // `/productos/${slug}`
      }>;
      categories: Array<{
        id: string;
        slug: string;
        name: string;
        href: string; // `/categorias/${slug}`
      }>;
    }
    ```
- **Error handling**: Return JSON with `products: []`, `categories: []` on any error; log server-side.
- **No auth required** — fully public endpoint.

### 2.2 Hook

```
src/features/search/hooks/use-live-search.ts
```
- **State**: `query` (string), `results` (products + categories), `isLoading` (boolean), `error` (string | null)
- **Debounce**: Use a `useEffect` + `setTimeout` with **300 ms** delay on `query` change.
- **Fetch**: Standard `fetch` to `/api/search?q=${encodeURIComponent(debouncedQuery)}`
- **AbortController**: Cancel in-flight requests when query changes or component unmounts.
- **Min query length**: Only fetch when `debouncedQuery.trim().length >= 2`.
- **Return**: `{ query, setQuery, results, isLoading, error, clear }`

### 2.3 UI Components

```
src/features/search/components/live-search.tsx
src/features/search/components/live-search-dropdown.tsx
src/features/search/components/live-search-product-item.tsx
src/features/search/components/live-search-category-item.tsx
src/features/search/components/live-search-trigger.tsx
```

#### `live-search-trigger.tsx`
- Search icon (Lucide `Search`) + placeholder text `"Buscar productos..."`
- On click / focus: expands into a larger input field (macOS-style spotlight feel)
- Uses Framer Motion `layout` prop for smooth width/height transition
- Mobile: full-width modal overlay style on focus

#### `live-search-dropdown.tsx`
- Appears below the input with a floating panel style
- Framer Motion:
  - `initial`: `{ opacity: 0, y: -8, scale: 0.98 }`
  - `animate`: `{ opacity: 1, y: 0, scale: 1 }`
  - `exit`: `{ opacity: 0, y: -8, scale: 0.98 }`
  - `transition`: `{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }` (calm, Apple-like)
- Sections:
  1. **Categorías** (max 3) — shown first if any
  2. **Productos** (max 10)
  3. **Ver todos los resultados** → link to `/productos?q={query}`
- Stagger children with `staggerChildren: 0.03`
- Each item animates with `opacity: 0 → 1`, `y: 6 → 0`
- Empty state: `"No encontramos resultados para \"{query}\""` with suggestion to press Enter for full catalog
- Loading state: subtle skeleton pulse (2-3 lines) or spinning Lucide `Loader2`

#### `live-search-product-item.tsx`
- Shows: thumbnail (40×40, rounded), product name (bold), brand (muted), price (with discount if applicable)
- On hover: subtle background color change (`bg-surface-soft`)
- Click: navigates to `/productos/{slug}`
- Keyboard navigable (arrow keys + Enter)

#### `live-search-category-item.tsx`
- Shows: Lucide `FolderOpen` icon + category name
- Click: navigates to `/categorias/{slug}`

#### `live-search.tsx` (container)
- Manages focus state, keyboard navigation (Escape to close, ArrowDown/ArrowUp to navigate items, Enter to select)
- Integrates `useLiveSearch`
- Renders `LiveSearchTrigger` + `AnimatePresence` wrapping `LiveSearchDropdown`
- Uses `useRef` for the container; click-outside closes dropdown
- On Enter in input: `router.push(`/productos?q=${encodeURIComponent(query)}`)`

---

## 3. Files to Modify

### 3.1 `src/components/layout/public-header.tsx`
- Import `LiveSearch` from `@/features/search/components/live-search`
- Replace the current nav area or add `LiveSearch` in the top bar, between the logo and the action buttons (account + cart)
- On desktop: search bar sits in the center of the header, expands on focus
- On mobile: search icon triggers an expanded overlay / modal style
- Keep existing navigation links below or collapse them into a hamburger if needed (designer discretion — prefer keeping existing nav if space allows)

### 3.2 `src/app/api/search/route.ts` (data access)
- Reuse Prisma from `@/server/db/prisma`
- Reuse existing `buildPublicProductVisibilityFilter()` pattern from `public-catalog.repository.ts` for product visibility
- Do **not** import server-only files into client components.

### 3.3 `src/features/search/` (new feature folder)
- Add a `types.ts` if needed for search-specific types (keep minimal, reuse `PublicCatalogProductSummary` where possible)

---

## 4. Animation Tokens (from `FRAMER_MOTION_TOKENS.md`)

Follow the Apple-HIG-aligned motion philosophy:
- **No pop-in from nowhere**
- **Every element has origin, transition, destination**
- Use these specific values:

```ts
// Dropdown container
const dropdownVariants = {
  hidden: { opacity: 0, y: -8, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1 },
};

const dropdownTransition = {
  duration: 0.2,
  ease: [0.25, 0.46, 0.45, 0.94],
};

// List items stagger
const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.03 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 6 },
  visible: { opacity: 1, y: 0 },
};
```

---

## 5. Design Tokens (from `DESIGN_SYSTEM.md` & Tailwind)

- **Panel background**: `bg-surface-canvas` with `shadow-lg` and `rounded-xl`
- **Border**: `border-border-soft`
- **Input focus ring**: `focus-visible:ring-2 focus-visible:ring-brand-primary`
- **Item hover**: `hover:bg-surface-soft`
- **Text**: `text-text-primary` for names, `text-text-secondary` for brands/prices, `text-text-muted` for empty states
- **Section headers**: `text-label-sm uppercase text-text-muted tracking-wide`
- **Spacing**: follow existing container patterns (`px-4 py-3`, `gap-2`)

---

## 6. Accessibility Requirements

- `role="combobox"`, `aria-expanded`, `aria-controls` on input
- `role="listbox"` on dropdown, `role="option"` on each item
- Escape key closes dropdown and returns focus to input
- Trap focus within dropdown while open (or at least handle Tab / Shift+Tab gracefully)
- Respect `prefers-reduced-motion`: disable Framer Motion animations when `matchMedia('(prefers-reduced-motion: reduce)')` is true

---

## 7. Edge Cases

| Case | Behavior |
|---|---|
| Query < 2 chars | No fetch; dropdown shows prompt `"Escribe al menos 2 caracteres..."` or stays closed |
| Empty results | Show empty state with CTA to press Enter for full catalog |
| Network error | Silently fail; dropdown shows `"No se pudieron cargar resultados. Intenta de nuevo."` |
| Very fast typing | AbortController cancels previous request; only latest results render |
| Mobile | Trigger expands to full-width overlay; dropdown renders below input |
| SSR | Search is client-only (no server fetch on initial render) |

---

## 8. Testing Checklist (for QA Agent)

- [ ] Typing "ser" shows results after ~300 ms
- [ ] Changing query quickly cancels previous fetch
- [ ] Clicking outside closes dropdown
- [ ] Pressing Escape closes dropdown
- [ ] Arrow keys navigate items; Enter selects
- [ ] Enter in input navigates to `/productos?q=...`
- [ ] Empty state renders when no results
- [ ] Mobile: search expands correctly without breaking header layout
- [ ] Product clicks navigate to correct product detail
- [ ] Category clicks navigate to correct category page
- [ ] Reduced motion disables animations

---

## 9. Dependencies

No new dependencies required. The project already has:
- `framer-motion` ^12.38.0
- `lucide-react` ^1.7.0

---

## 10. Architecture Notes

- This feature belongs in `features/search/` following the project's `features/` folder convention.
- Keep all search logic isolated: hook + components + API route. Do not leak into `components/layout/` beyond the `PublicHeader` import.
- The API route must remain lightweight; avoid importing heavy server-only services not needed for search.
- Do not modify existing catalog pages or filter logic — the search endpoint is standalone.
