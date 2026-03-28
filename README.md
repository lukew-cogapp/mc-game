# Drift Lands

A 2D block sandbox set among procedurally generated floating sky islands. Bridge gaps, glide across voids, and reach the sky before the rising lava catches you.

**[Play now](https://lukew-cogapp.github.io/mc-game/)**

## Controls

### Keyboard + Mouse

| Input | Action |
|---|---|
| A/D or Arrow Keys | Move left/right (walks up 1-tile steps) |
| W/Up/Space | Jump (press again for double jump) |
| Hold Space (falling) | Glide (3s limit) |
| Left Click (hold) | Mine block (speed varies by material) |
| Right Click | Place block (diagonal adjacency OK) |
| 1-9 / Scroll Wheel | Select inventory slot |
| M | Toggle music |

### Xbox Controller

| Input | Action |
|---|---|
| Left Stick / D-pad | Move |
| A | Jump / Glide |
| Right Stick | Aim block cursor (8 directions) |
| X (hold) | Mine block |
| B | Place block |
| LB / RB | Cycle inventory |

## Features

- **Structured world** — chain-of-promises island layout with safe, resource, reward, transit, and goal islands
- **5 biomes** — grassland, rocky, sandy, mossy, crystal (assigned by height)
- **Block sandbox** — mine (per-material timing), place (diagonal OK), hover tooltip shows block name
- **Movement** — momentum physics, double jump, glide (duration-limited), coyote time, jump buffering, auto step-up
- **Jetpack** — collectible fuel blocks, 3s rocket thrust with fire particles
- **Fruit** — apples, pears, peaches, strawberries, berries. Eat 10 to regain a life
- **Water** — falls, spreads sideways, slows player, evaporates at lava
- **3 lives** — lava death with invulnerability on respawn
- **Rising lava** — animated with danger glow, lava progress meter
- **Day/night cycle** — shrinking vision radius, sky color transitions
- **NPCs** — friendly characters with gravity, proximity dialogue, lava death notifications
- **Timer + high scores** — top 5 fastest times, leaderboard on victory screen
- **Procedural 8-bit music** — triangle wave chiptune, settings persisted
- **Character customization** — outfit, skin, hats, drawn pixel faces, particle trails
- **Xbox controller** — full support via browser Gamepad API
- **Pixel-art textures** — custom sprites for fruit, flowers, mushrooms, water, leaves, jetpack
- **Notification system** — slide-in messages for game events

## Tech Stack

- [Phaser 3](https://phaser.io/) + [rexUI](https://rexrainbow.github.io/phaser3-rex-notes/docs/site/ui-overview/) — game framework + UI plugin
- TypeScript (strict mode)
- [Vite](https://vite.dev/) — bundler
- [Biome](https://biomejs.dev/) — linter/formatter
- [Vitest](https://vitest.dev/) — 58 tests
- [Lefthook](https://github.com/evilmartians/lefthook) — pre-commit hooks

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # Type check
npm run test         # Run 58 tests
```

Pushing to `main` auto-deploys to [GitHub Pages](https://lukew-cogapp.github.io/mc-game/).

## Design

See [design/gdd/game-concept.md](design/gdd/game-concept.md) for the full game design document.
