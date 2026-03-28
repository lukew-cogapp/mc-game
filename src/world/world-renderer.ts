import {
	COLORS,
	PLATFORM_SHADOW_ALPHA,
	PLATFORM_SHADOW_HEIGHT,
	TILE_SIZE,
	WATER_ALPHA,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";
import { BlockType } from "../types";

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
};

// Blocks that get custom pixel-art textures instead of flat squares
const CUSTOM_TEXTURE_BLOCKS = new Set([
	BlockType.Flower,
	BlockType.Mushroom,
	BlockType.Apple,
	BlockType.Pear,
	BlockType.Peach,
	BlockType.Strawberry,
	BlockType.Berry,
	BlockType.Water,
	BlockType.Leaf,
]);

const drawPixelArtTexture = (
	gfx: Phaser.GameObjects.Graphics,
	blockType: BlockType,
): void => {
	const s = TILE_SIZE;
	const cx = s / 2;
	const cy = s / 2;

	switch (blockType) {
		case BlockType.Flower: {
			// Stem
			gfx.fillStyle(0x2d8a2d);
			gfx.fillRect(cx - 1, cy + 2, 3, s / 2 - 2);
			// Petals (5 around center)
			gfx.fillStyle(COLORS.flower);
			gfx.fillCircle(cx, cy - 3, 5);
			gfx.fillCircle(cx - 5, cy + 1, 4);
			gfx.fillCircle(cx + 5, cy + 1, 4);
			gfx.fillCircle(cx - 3, cy + 5, 4);
			gfx.fillCircle(cx + 3, cy + 5, 4);
			// Center
			gfx.fillStyle(0xffee44);
			gfx.fillCircle(cx, cy + 1, 3);
			break;
		}
		case BlockType.Mushroom: {
			// Stem
			gfx.fillStyle(0xddccaa);
			gfx.fillRect(cx - 3, cy + 2, 7, s / 2 - 2);
			// Cap
			gfx.fillStyle(COLORS.mushroom);
			gfx.fillCircle(cx, cy, 10);
			gfx.fillRect(cx - 10, cy, 20, 2);
			// Spots
			gfx.fillStyle(0xffffff);
			gfx.fillCircle(cx - 4, cy - 4, 2);
			gfx.fillCircle(cx + 3, cy - 2, 1.5);
			gfx.fillCircle(cx + 1, cy - 6, 1.5);
			break;
		}
		case BlockType.Apple: {
			// Body
			gfx.fillStyle(COLORS.apple);
			gfx.fillCircle(cx, cy + 2, 10);
			// Highlight
			gfx.fillStyle(0xff7777);
			gfx.fillCircle(cx - 3, cy - 2, 4);
			// Stem
			gfx.fillStyle(0x5a3a1a);
			gfx.fillRect(cx - 1, cy - 10, 2, 6);
			// Leaf
			gfx.fillStyle(0x44aa22);
			gfx.fillEllipse(cx + 4, cy - 8, 6, 4);
			break;
		}
		case BlockType.Pear: {
			// Bottom round
			gfx.fillStyle(COLORS.pear);
			gfx.fillCircle(cx, cy + 4, 10);
			// Top narrow
			gfx.fillCircle(cx, cy - 4, 6);
			// Blend middle
			gfx.fillRect(cx - 6, cy - 2, 12, 6);
			// Stem
			gfx.fillStyle(0x5a3a1a);
			gfx.fillRect(cx - 1, cy - 12, 2, 5);
			// Leaf
			gfx.fillStyle(0x44aa22);
			gfx.fillEllipse(cx + 4, cy - 10, 6, 3);
			break;
		}
		case BlockType.Peach: {
			// Body
			gfx.fillStyle(COLORS.peach);
			gfx.fillCircle(cx, cy + 1, 11);
			// Blush
			gfx.fillStyle(0xff9999, 0.5);
			gfx.fillCircle(cx + 3, cy + 3, 5);
			// Crease
			gfx.lineStyle(1, 0xdd8855, 0.5);
			gfx.beginPath();
			gfx.arc(cx - 2, cy - 4, 8, 0.8, 2.2);
			gfx.strokePath();
			// Stem
			gfx.fillStyle(0x5a3a1a);
			gfx.fillRect(cx - 1, cy - 12, 2, 5);
			// Leaf
			gfx.fillStyle(0x44aa22);
			gfx.fillEllipse(cx + 3, cy - 10, 6, 3);
			break;
		}
		case BlockType.Strawberry: {
			// Body (triangle-ish)
			gfx.fillStyle(COLORS.strawberry);
			gfx.beginPath();
			gfx.moveTo(cx, cy + 12);
			gfx.lineTo(cx - 9, cy - 4);
			gfx.lineTo(cx + 9, cy - 4);
			gfx.closePath();
			gfx.fillPath();
			gfx.fillCircle(cx, cy - 2, 9);
			// Seeds
			gfx.fillStyle(0xffdd44);
			gfx.fillCircle(cx - 3, cy, 1);
			gfx.fillCircle(cx + 3, cy, 1);
			gfx.fillCircle(cx, cy + 4, 1);
			gfx.fillCircle(cx - 2, cy + 7, 1);
			gfx.fillCircle(cx + 2, cy + 7, 1);
			// Leaves on top
			gfx.fillStyle(0x228833);
			gfx.fillEllipse(cx - 4, cy - 8, 6, 4);
			gfx.fillEllipse(cx + 4, cy - 8, 6, 4);
			gfx.fillEllipse(cx, cy - 10, 4, 4);
			break;
		}
		case BlockType.Berry: {
			// Cluster of small circles
			gfx.fillStyle(COLORS.berry);
			gfx.fillCircle(cx - 4, cy + 2, 5);
			gfx.fillCircle(cx + 4, cy + 2, 5);
			gfx.fillCircle(cx, cy - 3, 5);
			gfx.fillCircle(cx - 2, cy + 6, 4);
			gfx.fillCircle(cx + 2, cy + 6, 4);
			// Highlights
			gfx.fillStyle(0x9944cc);
			gfx.fillCircle(cx - 5, cy, 2);
			gfx.fillCircle(cx + 3, cy - 4, 2);
			// Stem
			gfx.fillStyle(0x2d5a1e);
			gfx.fillRect(cx - 1, cy - 10, 2, 5);
			break;
		}
		case BlockType.Water: {
			// Wavy blue fill
			gfx.fillStyle(COLORS.water, WATER_ALPHA);
			gfx.fillRect(0, 0, s, s);
			// Wave highlights
			gfx.fillStyle(0x66bbee, 0.3);
			gfx.fillRect(2, 4, 8, 2);
			gfx.fillRect(14, 10, 10, 2);
			gfx.fillRect(6, 18, 6, 2);
			gfx.fillRect(18, 24, 8, 2);
			// Darker wave lines
			gfx.fillStyle(0x2277aa, 0.25);
			gfx.fillRect(4, 8, 12, 1);
			gfx.fillRect(10, 16, 14, 1);
			gfx.fillRect(2, 26, 10, 1);
			break;
		}
		case BlockType.Leaf: {
			// Base green fill
			gfx.fillStyle(COLORS.leaf);
			gfx.fillRect(0, 0, s, s);
			// Leaf vein pattern
			gfx.fillStyle(0x1a4a14, 0.4);
			gfx.fillRect(cx - 1, 2, 2, s - 4);
			gfx.fillRect(4, cy - 1, s - 8, 2);
			// Lighter patches for texture
			gfx.fillStyle(0x3a7a2e, 0.5);
			gfx.fillRect(3, 3, 6, 5);
			gfx.fillRect(18, 14, 8, 6);
			gfx.fillRect(8, 22, 7, 5);
			// Subtle border
			gfx.lineStyle(1, 0x000000, 0.15);
			gfx.strokeRect(0, 0, s, s);
			break;
		}
	}
};

export const createWorldTextures = (scene: Phaser.Scene): void => {
	for (const [type, color] of Object.entries(BLOCK_COLOR_MAP)) {
		if (color === null) continue;
		const key = `block_${type}`;
		const gfx = scene.add.graphics();
		const blockTypeNum = Number(type) as BlockType;

		if (CUSTOM_TEXTURE_BLOCKS.has(blockTypeNum)) {
			// Pixel art texture
			drawPixelArtTexture(gfx, blockTypeNum);
		} else {
			// Standard flat square
			gfx.fillStyle(color);
			gfx.fillRect(0, 0, TILE_SIZE, TILE_SIZE);
			gfx.lineStyle(1, 0x000000, 0.2);
			gfx.strokeRect(0, 0, TILE_SIZE, TILE_SIZE);
		}

		gfx.generateTexture(key, TILE_SIZE, TILE_SIZE);
		gfx.destroy();
	}

	// Create the platform shadow texture
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

			// Add a small shadow below solid blocks that have air beneath them
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
