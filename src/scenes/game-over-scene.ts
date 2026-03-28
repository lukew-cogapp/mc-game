import type UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import {
	GAMEOVER_BG_COLOR,
	GAMEOVER_INPUT_DELAY,
	GAMEOVER_OVERLAY_ALPHA,
	GAMEOVER_OVERLAY_COLOR,
	GAMEOVER_PROMPT_COLOR,
	GAMEOVER_PROMPT_FADE_DURATION,
	GAMEOVER_PROMPT_PULSE_ALPHA,
	GAMEOVER_PROMPT_PULSE_DURATION,
	GAMEOVER_SUBTITLE_COLOR,
	GAMEOVER_SUBTITLE_DELAY,
	GAMEOVER_SUBTITLE_FADE_DURATION,
	GAMEOVER_TITLE_COLOR,
	GAMEOVER_TITLE_FADE_DURATION,
	TEXT_RESOLUTION,
} from "../config";
import { isAnyGamepadButtonDown } from "../input/gamepad-utils";

const TITLE_FONT_SIZE = "64px";
const SUBTITLE_FONT_SIZE = "18px";
const PROMPT_FONT_SIZE = "16px";
const PROMPT_DELAY = 1500;
const TITLE_BG_RADIUS = 12;
const TITLE_BG_COLOR = 0x220000;
const TITLE_BG_ALPHA = 0.6;
const TITLE_BG_PAD = { left: 32, right: 32, top: 16, bottom: 16 };
const SIZER_ITEM_SPACING = 20;
const PROMPT_TOP_PAD = 40;

export class GameOverScene extends Phaser.Scene {
	declare rexUI: UIPlugin;

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

		// Full-screen overlay using rexUI roundRectangle
		this.rexUI.add.roundRectangle(
			cx,
			cy,
			width,
			height,
			0,
			GAMEOVER_OVERLAY_COLOR,
			GAMEOVER_OVERLAY_ALPHA,
		);

		// Title text with rounded background
		const titleBg = this.rexUI.add.roundRectangle(
			0,
			0,
			0,
			0,
			TITLE_BG_RADIUS,
			TITLE_BG_COLOR,
			TITLE_BG_ALPHA,
		);

		const titleText = this.add
			.text(0, 0, "GAME OVER", {
				fontSize: TITLE_FONT_SIZE,
				color: GAMEOVER_TITLE_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION);

		const titleLabel = this.rexUI.add.label({
			background: titleBg,
			text: titleText,
			space: TITLE_BG_PAD,
			align: "center",
		});

		// Subtitle
		const subtitleText = this.add
			.text(0, 0, "The lava claimed you...", {
				fontSize: SUBTITLE_FONT_SIZE,
				color: GAMEOVER_SUBTITLE_COLOR,
			})
			.setResolution(TEXT_RESOLUTION);

		// Prompt
		const promptText = this.add
			.text(0, 0, "Press any key or button to continue", {
				fontSize: PROMPT_FONT_SIZE,
				color: GAMEOVER_PROMPT_COLOR,
			})
			.setResolution(TEXT_RESOLUTION);

		// Vertical sizer layout
		this.rexUI.add
			.sizer({
				x: cx,
				y: cy,
				orientation: "vertical",
				space: { item: SIZER_ITEM_SPACING },
			})
			.add(titleLabel, { align: "center" })
			.add(subtitleText, { align: "center" })
			.add(promptText, { align: "center", padding: { top: PROMPT_TOP_PAD } })
			.layout();

		// Fade-in tweens
		titleLabel.setAlpha(0);
		this.tweens.add({
			targets: titleLabel,
			alpha: 1,
			duration: GAMEOVER_TITLE_FADE_DURATION,
			ease: "Power2",
		});

		subtitleText.setAlpha(0);
		this.tweens.add({
			targets: subtitleText,
			alpha: 1,
			duration: GAMEOVER_SUBTITLE_FADE_DURATION,
			delay: GAMEOVER_SUBTITLE_DELAY,
		});

		promptText.setAlpha(0);
		this.tweens.add({
			targets: promptText,
			alpha: 1,
			duration: GAMEOVER_PROMPT_FADE_DURATION,
			delay: PROMPT_DELAY,
			onComplete: () => {
				this.tweens.add({
					targets: promptText,
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

		const anyButtonDown = isAnyGamepadButtonDown();

		// Edge-triggered: only fire on press, not hold
		if (anyButtonDown && !this.gpButtonWasDown) {
			this.scene.start("TitleScene");
		}
		this.gpButtonWasDown = anyButtonDown;
	}
}
