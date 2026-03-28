import {
	LAVA_ANIMATION_SPEED,
	LAVA_COLOR_1,
	LAVA_COLOR_2,
	LAVA_INITIAL_HEIGHT_TILES,
	LAVA_RISE_RATE,
	TILE_SIZE,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";

export interface LavaLayer {
	graphics: Phaser.GameObjects.Graphics;
	time: number;
	currentY: number;
}

export const createLava = (scene: Phaser.Scene): LavaLayer => {
	const graphics = scene.add.graphics();
	const currentY = (WORLD_HEIGHT_TILES - LAVA_INITIAL_HEIGHT_TILES) * TILE_SIZE;
	return { graphics, time: 0, currentY };
};

export const getLavaY = (lava: LavaLayer): number => lava.currentY;

export const updateLava = (lava: LavaLayer, delta: number): void => {
	lava.time += delta * LAVA_ANIMATION_SPEED;

	// Rise slowly over time
	lava.currentY -= (LAVA_RISE_RATE * delta) / 1000;

	const lavaWidth = WORLD_WIDTH_TILES * TILE_SIZE;
	const lavaBottom = WORLD_HEIGHT_TILES * TILE_SIZE;
	const lavaHeight = lavaBottom - lava.currentY;

	lava.graphics.clear();

	// Base lava layer
	lava.graphics.fillStyle(LAVA_COLOR_1);
	lava.graphics.fillRect(0, lava.currentY, lavaWidth, lavaHeight);

	// Animated glow stripes
	const stripeCount = 20;
	const stripeWidth = lavaWidth / stripeCount;
	for (let i = 0; i < stripeCount; i++) {
		const phase = lava.time + i * 0.5;
		const alpha = 0.3 + 0.3 * Math.sin(phase);
		lava.graphics.fillStyle(LAVA_COLOR_2, alpha);
		lava.graphics.fillRect(
			i * stripeWidth,
			lava.currentY,
			stripeWidth * 0.6,
			lavaHeight,
		);
	}

	// Surface glow — brighter, wavy top edge
	const surfaceHeight = 4;
	for (let x = 0; x < lavaWidth; x += 8) {
		const waveOffset = Math.sin(lava.time * 2 + x * 0.02) * 3;
		lava.graphics.fillStyle(0xffaa00, 0.6);
		lava.graphics.fillRect(
			x,
			lava.currentY + waveOffset - surfaceHeight,
			8,
			surfaceHeight,
		);
	}
};
