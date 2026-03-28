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

		this.cameras.main.setBackgroundColor(0x0a0a0a);

		const overlay = this.add.graphics();
		overlay.fillStyle(0x110000, 0.6);
		overlay.fillRect(0, 0, width, height);

		// GAME OVER text
		const title = this.add
			.text(cx, cy - 60, "GAME OVER", {
				fontSize: "64px",
				color: "#ff4444",
				fontStyle: "bold",
			})
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: title,
			alpha: 1,
			duration: 800,
			ease: "Power2",
		});

		const subtitle = this.add
			.text(cx, cy, "The lava claimed you...", {
				fontSize: "18px",
				color: "#cc8888",
			})
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: subtitle,
			alpha: 1,
			duration: 600,
			delay: 500,
		});

		const prompt = this.add
			.text(cx, cy + 80, "Press any key or button to continue", {
				fontSize: "16px",
				color: "#888888",
			})
			.setOrigin(0.5)
			.setAlpha(0);

		this.tweens.add({
			targets: prompt,
			alpha: 1,
			duration: 500,
			delay: 1500,
			onComplete: () => {
				this.tweens.add({
					targets: prompt,
					alpha: 0.4,
					duration: 800,
					yoyo: true,
					repeat: -1,
				});
			},
		});

		// Enable input after delay
		this.time.delayedCall(1500, () => {
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
