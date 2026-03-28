import { WORLD_HEIGHT_TILES, WORLD_WIDTH_TILES } from "../config";
import { BlockType } from "../types";
import { addBlockSprite, removeBlockSprite } from "./world-renderer";

export const updateWater = (
	scene: Phaser.Scene,
	grid: BlockType[][],
	blockGroup: Phaser.GameObjects.Group,
): void => {
	// Iterate bottom-up so water cascades in one pass
	for (let y = WORLD_HEIGHT_TILES - 2; y >= 0; y--) {
		for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
			if (grid[y][x] !== BlockType.Water) continue;

			const below = y + 1;
			if (below < WORLD_HEIGHT_TILES && grid[below][x] === BlockType.Air) {
				// Swap water and air
				grid[below][x] = BlockType.Water;
				grid[y][x] = BlockType.Air;

				removeBlockSprite(blockGroup, x, y);
				addBlockSprite(scene, blockGroup, x, below, BlockType.Water);
			}
		}
	}
};
