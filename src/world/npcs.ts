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

export interface NPC {
	x: number;
	y: number;
	container: Phaser.GameObjects.Container;
	dialogueLines: string[];
	isActive: boolean;
}

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

export const createNpcs = (
	scene: Phaser.Scene,
	spawnPositions: { x: number; y: number }[],
): NPC[] => {
	return spawnPositions.map((pos) => {
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

		const container = scene.add.container(pos.x, pos.y, [
			body,
			head,
			leftEye,
			rightEye,
		]);
		container.setDepth(NPC_CONTAINER_DEPTH);

		// Idle bob tween
		scene.tweens.add({
			targets: container,
			y: pos.y - NPC_BOB_AMPLITUDE,
			duration: NPC_BOB_DURATION,
			yoyo: true,
			repeat: -1,
			ease: "Sine.easeInOut",
		});

		return {
			x: pos.x,
			y: pos.y,
			container,
			dialogueLines: pickRandomLines(NPC_DIALOGUE_LINE_COUNT),
			isActive: false,
		};
	});
};

interface SpeechBubble {
	container: Phaser.GameObjects.Container;
	npcIndex: number;
	currentLineIndex: number;
	cycleTimer: number;
	fadeTween: Phaser.Tweens.Tween | null;
}

export interface NpcManager {
	npcs: NPC[];
	bubbles: Map<number, SpeechBubble>;
}

export const createNpcManager = (
	scene: Phaser.Scene,
	spawnPositions: { x: number; y: number }[],
): NpcManager => {
	const npcs = createNpcs(scene, spawnPositions);
	return {
		npcs,
		bubbles: new Map(),
	};
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

const createSpeechBubble = (
	scene: Phaser.Scene,
	npc: NPC,
	npcIndex: number,
	text: string,
): SpeechBubble => {
	const { bg, textObj, bubbleHeight } = buildBubbleContent(scene, text);

	const bubbleContainer = scene.add.container(
		npc.container.x,
		npc.container.y - NPC_BUBBLE_OFFSET_Y - bubbleHeight / 2,
		[bg, textObj],
	);
	bubbleContainer.setDepth(NPC_BUBBLE_DEPTH);
	bubbleContainer.setAlpha(0);

	// Fade in
	scene.tweens.add({
		targets: bubbleContainer,
		alpha: 1,
		duration: NPC_BUBBLE_FADE_DURATION,
	});

	return {
		container: bubbleContainer,
		npcIndex,
		currentLineIndex: 0,
		cycleTimer: 0,
		fadeTween: null,
	};
};

const updateBubbleText = (
	scene: Phaser.Scene,
	bubble: SpeechBubble,
	npc: NPC,
): void => {
	bubble.container.removeAll(true);

	const text = npc.dialogueLines[bubble.currentLineIndex];
	const { bg, textObj, bubbleHeight } = buildBubbleContent(scene, text);

	bubble.container.add([bg, textObj]);
	bubble.container.setPosition(
		npc.container.x,
		npc.container.y - NPC_BUBBLE_OFFSET_Y - bubbleHeight / 2,
	);
};

export const updateNpcs = (
	scene: Phaser.Scene,
	manager: NpcManager,
	playerX: number,
	playerY: number,
	delta: number,
): void => {
	const interactDist = NPC_INTERACT_RANGE * TILE_SIZE;

	for (let i = 0; i < manager.npcs.length; i++) {
		const npc = manager.npcs[i];
		const dx = playerX - npc.x;
		const dy = playerY - npc.y;
		const dist = Math.sqrt(dx * dx + dy * dy);

		const inRange = dist <= interactDist;
		const existingBubble = manager.bubbles.get(i);

		if (inRange && !existingBubble) {
			// Player just entered range: show speech bubble
			npc.isActive = true;
			const bubble = createSpeechBubble(scene, npc, i, npc.dialogueLines[0]);
			manager.bubbles.set(i, bubble);
		} else if (inRange && existingBubble) {
			// Player still in range: cycle dialogue
			existingBubble.cycleTimer += delta;
			if (existingBubble.cycleTimer >= NPC_DIALOGUE_CYCLE_MS) {
				existingBubble.cycleTimer = 0;
				existingBubble.currentLineIndex =
					(existingBubble.currentLineIndex + 1) % npc.dialogueLines.length;
				updateBubbleText(scene, existingBubble, npc);
			}

			// Keep bubble position synced with NPC bob
			const textObj = existingBubble.container.getAll()[1] as
				| Phaser.GameObjects.Text
				| undefined;
			const bubbleHeight = textObj
				? textObj.height + NPC_BUBBLE_PADDING_Y * 2
				: NPC_BUBBLE_FALLBACK_HEIGHT;
			existingBubble.container.setPosition(
				npc.container.x,
				npc.container.y - NPC_BUBBLE_OFFSET_Y - bubbleHeight / 2,
			);
		} else if (!inRange && existingBubble) {
			// Player left range: fade out and remove
			npc.isActive = false;
			if (!existingBubble.fadeTween) {
				existingBubble.fadeTween = scene.tweens.add({
					targets: existingBubble.container,
					alpha: 0,
					duration: NPC_BUBBLE_FADE_DURATION,
					onComplete: () => {
						existingBubble.container.destroy();
						manager.bubbles.delete(i);
					},
				});
			}
		}
	}
};
