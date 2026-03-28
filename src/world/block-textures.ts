import { COLORS, TILE_SIZE, WATER_ALPHA } from "../config";
import { BlockType } from "../types";

/**
 * Draw a pixel-art texture for special block types.
 * Called during texture generation — draws into a Graphics object
 * that gets converted to a texture via generateTexture().
 */
export const drawPixelArtTexture = (
	gfx: Phaser.GameObjects.Graphics,
	blockType: BlockType,
): void => {
	const s = TILE_SIZE;
	const cx = s / 2;
	const cy = s / 2;

	switch (blockType) {
		case BlockType.Flower: {
			gfx.fillStyle(0x2d8a2d);
			gfx.fillRect(cx - 1, cy + 2, 3, s / 2 - 2);
			gfx.fillStyle(COLORS.flower);
			gfx.fillCircle(cx, cy - 3, 5);
			gfx.fillCircle(cx - 5, cy + 1, 4);
			gfx.fillCircle(cx + 5, cy + 1, 4);
			gfx.fillCircle(cx - 3, cy + 5, 4);
			gfx.fillCircle(cx + 3, cy + 5, 4);
			gfx.fillStyle(0xffee44);
			gfx.fillCircle(cx, cy + 1, 3);
			break;
		}
		case BlockType.Mushroom: {
			gfx.fillStyle(0xddccaa);
			gfx.fillRect(cx - 3, cy + 2, 7, s / 2 - 2);
			gfx.fillStyle(COLORS.mushroom);
			gfx.fillCircle(cx, cy, 10);
			gfx.fillRect(cx - 10, cy, 20, 2);
			gfx.fillStyle(0xffffff);
			gfx.fillCircle(cx - 4, cy - 4, 2);
			gfx.fillCircle(cx + 3, cy - 2, 1.5);
			gfx.fillCircle(cx + 1, cy - 6, 1.5);
			break;
		}
		case BlockType.Apple: {
			gfx.fillStyle(COLORS.apple);
			gfx.fillCircle(cx, cy + 2, 10);
			gfx.fillStyle(0xff7777);
			gfx.fillCircle(cx - 3, cy - 2, 4);
			gfx.fillStyle(0x5a3a1a);
			gfx.fillRect(cx - 1, cy - 10, 2, 6);
			gfx.fillStyle(0x44aa22);
			gfx.fillEllipse(cx + 4, cy - 8, 6, 4);
			break;
		}
		case BlockType.Pear: {
			gfx.fillStyle(COLORS.pear);
			gfx.fillCircle(cx, cy + 4, 10);
			gfx.fillCircle(cx, cy - 4, 6);
			gfx.fillRect(cx - 6, cy - 2, 12, 6);
			gfx.fillStyle(0x5a3a1a);
			gfx.fillRect(cx - 1, cy - 12, 2, 5);
			gfx.fillStyle(0x44aa22);
			gfx.fillEllipse(cx + 4, cy - 10, 6, 3);
			break;
		}
		case BlockType.Peach: {
			gfx.fillStyle(COLORS.peach);
			gfx.fillCircle(cx, cy + 1, 11);
			gfx.fillStyle(0xff9999, 0.5);
			gfx.fillCircle(cx + 3, cy + 3, 5);
			gfx.lineStyle(1, 0xdd8855, 0.5);
			gfx.beginPath();
			gfx.arc(cx - 2, cy - 4, 8, 0.8, 2.2);
			gfx.strokePath();
			gfx.fillStyle(0x5a3a1a);
			gfx.fillRect(cx - 1, cy - 12, 2, 5);
			gfx.fillStyle(0x44aa22);
			gfx.fillEllipse(cx + 3, cy - 10, 6, 3);
			break;
		}
		case BlockType.Strawberry: {
			gfx.fillStyle(COLORS.strawberry);
			gfx.beginPath();
			gfx.moveTo(cx, cy + 12);
			gfx.lineTo(cx - 9, cy - 4);
			gfx.lineTo(cx + 9, cy - 4);
			gfx.closePath();
			gfx.fillPath();
			gfx.fillCircle(cx, cy - 2, 9);
			gfx.fillStyle(0xffdd44);
			gfx.fillCircle(cx - 3, cy, 1);
			gfx.fillCircle(cx + 3, cy, 1);
			gfx.fillCircle(cx, cy + 4, 1);
			gfx.fillCircle(cx - 2, cy + 7, 1);
			gfx.fillCircle(cx + 2, cy + 7, 1);
			gfx.fillStyle(0x228833);
			gfx.fillEllipse(cx - 4, cy - 8, 6, 4);
			gfx.fillEllipse(cx + 4, cy - 8, 6, 4);
			gfx.fillEllipse(cx, cy - 10, 4, 4);
			break;
		}
		case BlockType.Berry: {
			gfx.fillStyle(COLORS.berry);
			gfx.fillCircle(cx - 4, cy + 2, 5);
			gfx.fillCircle(cx + 4, cy + 2, 5);
			gfx.fillCircle(cx, cy - 3, 5);
			gfx.fillCircle(cx - 2, cy + 6, 4);
			gfx.fillCircle(cx + 2, cy + 6, 4);
			gfx.fillStyle(0x9944cc);
			gfx.fillCircle(cx - 5, cy, 2);
			gfx.fillCircle(cx + 3, cy - 4, 2);
			gfx.fillStyle(0x2d5a1e);
			gfx.fillRect(cx - 1, cy - 10, 2, 5);
			break;
		}
		case BlockType.Water: {
			gfx.fillStyle(COLORS.water, WATER_ALPHA);
			gfx.fillRect(0, 0, s, s);
			gfx.fillStyle(0x66bbee, 0.3);
			gfx.fillRect(2, 4, 8, 2);
			gfx.fillRect(14, 10, 10, 2);
			gfx.fillRect(6, 18, 6, 2);
			gfx.fillRect(18, 24, 8, 2);
			gfx.fillStyle(0x2277aa, 0.25);
			gfx.fillRect(4, 8, 12, 1);
			gfx.fillRect(10, 16, 14, 1);
			gfx.fillRect(2, 26, 10, 1);
			break;
		}
		case BlockType.Jetpack: {
			gfx.fillStyle(0x884422);
			gfx.fillRect(cx - 7, cy - 8, 14, 16);
			gfx.fillStyle(0x995533);
			gfx.fillRect(cx - 6, cy - 10, 12, 4);
			gfx.fillStyle(0x553311);
			gfx.fillRect(cx - 8, cy - 7, 3, 12);
			gfx.fillRect(cx + 5, cy - 7, 3, 12);
			gfx.fillStyle(0x666666);
			gfx.fillRect(cx - 5, cy + 8, 4, 6);
			gfx.fillRect(cx + 1, cy + 8, 4, 6);
			gfx.fillStyle(0xff6600);
			gfx.fillRect(cx - 4, cy + 14, 2, 3);
			gfx.fillStyle(0xffaa00);
			gfx.fillRect(cx - 4, cy + 13, 2, 2);
			gfx.fillStyle(0xff6600);
			gfx.fillRect(cx + 2, cy + 14, 2, 3);
			gfx.fillStyle(0xffaa00);
			gfx.fillRect(cx + 2, cy + 13, 2, 2);
			gfx.fillStyle(0x44cc44);
			gfx.fillRect(cx - 3, cy - 4, 6, 3);
			gfx.fillStyle(0xaa6633, 0.6);
			gfx.fillRect(cx - 5, cy - 6, 3, 6);
			break;
		}
		case BlockType.Leaf: {
			gfx.fillStyle(COLORS.leaf);
			gfx.fillRect(0, 0, s, s);
			gfx.fillStyle(0x1a4a14, 0.4);
			gfx.fillRect(cx - 1, 2, 2, s - 4);
			gfx.fillRect(4, cy - 1, s - 8, 2);
			gfx.fillStyle(0x3a7a2e, 0.5);
			gfx.fillRect(3, 3, 6, 5);
			gfx.fillRect(18, 14, 8, 6);
			gfx.fillRect(8, 22, 7, 5);
			gfx.lineStyle(1, 0x000000, 0.15);
			gfx.strokeRect(0, 0, s, s);
			break;
		}
	}
};

/** Set of block types that use pixel-art textures instead of flat squares */
export const CUSTOM_TEXTURE_BLOCKS = new Set([
	BlockType.Flower,
	BlockType.Mushroom,
	BlockType.Apple,
	BlockType.Pear,
	BlockType.Peach,
	BlockType.Strawberry,
	BlockType.Berry,
	BlockType.Water,
	BlockType.Leaf,
	BlockType.Jetpack,
]);
