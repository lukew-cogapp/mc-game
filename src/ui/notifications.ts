import {
	NOTIFICATION_BG_ALPHA,
	NOTIFICATION_BG_COLOR,
	NOTIFICATION_DURATION,
	NOTIFICATION_FADE_DURATION,
	NOTIFICATION_FONT_SIZE,
	NOTIFICATION_MAX_VISIBLE,
	NOTIFICATION_OFFSET_X,
	NOTIFICATION_OFFSET_Y,
	NOTIFICATION_SPACING,
	TEXT_RESOLUTION,
	UI_DEPTH,
} from "../config";

interface ActiveNotification {
	container: Phaser.GameObjects.Container;
	timer: number;
}

export class NotificationManager {
	private scene: Phaser.Scene;
	private notifications: ActiveNotification[] = [];

	constructor(scene: Phaser.Scene) {
		this.scene = scene;
	}

	show = (message: string, color = "#ffffff"): void => {
		// Remove oldest if at max
		while (this.notifications.length >= NOTIFICATION_MAX_VISIBLE) {
			const old = this.notifications.shift();
			old?.container.destroy();
		}

		const cam = this.scene.cameras.main;
		const x = cam.width - NOTIFICATION_OFFSET_X;
		const y =
			cam.height / 2 +
			NOTIFICATION_OFFSET_Y +
			this.notifications.length * NOTIFICATION_SPACING;

		// Background
		const text = this.scene.add.text(0, 0, message, {
			fontSize: NOTIFICATION_FONT_SIZE,
			color,
			fontStyle: "bold",
		});
		text.setResolution(TEXT_RESOLUTION);
		text.setOrigin(1, 0.5);

		const bgWidth = text.width + 20;
		const bgHeight = text.height + 12;
		const bg = this.scene.add.rectangle(
			-bgWidth / 2 - 4,
			0,
			bgWidth,
			bgHeight,
			NOTIFICATION_BG_COLOR,
			NOTIFICATION_BG_ALPHA,
		);

		const container = this.scene.add.container(x, y, [bg, text]);
		container.setScrollFactor(0);
		container.setDepth(UI_DEPTH + 1);
		container.setAlpha(0);

		// Slide in from right
		container.x = x + 100;
		this.scene.tweens.add({
			targets: container,
			x,
			alpha: 1,
			duration: 200,
			ease: "Power2",
		});

		const notification: ActiveNotification = {
			container,
			timer: NOTIFICATION_DURATION,
		};
		this.notifications.push(notification);
	};

	update = (delta: number): void => {
		for (let i = this.notifications.length - 1; i >= 0; i--) {
			const n = this.notifications[i];
			n.timer -= delta;

			if (n.timer <= 0) {
				// Fade out and remove
				this.scene.tweens.add({
					targets: n.container,
					alpha: 0,
					x: n.container.x + 50,
					duration: NOTIFICATION_FADE_DURATION,
					onComplete: () => n.container.destroy(),
				});
				this.notifications.splice(i, 1);
			}
		}

		// Reposition remaining notifications (slide up when one is removed)
		const cam = this.scene.cameras.main;
		for (let i = 0; i < this.notifications.length; i++) {
			const targetY =
				cam.height / 2 + NOTIFICATION_OFFSET_Y + i * NOTIFICATION_SPACING;
			if (Math.abs(this.notifications[i].container.y - targetY) > 1) {
				this.scene.tweens.add({
					targets: this.notifications[i].container,
					y: targetY,
					duration: 150,
				});
			}
		}
	};

	destroy = (): void => {
		for (const n of this.notifications) {
			n.container.destroy();
		}
		this.notifications = [];
	};
}
