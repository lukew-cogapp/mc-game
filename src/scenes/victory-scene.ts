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
	VICTORY_HIGH_SCORE_OFFSET_Y,
	VICTORY_INPUT_DELAY,
	VICTORY_LEADERBOARD_FADE_DELAY,
	VICTORY_LEADERBOARD_FONT_SIZE,
	VICTORY_LEADERBOARD_HEADER_COLOR,
	VICTORY_LEADERBOARD_OFFSET_Y,
	VICTORY_LEADERBOARD_ROW_HEIGHT,
	VICTORY_OVERLAY_ALPHA,
	VICTORY_OVERLAY_COLOR,
	VICTORY_PROMPT_COLOR,
	VICTORY_PROMPT_FADE_DELAY,
	VICTORY_PROMPT_FADE_DURATION,
	VICTORY_PROMPT_FONT_SIZE,
	VICTORY_PROMPT_OFFSET_Y,
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
	VICTORY_SUBTITLE_OFFSET_Y,
	VICTORY_TIME_COLOR,
	VICTORY_TIME_FADE_DELAY,
	VICTORY_TIME_FADE_DURATION,
	VICTORY_TIME_FONT_SIZE,
	VICTORY_TIME_OFFSET_Y,
	VICTORY_TITLE_COLOR,
	VICTORY_TITLE_FADE_DURATION,
	VICTORY_TITLE_FONT_SIZE,
	VICTORY_TITLE_OFFSET_Y,
	VICTORY_TITLE_SCALE_UP,
} from "../config";

export class VictoryScene extends Phaser.Scene {
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

		// Golden overlay
		const overlay = this.add.graphics();
		overlay.fillStyle(VICTORY_OVERLAY_COLOR, VICTORY_OVERLAY_ALPHA);
		overlay.fillRect(0, 0, width, height);

		// Victory text
		const title = this.add
			.text(cx, cy + VICTORY_TITLE_OFFSET_Y, "YOU REACHED THE SKY!", {
				fontSize: VICTORY_TITLE_FONT_SIZE,
				color: VICTORY_TITLE_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: title,
			alpha: 1,
			scaleX: VICTORY_TITLE_SCALE_UP,
			scaleY: VICTORY_TITLE_SCALE_UP,
			duration: VICTORY_TITLE_FADE_DURATION,
			ease: "Back.easeOut",
		});

		// Time display
		const timeMs = data?.timeMs ?? 0;
		const timeStr = formatTimeMs(timeMs);

		const timeLabel = this.add
			.text(cx, cy + VICTORY_TIME_OFFSET_Y, `Time: ${timeStr}`, {
				fontSize: VICTORY_TIME_FONT_SIZE,
				color: VICTORY_TIME_COLOR,
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: timeLabel,
			alpha: 1,
			duration: VICTORY_TIME_FADE_DURATION,
			delay: VICTORY_TIME_FADE_DELAY,
		});

		// Subtitle
		const subtitle = this.add
			.text(
				cx,
				cy + VICTORY_SUBTITLE_OFFSET_Y,
				"You escaped the rising lava!",
				{
					fontSize: VICTORY_SUBTITLE_FONT_SIZE,
					color: VICTORY_SUBTITLE_COLOR,
				},
			)
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: subtitle,
			alpha: 1,
			duration: VICTORY_SUBTITLE_FADE_DURATION,
			delay: VICTORY_SUBTITLE_FADE_DELAY,
		});

		// High score check
		const position = saveHighScore(timeMs);

		if (position !== null) {
			const hsLabel = this.add
				.text(
					cx,
					cy + VICTORY_HIGH_SCORE_OFFSET_Y,
					`NEW HIGH SCORE! #${position}`,
					{
						fontSize: VICTORY_HIGH_SCORE_FONT_SIZE,
						color: VICTORY_HIGH_SCORE_COLOR,
						fontStyle: "bold",
					},
				)
				.setResolution(TEXT_RESOLUTION)
				.setOrigin(0.5)
				.setAlpha(0);

			this.tweens.add({
				targets: hsLabel,
				alpha: 1,
				duration: VICTORY_TIME_FADE_DURATION,
				delay: VICTORY_HIGH_SCORE_FADE_DELAY,
			});
		}

		// Leaderboard
		const scores = loadHighScores();
		const leaderboardTop = cy + VICTORY_LEADERBOARD_OFFSET_Y;

		const lbHeader = this.add
			.text(cx, leaderboardTop, "TOP TIMES", {
				fontSize: VICTORY_LEADERBOARD_FONT_SIZE,
				color: VICTORY_LEADERBOARD_HEADER_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: lbHeader,
			alpha: 1,
			duration: VICTORY_TIME_FADE_DURATION,
			delay: VICTORY_LEADERBOARD_FADE_DELAY,
		});

		for (let i = 0; i < HIGH_SCORES_MAX; i++) {
			const rowY = leaderboardTop + VICTORY_LEADERBOARD_ROW_HEIGHT * (i + 1);
			const entry = scores[i];
			const text = entry
				? `#${i + 1}  ${formatTimeMs(entry.timeMs)}`
				: `#${i + 1}  ---`;
			const isCurrentScore = position !== null && i === position - 1;
			const color = isCurrentScore
				? VICTORY_SCORE_HIGHLIGHT_COLOR
				: VICTORY_SCORE_COLOR;

			const row = this.add
				.text(cx, rowY, text, {
					fontSize: VICTORY_LEADERBOARD_FONT_SIZE,
					color,
					fontStyle: isCurrentScore ? "bold" : "",
				})
				.setResolution(TEXT_RESOLUTION)
				.setOrigin(0.5)
				.setAlpha(0);

			this.tweens.add({
				targets: row,
				alpha: 1,
				duration: VICTORY_TIME_FADE_DURATION,
				delay: VICTORY_LEADERBOARD_FADE_DELAY + (i + 1) * 100,
			});
		}

		// Prompt
		const prompt = this.add
			.text(
				cx,
				cy + VICTORY_PROMPT_OFFSET_Y,
				"Press any key or button to continue",
				{
					fontSize: VICTORY_PROMPT_FONT_SIZE,
					color: VICTORY_PROMPT_COLOR,
				},
			)
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: prompt,
			alpha: 1,
			duration: VICTORY_PROMPT_FADE_DURATION,
			delay: VICTORY_PROMPT_FADE_DELAY,
			onComplete: () => {
				this.tweens.add({
					targets: prompt,
					alpha: VICTORY_PROMPT_PULSE_ALPHA,
					duration: VICTORY_PROMPT_PULSE_DURATION,
					yoyo: true,
					repeat: -1,
				});
			},
		});

		// Golden sparkle particles
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

		// Poll gamepad for any button
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

		if (anyButtonDown && !this.gpButtonWasDown) {
			this.scene.start("TitleScene");
		}
		this.gpButtonWasDown = anyButtonDown;
	}
}
