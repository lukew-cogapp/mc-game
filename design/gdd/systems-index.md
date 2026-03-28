# Drift Lands -- Systems Index

Scope: **Tier 1 (Weekend Prototype)** only.
Derived from `design/gdd/game-concept.md` and current source under `src/`.

---

## System Inventory

| # | System | Description | Dependencies | Priority | Status |
|---|--------|-------------|--------------|----------|--------|
| 1 | **World Grid** | 2D tile array that stores block types and serves as ground truth for all spatial queries | Config | Critical | Implemented |
| 2 | **Island Generation** | Procedurally places floating islands with biome-specific shapes, block composition, and trees | World Grid | Critical | Implemented |
| 3 | **World Renderer** | Creates block textures, stamps sprites for every non-air tile, and supports add/remove at runtime | World Grid | Critical | Implemented |
| 4 | **Player Movement** | Walk, jump, and glide with tile-based collision detection and gravity | World Grid, Config | Critical | Implemented |
| 5 | **Camera** | Follows the player with lerp smoothing; bounded to world extents | Player Movement | Critical | Implemented |
| 6 | **Block Interaction** | Left-click-hold to break blocks (timed), right-click to place; range-limited | Player Movement, World Grid, World Renderer, Inventory | Critical | Implemented |
| 7 | **Inventory** | 9-slot hotbar; stores mined blocks, number-key selection, UI rendering | Config | Critical | Implemented |
| 8 | **Void Death / Respawn** | Falling below the world resets the player to spawn position | Player Movement | Critical | Implemented |
| 9 | **Input** | Keyboard (cursor keys, number keys) and mouse (left/right click) binding | Phaser built-in | Critical | Implemented |
| 10 | **Scene Orchestration** | GameScene wires all systems together in create/update lifecycle | All above | Critical | Implemented |
| 11 | **Glide Feedback UI** | Text overlay showing glide state ("GLIDING" / "Hold UP to glide") | Player Movement | Low | Implemented |

---

## Dependency Graph

```
                  Config
                    |
        +-----------+-----------+
        |           |           |
   World Grid    Player Mov.  Inventory
        |           |           |
   +----+----+     Camera      |
   |         |      |          |
Island Gen  World   |          |
            Rend.   |          |
              |     |          |
              +--+--+----------+
                 |
           Block Interaction
                 |
          Void Death/Respawn  (uses Player Mov.)
                 |
          Scene Orchestration  (wires everything)
                 |
            Glide Feedback UI
```

Read bottom-up: Scene Orchestration depends on everything above it.
Block Interaction is the most cross-cutting system -- it touches the grid, renderer, player, and inventory.

---

## Implementation Status Summary

| Status | Count |
|--------|-------|
| Implemented | 11 |
| Partial | 0 |
| Not Started | 0 |

All Tier 1 systems are implemented. The prototype is functionally complete for its stated MVP scope.

---

## Missing / Implied Systems

The concept doc implies the following capabilities that have no dedicated system yet. None are required for Tier 1, but they will need systems if the project moves to Tier 2.

| Implied Feature | Source (concept doc section) | Tier |
|-----------------|------------------------------|------|
| Fog of war / distance reveal | Mechanics list, Tier 2 scope | 2 |
| Save / Load | Tier 2 scope | 2 |
| Crafting | Tier 2 scope | 2 |
| Sound / Particles ("juice") | Tier 2 scope | 2 |
| Parallax background / Weather | Tier 2 scope | 2 |
| Spawn-point update (last island) | Mechanics: "respawn on last island" | 1* |

\* The concept doc says "Void = death (fall and respawn on last island)" but the current implementation always respawns at the fixed home-island spawn point. This is a minor gap inside Tier 1 scope -- the player's `spawnX`/`spawnY` is never updated when they reach a new island.

---

## Recommended GDD Authoring Order

Write per-system GDDs in this order. The rationale is: design dependencies first, then the systems that consume them, finishing with cross-cutting or polish systems.

| Order | System | Rationale |
|-------|--------|-----------|
| 1 | World Grid | Foundation data structure; every other system reads it |
| 2 | Island Generation | Defines the content the player interacts with |
| 3 | Player Movement | Core feel; must be tuned before anything layered on top |
| 4 | Camera | Tightly coupled to player; affects how the world feels |
| 5 | Inventory | Standalone data model; needed before block interaction |
| 6 | Block Interaction | Heaviest cross-system integration; design last among core systems |
| 7 | Void Death / Respawn | Small system; document alongside or after player movement |
| 8 | Input | Mostly a binding table; document alongside the systems it serves |
| 9 | Scene Orchestration | Wiring doc, not a design doc; write if architecture gets complex |

For a weekend project, systems 1-6 are worth documenting. Systems 7-9 are small enough to live as notes inside their parent system's GDD.

---

## Key Tuning Parameters

These are the values most likely to change during playtesting. Centralised in `src/config.ts`.

| Parameter | Current Value | Affects |
|-----------|--------------|---------|
| `ISLAND_MIN_GAP` | 4 tiles | Whether gaps feel trivial or impossible |
| `GLIDE_GRAVITY` | 100 | How far gliding carries the player |
| `GLIDE_HORIZONTAL_BOOST` | 1.3x | Glide vs. bridge decision |
| `JUMP_VELOCITY` | -350 | Jump height relative to gaps |
| `BREAK_TIME_MS` | 300 ms | Pacing of the mine-and-build loop |
| `BLOCK_INTERACT_RANGE` | 4 tiles | How far the player can reach to build |
| `ISLAND_COUNT_MIN / MAX` | 12-18 | Density of the archipelago |
