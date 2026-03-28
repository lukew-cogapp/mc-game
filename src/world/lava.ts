import {
	LAVA_ANIMATION_SPEED,
	LAVA_COLOR_1,
	LAVA_COLOR_2,
	LAVA_INITIAL_HEIGHT_TILES,
	LAVA_RISE_RATE,
	LAVA_STRIPE_ALPHA_BASE,
	LAVA_STRIPE_ALPHA_RANGE,
	LAVA_STRIPE_COUNT,
	LAVA_STRIPE_WIDTH_RATIO,
	LAVA_SURFACE_ALPHA,
	LAVA_SURFACE_COLOR,
	LAVA_SURFACE_HEIGHT,
	LAVA_SURFACE_STEP,
	LAVA_SURFACE_WAVE_AMP,
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
	graphics.setDepth(90);
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
	const stripeWidth = lavaWidth / LAVA_STRIPE_COUNT;
	for (let i = 0; i < LAVA_STRIPE_COUNT; i++) {
		const phase = lava.time + i * 0.5;
		const alpha =
			LAVA_STRIPE_ALPHA_BASE + LAVA_STRIPE_ALPHA_RANGE * Math.sin(phase);
		lava.graphics.fillStyle(LAVA_COLOR_2, alpha);
		lava.graphics.fillRect(
			i * stripeWidth,
			lava.currentY,
			stripeWidth * LAVA_STRIPE_WIDTH_RATIO,
			lavaHeight,
		);
	}

	// Surface glow — brighter, wavy top edge
	for (let x = 0; x < lavaWidth; x += LAVA_SURFACE_STEP) {
		const waveOffset =
			Math.sin(lava.time * 2 + x * 0.02) * LAVA_SURFACE_WAVE_AMP;
		lava.graphics.fillStyle(LAVA_SURFACE_COLOR, LAVA_SURFACE_ALPHA);
		lava.graphics.fillRect(
			x,
			lava.currentY + waveOffset - LAVA_SURFACE_HEIGHT,
			LAVA_SURFACE_STEP,
			LAVA_SURFACE_HEIGHT,
		);
	}
};
