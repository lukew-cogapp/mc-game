import Phaser from "phaser";
import { COLORS } from "./config";
import { GameOverScene } from "./scenes/game-over-scene";
import { GameScene } from "./scenes/game-scene";
import { TitleScene } from "./scenes/title-scene";

const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundColor: `#${COLORS.void.toString(16).padStart(6, "0")}`,
	parent: document.body,
	scene: [TitleScene, GameScene, GameOverScene],
	roundPixels: true,
	pixelArt: true,
	scale: {
		mode: Phaser.Scale.RESIZE,
		autoCenter: Phaser.Scale.CENTER_BOTH,
	},
	input: {
		mouse: {
			preventDefaultWheel: true,
		},
		gamepad: true,
	},
};

new Phaser.Game(config);
