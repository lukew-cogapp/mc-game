import {
	COLORS,
	DEATH_INVULNERABLE_MS,
	GAMEPAD_STICK_DEADZONE,
	GLIDE_GRAVITY,
	GLIDE_HORIZONTAL_BOOST,
	GRAVITY,
	JUMP_VELOCITY,
	PLAYER_HEIGHT,
	PLAYER_OUTLINE_OFFSET,
	PLAYER_SHADOW_ALPHA,
	PLAYER_SPEED,
	PLAYER_WIDTH,
	STARTING_LIVES,
	TILE_SIZE,
	WATER_SPEED_MULTIPLIER,
} from "../config";
import type { CharacterConfig } from "../scenes/title-scene";
import { BlockType } from "../types";

const HAT_EMOJI_MAP: Record<string, string> = {
	tophat: "\u{1f3a9}",
	crown: "\u{1f451}",
	propeller: "\u{1fa81}",
	antenna: "\u{1f4e1}",
	halo: "\u{1f607}",
	horns: "\u{1f608}",
	party: "\u{1f389}",
	poo: "\u{1f4a9}",
};

import { drawFace } from "./face-renderer";

const TRAIL_EMOJI_MAP: Record<string, string> = {
	sparkles: "\u2728",
	hearts: "\u{1f496}",
	bubbles: "\u{1fae7}",
	fire: "\u{1f525}",
	rainbow: "\u{1f308}",
};

export interface Player {
	container: Phaser.GameObjects.Container;
	velocityX: number;
	velocityY: number;
	isGrounded: boolean;
	isGliding: boolean;
	facingRight: boolean;
	spawnX: number;
	spawnY: number;
	trail: string;
	trailTimer: number;
	lives: number;
	invulnerableTimer: number;
	fruitEaten: number;
}

export const createPlayer = (
	scene: Phaser.Scene,
	x: number,
	y: number,
	characterConfig?: CharacterConfig,
): Player => {
	const bodyColor = characterConfig?.bodyColor ?? COLORS.playerBody;
	const skinColor = characterConfig?.skinColor ?? COLORS.playerHead;

	// Shadow ellipse under player's feet for grounding
	const footShadow = scene.add.ellipse(
		0,
		PLAYER_HEIGHT / 2 + 2,
		PLAYER_WIDTH + 4,
		6,
		0x000000,
		PLAYER_SHADOW_ALPHA,
	);

	// Dark outline behind body for definition
	const bodyOutline = scene.add.rectangle(
		PLAYER_OUTLINE_OFFSET,
		PLAYER_OUTLINE_OFFSET,
		PLAYER_WIDTH + 2,
		PLAYER_HEIGHT + 2,
		0x000000,
	);
	bodyOutline.setAlpha(0.3);

	const body = scene.add.rectangle(
		0,
		0,
		PLAYER_WIDTH,
		PLAYER_HEIGHT,
		bodyColor,
	);
	const head = scene.add.circle(0, -PLAYER_HEIGHT / 2 - 4, 6, skinColor);

	const children: Phaser.GameObjects.GameObject[] = [
		footShadow,
		bodyOutline,
		body,
		head,
	];

	// Hat
	const hatKey = characterConfig?.hat ?? "none";
	if (hatKey !== "none" && HAT_EMOJI_MAP[hatKey]) {
		const hat = scene.add
			.text(0, -PLAYER_HEIGHT / 2 - 16, HAT_EMOJI_MAP[hatKey], {
				fontSize: "12px",
			})
			.setOrigin(0.5);
		children.push(hat);
	}

	// Face expression (drawn on head)
	const faceKey = characterConfig?.face ?? "none";
	if (faceKey !== "none") {
		const faceGfx = scene.add.graphics();
		faceGfx.setPosition(0, -PLAYER_HEIGHT / 2 - 4);
		drawFace(faceGfx, faceKey);
		children.push(faceGfx);
	}

	const container = scene.add.container(x, y, children);

	return {
		container,
		velocityX: 0,
		velocityY: 0,
		isGrounded: false,
		isGliding: false,
		facingRight: true,
		spawnX: x,
		spawnY: y,
		trail: characterConfig?.trail ?? "none",
		trailTimer: 0,
		lives: STARTING_LIVES,
		invulnerableTimer: 0,
		fruitEaten: 0,
	};
};

const NON_SOLID_BLOCKS: ReadonlySet<BlockType> = new Set([
	BlockType.Air,
	BlockType.Water,
	BlockType.Flower,
	BlockType.Mushroom,
	BlockType.Apple,
	BlockType.Pear,
	BlockType.Peach,
	BlockType.Strawberry,
	BlockType.Berry,
]);

const checkCollision = (
	grid: BlockType[][],
	worldX: number,
	worldY: number,
): boolean => {
	const gridX = Math.floor(worldX / TILE_SIZE);
	const gridY = Math.floor(worldY / TILE_SIZE);
	if (
		gridX < 0 ||
		gridY < 0 ||
		gridY >= grid.length ||
		gridX >= grid[0].length
	) {
		return false;
	}
	return !NON_SOLID_BLOCKS.has(grid[gridY][gridX]);
};

const isInWater = (
	grid: BlockType[][],
	worldX: number,
	worldY: number,
): boolean => {
	const gridX = Math.floor(worldX / TILE_SIZE);
	const gridY = Math.floor(worldY / TILE_SIZE);
	if (
		gridX < 0 ||
		gridY < 0 ||
		gridY >= grid.length ||
		gridX >= grid[0].length
	) {
		return false;
	}
	return grid[gridY][gridX] === BlockType.Water;
};

export interface GameInput {
	left: boolean;
	right: boolean;
	up: boolean;
	jump: boolean;
}

/**
 * Read the raw browser Gamepad API directly.
 * This bypasses Phaser's GamepadPlugin entirely and is reliable across scene transitions.
 */
const readBrowserGamepad = (): {
	left: boolean;
	right: boolean;
	jump: boolean;
	lb: boolean;
	rb: boolean;
	x: boolean;
	b: boolean;
} => {
	const none = {
		left: false,
		right: false,
		jump: false,
		lb: false,
		rb: false,
		x: false,
		b: false,
	};
	const pads = navigator.getGamepads?.();
	if (!pads) return none;

	for (const pad of pads) {
		if (!pad?.connected) continue;
		// Skip non-gamepad devices (audio remotes, etc.)
		if (pad.axes.length < 2 || pad.buttons.length < 10) continue;

		const stickH = pad.axes[0] ?? 0;
		const dpadLeft = pad.buttons[14]?.pressed ?? false;
		const dpadRight = pad.buttons[15]?.pressed ?? false;

		return {
			left: stickH < -GAMEPAD_STICK_DEADZONE || dpadLeft,
			right: stickH > GAMEPAD_STICK_DEADZONE || dpadRight,
			jump: pad.buttons[0]?.pressed ?? false,
			lb: pad.buttons[4]?.pressed ?? false,
			rb: pad.buttons[5]?.pressed ?? false,
			x: pad.buttons[2]?.pressed ?? false,
			b: pad.buttons[1]?.pressed ?? false,
		};
	}

	return none;
};

export const createGameInput = (
	cursors: Phaser.Types.Input.Keyboard.CursorKeys,
	wasd: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	},
	space: Phaser.Input.Keyboard.Key,
): GameInput => {
	// Keyboard
	const kbLeft = cursors.left.isDown || wasd.A.isDown;
	const kbRight = cursors.right.isDown || wasd.D.isDown;
	const kbUp = cursors.up.isDown || wasd.W.isDown;
	const kbJump = kbUp || space.isDown;

	// Gamepad (raw browser API — reliable across scene transitions)
	const gp = readBrowserGamepad();

	return {
		left: kbLeft || gp.left,
		right: kbRight || gp.right,
		up: kbUp || gp.jump,
		jump: kbJump || gp.jump,
	};
};

/** Read extra gamepad buttons for UI and actions */
export const readGamepadButtons = (): {
	lb: boolean;
	rb: boolean;
	x: boolean;
	b: boolean;
} => {
	const gp = readBrowserGamepad();
	return { lb: gp.lb, rb: gp.rb, x: gp.x, b: gp.b };
};

export const updatePlayer = (
	player: Player,
	input: GameInput,
	grid: BlockType[][],
	lavaY: number,
	delta: number,
): boolean => {
	// Tick invulnerability
	if (player.invulnerableTimer > 0) {
		player.invulnerableTimer -= delta;
		// Flash effect during invulnerability
		player.container.setAlpha(
			Math.sin(player.invulnerableTimer * 0.01) > 0 ? 1 : 0.3,
		);
	} else {
		player.container.setAlpha(1);
	}

	const dt = delta / 1000;
	const halfW = PLAYER_WIDTH / 2;
	const halfH = PLAYER_HEIGHT / 2;

	// Check if player is submerged in water
	const inWater = isInWater(grid, player.container.x, player.container.y);
	const speedMultiplier = inWater ? WATER_SPEED_MULTIPLIER : 1;

	// Horizontal input
	player.velocityX = 0;
	if (input.left) {
		player.velocityX = -PLAYER_SPEED * speedMultiplier;
		player.facingRight = false;
	} else if (input.right) {
		player.velocityX = PLAYER_SPEED * speedMultiplier;
		player.facingRight = true;
	}

	// Gliding
	player.isGliding = !player.isGrounded && input.jump && player.velocityY > 0;
	if (player.isGliding) {
		player.velocityX *= GLIDE_HORIZONTAL_BOOST;
	}

	// Gravity
	const currentGravity = player.isGliding ? GLIDE_GRAVITY : GRAVITY;
	player.velocityY += currentGravity * dt;

	// Jump
	if (input.jump && player.isGrounded) {
		player.velocityY = JUMP_VELOCITY;
		player.isGrounded = false;
	}

	// Move horizontally
	const newX = player.container.x + player.velocityX * dt;
	const footY = player.container.y + halfH - 1;
	const headY = player.container.y - halfH;

	const collidesLeft =
		checkCollision(grid, newX - halfW, footY) ||
		checkCollision(grid, newX - halfW, headY);
	const collidesRight =
		checkCollision(grid, newX + halfW, footY) ||
		checkCollision(grid, newX + halfW, headY);

	if (player.velocityX < 0 && !collidesLeft) {
		player.container.x = newX;
	} else if (player.velocityX > 0 && !collidesRight) {
		player.container.x = newX;
	}

	// Move vertically
	const newY = player.container.y + player.velocityY * dt;

	// Check feet (falling)
	if (player.velocityY > 0) {
		const leftFoot = checkCollision(
			grid,
			player.container.x - halfW + 2,
			newY + halfH,
		);
		const rightFoot = checkCollision(
			grid,
			player.container.x + halfW - 2,
			newY + halfH,
		);
		if (leftFoot || rightFoot) {
			// Snap to top of tile
			const gridY = Math.floor((newY + halfH) / TILE_SIZE);
			player.container.y = gridY * TILE_SIZE - halfH;
			player.velocityY = 0;
			player.isGrounded = true;
		} else {
			player.container.y = newY;
			player.isGrounded = false;
		}
	} else if (player.velocityY < 0) {
		// Check head (jumping)
		const leftHead = checkCollision(
			grid,
			player.container.x - halfW + 2,
			newY - halfH,
		);
		const rightHead = checkCollision(
			grid,
			player.container.x + halfW - 2,
			newY - halfH,
		);
		if (leftHead || rightHead) {
			player.velocityY = 0;
		} else {
			player.container.y = newY;
		}
	}

	// Check grounded (for next frame)
	const groundCheckLeft = checkCollision(
		grid,
		player.container.x - halfW + 2,
		player.container.y + halfH + 1,
	);
	const groundCheckRight = checkCollision(
		grid,
		player.container.x + halfW - 2,
		player.container.y + halfH + 1,
	);
	player.isGrounded = groundCheckLeft || groundCheckRight;

	// Lava death
	if (player.container.y + halfH >= lavaY && player.invulnerableTimer <= 0) {
		player.lives--;
		if (player.lives <= 0) {
			return true; // Game over
		}
		// Respawn with brief invulnerability
		player.container.x = player.spawnX;
		player.container.y = player.spawnY;
		player.velocityX = 0;
		player.velocityY = 0;
		player.invulnerableTimer = DEATH_INVULNERABLE_MS;
	}

	// Visual: flip based on direction
	player.container.scaleX = player.facingRight ? 1 : -1;

	// Trail particles
	if (player.trail !== "none" && TRAIL_EMOJI_MAP[player.trail]) {
		player.trailTimer += delta;
		if (player.trailTimer > 150) {
			player.trailTimer = 0;
			const scene = player.container.scene;
			const emoji = TRAIL_EMOJI_MAP[player.trail];
			if (emoji) {
				const particle = scene.add.text(
					player.container.x + (Math.random() - 0.5) * 10,
					player.container.y + halfH,
					emoji,
					{ fontSize: "10px" },
				);
				scene.tweens.add({
					targets: particle,
					y: particle.y + 20,
					alpha: 0,
					duration: 600,
					onComplete: () => particle.destroy(),
				});
			}
		}
	}

	return false;
};
