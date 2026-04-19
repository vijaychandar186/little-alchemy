# AGENTS.md — Little Alchemy

AI agent reference for this project.

---

## What This Is

A browser-based Little Alchemy game. Players drag elements onto a canvas and combine them to discover new ones. Supports two game datasets (v1, v2), full light/dark theming, 10 color schemes, and a collapsible sidebar.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15.4 (App Router, Turbopack) |
| Language | TypeScript 5.9 (strict) |
| UI | React 19, shadcn/ui (Base UI primitives) |
| Styling | Tailwind CSS v4 (`@import 'tailwindcss'` syntax) |
| Theming | next-themes + custom CSS scheme system |
| Icons | lucide-react (direct import, no registry) |
| Fonts | next/font/google (11 fonts loaded as CSS variables) |
| State | React useState/useRef (no external state lib) |
| Persistence | localStorage (game state) + cookies (UI preferences) |
| Package manager | pnpm |

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Server component — reads theme/sidebar cookies, applies fontVariables to <html>
│   ├── page.tsx            # Server component — reads sidebar_state cookie, passes defaultOpen to game
│   └── globals.css         # Tailwind imports, theme CSS import, shake keyframe
│
├── components/
│   ├── game/AlchemyGame.tsx    # Re-export shim for the features/ component
│   └── ui/                     # shadcn/ui components (button, dialog, input, popover,
│                               # scroll-area, select, separator, sheet, sidebar, skeleton, tooltip)
│
├── data/
│   ├── combinations_v1.json    # v1 recipe data: { elementName: [[a, b], ...] }
│   ├── combinations_v2.json    # v2 recipe data: same shape
│   └── iconMap.json            # { elementName: iconNumber } — number ≥599 → SVG, <599 → PNG
│
├── features/
│   ├── alchemy/
│   │   ├── hooks/
│   │   │   ├── useWorkspaceDrag.ts   # Pointer drag on workspace cards, merge detection, fail flash
│   │   │   └── useSidebarDrag.ts     # Drag from sidebar into workspace
│   │   ├── AlchemyGame.tsx     # Root client component — all game state lives here
│   │   ├── Sidebar.tsx         # Right sidebar: element list, search dialog, settings footer
│   │   ├── WorkspaceCard.tsx   # Individual draggable element card (80×~80px, centered on x/y)
│   │   ├── ElementGhost.tsx    # Fixed-position ghost following cursor during sidebar drag
│   │   ├── ElemIcon.tsx        # next/image wrapper — SVG for num≥599, PNG for num<599
│   │   ├── data.ts             # normalize, buildLookup, getIconNum, getStarters, loadState, saveState
│   │   └── types.ts            # Version='v1'|'v2', Combos, WEl={id,name,x,y}
│   │
│   └── theme/
│       ├── SchemeProvider.tsx  # Context: activeScheme + setActiveScheme; sets data-theme on <html>; persists cookie
│       ├── ThemeProvider.tsx   # next-themes wrapper
│       ├── SettingsPanel.tsx   # Popover trigger: theme toggle (light/dark/system), scheme select, game controls
│       ├── font.config.ts      # Loads 11 Google Fonts as CSS vars, exports fontVariables string
│       └── scheme.config.ts    # SCHEMES array, DEFAULT_SCHEME='vercel'
│
├── hooks/
│   └── use-mobile.ts           # useIsMobile hook (used by shadcn sidebar)
│
├── lib/
│   └── utils.ts                # cn() utility
│
├── styles/
│   ├── themes.css              # @imports all 10 theme files + font-family reset for [data-theme]
│   └── themes/                 # vercel.css, claude.css, whatsapp.css, supabase.css, mono.css,
│                               # neobrutualism.css, zen.css, astro-vista.css, light-green.css, notebook.css
│
└── types/
    └── css.d.ts                # declare module '*.css'
```

---

## Game Mechanics

### Combination Lookup

`buildLookup(data: Combos): Map<string, string>` — iterates recipes, sorts each pair, normalizes (lowercase, spaces→hyphens), joins with `|`. Result: `Map { "air|fire" → "energy", ... }`.

### Merge Detection (useWorkspaceDrag)

On `pointerup`, find a target card within AABB threshold:
```ts
Math.abs(w.x - current.x) < 130 && Math.abs(w.y - current.y) < 130
```
Cards are `w-20` (80px). `WEl.x/y` = center (cards use `transform: translate(-50%, -50%)`). Threshold gives ~50px tolerance beyond side-by-side touching.

If target found but no recipe → red border + shake animation for 800ms (`failedIds` Set in state).
If recipe found → remove both cards, spawn result at midpoint, add result to discovered set.

### Starter Elements

`getStarters(data)` returns elements that have no recipe (base elements). These are given to the player at the start of each version.

### State Persistence

- `loadState() / saveState()` → `localStorage` key `'alchemy-state'` → `{ version, v1: string[], v2: string[] }`
- Theme → `document.cookie 'active_scheme'`
- Sidebar open → `document.cookie 'sidebar_state'` (written by shadcn SidebarProvider automatically)

---

## Theme / Scheme System

### Architecture

```
<html lang="en" data-theme="vercel" class="__var_geist ... dark">
  <body class="antialiased">
    <ThemeProvider>   ← next-themes: manages .dark class
      <SchemeProvider>  ← manages data-theme attribute + cookie
        ...
```

- `data-theme` drives color scheme CSS variables
- `.dark` class on `<html>` drives dark mode overrides inside each theme CSS file
- CSS selectors: `[data-theme='vercel'] { ... }` and `[data-theme='vercel'].dark { ... }`

### CSS Cascade Rule

`themes.css` is imported at the top of `globals.css`. Never add `:root {}` color variable blocks — they have equal specificity to `[data-theme]` selectors and will override theme colors if they appear later in the cascade.

### Font System

Each scheme sets `--font-sans` and/or `--font-mono` CSS custom properties. `fontVariables` (the combined CSS variable class string from all 11 Google Fonts) must be on `<html>` — not `<body>` — so font vars are in the same element scope as `data-theme`.

---

## Sidebar Layout

The shadcn `Sidebar` component renders a `position: fixed; inset-y: 0` panel. To avoid it overlaying the header, `ElementSidebar` must be a **direct child of `SidebarProvider`**, not nested inside other divs.

Correct structure:
```
SidebarProvider (flex-row, h-screen min-h-0)
  ├─ div.flex-col.flex-1 (header + workspace)
  └─ ElementSidebar → <Sidebar side="right" collapsible="icon">
```

`SidebarContent` was modified from the shadcn default to wrap children in `<ScrollArea>` (removed `no-scrollbar` class).

In collapsed (`collapsible="icon"`) mode:
- Sidebar width collapses to `--sidebar-width-icon` (3rem)
- Hide text/labels: `group-data-[collapsible=icon]:hidden`
- Show collapsed-only content: `hidden group-data-[collapsible=icon]:flex`
- `SidebarMenuButton` collapsed padding override: `group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center`

---

## Key Constraints

- **No React Query, Zustand, or nuqs** — this is a self-contained game with simple useState
- **No authentication** — no Clerk or any auth layer
- **No API routes** — all data is static JSON in `src/data/`
- **`next/image` with `unoptimized`** for element icons (served from `/public/icons/`)
- **Turbopack** for dev — avoid anything known to break Turbopack (e.g. broken symlinks in `.claude/`)

---

## Dev Commands

```bash
pnpm dev           # Start dev server (Turbopack, port 3000)
pnpm build         # Production build (output: standalone)
pnpm lint          # ESLint
pnpm lint:fix      # ESLint fix + Prettier format
pnpm format        # Prettier only
```
