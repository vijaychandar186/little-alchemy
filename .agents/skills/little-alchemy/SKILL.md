# Little Alchemy — Project Skill

Reference for AI agents working on this codebase.

---

## What This Is

Browser-based Little Alchemy game clone. Players drag elements from a sidebar onto a canvas and combine them to discover new elements. Two independent game datasets (v1, v2).

---

## Stack

- Next.js 15.4 (App Router, Turbopack), React 19, TypeScript 5.9 strict
- Tailwind CSS v4 (`@import 'tailwindcss'` syntax — NOT v3 config object)
- shadcn/ui components via Base UI primitives (NOT Radix UI)
- next-themes for light/dark/system, custom CSS scheme system for color themes
- lucide-react for icons (direct import, no registry)
- pnpm as package manager

---

## File Map

```
src/
├── app/layout.tsx          # Server — reads cookies (active_scheme, sidebar_state), applies fontVariables to <html>
├── app/page.tsx            # Server — reads sidebar_state cookie, passes defaultOpen prop to AlchemyGame
├── data/
│   ├── combinations_v1.json   # { elementName: [[ingredientA, ingredientB], ...] }
│   ├── combinations_v2.json   # same shape, more elements
│   └── iconMap.json           # { elementName: number } — ≥599 → SVG, <599 → PNG
├── features/alchemy/
│   ├── AlchemyGame.tsx        # Root client component, owns ALL game state
│   ├── Sidebar.tsx            # Right sidebar (shadcn Sidebar, collapsible="icon", search dialog, settings footer)
│   ├── WorkspaceCard.tsx      # Draggable card (w-20, centered via translate(-50%,-50%))
│   ├── ElementGhost.tsx       # Fixed ghost following cursor during sidebar→workspace drag
│   ├── ElemIcon.tsx           # next/image unoptimized, SVG or PNG from /public/icons/
│   ├── data.ts                # normalize, buildLookup, getIconNum, getStarters, loadState, saveState
│   ├── types.ts               # Version='v1'|'v2', Combos, WEl={id,name,x,y}
│   └── hooks/
│       ├── useWorkspaceDrag.ts   # Pointer capture drag, AABB merge detection, failedIds flash
│       └── useSidebarDrag.ts     # Drag from sidebar list into workspace, ElementGhost positioning
└── features/theme/
    ├── AlchemyGame.tsx        # (re-export)
    ├── SchemeProvider.tsx     # Context: activeScheme/setActiveScheme, sets data-theme on <html>, persists cookie
    ├── ThemeProvider.tsx      # next-themes wrapper
    ├── SettingsPanel.tsx      # Popover: theme buttons, scheme Select, version toggle, fullscreen, clear, reset
    ├── font.config.ts         # 11 Google Fonts loaded as CSS vars, exported as fontVariables string
    └── scheme.config.ts       # SCHEMES array (10 entries), DEFAULT_SCHEME='vercel'
```

---

## Game Mechanics

### Types

```ts
type Version = 'v1' | 'v2'
type Combos = Record<string, string[][]>   // { "Fire": [["Air","Earth"], ...] }
type WEl = { id: string; name: string; x: number; y: number }
// x, y = center of card (CSS: left:x top:y + translate(-50%,-50%))
```

### Combination Lookup

```ts
buildLookup(data: Combos): Map<string, string>
// key: sorted pair joined by | — normalize(a) + '|' + normalize(b)
// normalize: lowercase, trim, spaces→hyphens
// e.g. "air|fire" → "Energy"
```

### Merge Detection

On `pointerup`, in `useWorkspaceDrag`:
```ts
const target = prev.find(w =>
  w.id !== id &&
  Math.abs(w.x - current.x) < 130 &&
  Math.abs(w.y - current.y) < 130
)
```
- Cards are 80px wide (w-20). Threshold 130 = ~50px tolerance beyond touching.
- No recipe found → add both ids to `failedIds` Set → WorkspaceCard shows red ring + shake 800ms.
- Recipe found → remove both, spawn result at midpoint, add to discovered Set.

### Starter Elements

`getStarters(data)` — elements with no recipe (base ingredients). Given to player on fresh start.

### State Persistence

```ts
loadState() / saveState()   // localStorage key 'alchemy-state': { version, v1: string[], v2: string[] }
// Cookies (server-readable):
//   'active_scheme' → color scheme name
//   'sidebar_state' → 'true'|'false' (written automatically by shadcn SidebarProvider)
```

---

## Layout Architecture

```
SidebarProvider (flex-row, h-screen min-h-0)      ← MUST wrap everything
  ├─ div.flex-col.flex-1 (header + workspace)
  │   ├─ header (h-12): title + SidebarTrigger
  │   └─ div.flex-1 (workspace canvas, position:relative)
  └─ ElementSidebar → <Sidebar side="right" collapsible="icon">
```

**Critical**: `ElementSidebar` must be a direct child of `SidebarProvider` (not nested inside the workspace div). The shadcn Sidebar renders `position:fixed; inset-y:0` — if nested, it overlays the header and the gap div is in the wrong flex context.

---

## Sidebar Collapsed Mode

Sidebar uses `collapsible="icon"` — collapses to `--sidebar-width-icon` (3rem).

Tailwind selectors for collapsed state (parent div has `data-collapsible="icon"` when collapsed, `data-collapsible=""` when expanded):
```
group-data-[collapsible=icon]:hidden          → hide in collapsed
hidden group-data-[collapsible=icon]:flex     → show only in collapsed
group-data-[collapsible=icon]:!p-0           → override padding in collapsed
group-data-[collapsible=icon]:justify-center  → center content in collapsed
```

SidebarMenuButton collapsed fix (base class sets `p-2!` which clips 28px tile in 32px button):
```tsx
className="group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:justify-center"
```

SidebarContent was modified to use ScrollArea (removed `no-scrollbar` class):
```tsx
// src/components/ui/sidebar.tsx — SidebarContent wraps children in <ScrollArea className="h-full">
```

---

## Theme / Scheme System

```
<html data-theme="vercel" class="__var_geist ... dark">
  ThemeProvider   → next-themes manages .dark class on <html>
  SchemeProvider  → manages data-theme attribute + 'active_scheme' cookie
```

- Color variables defined per-scheme: `[data-theme='vercel'] { --primary: ...; }` and `[data-theme='vercel'].dark { ... }`
- **Never add `:root {}` color blocks in globals.css** — equal specificity → cascade order wins → `:root` after themes.css import would override all schemes.
- `fontVariables` must be on `<html>` (not `<body>`) so font CSS vars are in scope for `[data-theme]` selectors on the same element.
- 10 schemes: vercel, claude, whatsapp, supabase, mono, neobrutualism, zen, astro-vista, light-green, notebook.

---

## Common Patterns

### Adding a new element interaction
- Game data is in `src/data/combinations_v1.json` / `combinations_v2.json` (static)
- No API calls — all combination logic is pure lookup from pre-built Map

### Changing merge threshold
- Edit `130` in both AABB conditions in `useWorkspaceDrag.ts` `onPointerUp`

### Adding a new color scheme
1. Create `src/styles/themes/your-scheme.css` with `[data-theme='your-scheme'] { ... }`
2. `@import './themes/your-scheme.css'` in `src/styles/themes.css`
3. Add `{ name: 'Display Name', value: 'your-scheme' }` to `SCHEMES` in `scheme.config.ts`

### Adding a shadcn component
```bash
pnpm dlx shadcn add <component>
```

---

## Key Constraints

- No React Query, Zustand, nuqs, or any state management library
- No authentication or API routes — purely static game
- `next/image` with `unoptimized` for element icons
- Turbopack dev — avoid broken symlinks in `.claude/` (causes Turbopack panic)
- shadcn here uses Base UI (`@base-ui/react`), NOT Radix UI — `asChild`, `Slot` patterns differ
