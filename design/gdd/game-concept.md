# Drift Lands — Game Concept Document

## Overview

| Field | Value |
|---|---|
| **Working Title** | Drift Lands |
| **Genre** | 2D Block Sandbox / Exploration-Builder |
| **Engine** | Phaser 3 (TypeScript) |
| **Platform** | Web Browser |
| **Target Audience** | Explorers and Creators |
| **Team Size** | Solo |
| **Current Phase** | Pre-production (Weekend Prototype) |

---

## Elevator Pitch

A 2D block sandbox set among procedurally generated floating sky islands. Glide across short gaps, build bridges across the void, and discover an ever-expanding archipelago. The thrill is in the reaching.

---

## Core Fantasy

An architect and explorer spanning impossible gaps between floating worlds, driven by the promise of what lies on the next island.

---

## Core Verb

**Bridge** — the player's most meaningful action is building connections between islands across the void.

---

## Unique Hook

Like 2D Minecraft, AND ALSO verticality and void traversal replace underground mining. The world is sky and void — there is no ground. Every new island is earned through construction.

---

## MDA Analysis

*Note: The MDA analysis describes the full game vision. Items marked (post-MVP) are not in the Tier 1 prototype.*

### Aesthetics (Player Emotions)
1. **Discovery** (primary) — The thrill of spotting a new island in the fog and wondering what's on it
2. **Expression** (secondary) — Building bridges and structures that reflect personal style
3. **Submission** (tertiary, post-MVP) — The flow state of rhythmic mining and building. Emerges in Tier 2+ when audio/particle juice, varied tools, and crafting add rhythmic depth to the core loop.

### Dynamics (Emergent Behavior)
- Players plan routes through the archipelago based on visible islands
- Resource scarcity on current islands drives exploration to new ones
- Bridge construction creates a visible, growing network — a map of the player's journey
- Gliding creates risk/reward decisions: "Can I make that gap, or should I build?"

### Mechanics (Rules and Systems)
- Tile-based block breaking and placement
- Procedural floating island generation with varied biomes and resources
- Player movement: walk, jump, glide
- Simple inventory: mine blocks, place blocks (no crafting in prototype)
- Fog of war / distance reveal tied to exploration (post-MVP)
- Void = death (fall and respawn on last island touched, losing nothing — see Void Death Design below)

---

## Player Motivation Profile (Self-Determination Theory)

### Autonomy
High. The player chooses which islands to pursue, what to build, and how to traverse. No quest markers, no forced progression.

### Competence
Medium. Skill grows through understanding island generation patterns, efficient bridging techniques, and glide distance mastery. No combat skill.

### Relatedness
Low (solo experience). Connection is to the world itself — the islands become familiar landmarks. Potential for shared worlds in future scope.

---

## Design Pillars

### 1. Span the Void
The core thrill is bridging impossible gaps. Every mechanic should support the feeling of reaching somewhere new by building your way there.
- **Design test**: "Does this feature make bridging more interesting or satisfying? If not, cut it."

### 2. Rewarding Horizons
Every island the player can see should be worth reaching. Discovery is the carrot that drives building.
- **Design test**: "Does every reachable island have something the player didn't have before?"

### 3. Elegant Simplicity
A weekend prototype means ruthless focus. If it can't be built in hours, it doesn't exist yet.
- **Design test**: "Can this feature be implemented in under 2 hours? If not, defer it."

---

## Anti-Pillars (What This Game is NOT)

- **NOT a survival game** — No hunger, no health bar, no hostile mobs. The void is the only threat.
- **NOT a crafting tree game** — No workbenches, no recipe systems in the prototype. Place what you mine.
- **NOT an underground game** — No caves, no digging down. The world is sky and void.

---

## Glide Design

Gliding is always available — no unlock, no resource cost. The player activates glide by **holding the jump key (Space/W/UP) while falling**. While gliding:

- Vertical fall speed is drastically reduced (from 800 to 100 gravity units)
- Horizontal speed gets a 1.3x boost, rewarding directional input during glide
- Glide duration is unlimited — the player descends slowly until they land or release

**Design intent:** Gliding bridges short gaps (2-4 tiles) for free, but medium gaps (5-8 tiles) cause the player to lose altitude and risk the void. Long gaps (9+ tiles) require built bridges. This creates a natural three-tier traversal system: walk (same island), glide (short hop), bridge (real crossing).

**Key tuning params:** `GLIDE_GRAVITY` (fall speed while gliding) and `GLIDE_HORIZONTAL_BOOST` (speed multiplier) in `src/config.ts`.

---

## Death Design

At the bottom of the world sits a **lava lake** — a visible, animated hazard that makes the void feel dangerous and real. Touching lava kills the player and respawns them on the **last island they stood on**. No inventory is lost, no penalty beyond lost position.

**Rationale:** This game is about creative building and exploration, not punishment. Losing inventory would discourage the risk-taking that makes bridging exciting ("should I try to glide that gap?"). Death is a spatial setback, not a resource penalty — you lose progress toward your destination, not your materials. The lava gives the void a visible floor and a clear threat, which is more readable than falling into infinite darkness.

**Implementation note:** The player's spawn point should update whenever they land on a new island's surface blocks.

---

## Camera Design

The camera follows the player with a gentle lerp (0.1), bounded to the world extents. This gives a smooth, non-jarring feel during movement.

**Key design consideration for Pillar 2 (Rewarding Horizons):** The player needs to see distant islands to be drawn toward them. The current camera shows roughly a screen's worth of world around the player, which should reveal nearby islands across the void. Islands beyond visual range become discoverable by building upward or outward. In Tier 2, fog of war creates a more deliberate reveal mechanic.

No free-look or camera panning in the prototype — the player's position IS the camera position.

---

## Core Loops

### 30-Second Loop (Moment-to-Moment)
Break blocks to gather resources. Place blocks to build structures or extend bridges. Rhythmic, tactile, satisfying.

### 5-Minute Loop (Short-Term Goals)
Spot a new island in the distance. Figure out how to reach it — glide or bridge? Arrive. Discover new block types or features. Decide: push further or head back?

### Session Loop (30-60 Minutes)
Start on home island. Expand outward through the archipelago, connecting islands to a growing bridge network. Natural stopping point: "I connected that far island." Hook: "I can see another one just beyond the fog..."

### Progression Loop (Days/Weeks — Post-Prototype)
Better materials enable longer/stronger bridges. Fog clears as you explore, revealing the full archipelago. Rare islands with unique blocks or ancient structures.

---

## Player Type Validation

| | |
|---|---|
| **Primary** | Explorers — driven by discovery, uncovering the map, seeing what's out there |
| **Secondary** | Creators — bridge-building and base construction satisfies builders |
| **Not For** | Achievers (no grind/optimization), Competitors (no PvP/leaderboards) |
| **Market Comps** | Terraria, Starbound, Kingdom: Two Crowns (2D worlds work). Airborne Kingdom (floating island theme in 3D). The 2D floating-island sandbox niche is underserved. |

---

## Scope Tiers

### Tier 1: Weekend Prototype (MVP)
The question this answers: **"Is bridging between floating islands fun?"**

- Tile-based world renderer with camera and scrolling
- Procedural floating island generation (5-10 islands)
- Player movement: walk, jump, glide
- Block break/place mechanics
- Simple inventory (mine it, place it)
- Void = respawn
- 2-3 distinct block/island types

### Tier 2: Vertical Slice (2-4 weeks)
- Fog of war / distance reveal
- 5+ island biome types with unique resources
- Basic crafting (combine blocks into bridge-specific materials)
- Sound effects and particle juice
- Parallax sky background and weather
- Save/load system

### Tier 3: Full Vision (months)
- Massive procedural archipelagos
- Full crafting and material progression
- Special structures and ruins on rare islands
- Wind mechanics affecting glide
- NPCs or creatures on islands
- Multiplayer bridge-building

---

## Technical Preferences

| | |
|---|---|
| **Engine** | Phaser 3 |
| **Language** | TypeScript |
| **Linter** | Biome |
| **Style** | Fat arrow functions preferred |
| **Platform** | Web browser |
| **Build** | Vite |
| **Deploy** | GitHub Pages |

---

## Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Bridging feels tedious, not thrilling | High | Smart placement assists, visual/audio feedback on progress |
| Island spacing too far (boring) or too close (trivial) | High | Tunable generation params, playtest early |
| Glide trivializes bridges | Medium | Balance glide distance vs. island gaps carefully |
| Scope creep beyond weekend | Medium | Pillar 3 (Elegant Simplicity) is the guardrail |
| Core loop too shallow past 15 minutes | Medium | Ensure island variety and block types create meaningful differences; playtest session length early |
| Phaser tilemap performance with large sparse worlds | Low | Chunk-based rendering or only allocating island regions if needed |

---

## Prototype Success Criteria

How we know the core hypothesis ("Is bridging between floating islands fun?") is validated:

- Players voluntarily bridge to at least 3 islands without prompting
- Players express curiosity about visible but unreached islands ("what's over there?")
- The glide-or-bridge decision feels like a meaningful choice, not an obvious one
- Players spend more time building outward (toward new islands) than building on their home island
- A 15-minute playtest session ends with the player wanting to continue

---

## Next Steps

1. `/setup-engine phaser 3` — Configure Phaser + TypeScript + Biome
2. `/design-review design/gdd/game-concept.md` — Validate this document
3. `/map-systems` — Decompose into systems (terrain, player, inventory, etc.)
4. `/prototype core-bridging` — Build the MVP to test the core hypothesis
5. `/sprint-plan new` — Plan the first sprint
