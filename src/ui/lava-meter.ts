import {
	HUD_LAVA_LABEL_COLOR,
	LAVA_METER_HEIGHT,
	LAVA_METER_MARGIN_TOP,
	LAVA_METER_WIDTH,
	LAVA_METER_X,
	TEXT_RESOLUTION,
	TILE_SIZE,
	WORLD_HEIGHT_TILES,
} from "../config";

export interface LavaMeterUI {
	gfx: Phaser.GameObjects.Graphics;
	label: Phaser.GameObjects.Text;
}

export const createLavaMeter = (scene: Phaser.Scene): LavaMeterUI => {
	const gfx = scene.add.graphics();
	gfx.setScrollFactor(0);
	gfx.setDepth(100);

	const label = scene.add.text(
		LAVA_METER_X + LAVA_METER_WIDTH + 4,
		LAVA_METER_MARGIN_TOP - 12,
		"",
		{
			fontSize: "14px",
			color: HUD_LAVA_LABEL_COLOR,
		},
	);
	label.setResolution(TEXT_RESOLUTION);
	label.setScrollFactor(0);
	label.setDepth(100);

	return { gfx, label };
};

export const updateLavaMeter = (
	meter: LavaMeterUI,
	playerY: number,
	lavaY: number,
): void => {
	const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;
	const meterX = LAVA_METER_X;
	const meterY = LAVA_METER_MARGIN_TOP;
	const meterW = LAVA_METER_WIDTH;
	const meterH = LAVA_METER_HEIGHT;

	// Normalize positions (0 = top of world, 1 = bottom)
	const playerNorm = Math.max(0, Math.min(1, playerY / worldH));
	const lavaNorm = Math.max(0, Math.min(1, lavaY / worldH));

	meter.gfx.clear();

	// Background track
	meter.gfx.fillStyle(0x000000, 0.5);
	meter.gfx.fillRoundedRect(meterX, meterY, meterW, meterH, 4);
	meter.gfx.lineStyle(1, 0xffffff, 0.15);
	meter.gfx.strokeRoundedRect(meterX, meterY, meterW, meterH, 4);

	// Lava fill (red, from bottom up to lava position)
	const lavaFillH = (1 - lavaNorm) * meterH;
	if (lavaFillH > 0) {
		meter.gfx.fillStyle(0xff4400, 0.6);
		meter.gfx.fillRect(
			meterX + 1,
			meterY + meterH - lavaFillH,
			meterW - 2,
			lavaFillH,
		);
	}

	// Goal zone at top (golden)
	meter.gfx.fillStyle(0xffd700, 0.4);
	meter.gfx.fillRect(meterX + 1, meterY, meterW - 2, 8);

	// Player position marker (white dot)
	const playerMeterY = meterY + playerNorm * meterH;
	meter.gfx.fillStyle(0xffffff);
	meter.gfx.fillCircle(meterX + meterW / 2, playerMeterY, 4);
	meter.gfx.lineStyle(1, 0x000000, 0.5);
	meter.gfx.strokeCircle(meterX + meterW / 2, playerMeterY, 4);

	// Height label in meters (1 tile = 1m)
	const heightInMeters = Math.floor((worldH - playerY) / TILE_SIZE);
	meter.label.setText(`${heightInMeters}m`);
};
