# Drift Lands

A 2D block sandbox set among procedurally generated floating sky islands. Glide across short gaps, build bridges across the void, and discover an ever-expanding archipelago. Reach the sky before the rising lava catches you.

**[Play now](https://lukew-cogapp.github.io/mc-game/)**

## Controls

### Keyboard + Mouse

| Input | Action |
|---|---|
| A/D or Arrow Keys | Move left/right |
| W/Up/Space | Jump |
| Hold Space (while falling) | Glide |
| Left Click (hold) | Break block |
| Right Click | Place block (must be adjacent) |
| 1-9 / Scroll Wheel | Select inventory slot |

### Xbox Controller

| Input | Action |
|---|---|
| Left Stick / D-pad | Move |
| A | Jump / Glide |
| X (hold) | Break block (facing direction) |
| B | Place block (facing direction) |
| LB / RB | Cycle inventory |

## Features

- Procedural floating islands across 5 biomes (grassland, rocky, sandy, mossy, crystal)
- Block breaking/placing with mining crack animation and hover highlighting
- Glide mechanic for crossing gaps
- Fruit trees (apples, pears, peaches, strawberries, berries) — walk through to eat, 10 fruit = +1 life
- Water physics (falls, slows player)
- Rising lava with danger glow
- 3 lives with invulnerability on respawn
- Day/night cycle with shrinking vision radius
- Sky gradient with golden goal beacon at the top
- Background clouds, falling leaves, ambient particles
- Character customization (outfit, skin, hats, faces, trails)
- Xbox controller support (raw browser Gamepad API)
- Pixel-art block textures for fruit, flowers, mushrooms, water, leaves

## Tech Stack

- [Phaser 3](https://phaser.io/) — game framework
- TypeScript (strict mode)
- [Vite](https://vite.dev/) — bundler
- [Biome](https://biomejs.dev/) — linter/formatter
- [Vitest](https://vitest.dev/) — test runner
- [Lefthook](https://github.com/evilmartians/lefthook) — pre-commit hooks (lint + typecheck + test)

## Development

```bash
npm install          # Install dependencies
npm run dev          # Start dev server
npm run build        # Production build
npm run lint:fix     # Auto-fix lint issues
npm run typecheck    # Type check
npm run test         # Run tests
```

Pushing to `main` auto-deploys to [GitHub Pages](https://lukew-cogapp.github.io/mc-game/).

## Design

See [design/gdd/game-concept.md](design/gdd/game-concept.md) for the full game design document.
