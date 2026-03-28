import {
	DAY_NIGHT_CYCLE_MS,
	DAY_NIGHT_DAY_COLOR,
	DAY_NIGHT_NIGHT_COLOR,
	DAY_NIGHT_OVERLAY_MAX_ALPHA,
	DAY_NIGHT_TEXT_COLOR,
	DAY_NIGHT_VISION_EDGE_STEPS,
	DAY_NIGHT_VISION_EDGE_WIDTH,
	DAY_SKY_COLOR,
	NIGHT_OVERLAY_COLOR,
	NIGHT_SKY_COLOR,
	TEXT_RESOLUTION,
	TILE_SIZE,
	UI_DEPTH,
	VISION_RADIUS_DAY,
	VISION_RADIUS_NIGHT,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";

const WORLD_W = WORLD_WIDTH_TILES * TILE_SIZE;
const WORLD_H = WORLD_HEIGHT_TILES * TILE_SIZE;

const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

const lerpColor = (color1: number, color2: number, t: number): number => {
	const r1 = (color1 >> 16) & 0xff;
	const g1 = (color1 >> 8) & 0xff;
	const b1 = color1 & 0xff;
	const r2 = (color2 >> 16) & 0xff;
	const g2 = (color2 >> 8) & 0xff;
	const b2 = color2 & 0xff;
	const r = Math.round(lerp(r1, r2, t));
	const g = Math.round(lerp(g1, g2, t));
	const b = Math.round(lerp(b1, b2, t));
	return (r << 16) | (g << 8) | b;
};

/**
 * Returns a 0-1 "darkness" value based on cycle position.
 * 0 = full day, 1 = deepest night.
 * Uses a sine wave: day peaks at 0.25 cycle, night peaks at 0.75 cycle.
 */
const getDarkness = (elapsed: number): number => {
	const cyclePos = (elapsed % DAY_NIGHT_CYCLE_MS) / DAY_NIGHT_CYCLE_MS;
	return (Math.sin(cyclePos * Math.PI * 2 - Math.PI / 2) + 1) / 2;
};

export class DayNightCycle extends Phaser.GameObjects.Container {
	private elapsed = 0;
	private mask_: Phaser.Display.Masks.BitmapMask;
	private maskGraphics: Phaser.GameObjects.Graphics;
	private overlay: Phaser.GameObjects.Rectangle;
	private timeIndicator: Phaser.GameObjects.Text;

	playerX = 0;
	playerY = 0;

	constructor(scene: Phaser.Scene) {
		super(scene);
		scene.add.existing(this);
		this.addToUpdateList();

		// Dark overlay covering the entire world
		this.overlay = scene.add.rectangle(
			WORLD_W / 2,
			WORLD_H / 2,
			WORLD_W,
			WORLD_H,
			NIGHT_OVERLAY_COLOR,
			0,
		);
		this.overlay.setDepth(UI_DEPTH - 2);

		// Graphics object for the circular vision mask (drawn in world space)
		this.maskGraphics = scene.add.graphics();
		this.maskGraphics.setVisible(false);

		// Create a bitmap mask — the overlay is only visible WHERE the mask is NOT drawn
		this.mask_ = new Phaser.Display.Masks.BitmapMask(scene, this.maskGraphics);
		this.mask_.invertAlpha = true;
		this.overlay.setMask(this.mask_);

		// Time indicator (HUD) — styled with background for readability
		this.timeIndicator = scene.add.text(10, 14, "", {
			fontSize: "16px",
			color: DAY_NIGHT_TEXT_COLOR,
			fontStyle: "bold",
			backgroundColor: "#00000088",
			padding: { x: 8, y: 4 },
		});
		this.timeIndicator.setResolution(TEXT_RESOLUTION);
		this.timeIndicator.setScrollFactor(0);
		this.timeIndicator.setDepth(UI_DEPTH);
	}

	preUpdate = (_time: number, delta: number): void => {
		this.elapsed += delta;

		const darkness = getDarkness(this.elapsed);

		// Vision radius interpolates between day and night
		const visionRadius = lerp(VISION_RADIUS_DAY, VISION_RADIUS_NIGHT, darkness);

		// Overlay alpha — darker at night
		this.overlay.setAlpha(darkness * DAY_NIGHT_OVERLAY_MAX_ALPHA);

		// Redraw the circular mask at the player's position
		this.maskGraphics.clear();
		this.maskGraphics.fillStyle(0xffffff);

		// Soft edge: draw concentric circles with decreasing alpha
		const steps = DAY_NIGHT_VISION_EDGE_STEPS;
		for (let i = steps; i >= 0; i--) {
			const r = visionRadius + (steps - i) * DAY_NIGHT_VISION_EDGE_WIDTH;
			const alpha = i / steps;
			this.maskGraphics.fillStyle(0xffffff, alpha);
			this.maskGraphics.fillCircle(this.playerX, this.playerY, r);
		}

		// Sky color transition
		const skyColor = lerpColor(DAY_SKY_COLOR, NIGHT_SKY_COLOR, darkness);
		this.scene.cameras.main.setBackgroundColor(skyColor);

		// Time indicator with emoji icon
		const isDay = darkness < 0.5;
		const icon = isDay ? "\u2600\ufe0f" : "\u{1f319}";
		const cycleNum = Math.floor(this.elapsed / DAY_NIGHT_CYCLE_MS) + 1;
		this.timeIndicator.setText(`${icon} Cycle ${cycleNum}`);
		this.timeIndicator.setColor(
			isDay ? DAY_NIGHT_DAY_COLOR : DAY_NIGHT_NIGHT_COLOR,
		);
	};
}
