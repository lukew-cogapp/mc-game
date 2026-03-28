# Drift Lands

A 2D block sandbox set among procedurally generated floating sky islands. Glide across short gaps, build bridges across the void, and reach the sky before the rising lava catches you.

**[Play now](https://lukew-cogapp.github.io/mc-game/)**

## Controls

### Keyboard + Mouse

| Input | Action |
|---|---|
| A/D or Arrow Keys | Move left/right |
| W/Up/Space | Jump (press again for double jump) |
| Hold Space (while falling) | Glide |
| Left Click (hold) | Break block |
| Right Click | Place block (must be adjacent) |
| 1-9 / Scroll Wheel | Select inventory slot |
| M | Toggle music |

### Xbox Controller

| Input | Action |
|---|---|
| Left Stick / D-pad | Move |
| A | Jump / Glide |
| Right Stick | Aim block cursor |
| X (hold) | Break block (aimed direction) |
| B | Place block (aimed direction) |
| LB / RB | Cycle inventory |

## Features

- **Structured world**: Chain-of-promises island layout with safe, resource, reward, transit, and goal islands
- **5 biomes**: Grassland, rocky, sandy, mossy, crystal — assigned by height
- **Block sandbox**: Break/place with mining animation, hover highlight, adjacency rules
- **Movement**: Momentum-based physics, double jump, glide, coyote time, jump buffering
- **Jetpack power-up**: Collectible fuel blocks give 3s of rocket boost with fire particles
- **Fruit**: Apples, pears, peaches, strawberries, berries — eat 10 to regain a life
- **3 lives**: Lava death with invulnerability on respawn, fruit-based life recovery
- **Rising lava**: Visible danger glow, lava progress meter on HUD
- **Day/night cycle**: Shrinking vision radius at night
- **NPCs**: Friendly characters on islands with cycling dialogue
- **Timer + high scores**: Top 5 fastest times saved locally with reset option
- **Victory screen**: Golden celebration with leaderboard on reaching the sky
- **Procedural 8-bit music**: Chiptune melody via Web Audio API, toggle in settings
- **Character customization**: Outfit, skin, hats, drawn faces, particle trails
- **Xbox controller**: Full support via raw browser Gamepad API
- **Pixel-art textures**: Custom drawn sprites for fruit, flowers, mushrooms, water, leaves, jetpack

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
