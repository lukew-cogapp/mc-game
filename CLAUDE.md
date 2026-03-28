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

- **Fat arrow functions everywhere** — never use `function` declarations. Use `const fn = () => {}` style.
- **All magic numbers in `src/config.ts`** — named constants organized by category. Never inline numeric/string literals.
- **Biome linter** — tabs, double quotes, recommended rules. Run `npx biome check --fix .` after changes. If biome says something is fixable, use the CLI before manual edits.
- **No external textures** — all visuals are procedurally drawn (Phaser rectangles, circles, Graphics primitives). Block textures stamped at runtime via `createWorldTextures()`.
- **Scene cleanup** — all scenes register `shutdown` handlers to remove input listeners, preventing accumulation across scene restarts.
- **Gamepad via raw browser API** — uses `navigator.getGamepads()` directly (not Phaser's GamepadPlugin) for reliable cross-scene support. Filters out non-gamepad devices (requires 2+ axes, 10+ buttons).

## Architecture

**Three Phaser scenes:** `TitleScene` (character customization) → `GameScene` (gameplay) → `GameOverScene` (death screen, back to title).

**GameScene update loop order:**
1. `updateLava()` — rise lava, get lavaY
2. `updateLavaGlow()` — red danger gradient above lava
3. `createGameInput()` + `updatePlayer()` — physics, collision, movement, death check
4. `collectFruit()` — eat fruit blocks on overlap, track toward life recovery
5. `handleBlockBreak()` — left-click / X button mining with crack animation
6. `handleGamepadActions()` — LB/RB inventory, X break, B place
7. `updateWater()` — cascade water blocks downward
8. `updateHoverHighlight()` — highlight block under cursor if in range
9. `updateDayNight()` — cycle lighting, resize vision mask
10. `updateClouds()` / `updateLeafParticles()` / `updateAmbientParticles()` — visual polish

**World system:** `BlockType[][]` grid (200x100 tiles, 32px each). No Phaser physics — collision is manual grid-based checking in `player.ts`. Block sprites created/destroyed at runtime as the grid changes.

**Player system:** Wraps a `Phaser.GameObjects.Container` (body + head + hat + face + outline + shadow). `GameInput` interface abstracts keyboard + gamepad into `{ left, right, up, jump }` booleans each frame.

**Lives system:** 3 lives, lava death costs 1 life + 1.5s invulnerability (flashing). 10 fruit eaten = +1 life (max 3). 0 lives = GameOverScene.

**Pixel art textures:** Fruit, flowers, mushrooms, water, and leaves get custom drawn textures in `world-renderer.ts` instead of flat colored squares.

## Key Files

- `src/config.ts` — all game constants
- `src/types.ts` — BlockType enum, Island/InventorySlot interfaces
- `src/player/face-renderer.ts` — shared face-drawing function (used by both player and title preview)
- `src/world/island-generator.ts` — procedural generation (biomes, trees, fruit, decorations)
- `src/world/world-renderer.ts` — block textures including pixel-art shapes

## Game Design

Three pillars: **Span the Void** (bridging is the core thrill), **Rewarding Horizons** (every island worth reaching), **Elegant Simplicity** (ruthless scope focus).

Design docs in `design/gdd/` — `game-concept.md` has the full vision, `systems-index.md` has the dependency map.

## Deploy

GitHub Pages via `.github/workflows/deploy.yml`. Pushes to `main` trigger: lint → typecheck → test → build → deploy.
