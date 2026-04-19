# Little Alchemy

A browser-based Little Alchemy built with Next.js 15, React 19, Tailwind CSS v4, and shadcn/ui.

Drag elements onto the canvas and combine them to discover new ones. Two game datasets (v1 and v2), 10 color schemes, light/dark/system theme support.

## Features

- Drag and drop elements from the sidebar onto the workspace
- Combine any two elements — if a recipe exists, a new element is discovered
- Two independent datasets: v1 (original) and v2 (extended)
- Progress persists across sessions via localStorage
- Collapsible right sidebar with search
- 10 color schemes + light / dark / system theme toggle
- Settings persisted via cookies (no flash on reload)

## Tech Stack

- **Next.js 15** — App Router, Turbopack dev server
- **React 19** — all UI
- **Tailwind CSS v4** — styling
- **shadcn/ui** — component library (sidebar, popover, dialog, scroll area, etc.)
- **next-themes** — light/dark/system toggle
- **lucide-react** — icons

## Getting Started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── app/              # Next.js root layout + page (server components)
├── data/             # Static JSON game data (combinations v1/v2, icon map)
├── features/
│   ├── alchemy/      # Game logic: drag hooks, workspace, sidebar, element icons
│   └── theme/        # Theme/scheme providers, settings panel, font config
├── components/ui/    # shadcn/ui components
└── styles/themes/    # Per-scheme CSS files (10 total)
```

## Available Scripts

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build
pnpm start        # Serve production build
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix lint + format
pnpm format       # Prettier
```

## Color Schemes

Vercel · Claude · WhatsApp · Supabase · Mono · Neobrutualism · Zen · Astro Vista · Light Green · Notebook

Switch schemes via the settings gear icon in the sidebar footer.
