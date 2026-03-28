import {
	WATER_SPREAD_CHANCE,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";
import { BlockType, NON_SOLID_BLOCKS } from "../types";
import { addBlockSprite, removeBlockSprite } from "./world-renderer";

/** Block types that fall when unsupported (air below). */
const GRAVITY_BLOCKS: ReadonlySet<BlockType> = new Set([
	BlockType.Water,
	BlockType.Apple,
	BlockType.Pear,
	BlockType.Peach,
	BlockType.Strawberry,
	BlockType.Berry,
	BlockType.Flower,
	BlockType.Mushroom,
]);

/** Block types that spread sideways when they can't fall. */
const SPREAD_BLOCKS: ReadonlySet<BlockType> = new Set([BlockType.Water]);

export const updateWater = (
	scene: Phaser.Scene,
	grid: BlockType[][],
	blockGroup: Phaser.GameObjects.Group,
): void => {
	// Iterate bottom-up so items cascade in one pass
	for (let y = WORLD_HEIGHT_TILES - 2; y >= 0; y--) {
		for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
			const block = grid[y][x];
			if (!GRAVITY_BLOCKS.has(block)) continue;

			const below = y + 1;
			if (below < WORLD_HEIGHT_TILES && grid[below][x] === BlockType.Air) {
				// Swap block and air (fall down)
				grid[below][x] = block;
				grid[y][x] = BlockType.Air;

				removeBlockSprite(blockGroup, x, y);
				addBlockSprite(scene, blockGroup, x, below, block);
				continue;
			}

			// Sideways spread — only for water, and only when can't fall
			if (!SPREAD_BLOCKS.has(block)) continue;

			// Check if the block below is solid (not air/non-solid)
			const solidBelow =
				below >= WORLD_HEIGHT_TILES || !NON_SOLID_BLOCKS.has(grid[below][x]);
			if (!solidBelow) continue;

			// Only spread on a fraction of ticks to avoid instant flooding
			if (Math.random() > WATER_SPREAD_CHANCE) continue;

			const leftOpen = x > 0 && grid[y][x - 1] === BlockType.Air;
			const rightOpen =
				x < WORLD_WIDTH_TILES - 1 && grid[y][x + 1] === BlockType.Air;

			let targetX: number | null = null;

			if (leftOpen && rightOpen) {
				// Both open — pick randomly
				targetX = Math.random() < 0.5 ? x - 1 : x + 1;
			} else if (leftOpen) {
				targetX = Math.random() < 0.5 ? x - 1 : null;
			} else if (rightOpen) {
				targetX = Math.random() < 0.5 ? x + 1 : null;
			}

			if (targetX !== null) {
				grid[y][targetX] = block;
				grid[y][x] = BlockType.Air;

				removeBlockSprite(blockGroup, x, y);
				addBlockSprite(scene, blockGroup, targetX, y, block);
			}
		}
	}
};
