import {
	ASCENT_HORIZONTAL_REACH_MAX,
	ASCENT_HORIZONTAL_REACH_MIN,
	ASCENT_VERTICAL_GAP_MAX,
	ASCENT_VERTICAL_GAP_MIN,
	DEAD_TREE_TRUNK_MAX,
	DEAD_TREE_TRUNK_MIN,
	DECORATION_FLOWER_CHANCE,
	DECORATION_MUSHROOM_CHANCE,
	FRUIT_PER_TREE_MAX,
	FRUIT_PER_TREE_MIN,
	GOAL_ISLAND_HEIGHT,
	GOAL_ISLAND_WIDTH,
	HOME_ISLAND_HEIGHT,
	HOME_ISLAND_WIDTH,
	ISLAND_EDGE_INDENT_CHANCE,
	ISLAND_EDGE_INDENT_MAX,
	ISLAND_GRASS_DEPTH_RATIO,
	ISLAND_MARGIN,
	ISLAND_OVERHANG_INDENT,
	ISLAND_SHAPE_FLAT_WIDE_CHANCE,
	ISLAND_SHAPE_OVERHANG_CHANCE,
	ISLAND_SHAPE_TALL_NARROW_CHANCE,
	ISLAND_TOP_WIDTH_RATIO,
	JETPACK_SPAWN_COUNT_MAX,
	JETPACK_SPAWN_COUNT_MIN,
	LARGE_TREE_CANOPY_MAX_DIST,
	LARGE_TREE_CANOPY_RADIUS,
	LARGE_TREE_TRUNK_MAX,
	LARGE_TREE_TRUNK_MIN,
	MID_CLIMB_RATIO,
	PLAYER_RESPAWN_OFFSET_Y,
	RESOURCE_ISLAND_HEIGHT_MAX,
	RESOURCE_ISLAND_HEIGHT_MIN,
	RESOURCE_ISLAND_WIDTH_MAX,
	RESOURCE_ISLAND_WIDTH_MIN,
	RESOURCE_VISIBLE_INTERVAL,
	REWARD_ISLAND_HEIGHT_MAX,
	REWARD_ISLAND_HEIGHT_MIN,
	REWARD_ISLAND_WIDTH_MAX,
	REWARD_ISLAND_WIDTH_MIN,
	SAFE_ISLAND_HEIGHT_MAX,
	SAFE_ISLAND_HEIGHT_MIN,
	SAFE_ISLAND_INTERVAL,
	SAFE_ISLAND_WIDTH_MAX,
	SAFE_ISLAND_WIDTH_MIN,
	SIDE_ISLAND_CHANCE,
	SIDE_ISLAND_HORIZONTAL_OFFSET_MAX,
	SIDE_ISLAND_HORIZONTAL_OFFSET_MIN,
	SIDE_ISLAND_VERTICAL_JITTER,
	SMALL_TREE_CANOPY_MAX_DIST,
	SMALL_TREE_CANOPY_RADIUS,
	SMALL_TREE_TRUNK_MAX,
	SMALL_TREE_TRUNK_MIN,
	SPAWN_CLEAR_HALF_WIDTH,
	SPAWN_CLEAR_HEIGHT,
	STARTER_ISLAND_COUNT,
	STARTER_ZONE_RATIO,
	STRAWBERRY_BUSH_CHANCE,
	TILE_SIZE,
	TRANSIT_ISLAND_HEIGHT_MAX,
	TRANSIT_ISLAND_HEIGHT_MIN,
	TRANSIT_ISLAND_WIDTH_MAX,
	TRANSIT_ISLAND_WIDTH_MIN,
	TREE_CANOPY_MAX_DIST,
	TREE_CANOPY_RADIUS,
	TREE_TRUNK_MAX,
	TREE_TRUNK_MIN,
	WATER_POOL_CHANCE,
	WATER_POOL_DEPTH,
	WATER_POOL_WIDTH_MAX,
	WATER_POOL_WIDTH_MIN,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";
import { BlockType, type Island, type IslandRole } from "../types";
import { pickNpcSpawnPositions } from "./npcs";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const randomRange = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

const clamp = (value: number, min: number, max: number): number =>
	Math.max(min, Math.min(max, value));

type IslandShape = "normal" | "tall_narrow" | "flat_wide" | "overhang";

const pickIslandShape = (): IslandShape => {
	const roll = Math.random();
	if (roll < ISLAND_SHAPE_TALL_NARROW_CHANCE) return "tall_narrow";
	if (roll < ISLAND_SHAPE_TALL_NARROW_CHANCE + ISLAND_SHAPE_FLAT_WIDE_CHANCE)
		return "flat_wide";
	if (
		roll <
		ISLAND_SHAPE_TALL_NARROW_CHANCE +
			ISLAND_SHAPE_FLAT_WIDE_CHANCE +
			ISLAND_SHAPE_OVERHANG_CHANCE
	)
		return "overhang";
	return "normal";
};

// ---------------------------------------------------------------------------
// Biome / block look-ups
// ---------------------------------------------------------------------------

const getSurfaceBlock = (biome: Island["biome"]): BlockType => {
	switch (biome) {
		case "sandy":
			return BlockType.Sand;
		case "mossy":
			return BlockType.MossyStone;
		case "crystal":
			return BlockType.CrystalBlock;
		default:
			return BlockType.Grass;
	}
};

const getSubSurfaceBlock = (biome: Island["biome"]): BlockType => {
	switch (biome) {
		case "sandy":
			return BlockType.Sand;
		case "mossy":
			return BlockType.Dirt;
		case "crystal":
			return BlockType.Stone;
		default:
			return BlockType.Dirt;
	}
};

const getDeepBlock = (biome: Island["biome"]): BlockType => {
	switch (biome) {
		case "mossy":
			return BlockType.MossyStone;
		case "crystal":
			return BlockType.CrystalBlock;
		default:
			return BlockType.Stone;
	}
};

// ---------------------------------------------------------------------------
// Island shape generation
// ---------------------------------------------------------------------------

const applyEdgeIrregularity = (grid: BlockType[][], island: Island): void => {
	for (let y = 0; y < island.height; y++) {
		let leftEdge = -1;
		let rightEdge = -1;
		for (let x = 0; x < island.width; x++) {
			if (grid[y][x] !== BlockType.Air) {
				if (leftEdge === -1) leftEdge = x;
				rightEdge = x;
			}
		}
		if (leftEdge === -1) continue;

		const rowWidth = rightEdge - leftEdge + 1;
		if (rowWidth <= 2) continue;

		if (island.biome === "rocky") {
			const jaggedChance =
				y < island.height * 0.4
					? ISLAND_EDGE_INDENT_CHANCE * 1.5
					: ISLAND_EDGE_INDENT_CHANCE * 0.5;
			if (Math.random() < jaggedChance) {
				const indent = randomRange(1, ISLAND_EDGE_INDENT_MAX + 1);
				for (let i = 0; i < indent && leftEdge + i < rightEdge; i++) {
					grid[y][leftEdge + i] = BlockType.Air;
				}
			}
			if (Math.random() < jaggedChance) {
				const indent = randomRange(1, ISLAND_EDGE_INDENT_MAX + 1);
				for (let i = 0; i < indent && rightEdge - i > leftEdge; i++) {
					grid[y][rightEdge - i] = BlockType.Air;
				}
			}
		} else if (island.biome === "sandy") {
			if (y < 2 && Math.random() < ISLAND_EDGE_INDENT_CHANCE * 0.5) {
				grid[y][leftEdge] = BlockType.Air;
			}
			if (y < 2 && Math.random() < ISLAND_EDGE_INDENT_CHANCE * 0.5) {
				grid[y][rightEdge] = BlockType.Air;
			}
		} else {
			if (Math.random() < ISLAND_EDGE_INDENT_CHANCE) {
				grid[y][leftEdge] = BlockType.Air;
			}
			if (Math.random() < ISLAND_EDGE_INDENT_CHANCE) {
				grid[y][rightEdge] = BlockType.Air;
			}
		}
	}
};

const generateIslandShape = (
	island: Island,
	shape: IslandShape,
): BlockType[][] => {
	const grid: BlockType[][] = Array.from({ length: island.height }, () =>
		Array(island.width).fill(BlockType.Air),
	);

	const midX = Math.floor(island.width / 2);

	for (let y = 0; y < island.height; y++) {
		let widthAtRow: number;

		if (shape === "overhang" && y >= 1 && y <= 2) {
			widthAtRow = Math.min(
				island.width,
				Math.floor(
					island.width *
						(ISLAND_TOP_WIDTH_RATIO +
							(1 - ISLAND_TOP_WIDTH_RATIO) * (y / island.height)),
				) + ISLAND_OVERHANG_INDENT,
			);
		} else {
			widthAtRow = Math.min(
				island.width,
				Math.floor(
					island.width *
						(ISLAND_TOP_WIDTH_RATIO +
							(1 - ISLAND_TOP_WIDTH_RATIO) * (y / island.height)),
				),
			);
		}

		const startX = midX - Math.floor(widthAtRow / 2);

		for (let x = startX; x < startX + widthAtRow; x++) {
			if (x < 0 || x >= island.width) continue;

			if (y === 0) {
				grid[y][x] = getSurfaceBlock(island.biome);
			} else if (y < island.height * ISLAND_GRASS_DEPTH_RATIO) {
				grid[y][x] = getSubSurfaceBlock(island.biome);
			} else {
				grid[y][x] = getDeepBlock(island.biome);
			}
		}
	}

	applyEdgeIrregularity(grid, island);

	return grid;
};

// ---------------------------------------------------------------------------
// Trees
// ---------------------------------------------------------------------------

const addTree = (
	worldGrid: BlockType[][],
	baseX: number,
	baseY: number,
	trunkMin: number,
	trunkMax: number,
	canopyRadius: number,
	canopyMaxDist: number,
): { x: number; y: number }[] => {
	const trunkHeight = randomRange(trunkMin, trunkMax);
	const leafPositions: { x: number; y: number }[] = [];

	for (let i = 1; i <= trunkHeight; i++) {
		const ty = baseY - i;
		if (ty >= 0 && ty < worldGrid.length) {
			worldGrid[ty][baseX] = BlockType.Wood;
		}
	}

	const canopyY = baseY - trunkHeight;
	for (let dy = -canopyRadius; dy <= 0; dy++) {
		for (let dx = -canopyRadius; dx <= canopyRadius; dx++) {
			const lx = baseX + dx;
			const ly = canopyY + dy;
			if (
				ly >= 0 &&
				ly < worldGrid.length &&
				lx >= 0 &&
				lx < worldGrid[0].length
			) {
				if (worldGrid[ly][lx] === BlockType.Air) {
					const dist = Math.abs(dx) + Math.abs(dy);
					if (dist <= canopyMaxDist) {
						worldGrid[ly][lx] = BlockType.Leaf;
						leafPositions.push({ x: lx, y: ly });
					}
				}
			}
		}
	}

	return leafPositions;
};

const addNormalTree = (
	worldGrid: BlockType[][],
	baseX: number,
	baseY: number,
): { x: number; y: number }[] =>
	addTree(
		worldGrid,
		baseX,
		baseY,
		TREE_TRUNK_MIN,
		TREE_TRUNK_MAX,
		TREE_CANOPY_RADIUS,
		TREE_CANOPY_MAX_DIST,
	);

const addSmallTree = (
	worldGrid: BlockType[][],
	baseX: number,
	baseY: number,
): { x: number; y: number }[] =>
	addTree(
		worldGrid,
		baseX,
		baseY,
		SMALL_TREE_TRUNK_MIN,
		SMALL_TREE_TRUNK_MAX,
		SMALL_TREE_CANOPY_RADIUS,
		SMALL_TREE_CANOPY_MAX_DIST,
	);

const addLargeTree = (
	worldGrid: BlockType[][],
	baseX: number,
	baseY: number,
): { x: number; y: number }[] =>
	addTree(
		worldGrid,
		baseX,
		baseY,
		LARGE_TREE_TRUNK_MIN,
		LARGE_TREE_TRUNK_MAX,
		LARGE_TREE_CANOPY_RADIUS,
		LARGE_TREE_CANOPY_MAX_DIST,
	);

const addDeadTree = (
	worldGrid: BlockType[][],
	baseX: number,
	baseY: number,
): void => {
	const trunkHeight = randomRange(DEAD_TREE_TRUNK_MIN, DEAD_TREE_TRUNK_MAX);
	for (let i = 1; i <= trunkHeight; i++) {
		const ty = baseY - i;
		if (ty >= 0 && ty < worldGrid.length) {
			worldGrid[ty][baseX] = BlockType.DeadWood;
		}
	}
};

// ---------------------------------------------------------------------------
// Fruit
// ---------------------------------------------------------------------------

const getFruitTypesForBiome = (biome: Island["biome"]): BlockType[] => {
	switch (biome) {
		case "grassland":
			return [BlockType.Apple, BlockType.Pear];
		case "mossy":
			return [BlockType.Peach, BlockType.Berry];
		case "sandy":
			return [BlockType.Pear];
		case "crystal":
			return [BlockType.Berry];
		default:
			return [];
	}
};

const addFruitToLeaves = (
	worldGrid: BlockType[][],
	leafPositions: { x: number; y: number }[],
	fruitTypes: BlockType[],
): void => {
	if (fruitTypes.length === 0 || leafPositions.length === 0) return;

	const fruitCount = randomRange(FRUIT_PER_TREE_MIN, FRUIT_PER_TREE_MAX);
	const adjacentOffsets = [
		{ dx: -1, dy: 0 },
		{ dx: 1, dy: 0 },
		{ dx: 0, dy: -1 },
		{ dx: 0, dy: 1 },
	];

	const candidates: { x: number; y: number }[] = [];
	for (const leaf of leafPositions) {
		for (const offset of adjacentOffsets) {
			const fx = leaf.x + offset.dx;
			const fy = leaf.y + offset.dy;
			if (
				fy >= 0 &&
				fy < worldGrid.length &&
				fx >= 0 &&
				fx < worldGrid[0].length &&
				worldGrid[fy][fx] === BlockType.Air
			) {
				candidates.push({ x: fx, y: fy });
			}
		}
	}

	for (let i = candidates.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[candidates[i], candidates[j]] = [candidates[j], candidates[i]];
	}

	const placed = Math.min(fruitCount, candidates.length);
	for (let i = 0; i < placed; i++) {
		const pos = candidates[i];
		const fruit = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
		worldGrid[pos.y][pos.x] = fruit;
	}
};

const addTreesForBiome = (worldGrid: BlockType[][], island: Island): void => {
	const treeCount = randomRange(1, Math.floor(island.width / 4));
	const canopySpace = LARGE_TREE_CANOPY_RADIUS;

	for (let t = 0; t < treeCount; t++) {
		const treeX =
			island.x + randomRange(canopySpace, island.width - canopySpace - 1);
		const treeY = island.y;
		const surfaceBlock = worldGrid[treeY]?.[treeX];

		if (surfaceBlock === undefined || surfaceBlock === BlockType.Air) continue;

		let leafPositions: { x: number; y: number }[] = [];

		switch (island.biome) {
			case "grassland": {
				const roll = Math.random();
				if (roll < 0.33) {
					leafPositions = addSmallTree(worldGrid, treeX, treeY);
				} else if (roll < 0.66) {
					leafPositions = addNormalTree(worldGrid, treeX, treeY);
				} else {
					leafPositions = addLargeTree(worldGrid, treeX, treeY);
				}
				break;
			}
			case "mossy": {
				const roll = Math.random();
				if (roll < 0.5) {
					leafPositions = addNormalTree(worldGrid, treeX, treeY);
				} else {
					leafPositions = addLargeTree(worldGrid, treeX, treeY);
				}
				break;
			}
			case "rocky":
				addDeadTree(worldGrid, treeX, treeY);
				break;
			case "crystal": {
				if (Math.random() < 0.5) {
					leafPositions = addSmallTree(worldGrid, treeX, treeY);
				}
				break;
			}
			default:
				break;
		}

		const fruitTypes = getFruitTypesForBiome(island.biome);
		addFruitToLeaves(worldGrid, leafPositions, fruitTypes);
	}
};

// ---------------------------------------------------------------------------
// Decorations & water
// ---------------------------------------------------------------------------

const addDecorations = (worldGrid: BlockType[][], island: Island): void => {
	for (let dx = 0; dx < island.width; dx++) {
		const wx = island.x + dx;
		const wy = island.y;

		if (
			wy <= 0 ||
			wy >= worldGrid.length ||
			wx < 0 ||
			wx >= worldGrid[0].length
		)
			continue;

		const surfaceBlock = worldGrid[wy]?.[wx];
		if (surfaceBlock === undefined || surfaceBlock === BlockType.Air) continue;

		const above = wy - 1;
		if (above < 0 || worldGrid[above][wx] !== BlockType.Air) continue;

		if (island.biome === "mossy" || island.biome === "grassland") {
			if (Math.random() < STRAWBERRY_BUSH_CHANCE) {
				worldGrid[above][wx] = BlockType.Strawberry;
				const neighborX = wx + 1;
				if (
					Math.random() < 0.5 &&
					neighborX < worldGrid[0].length &&
					worldGrid[above][neighborX] === BlockType.Air
				) {
					worldGrid[above][neighborX] = BlockType.Strawberry;
				}
			} else if (Math.random() < DECORATION_FLOWER_CHANCE) {
				worldGrid[above][wx] = BlockType.Flower;
			} else if (Math.random() < DECORATION_MUSHROOM_CHANCE) {
				worldGrid[above][wx] = BlockType.Mushroom;
			}
		} else if (island.biome === "crystal") {
			if (Math.random() < DECORATION_MUSHROOM_CHANCE) {
				worldGrid[above][wx] = BlockType.Mushroom;
			}
		} else if (island.biome === "rocky") {
			if (Math.random() < DECORATION_MUSHROOM_CHANCE * 0.5) {
				worldGrid[above][wx] = BlockType.Mushroom;
			}
		}
	}
};

const addWaterPool = (worldGrid: BlockType[][], island: Island): void => {
	if (Math.random() > WATER_POOL_CHANCE) return;
	if (island.width < WATER_POOL_WIDTH_MIN + 2) return;

	const poolWidth = randomRange(
		WATER_POOL_WIDTH_MIN,
		Math.min(WATER_POOL_WIDTH_MAX, island.width - 2),
	);
	const poolStartX = island.x + randomRange(1, island.width - poolWidth - 1);

	for (let dx = 0; dx < poolWidth; dx++) {
		const wx = poolStartX + dx;
		const surfaceY = island.y;

		if (
			wx < 0 ||
			wx >= worldGrid[0].length ||
			surfaceY < 0 ||
			surfaceY >= worldGrid.length
		)
			continue;

		for (let depth = 0; depth < WATER_POOL_DEPTH; depth++) {
			const wy = surfaceY + depth;
			if (wy < worldGrid.length && worldGrid[wy][wx] !== BlockType.Air) {
				worldGrid[wy][wx] = BlockType.Water;
			}
		}
	}
};

// ---------------------------------------------------------------------------
// Ascent chain helpers
// ---------------------------------------------------------------------------

const stampIsland = (
	grid: BlockType[][],
	island: Island,
	shape: IslandShape,
): void => {
	const islandShape = generateIslandShape(island, shape);
	for (let dy = 0; dy < island.height; dy++) {
		for (let dx = 0; dx < island.width; dx++) {
			const wx = island.x + dx;
			const wy = island.y + dy;
			if (
				wx >= 0 &&
				wx < WORLD_WIDTH_TILES &&
				wy >= 0 &&
				wy < WORLD_HEIGHT_TILES
			) {
				if (islandShape[dy][dx] !== BlockType.Air) {
					grid[wy][wx] = islandShape[dy][dx];
				}
			}
		}
	}
};

const getDimensionsForRole = (
	role: IslandRole,
): { width: number; height: number } => {
	switch (role) {
		case "safe":
			return {
				width: randomRange(SAFE_ISLAND_WIDTH_MIN, SAFE_ISLAND_WIDTH_MAX),
				height: randomRange(SAFE_ISLAND_HEIGHT_MIN, SAFE_ISLAND_HEIGHT_MAX),
			};
		case "resource":
			return {
				width: randomRange(
					RESOURCE_ISLAND_WIDTH_MIN,
					RESOURCE_ISLAND_WIDTH_MAX,
				),
				height: randomRange(
					RESOURCE_ISLAND_HEIGHT_MIN,
					RESOURCE_ISLAND_HEIGHT_MAX,
				),
			};
		case "reward":
			return {
				width: randomRange(REWARD_ISLAND_WIDTH_MIN, REWARD_ISLAND_WIDTH_MAX),
				height: randomRange(REWARD_ISLAND_HEIGHT_MIN, REWARD_ISLAND_HEIGHT_MAX),
			};
		case "transit":
			return {
				width: randomRange(TRANSIT_ISLAND_WIDTH_MIN, TRANSIT_ISLAND_WIDTH_MAX),
				height: randomRange(
					TRANSIT_ISLAND_HEIGHT_MIN,
					TRANSIT_ISLAND_HEIGHT_MAX,
				),
			};
		case "goal":
			return { width: GOAL_ISLAND_WIDTH, height: GOAL_ISLAND_HEIGHT };
	}
};

const pickBiomeForHeight = (heightRatio: number): Island["biome"] => {
	if (heightRatio < STARTER_ZONE_RATIO) {
		return "grassland";
	}
	if (heightRatio < STARTER_ZONE_RATIO + MID_CLIMB_RATIO) {
		const roll = Math.random();
		if (roll < 0.4) return "mossy";
		if (roll < 0.7) return "grassland";
		return "rocky";
	}
	const roll = Math.random();
	if (roll < 0.4) return "crystal";
	if (roll < 0.7) return "sandy";
	return "rocky";
};

const pickMainChainRole = (
	index: number,
	totalChainLength: number,
): IslandRole => {
	const ratio = index / totalChainLength;

	if (ratio < STARTER_ZONE_RATIO) {
		return index === 0 ? "safe" : Math.random() < 0.5 ? "safe" : "resource";
	}

	if (ratio < STARTER_ZONE_RATIO + MID_CLIMB_RATIO) {
		if (index % SAFE_ISLAND_INTERVAL === 0) return "safe";
		if (index % RESOURCE_VISIBLE_INTERVAL === 0) return "resource";
		const roll = Math.random();
		if (roll < 0.35) return "resource";
		if (roll < 0.55) return "safe";
		return "transit";
	}

	const roll = Math.random();
	if (roll < 0.3) return "transit";
	if (roll < 0.6) return "resource";
	return "safe";
};

// ---------------------------------------------------------------------------
// Main generation: "chain of reachable promises"
// ---------------------------------------------------------------------------

export const generateWorld = (): {
	grid: BlockType[][];
	islands: Island[];
	spawnX: number;
	spawnY: number;
	npcPositions: { x: number; y: number }[];
} => {
	const grid: BlockType[][] = Array.from({ length: WORLD_HEIGHT_TILES }, () =>
		Array(WORLD_WIDTH_TILES).fill(BlockType.Air),
	);

	const islands: Island[] = [];

	// 1. Home island (centre-bottom, widest, grassland, safe)
	const homeY =
		WORLD_HEIGHT_TILES -
		Math.floor(WORLD_HEIGHT_TILES * STARTER_ZONE_RATIO) -
		HOME_ISLAND_HEIGHT;
	const homeIsland: Island = {
		x: Math.floor(WORLD_WIDTH_TILES / 2) - Math.floor(HOME_ISLAND_WIDTH / 2),
		y: homeY,
		width: HOME_ISLAND_WIDTH,
		height: HOME_ISLAND_HEIGHT,
		biome: "grassland",
		role: "safe",
	};
	islands.push(homeIsland);
	stampIsland(grid, homeIsland, "normal");

	// 2. Main ascent chain
	const topMargin = 8;
	const chainBottomY = homeIsland.y;
	const chainTopY = topMargin;

	const avgVerticalGap =
		(ASCENT_VERTICAL_GAP_MIN + ASCENT_VERTICAL_GAP_MAX) / 2;
	const estimatedChainLength = Math.ceil(
		(chainBottomY - chainTopY) / avgVerticalGap,
	);

	let prevCenterX = homeIsland.x + Math.floor(homeIsland.width / 2);
	const prevY = homeIsland.y;
	let goingRight = Math.random() < 0.5;

	// Starter islands near home
	for (let s = 0; s < STARTER_ISLAND_COUNT - 1; s++) {
		const role: IslandRole = s === 0 ? "resource" : "safe";
		const { width, height } = getDimensionsForRole(role);
		const offsetDir = s % 2 === 0 ? 1 : -1;
		const hOffset =
			offsetDir *
			randomRange(ASCENT_HORIZONTAL_REACH_MIN, ASCENT_HORIZONTAL_REACH_MAX);
		const x = clamp(
			prevCenterX + hOffset - Math.floor(width / 2),
			ISLAND_MARGIN,
			WORLD_WIDTH_TILES - width - ISLAND_MARGIN,
		);
		const y = clamp(
			prevY - randomRange(2, 4),
			chainTopY,
			WORLD_HEIGHT_TILES - height,
		);

		const island: Island = {
			x,
			y,
			width,
			height,
			biome: "grassland",
			role,
		};
		islands.push(island);
		stampIsland(grid, island, pickIslandShape());
	}

	// Walk the chain upward
	let chainIndex = 0;
	let currentY = prevY;

	while (currentY > chainTopY + ASCENT_VERTICAL_GAP_MAX) {
		const vGap = randomRange(ASCENT_VERTICAL_GAP_MIN, ASCENT_VERTICAL_GAP_MAX);
		const nextY = currentY - vGap;
		if (nextY < chainTopY) break;

		const hReach = randomRange(
			ASCENT_HORIZONTAL_REACH_MIN,
			ASCENT_HORIZONTAL_REACH_MAX,
		);
		const direction = goingRight ? 1 : -1;
		goingRight = !goingRight;

		const role = pickMainChainRole(chainIndex, estimatedChainLength);
		const { width, height } = getDimensionsForRole(role);

		const rawX = prevCenterX + direction * hReach - Math.floor(width / 2);
		const x = clamp(
			rawX,
			ISLAND_MARGIN,
			WORLD_WIDTH_TILES - width - ISLAND_MARGIN,
		);
		const y = clamp(nextY, chainTopY, WORLD_HEIGHT_TILES - height);

		const heightRatio = 1 - (y - chainTopY) / (chainBottomY - chainTopY);
		const biome = pickBiomeForHeight(heightRatio);

		const island: Island = { x, y, width, height, biome, role };
		islands.push(island);
		stampIsland(grid, island, pickIslandShape());

		// Optional side island
		if (Math.random() < SIDE_ISLAND_CHANCE && role !== "transit") {
			const sideRole: IslandRole = Math.random() < 0.5 ? "reward" : "transit";
			const sideDims = getDimensionsForRole(sideRole);
			const sideDir = -direction;
			const sideHOffset = randomRange(
				SIDE_ISLAND_HORIZONTAL_OFFSET_MIN,
				SIDE_ISLAND_HORIZONTAL_OFFSET_MAX,
			);
			const sideVJitter = randomRange(
				-SIDE_ISLAND_VERTICAL_JITTER,
				SIDE_ISLAND_VERTICAL_JITTER,
			);
			const sideCenterX = x + Math.floor(width / 2) + sideDir * sideHOffset;
			const sideX = clamp(
				sideCenterX - Math.floor(sideDims.width / 2),
				ISLAND_MARGIN,
				WORLD_WIDTH_TILES - sideDims.width - ISLAND_MARGIN,
			);
			const sideY = clamp(
				y + sideVJitter,
				chainTopY,
				WORLD_HEIGHT_TILES - sideDims.height,
			);

			const sideIsland: Island = {
				x: sideX,
				y: sideY,
				width: sideDims.width,
				height: sideDims.height,
				biome: sideRole === "reward" ? pickBiomeForHeight(heightRatio) : biome,
				role: sideRole,
			};
			islands.push(sideIsland);
			stampIsland(grid, sideIsland, pickIslandShape());
		}

		prevCenterX = x + Math.floor(width / 2);
		currentY = y;
		chainIndex++;
	}

	// 3. Goal island at the top
	const goalDims = getDimensionsForRole("goal");
	const goalIsland: Island = {
		x: clamp(
			prevCenterX - Math.floor(goalDims.width / 2),
			ISLAND_MARGIN,
			WORLD_WIDTH_TILES - goalDims.width - ISLAND_MARGIN,
		),
		y: clamp(chainTopY, 2, WORLD_HEIGHT_TILES - goalDims.height),
		width: goalDims.width,
		height: goalDims.height,
		biome: "crystal",
		role: "goal",
	};
	islands.push(goalIsland);
	stampIsland(grid, goalIsland, "normal");

	// 4. Populate islands
	for (const island of islands) {
		if (island.role !== "transit") {
			addTreesForBiome(grid, island);
			addWaterPool(grid, island);
		}
		addDecorations(grid, island);
	}

	// 5. Clear spawn area
	const spawnTileX = Math.floor(homeIsland.x + homeIsland.width / 2);
	const spawnTileY = homeIsland.y - PLAYER_RESPAWN_OFFSET_Y;
	for (let dy = 0; dy < SPAWN_CLEAR_HEIGHT; dy++) {
		for (let dx = -SPAWN_CLEAR_HALF_WIDTH; dx <= SPAWN_CLEAR_HALF_WIDTH; dx++) {
			const cx = spawnTileX + dx;
			const cy = spawnTileY - dy;
			if (
				cx >= 0 &&
				cx < WORLD_WIDTH_TILES &&
				cy >= 0 &&
				cy < WORLD_HEIGHT_TILES
			) {
				grid[cy][cx] = BlockType.Air;
			}
		}
	}

	const spawnX = spawnTileX * TILE_SIZE;
	const spawnY = spawnTileY * TILE_SIZE;

	// 6. NPC placement
	const npcPositions = pickNpcSpawnPositions(islands);

	return { grid, islands, spawnX, spawnY, npcPositions };
};
