import type UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
import {
	formatTimeMs,
	loadHighScores,
	saveHighScore,
} from "../audio/high-scores";
import {
	HIGH_SCORES_MAX,
	TEXT_RESOLUTION,
	VICTORY_BG_COLOR,
	VICTORY_HIGH_SCORE_COLOR,
	VICTORY_HIGH_SCORE_FADE_DELAY,
	VICTORY_HIGH_SCORE_FONT_SIZE,
	VICTORY_INPUT_DELAY,
	VICTORY_LEADERBOARD_FADE_DELAY,
	VICTORY_LEADERBOARD_FONT_SIZE,
	VICTORY_LEADERBOARD_HEADER_COLOR,
	VICTORY_OVERLAY_ALPHA,
	VICTORY_OVERLAY_COLOR,
	VICTORY_PROMPT_COLOR,
	VICTORY_PROMPT_FADE_DELAY,
	VICTORY_PROMPT_FADE_DURATION,
	VICTORY_PROMPT_FONT_SIZE,
	VICTORY_PROMPT_PULSE_ALPHA,
	VICTORY_PROMPT_PULSE_DURATION,
	VICTORY_SCORE_COLOR,
	VICTORY_SCORE_HIGHLIGHT_COLOR,
	VICTORY_SPARKLE_ALPHA_MIN,
	VICTORY_SPARKLE_ALPHA_RANGE,
	VICTORY_SPARKLE_COLOR,
	VICTORY_SPARKLE_COUNT,
	VICTORY_SPARKLE_DELAY_RANGE,
	VICTORY_SPARKLE_DRIFT_MIN,
	VICTORY_SPARKLE_DRIFT_RANGE,
	VICTORY_SPARKLE_DURATION_MIN,
	VICTORY_SPARKLE_DURATION_RANGE,
	VICTORY_SPARKLE_RADIUS,
	VICTORY_SUBTITLE_COLOR,
	VICTORY_SUBTITLE_FADE_DELAY,
	VICTORY_SUBTITLE_FADE_DURATION,
	VICTORY_SUBTITLE_FONT_SIZE,
	VICTORY_TIME_COLOR,
	VICTORY_TIME_FADE_DELAY,
	VICTORY_TIME_FADE_DURATION,
	VICTORY_TIME_FONT_SIZE,
	VICTORY_TITLE_COLOR,
	VICTORY_TITLE_FADE_DURATION,
	VICTORY_TITLE_FONT_SIZE,
	VICTORY_TITLE_SCALE_UP,
} from "../config";
import { isAnyGamepadButtonDown } from "../input/gamepad-utils";

const TITLE_BG_RADIUS = 12;
const TITLE_BG_COLOR = 0x332200;
const TITLE_BG_ALPHA = 0.6;
const TITLE_BG_PAD = { left: 32, right: 32, top: 16, bottom: 16 };
const SIZER_ITEM_SPACING = 12;
const LEADERBOARD_ITEM_SPACING = 4;
const PROMPT_TOP_PAD = 24;
const LEADERBOARD_TOP_PAD = 16;
const LEADERBOARD_ROW_STAGGER_MS = 100;

export class VictoryScene extends Phaser.Scene {
	declare rexUI: UIPlugin;

	private canAcceptInput = false;
	private gpButtonWasDown = true;

	constructor() {
		super({ key: "VictoryScene" });
	}

	create(data?: { timeMs: number }): void {
		this.events.on("shutdown", () => {
			this.input.removeAllListeners();
			if (this.input.keyboard) this.input.keyboard.removeAllListeners();
		});

		this.canAcceptInput = false;
		this.gpButtonWasDown = true;

		const { width, height } = this.cameras.main;
		const cx = width / 2;
		const cy = height / 2;

		// Golden background
		this.cameras.main.setBackgroundColor(VICTORY_BG_COLOR);

		// Golden overlay using rexUI roundRectangle
		this.rexUI.add.roundRectangle(
			cx,
			cy,
			width,
			height,
			0,
			VICTORY_OVERLAY_COLOR,
			VICTORY_OVERLAY_ALPHA,
		);

		// Title with rounded background
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
			.text(0, 0, "YOU REACHED THE SKY!", {
				fontSize: VICTORY_TITLE_FONT_SIZE,
				color: VICTORY_TITLE_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION);

		const titleLabel = this.rexUI.add.label({
			background: titleBg,
			text: titleText,
			space: TITLE_BG_PAD,
			align: "center",
		});

		// Time display
		const timeMs = data?.timeMs ?? 0;
		const timeStr = formatTimeMs(timeMs);

		const timeText = this.add
			.text(0, 0, `Time: ${timeStr}`, {
				fontSize: VICTORY_TIME_FONT_SIZE,
				color: VICTORY_TIME_COLOR,
			})
			.setResolution(TEXT_RESOLUTION);

		// Subtitle
		const subtitleText = this.add
			.text(0, 0, "You escaped the rising lava!", {
				fontSize: VICTORY_SUBTITLE_FONT_SIZE,
				color: VICTORY_SUBTITLE_COLOR,
			})
			.setResolution(TEXT_RESOLUTION);

		// High score check
		const position = saveHighScore(timeMs);

		// High score notification (conditionally created)
		const hsText =
			position !== null
				? this.add
						.text(0, 0, `NEW HIGH SCORE! #${position}`, {
							fontSize: VICTORY_HIGH_SCORE_FONT_SIZE,
							color: VICTORY_HIGH_SCORE_COLOR,
							fontStyle: "bold",
						})
						.setResolution(TEXT_RESOLUTION)
				: null;

		// Leaderboard header
		const lbHeaderText = this.add
			.text(0, 0, "TOP TIMES", {
				fontSize: VICTORY_LEADERBOARD_FONT_SIZE,
				color: VICTORY_LEADERBOARD_HEADER_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION);

		// Leaderboard rows
		const scores = loadHighScores();
		const leaderboardRows: Phaser.GameObjects.Text[] = [];

		for (let i = 0; i < HIGH_SCORES_MAX; i++) {
			const entry = scores[i];
			const text = entry
				? `#${i + 1}  ${formatTimeMs(entry.timeMs)}`
				: `#${i + 1}  ---`;
			const isCurrentScore = position !== null && i === position - 1;
			const color = isCurrentScore
				? VICTORY_SCORE_HIGHLIGHT_COLOR
				: VICTORY_SCORE_COLOR;

			const row = this.add
				.text(0, 0, text, {
					fontSize: VICTORY_LEADERBOARD_FONT_SIZE,
					color,
					fontStyle: isCurrentScore ? "bold" : "",
				})
				.setResolution(TEXT_RESOLUTION);
			leaderboardRows.push(row);
		}

		// Prompt
		const promptText = this.add
			.text(0, 0, "Press any key or button to continue", {
				fontSize: VICTORY_PROMPT_FONT_SIZE,
				color: VICTORY_PROMPT_COLOR,
			})
			.setResolution(TEXT_RESOLUTION);

		// Leaderboard sub-sizer
		const lbSizer = this.rexUI.add.sizer({
			orientation: "vertical",
			space: { item: LEADERBOARD_ITEM_SPACING },
		});
		lbSizer.add(lbHeaderText, { align: "center" });
		for (const row of leaderboardRows) {
			lbSizer.add(row, { align: "center" });
		}

		// Main vertical sizer
		const sizer = this.rexUI.add
			.sizer({
				x: cx,
				y: cy,
				orientation: "vertical",
				space: { item: SIZER_ITEM_SPACING },
			})
			.add(titleLabel, { align: "center" })
			.add(timeText, { align: "center" })
			.add(subtitleText, { align: "center" });

		if (hsText) {
			sizer.add(hsText, { align: "center" });
		}

		sizer
			.add(lbSizer, {
				align: "center",
				padding: { top: LEADERBOARD_TOP_PAD },
			})
			.add(promptText, {
				align: "center",
				padding: { top: PROMPT_TOP_PAD },
			})
			.layout();

		// Fade-in tweens
		titleLabel.setAlpha(0);
		this.tweens.add({
			targets: titleLabel,
			alpha: 1,
			scaleX: VICTORY_TITLE_SCALE_UP,
			scaleY: VICTORY_TITLE_SCALE_UP,
			duration: VICTORY_TITLE_FADE_DURATION,
			ease: "Back.easeOut",
		});

		timeText.setAlpha(0);
		this.tweens.add({
			targets: timeText,
			alpha: 1,
			duration: VICTORY_TIME_FADE_DURATION,
			delay: VICTORY_TIME_FADE_DELAY,
		});

		subtitleText.setAlpha(0);
		this.tweens.add({
			targets: subtitleText,
			alpha: 1,
			duration: VICTORY_SUBTITLE_FADE_DURATION,
			delay: VICTORY_SUBTITLE_FADE_DELAY,
		});

		if (hsText) {
			hsText.setAlpha(0);
			this.tweens.add({
				targets: hsText,
				alpha: 1,
				duration: VICTORY_TIME_FADE_DURATION,
				delay: VICTORY_HIGH_SCORE_FADE_DELAY,
			});
		}

		lbHeaderText.setAlpha(0);
		this.tweens.add({
			targets: lbHeaderText,
			alpha: 1,
			duration: VICTORY_TIME_FADE_DURATION,
			delay: VICTORY_LEADERBOARD_FADE_DELAY,
		});

		for (let i = 0; i < leaderboardRows.length; i++) {
			leaderboardRows[i].setAlpha(0);
			this.tweens.add({
				targets: leaderboardRows[i],
				alpha: 1,
				duration: VICTORY_TIME_FADE_DURATION,
				delay:
					VICTORY_LEADERBOARD_FADE_DELAY + (i + 1) * LEADERBOARD_ROW_STAGGER_MS,
			});
		}

		promptText.setAlpha(0);
		this.tweens.add({
			targets: promptText,
			alpha: 1,
			duration: VICTORY_PROMPT_FADE_DURATION,
			delay: VICTORY_PROMPT_FADE_DELAY,
			onComplete: () => {
				this.tweens.add({
					targets: promptText,
					alpha: VICTORY_PROMPT_PULSE_ALPHA,
					duration: VICTORY_PROMPT_PULSE_DURATION,
					yoyo: true,
					repeat: -1,
				});
			},
		});

		// Golden sparkle particles (standalone, outside sizer)
		for (let i = 0; i < VICTORY_SPARKLE_COUNT; i++) {
			const px = Math.random() * width;
			const py = Math.random() * height;
			const dot = this.add.circle(
				px,
				py,
				VICTORY_SPARKLE_RADIUS,
				VICTORY_SPARKLE_COLOR,
				VICTORY_SPARKLE_ALPHA_MIN + Math.random() * VICTORY_SPARKLE_ALPHA_RANGE,
			);
			this.tweens.add({
				targets: dot,
				y:
					py -
					VICTORY_SPARKLE_DRIFT_MIN -
					Math.random() * VICTORY_SPARKLE_DRIFT_RANGE,
				alpha: 0,
				duration:
					VICTORY_SPARKLE_DURATION_MIN +
					Math.random() * VICTORY_SPARKLE_DURATION_RANGE,
				repeat: -1,
				yoyo: true,
				delay: Math.random() * VICTORY_SPARKLE_DELAY_RANGE,
			});
		}

		// Accept input after delay
		this.time.delayedCall(VICTORY_INPUT_DELAY, () => {
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

		if (anyButtonDown && !this.gpButtonWasDown) {
			this.scene.start("TitleScene");
		}
		this.gpButtonWasDown = anyButtonDown;
	}
}
