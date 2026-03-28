import {
	DAY_NIGHT_CYCLE_MS,
	DAY_NIGHT_DAY_COLOR,
	DAY_NIGHT_NIGHT_COLOR,
	DAY_NIGHT_OVERLAY_MAX_ALPHA,
	DAY_NIGHT_TEXT_BG_COLOR,
	DAY_NIGHT_TEXT_COLOR,
	DAY_NIGHT_VISION_EDGE_STEPS,
	DAY_NIGHT_VISION_EDGE_WIDTH,
	DAY_SKY_COLOR,
	NIGHT_OVERLAY_COLOR,
	NIGHT_SKY_COLOR,
	TILE_SIZE,
	UI_DEPTH,
	VISION_RADIUS_DAY,
	VISION_RADIUS_NIGHT,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";

export interface DayNightCycle {
	elapsed: number;
	mask: Phaser.Display.Masks.BitmapMask;
	maskGraphics: Phaser.GameObjects.Graphics;
	overlay: Phaser.GameObjects.Rectangle;
	timeIndicator: Phaser.GameObjects.Text;
}

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

export const createDayNight = (scene: Phaser.Scene): DayNightCycle => {
	const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
	const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;

	// Dark overlay covering the entire world
	const overlay = scene.add.rectangle(
		worldW / 2,
		worldH / 2,
		worldW,
		worldH,
		NIGHT_OVERLAY_COLOR,
		0,
	);
	overlay.setDepth(UI_DEPTH - 2);

	// Graphics object for the circular vision mask (drawn in world space)
	const maskGraphics = scene.add.graphics();
	maskGraphics.setVisible(false);

	// Create a bitmap mask — the overlay is only visible WHERE the mask is NOT drawn
	const mask = new Phaser.Display.Masks.BitmapMask(scene, maskGraphics);
	mask.invertAlpha = true;
	overlay.setMask(mask);

	// Time indicator (HUD) — styled with icon
	const timeIndicator = scene.add.text(10, 30, "", {
		fontSize: "14px",
		color: DAY_NIGHT_TEXT_COLOR,
		fontStyle: "bold",
	});
	timeIndicator.setResolution(2);
	timeIndicator.setScrollFactor(0);
	timeIndicator.setDepth(UI_DEPTH);

	return { elapsed: 0, mask, maskGraphics, overlay, timeIndicator };
};

export const updateDayNight = (
	cycle: DayNightCycle,
	scene: Phaser.Scene,
	playerX: number,
	playerY: number,
	delta: number,
): void => {
	cycle.elapsed += delta;

	const darkness = getDarkness(cycle.elapsed);

	// Vision radius interpolates between day and night
	const visionRadius = lerp(VISION_RADIUS_DAY, VISION_RADIUS_NIGHT, darkness);

	// Overlay alpha — darker at night
	cycle.overlay.setAlpha(darkness * DAY_NIGHT_OVERLAY_MAX_ALPHA);

	// Redraw the circular mask at the player's position
	cycle.maskGraphics.clear();
	cycle.maskGraphics.fillStyle(0xffffff);

	// Soft edge: draw concentric circles with decreasing alpha
	const steps = DAY_NIGHT_VISION_EDGE_STEPS;
	for (let i = steps; i >= 0; i--) {
		const r = visionRadius + (steps - i) * DAY_NIGHT_VISION_EDGE_WIDTH;
		const alpha = i / steps;
		cycle.maskGraphics.fillStyle(0xffffff, alpha);
		cycle.maskGraphics.fillCircle(playerX, playerY, r);
	}

	// Sky color transition
	const skyColor = lerpColor(DAY_SKY_COLOR, NIGHT_SKY_COLOR, darkness);
	scene.cameras.main.setBackgroundColor(skyColor);

	// Time indicator with emoji icon
	const isDay = darkness < 0.5;
	const icon = isDay ? "\u2600\ufe0f" : "\u{1f319}";
	const cycleNum = Math.floor(cycle.elapsed / DAY_NIGHT_CYCLE_MS) + 1;
	cycle.timeIndicator.setText(`${icon} Cycle ${cycleNum}`);
	cycle.timeIndicator.setColor(
		isDay ? DAY_NIGHT_DAY_COLOR : DAY_NIGHT_NIGHT_COLOR,
	);
};
