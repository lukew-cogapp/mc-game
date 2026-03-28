import {
	BLOCK_BREAK_OVERLAY_ALPHA,
	BLOCK_BREAK_OVERLAY_COLOR,
	BLOCK_BREAK_PROGRESS_ALPHA_RANGE,
	BLOCK_INTERACT_RANGE,
	CRACK_LINE_ALPHA,
	CRACK_LINE_COLOR,
	CRACK_LINE_WIDTH,
	CRACK_STAGES,
	MINE_TIME_CRYSTAL,
	MINE_TIME_DEAD_WOOD,
	MINE_TIME_DEFAULT,
	MINE_TIME_DIRT,
	MINE_TIME_GRASS,
	MINE_TIME_LEAF,
	MINE_TIME_MOSSY_STONE,
	MINE_TIME_SAND,
	MINE_TIME_STONE,
	MINE_TIME_WOOD,
	TILE_SIZE,
} from "../config";
import { BlockType, NON_SOLID_BLOCKS } from "../types";

const getMineTime = (blockType: BlockType): number => {
	switch (blockType) {
		case BlockType.Dirt:
			return MINE_TIME_DIRT;
		case BlockType.Grass:
			return MINE_TIME_GRASS;
		case BlockType.Sand:
			return MINE_TIME_SAND;
		case BlockType.Wood:
			return MINE_TIME_WOOD;
		case BlockType.DeadWood:
			return MINE_TIME_DEAD_WOOD;
		case BlockType.Leaf:
			return MINE_TIME_LEAF;
		case BlockType.Stone:
			return MINE_TIME_STONE;
		case BlockType.MossyStone:
			return MINE_TIME_MOSSY_STONE;
		case BlockType.CrystalBlock:
			return MINE_TIME_CRYSTAL;
		default:
			return MINE_TIME_DEFAULT;
	}
};

import { addBlockSprite, removeBlockSprite } from "../world/world-renderer";
import type { InventoryBar } from "./inventory";
import type { Player } from "./player";

export interface BlockInteraction {
	breakingX: number;
	breakingY: number;
	breakingTimer: number;
	breakingOverlay: Phaser.GameObjects.Rectangle | null;
	crackOverlay: Phaser.GameObjects.Graphics | null;
}

export const createBlockInteraction = (): BlockInteraction => ({
	breakingX: -1,
	breakingY: -1,
	breakingTimer: 0,
	breakingOverlay: null,
	crackOverlay: null,
});

const hasAdjacentSolid = (
	grid: BlockType[][],
	gx: number,
	gy: number,
): boolean => {
	const neighbors = [
		[gx - 1, gy],
		[gx + 1, gy],
		[gx, gy - 1],
		[gx, gy + 1],
		[gx - 1, gy - 1],
		[gx + 1, gy - 1],
		[gx - 1, gy + 1],
		[gx + 1, gy + 1],
	];
	return neighbors.some(([nx, ny]) => {
		if (nx === undefined || ny === undefined) return false;
		if (ny < 0 || ny >= grid.length || nx < 0 || nx >= grid[0].length)
			return false;
		return !NON_SOLID_BLOCKS.has(grid[ny][nx]);
	});
};

const getGridPos = (
	worldX: number,
	worldY: number,
): { gx: number; gy: number } => ({
	gx: Math.floor(worldX / TILE_SIZE),
	gy: Math.floor(worldY / TILE_SIZE),
});

const isInRange = (player: Player, gx: number, gy: number): boolean => {
	const playerGx = Math.floor(player.x / TILE_SIZE);
	const playerGy = Math.floor(player.y / TILE_SIZE);
	const dx = Math.abs(playerGx - gx);
	const dy = Math.abs(playerGy - gy);
	return dx <= BLOCK_INTERACT_RANGE && dy <= BLOCK_INTERACT_RANGE;
};

export const handleBlockBreak = (
	scene: Phaser.Scene,
	interaction: BlockInteraction,
	player: Player,
	grid: BlockType[][],
	inventory: InventoryBar,
	blockGroup: Phaser.GameObjects.Group,
	pointer: Phaser.Input.Pointer,
	delta: number,
): void => {
	if (!pointer.leftButtonDown()) {
		clearBreaking(interaction);
		return;
	}

	const worldX = pointer.worldX;
	const worldY = pointer.worldY;
	const { gx, gy } = getGridPos(worldX, worldY);

	if (!isInRange(player, gx, gy)) {
		clearBreaking(interaction);
		return;
	}

	if (gy < 0 || gy >= grid.length || gx < 0 || gx >= grid[0].length) return;
	if (grid[gy][gx] === BlockType.Air) {
		clearBreaking(interaction);
		return;
	}

	// Started breaking a new block?
	if (interaction.breakingX !== gx || interaction.breakingY !== gy) {
		clearBreaking(interaction);
		interaction.breakingX = gx;
		interaction.breakingY = gy;
		interaction.breakingTimer = 0;

		interaction.breakingOverlay = scene.add.rectangle(
			gx * TILE_SIZE + TILE_SIZE / 2,
			gy * TILE_SIZE + TILE_SIZE / 2,
			TILE_SIZE,
			TILE_SIZE,
			BLOCK_BREAK_OVERLAY_COLOR,
			BLOCK_BREAK_OVERLAY_ALPHA,
		);

		interaction.crackOverlay = scene.add.graphics();
	}

	interaction.breakingTimer += delta;

	// Per-block mining time
	const mineTime = getMineTime(grid[gy][gx]);

	// Update overlay opacity and crack lines based on progress
	const progress = Math.min(interaction.breakingTimer / mineTime, 1);
	if (interaction.breakingOverlay) {
		interaction.breakingOverlay.setAlpha(
			BLOCK_BREAK_OVERLAY_ALPHA + progress * BLOCK_BREAK_PROGRESS_ALPHA_RANGE,
		);
	}
	if (interaction.crackOverlay) {
		const stage = Math.min(
			Math.floor(progress * CRACK_STAGES) + (progress > 0 ? 1 : 0),
			CRACK_STAGES,
		);
		drawCracks(interaction.crackOverlay, gx, gy, stage);
	}

	// Block broken!
	if (interaction.breakingTimer >= mineTime) {
		const blockType = grid[gy][gx];
		grid[gy][gx] = BlockType.Air;
		removeBlockSprite(blockGroup, gx, gy);
		inventory.addBlock(blockType);
		inventory.render();
		clearBreaking(interaction);
	}
};

export const handleBlockPlace = (
	scene: Phaser.Scene,
	player: Player,
	grid: BlockType[][],
	inventory: InventoryBar,
	blockGroup: Phaser.GameObjects.Group,
	pointer: Phaser.Input.Pointer,
): void => {
	const worldX = pointer.worldX;
	const worldY = pointer.worldY;
	const { gx, gy } = getGridPos(worldX, worldY);

	if (!isInRange(player, gx, gy)) return;
	if (gy < 0 || gy >= grid.length || gx < 0 || gx >= grid[0].length) return;
	if (grid[gy][gx] !== BlockType.Air) return;

	// Must be adjacent to at least one solid block
	if (!hasAdjacentSolid(grid, gx, gy)) return;

	// Don't place on player
	const playerGx = Math.floor(player.x / TILE_SIZE);
	const playerGy = Math.floor(player.y / TILE_SIZE);
	if (gx === playerGx && (gy === playerGy || gy === playerGy - 1)) return;

	const blockType = inventory.removeSelected();
	if (blockType === null) return;

	grid[gy][gx] = blockType;
	addBlockSprite(scene, blockGroup, gx, gy, blockType);
	inventory.render();
};

const clearBreaking = (interaction: BlockInteraction): void => {
	interaction.breakingX = -1;
	interaction.breakingY = -1;
	interaction.breakingTimer = 0;
	if (interaction.breakingOverlay) {
		interaction.breakingOverlay.destroy();
		interaction.breakingOverlay = null;
	}
	if (interaction.crackOverlay) {
		interaction.crackOverlay.destroy();
		interaction.crackOverlay = null;
	}
};

const drawCracks = (
	graphics: Phaser.GameObjects.Graphics,
	gx: number,
	gy: number,
	stage: number,
): void => {
	const x = gx * TILE_SIZE;
	const y = gy * TILE_SIZE;
	const s = TILE_SIZE;

	graphics.clear();
	graphics.lineStyle(CRACK_LINE_WIDTH, CRACK_LINE_COLOR, CRACK_LINE_ALPHA);

	// Stage 1: single diagonal crack from centre
	if (stage >= 1) {
		graphics.beginPath();
		graphics.moveTo(x + s * 0.5, y + s * 0.5);
		graphics.lineTo(x + s * 0.8, y + s * 0.2);
		graphics.strokePath();
	}

	// Stage 2: second crack branching down-left
	if (stage >= 2) {
		graphics.beginPath();
		graphics.moveTo(x + s * 0.5, y + s * 0.5);
		graphics.lineTo(x + s * 0.2, y + s * 0.75);
		graphics.strokePath();
	}

	// Stage 3: crack from top-left toward centre
	if (stage >= 3) {
		graphics.beginPath();
		graphics.moveTo(x + s * 0.15, y + s * 0.1);
		graphics.lineTo(x + s * 0.45, y + s * 0.45);
		graphics.strokePath();

		graphics.beginPath();
		graphics.moveTo(x + s * 0.5, y + s * 0.5);
		graphics.lineTo(x + s * 0.85, y + s * 0.7);
		graphics.strokePath();
	}

	// Stage 4: dense network, block about to shatter
	if (stage >= 4) {
		graphics.beginPath();
		graphics.moveTo(x + s * 0.3, y + s * 0.15);
		graphics.lineTo(x + s * 0.6, y + s * 0.35);
		graphics.strokePath();

		graphics.beginPath();
		graphics.moveTo(x + s * 0.7, y + s * 0.55);
		graphics.lineTo(x + s * 0.9, y + s * 0.9);
		graphics.strokePath();

		graphics.beginPath();
		graphics.moveTo(x + s * 0.1, y + s * 0.5);
		graphics.lineTo(x + s * 0.35, y + s * 0.85);
		graphics.strokePath();
	}
};
