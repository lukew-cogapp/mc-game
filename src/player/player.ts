import {
	COLORS,
	COYOTE_TIME_MS,
	DEATH_INVULNERABLE_MS,
	DOUBLE_JUMP_VELOCITY,
	GAMEPAD_STICK_DEADZONE,
	GLIDE_GRAVITY,
	GLIDE_HORIZONTAL_BOOST,
	GLIDE_MAX_DURATION_MS,
	GRAVITY,
	JETPACK_PARTICLE_FREQUENCY,
	JETPACK_PARTICLE_GRAVITY_Y,
	JETPACK_PARTICLE_LIFESPAN,
	JETPACK_PARTICLE_SPEED,
	JETPACK_THRUST,
	JUMP_BUFFER_MS,
	JUMP_CUT_MULTIPLIER,
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
	PLAYER_STEP_UP_HEIGHT,
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
import { BlockType, NON_SOLID_BLOCKS } from "../types";
import { drawFace } from "./face-renderer";

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

export class Player extends Phaser.GameObjects.Container {
	velocityX = 0;
	velocityY = 0;
	isGrounded = false;
	isGliding = false;
	canDoubleJump = false;
	jumpWasDown = false;
	facingRight = true;
	spawnX: number;
	spawnY: number;
	trail: string;
	trailTimer = 0;
	lives = STARTING_LIVES;
	invulnerableTimer = 0;
	fruitEaten = 0;
	coyoteTimer = 0;
	jumpBufferTimer = 0;
	wasGrounded = false;
	trailEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
	jetpackFuel = 0;
	jetpackActive = false;
	jetpackEmitter: Phaser.GameObjects.Particles.ParticleEmitter | null = null;
	glideTimer = 0;

	// Properties set by scene each frame
	grid: BlockType[][] | null = null;
	lavaY = Number.MAX_SAFE_INTEGER;

	// Keyboard input refs (set via setInput)
	private cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;
	private wasd: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	} | null = null;
	private spaceKey: Phaser.Input.Keyboard.Key | null = null;

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		characterConfig?: CharacterConfig,
	) {
		super(scene, x, y);
		scene.add.existing(this);
		this.addToUpdateList();

		this.spawnX = x;
		this.spawnY = y;

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

		this.add(children);

		const trailType = characterConfig?.trail ?? "none";
		this.trail = trailType;
		this.trailEmitter =
			trailType !== "none" ? createTrailEmitter(scene, trailType) : null;

		// Jetpack flame emitter (created once, toggled on/off)
		this.jetpackEmitter = scene.add.particles(0, 0, "particle_dot", {
			speed: JETPACK_PARTICLE_SPEED,
			gravityY: JETPACK_PARTICLE_GRAVITY_Y,
			lifespan: JETPACK_PARTICLE_LIFESPAN,
			alpha: { start: 0.9, end: 0 },
			scale: { start: 0.6, end: 0 },
			tint: [0xff4400, 0xff8800, 0xffaa00],
			frequency: JETPACK_PARTICLE_FREQUENCY,
			emitting: false,
			angle: { min: 70, max: 110 },
		});
	}

	setInput = (
		cursors: Phaser.Types.Input.Keyboard.CursorKeys,
		wasd: {
			W: Phaser.Input.Keyboard.Key;
			A: Phaser.Input.Keyboard.Key;
			D: Phaser.Input.Keyboard.Key;
		},
		spaceKey: Phaser.Input.Keyboard.Key,
	): void => {
		this.cursors = cursors;
		this.wasd = wasd;
		this.spaceKey = spaceKey;
	};

	preUpdate = (_time: number, delta: number): void => {
		// Guard: grid must be set by the scene before preUpdate runs
		const grid = this.grid;
		if (!grid) return;

		// Compute input from stored keyboard refs
		const input =
			this.cursors && this.wasd && this.spaceKey
				? createGameInput(this.cursors, this.wasd, this.spaceKey)
				: { left: false, right: false, up: false, jump: false };

		// Tick invulnerability
		if (this.invulnerableTimer > 0) {
			this.invulnerableTimer -= delta;
			// Flash effect during invulnerability
			this.setAlpha(
				Math.sin(this.invulnerableTimer * PLAYER_INVULNERABLE_FLASH_SPEED) > 0
					? 1
					: PLAYER_INVULNERABLE_DIM_ALPHA,
			);
		} else {
			this.setAlpha(1);
		}

		const dt = delta / 1000;
		const halfW = PLAYER_WIDTH / 2;
		const halfH = PLAYER_HEIGHT / 2;

		// Check if player is submerged in water
		const inWater = isInWater(grid, this.x, this.y);
		const speedMultiplier = inWater ? WATER_SPEED_MULTIPLIER : 1;
		const targetSpeed = PLAYER_SPEED * speedMultiplier;

		// Acceleration-based horizontal movement
		if (input.left) {
			this.velocityX = Math.max(
				this.velocityX - PLAYER_ACCELERATION * dt,
				-targetSpeed,
			);
			this.facingRight = false;
		} else if (input.right) {
			this.velocityX = Math.min(
				this.velocityX + PLAYER_ACCELERATION * dt,
				targetSpeed,
			);
			this.facingRight = true;
		} else {
			// Decelerate toward 0
			if (this.velocityX > 0) {
				this.velocityX = Math.max(0, this.velocityX - PLAYER_DECELERATION * dt);
			} else if (this.velocityX < 0) {
				this.velocityX = Math.min(0, this.velocityX + PLAYER_DECELERATION * dt);
			}
		}

		// Gliding
		this.isGliding =
			!this.isGrounded &&
			input.jump &&
			this.velocityY > 0 &&
			!this.jetpackActive;
		if (this.isGliding) {
			this.glideTimer += delta;
			if (this.glideTimer >= GLIDE_MAX_DURATION_MS) {
				this.isGliding = false;
			}
			// Boost max speed while gliding, but don't multiply every frame
			const glideMaxSpeed = targetSpeed * GLIDE_HORIZONTAL_BOOST;
			this.velocityX = Math.max(
				-glideMaxSpeed,
				Math.min(glideMaxSpeed, this.velocityX),
			);
		}
		if (this.isGrounded) {
			this.glideTimer = 0;
		}

		// Gravity
		const currentGravity = this.isGliding ? GLIDE_GRAVITY : GRAVITY;
		this.velocityY += currentGravity * dt;

		// Coyote time: track when player leaves ground
		if (this.wasGrounded && !this.isGrounded) {
			this.coyoteTimer = COYOTE_TIME_MS;
		}
		if (this.coyoteTimer > 0) {
			this.coyoteTimer -= delta;
		}

		// Jump buffering: track jump presses while airborne
		if (this.jumpBufferTimer > 0) {
			this.jumpBufferTimer -= delta;
		}

		// Jump / Double jump (edge-triggered — must release and re-press)
		const jumpPressed = input.jump && !this.jumpWasDown;

		// Buffer the jump if pressed while airborne
		if (jumpPressed && !this.isGrounded && this.coyoteTimer <= 0) {
			this.jumpBufferTimer = JUMP_BUFFER_MS;
		}

		// Determine if jump should execute (grounded, coyote time, or buffered)
		const canCoyoteJump = !this.isGrounded && this.coyoteTimer > 0;
		const shouldJump = jumpPressed && (this.isGrounded || canCoyoteJump);

		if (shouldJump) {
			this.velocityY = JUMP_VELOCITY;
			this.isGrounded = false;
			this.coyoteTimer = 0;
			this.jumpBufferTimer = 0;
			this.canDoubleJump = true;
		} else if (jumpPressed && this.canDoubleJump) {
			this.velocityY = DOUBLE_JUMP_VELOCITY;
			this.canDoubleJump = false;
			this.jumpBufferTimer = 0;
		}

		// Jump buffer: auto-jump on landing if buffer is active
		if (this.isGrounded && this.jumpBufferTimer > 0) {
			this.velocityY = JUMP_VELOCITY;
			this.isGrounded = false;
			this.jumpBufferTimer = 0;
			this.canDoubleJump = true;
		}

		// Variable jump height: cut velocity when jump released early while ascending
		if (!input.jump && this.jumpWasDown && this.velocityY < 0) {
			this.velocityY *= JUMP_CUT_MULTIPLIER;
		}

		this.jumpWasDown = input.jump;

		// Jetpack boost: airborne + holding jump + has fuel
		if (!this.isGrounded && input.jump && this.jetpackFuel > 0) {
			this.jetpackActive = true;
			this.velocityY = JETPACK_THRUST;
			this.jetpackFuel = Math.max(0, this.jetpackFuel - delta);
		} else {
			this.jetpackActive = false;
		}

		// Jetpack flame emitter
		if (this.jetpackEmitter) {
			if (this.jetpackActive) {
				this.jetpackEmitter.setPosition(this.x, this.y + PLAYER_HEIGHT / 2);
				this.jetpackEmitter.start();
			} else {
				this.jetpackEmitter.stop();
			}
		}

		// Move horizontally
		const newX = this.x + this.velocityX * dt;
		const footY = this.y + halfH - 1;
		const headY = this.y - halfH;

		const collidesLeft =
			checkCollision(grid, newX - halfW + PLAYER_COLLISION_INSET, footY) ||
			checkCollision(grid, newX - halfW + PLAYER_COLLISION_INSET, headY);
		const collidesRight =
			checkCollision(grid, newX + halfW - PLAYER_COLLISION_INSET, footY) ||
			checkCollision(grid, newX + halfW - PLAYER_COLLISION_INSET, headY);

		if (this.velocityX < 0 && !collidesLeft) {
			this.x = newX;
		} else if (this.velocityX > 0 && !collidesRight) {
			this.x = newX;
		} else if (this.velocityX !== 0) {
			// Step-up: try to climb 1-tile obstacles
			const stepCheckX = this.velocityX < 0 ? newX - halfW : newX + halfW;
			const blockGy = Math.floor(footY / TILE_SIZE);
			const blockGx = Math.floor(stepCheckX / TILE_SIZE);
			const aboveGy = blockGy - PLAYER_STEP_UP_HEIGHT;
			// Check tile above blocker is non-solid
			const aboveClear =
				aboveGy >= 0 &&
				aboveGy < grid.length &&
				blockGx >= 0 &&
				blockGx < grid[0].length &&
				NON_SOLID_BLOCKS.has(grid[aboveGy][blockGx]);
			// Check player head wouldn't collide 1 tile up
			const headClearLeft = !checkCollision(
				grid,
				this.x - halfW + PLAYER_COLLISION_INSET,
				headY - TILE_SIZE,
			);
			const headClearRight = !checkCollision(
				grid,
				this.x + halfW - PLAYER_COLLISION_INSET,
				headY - TILE_SIZE,
			);
			if (aboveClear && headClearLeft && headClearRight) {
				this.y -= TILE_SIZE;
				this.x = newX;
			}
		}

		// Move vertically
		const newY = this.y + this.velocityY * dt;

		// Check feet (falling)
		if (this.velocityY > 0) {
			const leftFoot = checkCollision(
				grid,
				this.x - halfW + PLAYER_COLLISION_INSET,
				newY + halfH,
			);
			const rightFoot = checkCollision(
				grid,
				this.x + halfW - PLAYER_COLLISION_INSET,
				newY + halfH,
			);
			if (leftFoot || rightFoot) {
				// Snap to top of tile
				const gridY = Math.floor((newY + halfH) / TILE_SIZE);
				this.y = gridY * TILE_SIZE - halfH;
				this.velocityY = 0;
				this.isGrounded = true;
			} else {
				this.y = newY;
				this.isGrounded = false;
			}
		} else if (this.velocityY < 0) {
			// Check head (jumping)
			const leftHead = checkCollision(
				grid,
				this.x - halfW + PLAYER_COLLISION_INSET,
				newY - halfH,
			);
			const rightHead = checkCollision(
				grid,
				this.x + halfW - PLAYER_COLLISION_INSET,
				newY - halfH,
			);
			if (leftHead || rightHead) {
				this.velocityY = 0;
			} else {
				this.y = newY;
			}
		}

		// Check grounded (for next frame)
		this.wasGrounded = this.isGrounded;
		const groundCheckLeft = checkCollision(
			grid,
			this.x - halfW + PLAYER_COLLISION_INSET,
			this.y + halfH + 1,
		);
		const groundCheckRight = checkCollision(
			grid,
			this.x + halfW - PLAYER_COLLISION_INSET,
			this.y + halfH + 1,
		);
		this.isGrounded = groundCheckLeft || groundCheckRight;

		// Update spawn point when landing on solid ground
		if (this.isGrounded && !this.wasGrounded) {
			this.spawnX = this.x;
			this.spawnY = this.y;
		}

		// Lava death
		if (this.y + halfH >= this.lavaY && this.invulnerableTimer <= 0) {
			this.lives--;
			if (this.lives <= 0) {
				this.emit("death");
				return;
			}
			// Respawn with brief invulnerability
			this.x = this.spawnX;
			this.y = this.spawnY;
			this.velocityX = 0;
			this.velocityY = 0;
			this.invulnerableTimer = DEATH_INVULNERABLE_MS;
			this.emit("respawn", this.lives);
		}

		// Visual: flip based on direction + gentle idle bob when grounded
		this.scaleX = this.facingRight ? 1 : -1;
		if (this.isGrounded && Math.abs(this.velocityX) < 1) {
			const bobOffset =
				Math.sin(Date.now() * PLAYER_BOB_SPEED) * PLAYER_BOB_AMPLITUDE;
			this.y += bobOffset;
		}

		// Trail particle emitter: follow player position
		if (this.trailEmitter) {
			this.trailEmitter.setPosition(this.x, this.y + TRAIL_PARTICLE_OFFSET_Y);
		}
	};
}

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
