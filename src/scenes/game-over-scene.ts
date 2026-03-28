import {
	GAMEOVER_BG_COLOR,
	GAMEOVER_INPUT_DELAY,
	GAMEOVER_OVERLAY_ALPHA,
	GAMEOVER_OVERLAY_COLOR,
	GAMEOVER_PROMPT_COLOR,
	GAMEOVER_PROMPT_DELAY,
	GAMEOVER_PROMPT_FADE_DURATION,
	GAMEOVER_PROMPT_OFFSET_Y,
	GAMEOVER_PROMPT_PULSE_ALPHA,
	GAMEOVER_PROMPT_PULSE_DURATION,
	GAMEOVER_SUBTITLE_COLOR,
	GAMEOVER_SUBTITLE_DELAY,
	GAMEOVER_SUBTITLE_FADE_DURATION,
	GAMEOVER_TITLE_COLOR,
	GAMEOVER_TITLE_FADE_DURATION,
	GAMEOVER_TITLE_OFFSET_Y,
	TEXT_RESOLUTION,
} from "../config";

export class GameOverScene extends Phaser.Scene {
	private canAcceptInput = false;
	private gpButtonWasDown = false;

	constructor() {
		super({ key: "GameOverScene" });
	}

	create(): void {
		this.events.on("shutdown", () => {
			this.input.removeAllListeners();
			if (this.input.keyboard) this.input.keyboard.removeAllListeners();
		});
		const { width, height } = this.cameras.main;
		const cx = width / 2;
		const cy = height / 2;

		this.canAcceptInput = false;
		this.gpButtonWasDown = true; // Prevent instant skip from held A button

		this.cameras.main.setBackgroundColor(GAMEOVER_BG_COLOR);

		const overlay = this.add.graphics();
		overlay.fillStyle(GAMEOVER_OVERLAY_COLOR, GAMEOVER_OVERLAY_ALPHA);
		overlay.fillRect(0, 0, width, height);

		// GAME OVER text
		const title = this.add
			.text(cx, cy + GAMEOVER_TITLE_OFFSET_Y, "GAME OVER", {
				fontSize: "64px",
				color: GAMEOVER_TITLE_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: title,
			alpha: 1,
			duration: GAMEOVER_TITLE_FADE_DURATION,
			ease: "Power2",
		});

		const subtitle = this.add
			.text(cx, cy, "The lava claimed you...", {
				fontSize: "18px",
				color: GAMEOVER_SUBTITLE_COLOR,
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: subtitle,
			alpha: 1,
			duration: GAMEOVER_SUBTITLE_FADE_DURATION,
			delay: GAMEOVER_SUBTITLE_DELAY,
		});

		const prompt = this.add
			.text(
				cx,
				cy + GAMEOVER_PROMPT_OFFSET_Y,
				"Press any key or button to continue",
				{
					fontSize: "16px",
					color: GAMEOVER_PROMPT_COLOR,
				},
			)
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: prompt,
			alpha: 1,
			duration: GAMEOVER_PROMPT_FADE_DURATION,
			delay: GAMEOVER_PROMPT_DELAY,
			onComplete: () => {
				this.tweens.add({
					targets: prompt,
					alpha: GAMEOVER_PROMPT_PULSE_ALPHA,
					duration: GAMEOVER_PROMPT_PULSE_DURATION,
					yoyo: true,
					repeat: -1,
				});
			},
		});

		// Enable input after delay
		this.time.delayedCall(GAMEOVER_INPUT_DELAY, () => {
			this.canAcceptInput = true;

			const goHome = () => {
				this.scene.start("TitleScene");
			};

			if (this.input.keyboard) {
				this.input.keyboard.on("keydown", goHome);
			}
			this.input.on("pointerdown", goHome);
		});
	}

	update(): void {
		if (!this.canAcceptInput) return;

		// Poll browser gamepad directly for any button press
		const pads = navigator.getGamepads?.();
		if (!pads) return;

		let anyButtonDown = false;
		for (const pad of pads) {
			if (!pad?.connected) continue;
			for (const btn of pad.buttons) {
				if (btn.pressed) {
					anyButtonDown = true;
					break;
				}
			}
			if (anyButtonDown) break;
		}

		// Edge-triggered: only fire on press, not hold
		if (anyButtonDown && !this.gpButtonWasDown) {
			this.scene.start("TitleScene");
		}
		this.gpButtonWasDown = anyButtonDown;
	}
}
