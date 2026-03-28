import {
	BLOCK_OUTLINE_ALPHA,
	COLORS,
	PLATFORM_SHADOW_ALPHA,
	PLATFORM_SHADOW_HEIGHT,
	TILE_SIZE,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";
import { BlockType } from "../types";
import { CUSTOM_TEXTURE_BLOCKS, drawPixelArtTexture } from "./block-textures";

const BLOCK_COLOR_MAP: Record<BlockType, number | null> = {
	[BlockType.Air]: null,
	[BlockType.Dirt]: COLORS.dirt,
	[BlockType.Grass]: COLORS.grass,
	[BlockType.Stone]: COLORS.stone,
	[BlockType.Sand]: COLORS.sand,
	[BlockType.Wood]: COLORS.wood,
	[BlockType.Leaf]: COLORS.leaf,
	[BlockType.Water]: COLORS.water,
	[BlockType.MossyStone]: COLORS.mossyStone,
	[BlockType.CrystalBlock]: COLORS.crystalBlock,
	[BlockType.Flower]: COLORS.flower,
	[BlockType.Mushroom]: COLORS.mushroom,
	[BlockType.DeadWood]: COLORS.deadWood,
	[BlockType.Apple]: COLORS.apple,
	[BlockType.Pear]: COLORS.pear,
	[BlockType.Peach]: COLORS.peach,
	[BlockType.Strawberry]: COLORS.strawberry,
	[BlockType.Berry]: COLORS.berry,
	[BlockType.Jetpack]: COLORS.jetpack,
};

export const createWorldTextures = (scene: Phaser.Scene): void => {
	for (const [type, color] of Object.entries(BLOCK_COLOR_MAP)) {
		if (color === null) continue;
		const key = `block_${type}`;
		const gfx = scene.add.graphics();
		const blockTypeNum = Number(type) as BlockType;

		if (CUSTOM_TEXTURE_BLOCKS.has(blockTypeNum)) {
			drawPixelArtTexture(gfx, blockTypeNum);
		} else {
			gfx.fillStyle(color);
			gfx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
			gfx.lineStyle(1, 0x000000, BLOCK_OUTLINE_ALPHA);
			gfx.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
		}

		gfx.generateTexture(key, TILE_SIZE, TILE_SIZE);
		gfx.destroy();
	}

	const shadowGfx = scene.add.graphics();
	shadowGfx.fillStyle(0x000000);
	shadowGfx.fillRect(0, 0, TILE_SIZE, PLATFORM_SHADOW_HEIGHT);
	shadowGfx.generateTexture("block_shadow", TILE_SIZE, PLATFORM_SHADOW_HEIGHT);
	shadowGfx.destroy();
};

export const renderWorld = (
	scene: Phaser.Scene,
	grid: BlockType[][],
): Phaser.GameObjects.Group => {
	const blockGroup = scene.add.group();

	for (let y = 0; y < WORLD_HEIGHT_TILES; y++) {
		for (let x = 0; x < WORLD_WIDTH_TILES; x++) {
			const blockType = grid[y][x];
			if (blockType === BlockType.Air) continue;

			const sprite = scene.add.sprite(
				x * TILE_SIZE + TILE_SIZE / 2,
				y * TILE_SIZE + TILE_SIZE / 2,
				`block_${blockType}`,
			);
			sprite.setData("gridX", x);
			sprite.setData("gridY", y);
			sprite.setData("blockType", blockType);
			blockGroup.add(sprite);

			const belowY = y + 1;
			if (belowY < WORLD_HEIGHT_TILES && grid[belowY][x] === BlockType.Air) {
				const shadow = scene.add.sprite(
					x * TILE_SIZE + TILE_SIZE / 2,
					(y + 1) * TILE_SIZE + PLATFORM_SHADOW_HEIGHT / 2,
					"block_shadow",
				);
				shadow.setAlpha(PLATFORM_SHADOW_ALPHA);
				blockGroup.add(shadow);
			}
		}
	}

	return blockGroup;
};

export const addBlockSprite = (
	scene: Phaser.Scene,
	blockGroup: Phaser.GameObjects.Group,
	gridX: number,
	gridY: number,
	blockType: BlockType,
): Phaser.GameObjects.Sprite => {
	const sprite = scene.add.sprite(
		gridX * TILE_SIZE + TILE_SIZE / 2,
		gridY * TILE_SIZE + TILE_SIZE / 2,
		`block_${blockType}`,
	);
	sprite.setData("gridX", gridX);
	sprite.setData("gridY", gridY);
	sprite.setData("blockType", blockType);
	blockGroup.add(sprite);
	return sprite;
};

export const removeBlockSprite = (
	blockGroup: Phaser.GameObjects.Group,
	gridX: number,
	gridY: number,
): void => {
	const sprite = blockGroup
		.getChildren()
		.find(
			(child) =>
				(child as Phaser.GameObjects.Sprite).getData("gridX") === gridX &&
				(child as Phaser.GameObjects.Sprite).getData("gridY") === gridY,
		) as Phaser.GameObjects.Sprite | undefined;

	if (sprite) {
		blockGroup.remove(sprite, true, true);
	}
};
