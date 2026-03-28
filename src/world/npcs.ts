import {
	NPC_BOB_AMPLITUDE,
	NPC_BOB_DURATION,
	NPC_BODY_COLOR,
	NPC_BODY_HEIGHT,
	NPC_BODY_WIDTH,
	NPC_BUBBLE_ALPHA,
	NPC_BUBBLE_BG_COLOR,
	NPC_BUBBLE_CORNER_RADIUS,
	NPC_BUBBLE_DEPTH,
	NPC_BUBBLE_FADE_DURATION,
	NPC_BUBBLE_FALLBACK_HEIGHT,
	NPC_BUBBLE_FONT_SIZE,
	NPC_BUBBLE_MAX_WIDTH,
	NPC_BUBBLE_OFFSET_Y,
	NPC_BUBBLE_PADDING_X,
	NPC_BUBBLE_PADDING_Y,
	NPC_BUBBLE_POINTER_SIZE,
	NPC_CONTAINER_DEPTH,
	NPC_COUNT,
	NPC_DIALOGUE_CYCLE_MS,
	NPC_DIALOGUE_LINE_COUNT,
	NPC_EYE_COLOR,
	NPC_EYE_OFFSET_X,
	NPC_EYE_RADIUS,
	NPC_HEAD_COLOR,
	NPC_HEAD_RADIUS,
	NPC_INTERACT_RANGE,
	TILE_SIZE,
} from "../config";
import type { Island } from "../types";

const DIALOGUE_POOL: string[] = [
	"The view from up here is amazing!",
	"Watch out for the lava! It's getting closer...",
	"I found an apple tree on the next island!",
	"Have you tried double jumping? It's quite fun!",
	"I've been stuck on this island for 3 cycles now...",
	"The golden light at the top... what do you think it is?",
	"If you hold jump while falling, you can glide!",
	"I once tried to swim in the lava. Once.",
	"These mushrooms look suspicious, don't they?",
	"Do you ever wonder who built these islands?",
	"I heard there's crystal blocks on an island nearby.",
	"My friend fell into the void yesterday. Don't ask.",
	"Tip: collect fruit to earn extra lives!",
	"The night is dark and full of... well, darkness.",
	"I tried stacking blocks to the top. Got tired at row 12.",
	"Did you know you can break blocks with left click?",
	"Right click places blocks. Revolutionary, I know.",
	"The moss on those stones makes them extra slippery... just kidding.",
	"I keep hearing rumbling from below. Probably nothing.",
	"Legend says if you reach the golden light, you win!",
	"This island used to be bigger. Then the lava came.",
	"I collect flowers as a hobby. Don't judge me.",
	"Have you met the others? There are a few of us left.",
	"Sometimes I just stand here and enjoy the breeze.",
	"Pro tip: sand islands have pears. Pears are the best.",
];

const pickRandomLines = (count: number): string[] => {
	const shuffled = [...DIALOGUE_POOL].sort(() => Math.random() - 0.5);
	return shuffled.slice(0, count);
};

export const pickNpcSpawnPositions = (
	islands: Island[],
): { x: number; y: number }[] => {
	// Exclude the home island (index 0) from NPC spawning
	const candidates = islands.slice(1);
	if (candidates.length === 0) return [];

	const shuffled = [...candidates].sort(() => Math.random() - 0.5);
	const count = Math.min(NPC_COUNT, shuffled.length);
	const positions: { x: number; y: number }[] = [];

	for (let i = 0; i < count; i++) {
		const island = shuffled[i];
		// Place the NPC on the surface, roughly centered
		const tileX = island.x + Math.floor(island.width / 2);
		const tileY = island.y - 1; // one tile above the surface
		positions.push({
			x: tileX * TILE_SIZE + TILE_SIZE / 2,
			y: tileY * TILE_SIZE + TILE_SIZE / 2,
		});
	}

	return positions;
};

/** Build the text + background graphics for a speech bubble and return them. */
const buildBubbleContent = (
	scene: Phaser.Scene,
	text: string,
): {
	bg: Phaser.GameObjects.Graphics;
	textObj: Phaser.GameObjects.Text;
	bubbleHeight: number;
} => {
	const textObj = scene.add.text(0, 0, text, {
		fontSize: NPC_BUBBLE_FONT_SIZE,
		color: "#ffffff",
		wordWrap: { width: NPC_BUBBLE_MAX_WIDTH - NPC_BUBBLE_PADDING_X * 2 },
		align: "center",
	});
	textObj.setResolution(2);
	textObj.setOrigin(0.5, 0.5);

	const bubbleWidth =
		Math.min(textObj.width, NPC_BUBBLE_MAX_WIDTH) + NPC_BUBBLE_PADDING_X * 2;
	const bubbleHeight = textObj.height + NPC_BUBBLE_PADDING_Y * 2;

	const bg = scene.add.graphics();
	bg.fillStyle(NPC_BUBBLE_BG_COLOR, NPC_BUBBLE_ALPHA);
	bg.fillRoundedRect(
		-bubbleWidth / 2,
		-bubbleHeight / 2,
		bubbleWidth,
		bubbleHeight,
		NPC_BUBBLE_CORNER_RADIUS,
	);
	bg.fillTriangle(
		-NPC_BUBBLE_POINTER_SIZE,
		bubbleHeight / 2,
		NPC_BUBBLE_POINTER_SIZE,
		bubbleHeight / 2,
		0,
		bubbleHeight / 2 + NPC_BUBBLE_POINTER_SIZE,
	);

	return { bg, textObj, bubbleHeight };
};

export class Npc extends Phaser.GameObjects.Container {
	private dialogueLines: string[];
	private bubble: Phaser.GameObjects.Container | null = null;
	private dialogueIndex = 0;
	private dialogueTimer = 0;
	private fadeTween: Phaser.Tweens.Tween | null = null;
	private spawnX: number;
	private spawnY: number;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y);
		scene.add.existing(this);

		this.spawnX = x;
		this.spawnY = y;

		// Body (small colored rectangle)
		const body = scene.add.rectangle(
			0,
			0,
			NPC_BODY_WIDTH,
			NPC_BODY_HEIGHT,
			NPC_BODY_COLOR,
		);

		// Head (circle on top)
		const head = scene.add.circle(
			0,
			-NPC_BODY_HEIGHT / 2 - NPC_HEAD_RADIUS,
			NPC_HEAD_RADIUS,
			NPC_HEAD_COLOR,
		);

		// Tiny eyes for character
		const eyeY = -NPC_BODY_HEIGHT / 2 - NPC_HEAD_RADIUS;
		const leftEye = scene.add.circle(
			-NPC_EYE_OFFSET_X,
			eyeY,
			NPC_EYE_RADIUS,
			NPC_EYE_COLOR,
		);
		const rightEye = scene.add.circle(
			NPC_EYE_OFFSET_X,
			eyeY,
			NPC_EYE_RADIUS,
			NPC_EYE_COLOR,
		);

		this.add([body, head, leftEye, rightEye]);
		this.setDepth(NPC_CONTAINER_DEPTH);

		// Pick random dialogue
		this.dialogueLines = pickRandomLines(NPC_DIALOGUE_LINE_COUNT);

		// Idle bob tween
		scene.tweens.add({
			targets: this,
			y: y - NPC_BOB_AMPLITUDE,
			duration: NPC_BOB_DURATION,
			yoyo: true,
			repeat: -1,
			ease: "Sine.easeInOut",
		});
	}

	update = (playerX: number, playerY: number, delta: number): void => {
		const interactDist = NPC_INTERACT_RANGE * TILE_SIZE;
		const dx = playerX - this.spawnX;
		const dy = playerY - this.spawnY;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const inRange = dist <= interactDist;

		if (inRange && !this.bubble) {
			// Player just entered range: show speech bubble
			this.dialogueIndex = 0;
			this.dialogueTimer = 0;
			this.fadeTween = null;
			this.createBubble();
		} else if (inRange && this.bubble) {
			// Player still in range: cycle dialogue
			this.dialogueTimer += delta;
			if (this.dialogueTimer >= NPC_DIALOGUE_CYCLE_MS) {
				this.dialogueTimer = 0;
				this.dialogueIndex =
					(this.dialogueIndex + 1) % this.dialogueLines.length;
				this.updateBubbleText();
			}

			// Keep bubble position synced with NPC bob
			this.syncBubblePosition();
		} else if (!inRange && this.bubble) {
			// Player left range: fade out and remove
			if (!this.fadeTween) {
				this.fadeTween = this.scene.tweens.add({
					targets: this.bubble,
					alpha: 0,
					duration: NPC_BUBBLE_FADE_DURATION,
					onComplete: () => {
						this.bubble?.destroy();
						this.bubble = null;
						this.fadeTween = null;
					},
				});
			}
		}
	};

	private createBubble = (): void => {
		const text = this.dialogueLines[this.dialogueIndex];
		const { bg, textObj, bubbleHeight } = buildBubbleContent(this.scene, text);

		this.bubble = this.scene.add.container(
			this.x,
			this.y - NPC_BUBBLE_OFFSET_Y - bubbleHeight / 2,
			[bg, textObj],
		);
		this.bubble.setDepth(NPC_BUBBLE_DEPTH);
		this.bubble.setAlpha(0);

		// Fade in
		this.scene.tweens.add({
			targets: this.bubble,
			alpha: 1,
			duration: NPC_BUBBLE_FADE_DURATION,
		});
	};

	private updateBubbleText = (): void => {
		if (!this.bubble) return;

		this.bubble.removeAll(true);

		const text = this.dialogueLines[this.dialogueIndex];
		const { bg, textObj, bubbleHeight } = buildBubbleContent(this.scene, text);

		this.bubble.add([bg, textObj]);
		this.bubble.setPosition(
			this.x,
			this.y - NPC_BUBBLE_OFFSET_Y - bubbleHeight / 2,
		);
	};

	private syncBubblePosition = (): void => {
		if (!this.bubble) return;

		const textObj = this.bubble.getAll()[1] as
			| Phaser.GameObjects.Text
			| undefined;
		const bubbleHeight = textObj
			? textObj.height + NPC_BUBBLE_PADDING_Y * 2
			: NPC_BUBBLE_FALLBACK_HEIGHT;
		this.bubble.setPosition(
			this.x,
			this.y - NPC_BUBBLE_OFFSET_Y - bubbleHeight / 2,
		);
	};
}
