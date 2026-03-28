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

const LAVA_DEPTH = 90;
const LAVA_WIDTH = WORLD_WIDTH_TILES * TILE_SIZE;
const LAVA_BOTTOM = WORLD_HEIGHT_TILES * TILE_SIZE;

export class Lava extends Phaser.GameObjects.Graphics {
	private time = 0;
	private currentY =
		(WORLD_HEIGHT_TILES - LAVA_INITIAL_HEIGHT_TILES) * TILE_SIZE;

	constructor(scene: Phaser.Scene) {
		super(scene);
		scene.add.existing(this);
		this.addToUpdateList();
		this.setDepth(LAVA_DEPTH);
	}

	getY = (): number => this.currentY;

	preUpdate = (_time: number, delta: number): void => {
		this.time += delta * LAVA_ANIMATION_SPEED;

		// Rise slowly over time
		this.currentY -= (LAVA_RISE_RATE * delta) / 1000;

		const lavaHeight = LAVA_BOTTOM - this.currentY;

		this.clear();

		// Base lava layer
		this.fillStyle(LAVA_COLOR_1);
		this.fillRect(0, this.currentY, LAVA_WIDTH, lavaHeight);

		// Animated glow stripes
		const stripeWidth = LAVA_WIDTH / LAVA_STRIPE_COUNT;
		for (let i = 0; i < LAVA_STRIPE_COUNT; i++) {
			const phase = this.time + i * 0.5;
			const alpha =
				LAVA_STRIPE_ALPHA_BASE + LAVA_STRIPE_ALPHA_RANGE * Math.sin(phase);
			this.fillStyle(LAVA_COLOR_2, alpha);
			this.fillRect(
				i * stripeWidth,
				this.currentY,
				stripeWidth * LAVA_STRIPE_WIDTH_RATIO,
				lavaHeight,
			);
		}

		// Surface glow — brighter, wavy top edge
		for (let x = 0; x < LAVA_WIDTH; x += LAVA_SURFACE_STEP) {
			const waveOffset =
				Math.sin(this.time * 2 + x * 0.02) * LAVA_SURFACE_WAVE_AMP;
			this.fillStyle(LAVA_SURFACE_COLOR, LAVA_SURFACE_ALPHA);
			this.fillRect(
				x,
				this.currentY + waveOffset - LAVA_SURFACE_HEIGHT,
				LAVA_SURFACE_STEP,
				LAVA_SURFACE_HEIGHT,
			);
		}
	};
}
