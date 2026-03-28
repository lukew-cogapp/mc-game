import {
	GOAL_BEACON_BEAM_ALPHA,
	GOAL_BEACON_BEAM_WIDTH,
	GOAL_BEACON_COLOR,
	GOAL_BEACON_GLOW_ALPHA,
	GOAL_BEACON_GLOW_STEPS,
	GOAL_BEACON_HEIGHT_TILES,
	GOAL_BEACON_PULSE_ALPHA,
	GOAL_BEACON_PULSE_DURATION,
	GOAL_BEACON_PULSE_SCALE_X,
	SKY_GRADIENT_BAND_HEIGHT,
	SKY_GRADIENT_BOTTOM_COLOR,
	SKY_GRADIENT_DEPTH,
	SKY_GRADIENT_MID_COLOR,
	SKY_GRADIENT_TOP_COLOR,
	TILE_SIZE,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";

export const drawSkyGradient = (scene: Phaser.Scene): void => {
	const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
	const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;
	const gfx = scene.add.graphics();
	gfx.setDepth(SKY_GRADIENT_DEPTH);

	const bands = Math.ceil(worldH / SKY_GRADIENT_BAND_HEIGHT);
	for (let i = 0; i < bands; i++) {
		const t = i / bands; // 0 = top, 1 = bottom
		let r: number;
		let g: number;
		let b: number;
		if (t < 0.5) {
			// Top to mid
			const lt = t * 2;
			r =
				SKY_GRADIENT_TOP_COLOR.r +
				(SKY_GRADIENT_MID_COLOR.r - SKY_GRADIENT_TOP_COLOR.r) * lt;
			g =
				SKY_GRADIENT_TOP_COLOR.g +
				(SKY_GRADIENT_MID_COLOR.g - SKY_GRADIENT_TOP_COLOR.g) * lt;
			b =
				SKY_GRADIENT_TOP_COLOR.b +
				(SKY_GRADIENT_MID_COLOR.b - SKY_GRADIENT_TOP_COLOR.b) * lt;
		} else {
			// Mid to bottom
			const lt = (t - 0.5) * 2;
			r =
				SKY_GRADIENT_MID_COLOR.r +
				(SKY_GRADIENT_BOTTOM_COLOR.r - SKY_GRADIENT_MID_COLOR.r) * lt;
			g =
				SKY_GRADIENT_MID_COLOR.g +
				(SKY_GRADIENT_BOTTOM_COLOR.g - SKY_GRADIENT_MID_COLOR.g) * lt;
			b =
				SKY_GRADIENT_MID_COLOR.b +
				(SKY_GRADIENT_BOTTOM_COLOR.b - SKY_GRADIENT_MID_COLOR.b) * lt;
		}
		const bandH = worldH / bands;
		gfx.fillStyle(
			Phaser.Display.Color.GetColor(
				Math.round(r),
				Math.round(g),
				Math.round(b),
			),
		);
		gfx.fillRect(0, i * bandH, worldW, bandH + 1);
	}
};

export const drawGoalBeacon = (scene: Phaser.Scene): void => {
	const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
	const beaconH = GOAL_BEACON_HEIGHT_TILES * TILE_SIZE;

	// Golden glow at the top
	const gfx = scene.add.graphics();
	gfx.setDepth(-15);
	for (let i = 0; i < GOAL_BEACON_GLOW_STEPS; i++) {
		const alpha = GOAL_BEACON_GLOW_ALPHA * (1 - i / GOAL_BEACON_GLOW_STEPS);
		gfx.fillStyle(GOAL_BEACON_COLOR, alpha);
		gfx.fillRect(
			0,
			i * (beaconH / GOAL_BEACON_GLOW_STEPS),
			worldW,
			beaconH / GOAL_BEACON_GLOW_STEPS + 1,
		);
	}

	// Central light beam
	const beamX = worldW / 2;
	const beam = scene.add.rectangle(
		beamX,
		beaconH / 2,
		GOAL_BEACON_BEAM_WIDTH,
		beaconH,
		GOAL_BEACON_COLOR,
		GOAL_BEACON_BEAM_ALPHA,
	);
	beam.setDepth(-14);
	beam.setBlendMode(Phaser.BlendModes.ADD);

	// Pulse the beam
	scene.tweens.add({
		targets: beam,
		alpha: GOAL_BEACON_PULSE_ALPHA,
		scaleX: GOAL_BEACON_PULSE_SCALE_X,
		duration: GOAL_BEACON_PULSE_DURATION,
		yoyo: true,
		repeat: -1,
		ease: "Sine.easeInOut",
	});
};
