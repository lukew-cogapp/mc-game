import {
	COLORS,
	COYOTE_TIME_MS,
	DEATH_INVULNERABLE_MS,
	DOUBLE_JUMP_VELOCITY,
	GAMEPAD_STICK_DEADZONE,
	GLIDE_GRAVITY,
	GLIDE_HORIZONTAL_BOOST,
	GRAVITY,
	JUMP_BUFFER_MS,
	JUMP_VELOCITY,
	PLAYER_ACCELERATION,
	PLAYER_BOB_AMPLITUDE,
	PLAYER_BOB_SPEED,
	PLAYER_COLLISION_INSET,
	PLAYER_DECELERATION,
	PLAYER_FOOT_SHADOW_HEIGHT,
	PLAYER_FOOT_SHADOW_OFFSET_Y,
	PLAYER_FOOT_SHADOW_WIDTH_EXTRA,
	PLAYER_HAT_OFFSET_Y,
	PLAYER_HEAD_OFFSET_Y,
	PLAYER_HEAD_RADIUS,
	PLAYER_HEIGHT,
	PLAYER_INVULNERABLE_DIM_ALPHA,
	PLAYER_INVULNERABLE_FLASH_SPEED,
	PLAYER_OUTLINE_ALPHA,
	PLAYER_OUTLINE_EXTRA,
	PLAYER_OUTLINE_OFFSET,
	PLAYER_SHADOW_ALPHA,
	PLAYER_SPEED,
	PLAYER_WIDTH,
	STARTING_LIVES,
	TILE_SIZE,
	TRAIL_BUBBLES_GRAVITY_Y,
	TRAIL_BUBBLES_LIFESPAN,
	TRAIL_BUBBLES_SPEED,
	TRAIL_EMIT_FREQUENCY,
	TRAIL_FIRE_GRAVITY_Y,
	TRAIL_FIRE_LIFESPAN,
	TRAIL_FIRE_SPEED,
	TRAIL_HEARTS_GRAVITY_Y,
	TRAIL_HEARTS_LIFESPAN,
	TRAIL_HEARTS_SPEED,
	TRAIL_PARTICLE_OFFSET_Y,
	TRAIL_RAINBOW_LIFESPAN,
	TRAIL_RAINBOW_SPEED,
	TRAIL_SPARKLE_GRAVITY_Y,
	TRAIL_SPARKLE_LIFESPAN,
	TRAIL_SPARKLE_SPEED,
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

export interface Player {
	container: Phaser.GameObjects.Container;
	velocityX: number;
	velocityY: number;
	isGrounded: boolean;
	isGliding: boolean;
	canDoubleJump: boolean;
	jumpWasDown: boolean;
	facingRight: boolean;
	spawnX: number;
	spawnY: number;
	trail: string;
	trailTimer: number;
	lives: number;
	invulnerableTimer: number;
	fruitEaten: number;
	coyoteTimer: number;
	jumpBufferTimer: number;
	wasGrounded: boolean;
	trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null;
}

const TRAIL_EMITTER_CONFIGS: Record<
	string,
	Phaser.Types.GameObjects.Particles.ParticleEmitterConfig
> = {
	sparkles: {
		speed: TRAIL_SPARKLE_SPEED,
		gravityY: TRAIL_SPARKLE_GRAVITY_Y,
		lifespan: TRAIL_SPARKLE_LIFESPAN,
		alpha: { start: 0.8, end: 0 },
		scale: { start: 0.5, end: 0 },
		tint: 0xffdd44,
		frequency: TRAIL_EMIT_FREQUENCY,
		emitting: false,
	},
	hearts: {
		speed: TRAIL_HEARTS_SPEED,
		gravityY: TRAIL_HEARTS_GRAVITY_Y,
		lifespan: TRAIL_HEARTS_LIFESPAN,
		alpha: { start: 0.8, end: 0 },
		scale: { start: 0.6, end: 0.1 },
		tint: 0xff6688,
		frequency: TRAIL_EMIT_FREQUENCY,
		emitting: false,
	},
	bubbles: {
		speed: TRAIL_BUBBLES_SPEED,
		gravityY: TRAIL_BUBBLES_GRAVITY_Y,
		lifespan: TRAIL_BUBBLES_LIFESPAN,
		alpha: { start: 0.7, end: 0 },
		scale: { start: 0.5, end: 0.2 },
		tint: 0x88ccff,
		frequency: TRAIL_EMIT_FREQUENCY,
		emitting: false,
	},
	fire: {
		speed: TRAIL_FIRE_SPEED,
		gravityY: TRAIL_FIRE_GRAVITY_Y,
		lifespan: TRAIL_FIRE_LIFESPAN,
		alpha: { start: 0.9, end: 0 },
		scale: { start: 0.5, end: 0 },
		tint: [0xff4400, 0xff8800, 0xffaa00],
		frequency: TRAIL_EMIT_FREQUENCY,
		emitting: false,
	},
	rainbow: {
		speed: TRAIL_RAINBOW_SPEED,
		lifespan: TRAIL_RAINBOW_LIFESPAN,
		alpha: { start: 0.8, end: 0 },
		scale: { start: 0.4, end: 0 },
		tint: [0xff0000, 0xff8800, 0xffff00, 0x00ff00, 0x0088ff, 0x8800ff],
		frequency: TRAIL_EMIT_FREQUENCY,
		emitting: false,
	},
};

const createTrailEmitter = (
	scene: Phaser.Scene,
	trailType: string,
): Phaser.GameObjects.Particles.ParticleEmitter | null => {
	const config = TRAIL_EMITTER_CONFIGS[trailType];
	if (!config) return null;

	const emitter = scene.add.particles(0, 0, "particle_dot", config);
	emitter.start();
	return emitter;
};

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
		PLAYER_HEIGHT / 2 + PLAYER_FOOT_SHADOW_OFFSET_Y,
		PLAYER_WIDTH + PLAYER_FOOT_SHADOW_WIDTH_EXTRA,
		PLAYER_FOOT_SHADOW_HEIGHT,
		0x000000,
		PLAYER_SHADOW_ALPHA,
	);

	// Dark outline behind body for definition
	const bodyOutline = scene.add.rectangle(
		PLAYER_OUTLINE_OFFSET,
		PLAYER_OUTLINE_OFFSET,
		PLAYER_WIDTH + PLAYER_OUTLINE_EXTRA,
		PLAYER_HEIGHT + PLAYER_OUTLINE_EXTRA,
		0x000000,
	);
	bodyOutline.setAlpha(PLAYER_OUTLINE_ALPHA);

	const body = scene.add.rectangle(
		0,
		0,
		PLAYER_WIDTH,
		PLAYER_HEIGHT,
		bodyColor,
	);
	const head = scene.add.circle(
		0,
		-PLAYER_HEIGHT / 2 - PLAYER_HEAD_OFFSET_Y,
		PLAYER_HEAD_RADIUS,
		skinColor,
	);

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
			.text(
				0,
				-PLAYER_HEIGHT / 2 - PLAYER_HAT_OFFSET_Y,
				HAT_EMOJI_MAP[hatKey],
				{
					fontSize: "12px",
				},
			)
			.setOrigin(0.5);
		children.push(hat);
	}

	// Face expression (drawn on head)
	const faceKey = characterConfig?.face ?? "none";
	if (faceKey !== "none") {
		const faceGfx = scene.add.graphics();
		faceGfx.setPosition(0, -PLAYER_HEIGHT / 2 - PLAYER_HEAD_OFFSET_Y);
		drawFace(faceGfx, faceKey);
		children.push(faceGfx);
	}

	const container = scene.add.container(x, y, children);

	const trailType = characterConfig?.trail ?? "none";
	const trailEmitter =
		trailType !== "none" ? createTrailEmitter(scene, trailType) : null;

	return {
		container,
		velocityX: 0,
		velocityY: 0,
		isGrounded: false,
		isGliding: false,
		canDoubleJump: false,
		jumpWasDown: false,
		facingRight: true,
		spawnX: x,
		spawnY: y,
		trail: trailType,
		trailTimer: 0,
		lives: STARTING_LIVES,
		invulnerableTimer: 0,
		fruitEaten: 0,
		coyoteTimer: 0,
		jumpBufferTimer: 0,
		wasGrounded: false,
		trailEmitter,
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
	rightStickX: number;
	rightStickY: number;
} => {
	const none = {
		left: false,
		right: false,
		jump: false,
		lb: false,
		rb: false,
		x: false,
		b: false,
		rightStickX: 0,
		rightStickY: 0,
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
			rightStickX: pad.axes[2] ?? 0,
			rightStickY: pad.axes[3] ?? 0,
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

/** Read the right analog stick axes (-1 to 1) */
export const readGamepadRightStick = (): { x: number; y: number } => {
	const gp = readBrowserGamepad();
	return { x: gp.rightStickX, y: gp.rightStickY };
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
			Math.sin(player.invulnerableTimer * PLAYER_INVULNERABLE_FLASH_SPEED) > 0
				? 1
				: PLAYER_INVULNERABLE_DIM_ALPHA,
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
	const targetSpeed = PLAYER_SPEED * speedMultiplier;

	// Acceleration-based horizontal movement
	if (input.left) {
		player.velocityX = Math.max(
			player.velocityX - PLAYER_ACCELERATION * dt,
			-targetSpeed,
		);
		player.facingRight = false;
	} else if (input.right) {
		player.velocityX = Math.min(
			player.velocityX + PLAYER_ACCELERATION * dt,
			targetSpeed,
		);
		player.facingRight = true;
	} else {
		// Decelerate toward 0
		if (player.velocityX > 0) {
			player.velocityX = Math.max(
				0,
				player.velocityX - PLAYER_DECELERATION * dt,
			);
		} else if (player.velocityX < 0) {
			player.velocityX = Math.min(
				0,
				player.velocityX + PLAYER_DECELERATION * dt,
			);
		}
	}

	// Gliding
	player.isGliding = !player.isGrounded && input.jump && player.velocityY > 0;
	if (player.isGliding) {
		player.velocityX *= GLIDE_HORIZONTAL_BOOST;
	}

	// Gravity
	const currentGravity = player.isGliding ? GLIDE_GRAVITY : GRAVITY;
	player.velocityY += currentGravity * dt;

	// Coyote time: track when player leaves ground
	if (player.wasGrounded && !player.isGrounded) {
		player.coyoteTimer = COYOTE_TIME_MS;
	}
	if (player.coyoteTimer > 0) {
		player.coyoteTimer -= delta;
	}

	// Jump buffering: track jump presses while airborne
	if (player.jumpBufferTimer > 0) {
		player.jumpBufferTimer -= delta;
	}

	// Jump / Double jump (edge-triggered — must release and re-press)
	const jumpPressed = input.jump && !player.jumpWasDown;

	// Buffer the jump if pressed while airborne
	if (jumpPressed && !player.isGrounded && player.coyoteTimer <= 0) {
		player.jumpBufferTimer = JUMP_BUFFER_MS;
	}

	// Determine if jump should execute (grounded, coyote time, or buffered)
	const canCoyoteJump = !player.isGrounded && player.coyoteTimer > 0;
	const shouldJump = jumpPressed && (player.isGrounded || canCoyoteJump);

	if (shouldJump) {
		player.velocityY = JUMP_VELOCITY;
		player.isGrounded = false;
		player.coyoteTimer = 0;
		player.jumpBufferTimer = 0;
		player.canDoubleJump = true;
	} else if (jumpPressed && player.canDoubleJump) {
		player.velocityY = DOUBLE_JUMP_VELOCITY;
		player.canDoubleJump = false;
		player.jumpBufferTimer = 0;
	}

	// Jump buffer: auto-jump on landing if buffer is active
	if (player.isGrounded && player.jumpBufferTimer > 0) {
		player.velocityY = JUMP_VELOCITY;
		player.isGrounded = false;
		player.jumpBufferTimer = 0;
		player.canDoubleJump = true;
	}

	// Variable jump height: cut velocity when jump released early while ascending
	if (!input.jump && player.jumpWasDown && player.velocityY < 0) {
		player.velocityY *= 0.5;
	}

	player.jumpWasDown = input.jump;

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
	player.wasGrounded = player.isGrounded;
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

	// Visual: flip based on direction + gentle idle bob when grounded
	player.container.scaleX = player.facingRight ? 1 : -1;
	if (player.isGrounded && Math.abs(player.velocityX) < 1) {
		const bobOffset = Math.sin(Date.now() * 0.003) * 1.5;
		player.container.y += bobOffset;
	}

	// Trail particle emitter: follow player position
	if (player.trailEmitter) {
		player.trailEmitter.setPosition(
			player.container.x,
			player.container.y + TRAIL_PARTICLE_OFFSET_Y,
		);
	}

	return false;
};
