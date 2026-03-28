import {
	CLIMB_BAND_HEIGHT,
	CLIMB_BAND_MAX_ISLANDS,
	CLIMB_BAND_MIN_ISLANDS,
	CLIMB_HORIZONTAL_REACH,
	CLIMB_TOP_BAND_THRESHOLD,
	CLIMB_TOP_SHRINK_RATIO,
	DEAD_TREE_TRUNK_MAX,
	DEAD_TREE_TRUNK_MIN,
	DECORATION_FLOWER_CHANCE,
	DECORATION_MUSHROOM_CHANCE,
	FRUIT_PER_TREE_MAX,
	FRUIT_PER_TREE_MIN,
	HOME_ISLAND_HEIGHT,
	HOME_ISLAND_WIDTH,
	ISLAND_EDGE_INDENT_CHANCE,
	ISLAND_EDGE_INDENT_MAX,
	ISLAND_FLAT_WIDE_HEIGHT_MAX,
	ISLAND_FLAT_WIDE_HEIGHT_MIN,
	ISLAND_FLAT_WIDE_WIDTH_MAX,
	ISLAND_FLAT_WIDE_WIDTH_MIN,
	ISLAND_GRASS_DEPTH_RATIO,
	ISLAND_HEIGHT_MAX,
	ISLAND_HEIGHT_MIN,
	ISLAND_MARGIN,
	ISLAND_MIN_GAP,
	ISLAND_OVERHANG_INDENT,
	ISLAND_PLACEMENT_ATTEMPTS,
	ISLAND_SHAPE_FLAT_WIDE_CHANCE,
	ISLAND_SHAPE_OVERHANG_CHANCE,
	ISLAND_SHAPE_TALL_NARROW_CHANCE,
	ISLAND_TALL_NARROW_HEIGHT_MAX,
	ISLAND_TALL_NARROW_HEIGHT_MIN,
	ISLAND_TALL_NARROW_WIDTH_MAX,
	ISLAND_TALL_NARROW_WIDTH_MIN,
	ISLAND_TOP_WIDTH_RATIO,
	ISLAND_WIDTH_MAX,
	ISLAND_WIDTH_MIN,
	ISLAND_Y_BOTTOM_MARGIN,
	ISLAND_Y_MIN,
	LARGE_TREE_CANOPY_MAX_DIST,
	LARGE_TREE_CANOPY_RADIUS,
	LARGE_TREE_TRUNK_MAX,
	LARGE_TREE_TRUNK_MIN,
	PLAYER_RESPAWN_OFFSET_Y,
	SMALL_TREE_CANOPY_MAX_DIST,
	SMALL_TREE_CANOPY_RADIUS,
	SMALL_TREE_TRUNK_MAX,
	SMALL_TREE_TRUNK_MIN,
	SPAWN_CLEAR_HALF_WIDTH,
	SPAWN_CLEAR_HEIGHT,
	STRAWBERRY_BUSH_CHANCE,
	TILE_SIZE,
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
import { BlockType, type Island } from "../types";
import { pickNpcSpawnPositions } from "./npcs";

const randomRange = (min: number, max: number): number =>
	Math.floor(Math.random() * (max - min + 1)) + min;

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

const getIslandDimensions = (
	shape: IslandShape,
): { width: number; height: number } => {
	switch (shape) {
		case "tall_narrow":
			return {
				width: randomRange(
					ISLAND_TALL_NARROW_WIDTH_MIN,
					ISLAND_TALL_NARROW_WIDTH_MAX,
				),
				height: randomRange(
					ISLAND_TALL_NARROW_HEIGHT_MIN,
					ISLAND_TALL_NARROW_HEIGHT_MAX,
				),
			};
		case "flat_wide":
			return {
				width: randomRange(
					ISLAND_FLAT_WIDE_WIDTH_MIN,
					ISLAND_FLAT_WIDE_WIDTH_MAX,
				),
				height: randomRange(
					ISLAND_FLAT_WIDE_HEIGHT_MIN,
					ISLAND_FLAT_WIDE_HEIGHT_MAX,
				),
			};
		default:
			return {
				width: randomRange(ISLAND_WIDTH_MIN, ISLAND_WIDTH_MAX),
				height: randomRange(ISLAND_HEIGHT_MIN, ISLAND_HEIGHT_MAX),
			};
	}
};

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

/**
 * Apply irregular edge indentations based on biome:
 * - Rocky: jagged (narrower top, wider bottom with random cutouts)
 * - Sandy: smoother/rounder (gentle indentations)
 * - Others: random +/- 1 tile indentations on the sides
 */
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

	// Collect candidate positions adjacent to leaves
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

	// Shuffle and pick up to fruitCount positions
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
				// Crystal biomes get small trees occasionally
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

		// Only place on surface blocks with air above
		const surfaceBlock = worldGrid[wy]?.[wx];
		if (surfaceBlock === undefined || surfaceBlock === BlockType.Air) continue;

		const above = wy - 1;
		if (above < 0 || worldGrid[above][wx] !== BlockType.Air) continue;

		if (island.biome === "mossy" || island.biome === "grassland") {
			if (Math.random() < STRAWBERRY_BUSH_CHANCE) {
				// Place a strawberry bush (1-2 blocks wide, 1 block tall)
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
			// Crystal biomes get mushrooms
			if (Math.random() < DECORATION_MUSHROOM_CHANCE) {
				worldGrid[above][wx] = BlockType.Mushroom;
			}
		} else if (island.biome === "rocky") {
			// Rocky biomes get occasional mushrooms
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

	// Dig a small depression and fill with water
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

		// Replace the surface block with water
		for (let depth = 0; depth < WATER_POOL_DEPTH; depth++) {
			const wy = surfaceY + depth;
			if (wy < worldGrid.length && worldGrid[wy][wx] !== BlockType.Air) {
				worldGrid[wy][wx] = BlockType.Water;
			}
		}
	}
};

/**
 * Stamp an island's shape onto the world grid.
 */
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

/**
 * Check that a candidate island doesn't overlap any existing islands.
 */
const isPlacementValid = (
	islands: Island[],
	x: number,
	y: number,
	width: number,
	height: number,
): boolean =>
	islands.every((other) => {
		const dx = Math.abs(x + width / 2 - (other.x + other.width / 2));
		const dy = Math.abs(y + height / 2 - (other.y + other.height / 2));
		return dx > width + ISLAND_MIN_GAP || dy > height + ISLAND_MIN_GAP;
	});

/**
 * Generate islands using a structured vertical-band climb path.
 *
 * The world is divided into horizontal bands (each CLIMB_BAND_HEIGHT rows).
 * The home island sits at the center-bottom. Each band above gets 1-2 islands
 * placed within horizontal reach of the band below, creating a zig-zag upward
 * route. Bands near the top produce smaller, rarer islands.
 */
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
	const biomes: Island["biome"][] = [
		"grassland",
		"rocky",
		"sandy",
		"mossy",
		"crystal",
	];

	// Home island -- larger, centered
	const homeIsland: Island = {
		x: Math.floor(WORLD_WIDTH_TILES / 2) - Math.floor(HOME_ISLAND_WIDTH / 2),
		y: Math.floor(WORLD_HEIGHT_TILES / 2),
		width: HOME_ISLAND_WIDTH,
		height: HOME_ISLAND_HEIGHT,
		biome: "grassland",
		role: "safe",
	};
	islands.push(homeIsland);

	// -- Structured climb path: divide into vertical bands --
	const homeTopY = homeIsland.y;
	const bandCount = Math.floor((homeTopY - ISLAND_Y_MIN) / CLIMB_BAND_HEIGHT);

	let prevBandCenters: number[] = [
		Math.floor(homeIsland.x + homeIsland.width / 2),
	];

	const placeBandIslands = (
		bandTopY: number,
		bandBottomY: number,
		count: number,
		shrink: boolean,
		centers: number[],
	): number[] => {
		const bandCenters: number[] = [];

		for (let i = 0; i < count; i++) {
			const shape = pickIslandShape();
			let { width, height } = getIslandDimensions(shape);

			if (shrink) {
				width = Math.max(
					ISLAND_WIDTH_MIN,
					Math.floor(width * CLIMB_TOP_SHRINK_RATIO),
				);
				height = Math.max(
					ISLAND_HEIGHT_MIN,
					Math.floor(height * CLIMB_TOP_SHRINK_RATIO),
				);
			}

			const refCenter = centers[Math.floor(Math.random() * centers.length)];

			let x: number;
			let y: number;
			let attempts = 0;
			let valid = false;

			do {
				const minX = Math.max(
					ISLAND_MARGIN,
					refCenter - CLIMB_HORIZONTAL_REACH - Math.floor(width / 2),
				);
				const maxX = Math.min(
					WORLD_WIDTH_TILES - width - ISLAND_MARGIN,
					refCenter + CLIMB_HORIZONTAL_REACH - Math.floor(width / 2),
				);
				x =
					minX <= maxX
						? randomRange(minX, maxX)
						: randomRange(
								ISLAND_MARGIN,
								WORLD_WIDTH_TILES - width - ISLAND_MARGIN,
							);

				const minY = Math.max(ISLAND_Y_MIN, bandTopY);
				const maxY = Math.max(minY, bandBottomY - height);
				y = randomRange(minY, maxY);

				attempts++;
				valid = isPlacementValid(islands, x, y, width, height);
			} while (!valid && attempts < ISLAND_PLACEMENT_ATTEMPTS);

			if (valid) {
				const island: Island = {
					x,
					y,
					width,
					height,
					biome: biomes[randomRange(0, biomes.length - 1)],
					role: "transit",
				};
				islands.push(island);
				stampIsland(grid, island, shape);
				bandCenters.push(Math.floor(x + width / 2));
			}
		}

		return bandCenters;
	};

	// Place islands in bands going upward from the home island
	for (let band = 0; band < bandCount; band++) {
		const bandTopY = homeTopY - (band + 1) * CLIMB_BAND_HEIGHT;
		const bandBottomY = bandTopY + CLIMB_BAND_HEIGHT;

		const heightRatio = 1 - bandTopY / WORLD_HEIGHT_TILES;
		const isTopRegion = heightRatio > CLIMB_TOP_BAND_THRESHOLD;
		const islandCountInBand = isTopRegion
			? CLIMB_BAND_MIN_ISLANDS
			: randomRange(CLIMB_BAND_MIN_ISLANDS, CLIMB_BAND_MAX_ISLANDS);

		const bandCenters = placeBandIslands(
			bandTopY,
			bandBottomY,
			islandCountInBand,
			isTopRegion,
			prevBandCenters,
		);

		if (bandCenters.length > 0) {
			prevBandCenters = bandCenters;
		}
	}

	// Place a few islands below the home island for variety
	const belowBandTop = homeIsland.y + homeIsland.height;
	const belowBandBottom = WORLD_HEIGHT_TILES - ISLAND_Y_BOTTOM_MARGIN;
	const belowBandCount = Math.floor(
		(belowBandBottom - belowBandTop) / CLIMB_BAND_HEIGHT,
	);

	let prevBelowCenters: number[] = [
		Math.floor(homeIsland.x + homeIsland.width / 2),
	];

	for (let band = 0; band < belowBandCount; band++) {
		const bTop = belowBandTop + band * CLIMB_BAND_HEIGHT;
		const bBottom = bTop + CLIMB_BAND_HEIGHT;

		const bandCenters = placeBandIslands(
			bTop,
			bBottom,
			CLIMB_BAND_MIN_ISLANDS,
			false,
			prevBelowCenters,
		);

		if (bandCenters.length > 0) {
			prevBelowCenters = bandCenters;
		}
	}

	// Stamp the home island (always normal shape)
	stampIsland(grid, homeIsland, "normal");

	// Add trees, decorations, and water pools
	for (const island of islands) {
		addTreesForBiome(grid, island);
		addDecorations(grid, island);
		addWaterPool(grid, island);
	}

	// Spawn on top of home island -- clear area above spawn point
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

	// Pick NPC spawn positions on non-home islands
	const npcPositions = pickNpcSpawnPositions(islands);

	return { grid, islands, spawnX, spawnY, npcPositions };
};
