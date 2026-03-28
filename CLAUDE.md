# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Drift Lands** — a 2D block sandbox on floating sky islands, built with Phaser 3 + TypeScript + rexUI. Deployed at https://lukew-cogapp.github.io/mc-game/

## Commands

```bash
npm run dev          # Start dev server (auto-opens browser)
npm run build        # Typecheck + production build to dist/
npm run lint         # Biome check (format + lint + imports)
npm run lint:fix     # Auto-fix biome issues
npm run typecheck    # tsc --noEmit
npm run test         # Vitest run (58 tests)
npm run test:watch   # Vitest watch mode
```

Pre-commit hooks (lefthook) run lint, typecheck, and test in parallel.

## Code Conventions

- **Fat arrow functions everywhere** — never use `function` declarations. Class methods use property arrow syntax.
- **All magic numbers in `src/config.ts`** — 800+ named constants organized by category (prefixed: `TITLE_*`, `GAMEOVER_*`, `VICTORY_*`, `HUD_*`, etc.). Never inline numeric/string literals.
- **Biome linter** — tabs, double quotes, recommended rules. Run `npx biome check --fix .` after changes. If biome says something is fixable, use the CLI before manual edits.
- **No external assets** — all visuals are procedurally drawn (Graphics primitives, generated textures). Music is procedurally generated via Web Audio API.
- **rexUI plugin** — use `this.rexUI` for UI layout (Sizer, Label, RoundRectangle, Buttons). Typed via `src/types/rexui.d.ts`.
- **Scene cleanup** — all scenes register `shutdown` handlers to remove input listeners.
- **Gamepad via raw browser API** — `navigator.getGamepads()` directly. Filters non-gamepad devices (requires 2+ axes, 10+ buttons).
- **Shared sets** — `NON_SOLID_BLOCKS` defined once in `types.ts`.
- **Text resolution** — all text uses `.setResolution(TEXT_RESOLUTION)` (currently 3x) for crisp rendering.
- **Block sprite map** — `world-renderer.ts` uses a `Map<string, Sprite>` for O(1) sprite lookups.

## Architecture

**Four Phaser scenes:** `TitleScene` → `GameScene` → `GameOverScene` / `VictoryScene` → back to title.

**OO class architecture:**
- `Player` extends `Phaser.GameObjects.Container` — physics, rendering, trails, jetpack
- `Npc` extends `Phaser.GameObjects.Container` — gravity, dialogue, speech bubbles
- `InventoryBar` — 9-slot hotbar with block texture previews

**GameScene update loop:**
1. Lava: rise + danger glow
2. Player: acceleration-based movement, coyote time, jump buffer, step-up, jetpack, glide (with duration limit)
3. Pickups: fruit (10 = +1 life), jetpack fuel
4. Block interaction: mine (per-type timing), place (8-direction adjacency), right-stick targeting
5. World: water cascade + sideways spill, NPC gravity + dialogue
6. Visuals: hover highlight + tooltip, day/night, clouds, leaves, particles, lava meter
7. HUD: lives, fruit counter, jetpack bar, timer
8. Notifications: slide-in messages for deaths, pickups, events

**World:** `BlockType[][]` grid (200×100 tiles, 32px). Manual collision. Chain-of-promises island generation with roles (safe/resource/reward/transit/goal).

**Audio:** Procedural chiptune (triangle wave, 72 BPM). Settings persisted to localStorage.

**Persistence (localStorage):**
- `drift-lands-character` — customization
- `drift-lands-settings` — music/SFX toggles
- `drift-lands-high-scores` — top 5 times

## Key Files

- `src/config.ts` — all constants (800+)
- `src/types.ts` — BlockType enum, Island/IslandRole, NON_SOLID_BLOCKS
- `src/player/player.ts` — Player class
- `src/player/inventory.ts` — InventoryBar class, BLOCK_NAMES
- `src/player/block-interaction.ts` — mine/place with per-type timing
- `src/player/face-renderer.ts` — drawn pixel faces
- `src/world/island-generator.ts` — chain-of-promises generation
- `src/world/npcs.ts` — Npc class with gravity + dialogue
- `src/world/world-renderer.ts` — block sprites + O(1) Map lookup
- `src/world/block-textures.ts` — pixel art texture drawing
- `src/world/water-physics.ts` — gravity + sideways spill + lava evaporation
- `src/world/sky.ts` — gradient + goal beacon
- `src/world/ambient.ts` — clouds, particles, leaves
- `src/world/lava.ts` — rising lava (depth 90, always above blocks)
- `src/world/day-night.ts` — cycle with vision radius
- `src/audio/music.ts` — procedural chiptune
- `src/audio/settings.ts` — music/SFX persistence
- `src/audio/high-scores.ts` — top 5 leaderboard
- `src/ui/notifications.ts` — NotificationManager
- `src/ui/lava-meter.ts` — vertical progress bar

## Testing

58 tests across 4 files: high-scores, settings, types, config. Run with `npm test`.

## Deploy

GitHub Pages via `.github/workflows/deploy.yml`. Push to `main` → lint → typecheck → test → build → deploy.
