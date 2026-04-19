# CLAUDE.md

Little Alchemy — a browser game built with Next.js 15, React 19, Tailwind v4, and shadcn/ui.

## Project Structure

```
src/
├── app/                        # Next.js App Router (layout, page, globals.css)
├── components/
│   ├── game/AlchemyGame.tsx    # Re-export shim → features/alchemy/AlchemyGame
│   └── ui/                     # shadcn/ui components (do not modify directly)
├── data/                       # Static JSON: combinations_v1.json, combinations_v2.json, iconMap.json
├── features/
│   ├── alchemy/                # All game logic
│   │   ├── hooks/              # useWorkspaceDrag, useSidebarDrag
│   │   ├── AlchemyGame.tsx     # Root orchestrator, owns all state
│   │   ├── Sidebar.tsx         # Right sidebar (shadcn Sidebar, collapsible="icon")
│   │   ├── WorkspaceCard.tsx   # Draggable element tile on canvas
│   │   ├── ElementGhost.tsx    # Drag preview following cursor
│   │   ├── ElemIcon.tsx        # Element icon (next/image, SVG ≥599 / PNG <599)
│   │   ├── data.ts             # normalize, buildLookup, getStarters, loadState, saveState
│   │   └── types.ts            # Version, Combos, WEl
│   └── theme/
│       ├── AlchemyGame.tsx     # Root orchestrator
│       ├── SchemeProvider.tsx  # Sets data-theme on <html>, manages cookie
│       ├── ThemeProvider.tsx   # next-themes wrapper (light/dark/system)
│       ├── SettingsPanel.tsx   # Popover: theme toggle + scheme select + game controls
│       ├── font.config.ts      # All Google Font variables (loaded on <html>)
│       └── scheme.config.ts    # SCHEMES array + DEFAULT_SCHEME
├── styles/
│   ├── themes.css              # @imports all 10 theme CSS files
│   └── themes/                 # One CSS file per scheme ([data-theme='x'] selectors)
└── types/css.d.ts              # declare module '*.css'
```

## Critical Conventions

- **Icons** — import from `lucide-react` directly (not a registry). Element icons use `ElemIcon` which wraps `next/image`.
- **Formatting** — single quotes, no trailing comma, 2-space indent (Prettier enforced).
- **`'use client'`** — all interactive game components are client components. `src/app/layout.tsx` and `src/app/page.tsx` are server components (read cookies for theme/sidebar state).
- **shadcn components** — do not modify `src/components/ui/` except when the component itself needs a structural change (e.g. `SidebarContent` was modified to use `ScrollArea`).
- **State persistence** — game state (discovered elements, active version) persists to `localStorage` via `loadState`/`saveState` in `data.ts`. Theme/scheme/sidebar state persists via cookies (read server-side in layout/page to avoid FOUC).

## Theme System

- **Light/dark/system** toggle: `next-themes` sets `.dark` class on `<html>`.
- **Color scheme**: `data-theme="<scheme>"` on `<html>`. 10 schemes in `src/styles/themes/`.
- **Fonts**: `fontVariables` (all 11 Google Font CSS vars) applied to `<html>` element so font vars are in scope for `[data-theme]` selectors.
- CSS cascade rule: themes.css is imported at top of globals.css. Never add `:root {}` color variable blocks in globals.css — they would override theme CSS at equal specificity.

## Game Mechanics

- **Lookup**: `buildLookup(data)` builds a `Map<string, string>` keyed by `"elem1|elem2"` (sorted, lowercased, spaces→hyphens).
- **Merge detection**: AABB check — `Math.abs(dx) < 130 && Math.abs(dy) < 130` on card centers. Cards are `w-20` (80px); threshold gives ~50px tolerance beyond touching.
- **Positions**: `WEl.x, WEl.y` are the **center** of the card (cards use `transform: translate(-50%, -50%)`).
- **Failed merge**: cards flash red border + shake animation for 800ms when overlapping but no recipe exists.
- **Two versions**: `v1` and `v2` datasets are independent; switching version clears the workspace.

## Sidebar Layout

`SidebarProvider` wraps the full page. `ElementSidebar` (which renders the shadcn `<Sidebar side="right" collapsible="icon">`) is a **direct child** of `SidebarProvider` — not nested inside the workspace div. This ensures the sidebar gap div is in the correct flex context.

Layout tree:
```
SidebarProvider (flex-row, h-screen)
  ├─ div.flex-col (header + workspace) — flex-1
  └─ ElementSidebar → <Sidebar side="right">
```

## Dev Commands

```bash
pnpm dev          # Turbopack dev server
pnpm build        # Production build
pnpm lint:fix     # ESLint fix + Prettier
pnpm format       # Prettier only
```
