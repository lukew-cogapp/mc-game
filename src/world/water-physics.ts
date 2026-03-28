import { WORLD_HEIGHT_TILES, WORLD_WIDTH_TILES } from "../config";
import { BlockType } from "../types";
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
				// Swap block and air
				grid[below][x] = block;
				grid[y][x] = BlockType.Air;

				removeBlockSprite(blockGroup, x, y);
				addBlockSprite(scene, blockGroup, x, below, block);
			}
		}
	}
};
