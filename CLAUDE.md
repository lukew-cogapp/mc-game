# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Drift Lands** — a 2D block sandbox on floating sky islands, built with Phaser 3 + TypeScript. Deployed at https://lukew-cogapp.github.io/mc-game/

## Commands

```bash
npm run dev          # Start dev server (auto-opens browser)
npm run build        # Typecheck + production build to dist/
npm run lint         # Biome check (format + lint + imports)
npm run lint:fix     # Auto-fix biome issues
npm run typecheck    # tsc --noEmit
npm run test         # Vitest run (once)
npm run test:watch   # Vitest watch mode
```

Pre-commit hooks (lefthook) run lint, typecheck, and test in parallel.

## Code Conventions

- **Fat arrow functions everywhere** — never use `function` declarations. Class methods use property arrow syntax.
- **All magic numbers in `src/config.ts`** — 500+ named constants organized by category (prefixed: `TITLE_*`, `GAMEOVER_*`, `VICTORY_*`, `HUD_*`, etc.). Never inline numeric/string literals.
- **Biome linter** — tabs, double quotes, recommended rules. Run `npx biome check --fix .` after changes. If biome says something is fixable, use the CLI before manual edits.
- **No external assets** — all visuals are procedurally drawn (Graphics primitives, generated textures). Music is procedurally generated via Web Audio API.
- **Scene cleanup** — all scenes register `shutdown` handlers to remove input listeners, preventing accumulation across scene restarts.
- **Gamepad via raw browser API** — uses `navigator.getGamepads()` directly (not Phaser's GamepadPlugin). Filters non-gamepad devices (requires 2+ axes, 10+ buttons).
- **Shared sets** — `NON_SOLID_BLOCKS` is defined once in `types.ts` and imported everywhere.

## Architecture

**Four Phaser scenes:** `TitleScene` → `GameScene` → `GameOverScene` / `VictoryScene` → back to title.

**GameScene update loop order:**
1. Lava: rise + danger glow
2. Player: input → physics (acceleration, coyote time, jump buffer) → collision → death/win check
3. Pickups: fruit collection (10 = +1 life), jetpack fuel collection
4. Block interaction: break (mouse/gamepad) + place (mouse/gamepad) + right-stick targeting
5. Gamepad actions: LB/RB inventory, X break, B place
6. World: water cascade, NPC dialogue proximity
7. Visuals: hover highlight, day/night cycle, clouds, leaves, ambient particles, lava meter
8. HUD: lives, fruit counter, jetpack fuel bar, timer

**World system:** `BlockType[][]` grid (200x100 tiles, 32px). Manual grid-based collision (no Phaser physics). Island generation follows "chain of reachable promises" pattern with roles (safe/resource/reward/transit/goal).

**Player system:** Container with body, head, hat, face (drawn via Graphics), outline, shadow. Momentum-based movement, double jump, glide, coyote time, jump buffering, variable jump height, jetpack boost. Particle emitter for trail effects.

**Audio:** Procedural 8-bit chiptune via Web Audio API oscillators (square wave, 2-channel). Settings persisted to localStorage.

**Persistence (localStorage):**
- Character customization: `drift-lands-character`
- Audio settings: `drift-lands-settings`
- High scores: `drift-lands-high-scores`

## Key Files

- `src/config.ts` — all game constants (500+)
- `src/types.ts` — BlockType enum, Island interface (with roles), NON_SOLID_BLOCKS set
- `src/audio/music.ts` — procedural chiptune generator
- `src/audio/settings.ts` — music/SFX settings persistence
- `src/audio/high-scores.ts` — top 5 leaderboard
- `src/player/face-renderer.ts` — shared face-drawing (player + title preview)
- `src/world/island-generator.ts` — chain-of-promises generation
- `src/world/npcs.ts` — NPC spawning and dialogue
- `src/world/world-renderer.ts` — block textures including pixel-art shapes

## Deploy

GitHub Pages via `.github/workflows/deploy.yml`. Pushes to `main` trigger: lint → typecheck → test → build → deploy.
