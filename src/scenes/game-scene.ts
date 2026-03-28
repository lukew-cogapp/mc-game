import {
	AMBIENT_PARTICLE_ALPHA_MAX,
	AMBIENT_PARTICLE_ALPHA_MIN,
	AMBIENT_PARTICLE_COUNT,
	AMBIENT_PARTICLE_RADIUS_MAX,
	AMBIENT_PARTICLE_RADIUS_MIN,
	AMBIENT_PARTICLE_SPEED_MAX,
	AMBIENT_PARTICLE_SPEED_MIN,
	BLOCK_INTERACT_RANGE,
	CAMERA_LERP,
	CLOUD_ALPHA,
	CLOUD_COUNT,
	CLOUD_SPEED,
	COLORS,
	FRUIT_PER_LIFE,
	GOAL_BEACON_BEAM_WIDTH,
	GOAL_BEACON_COLOR,
	GOAL_BEACON_HEIGHT_TILES,
	HOVER_HIGHLIGHT_ALPHA,
	HOVER_HIGHLIGHT_COLOR,
	HOVER_HIGHLIGHT_LINE_WIDTH,
	INVENTORY_SLOTS,
	LAVA_GLOW_ALPHA,
	LAVA_GLOW_COLOR,
	LAVA_GLOW_HEIGHT,
	LEAF_PARTICLE_DRIFT_SPEED,
	LEAF_PARTICLE_HEIGHT,
	LEAF_PARTICLE_INTERVAL,
	LEAF_PARTICLE_LIFETIME,
	LEAF_PARTICLE_MAX,
	LEAF_PARTICLE_WIDTH,
	LEAF_PARTICLE_WOBBLE_AMPLITUDE,
	LEAF_PARTICLE_WOBBLE_SPEED,
	MAX_LIVES,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	SKY_GRADIENT_BAND_HEIGHT,
	SKY_GRADIENT_BOTTOM_COLOR,
	SKY_GRADIENT_MID_COLOR,
	SKY_GRADIENT_TOP_COLOR,
	TILE_SIZE,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";
import {
	type BlockInteraction,
	createBlockInteraction,
	handleBlockBreak,
	handleBlockPlace,
} from "../player/block-interaction";
import {
	createInventory,
	type Inventory,
	renderInventory,
} from "../player/inventory";
import {
	createGameInput,
	createPlayer,
	type Player,
	readGamepadButtons,
	updatePlayer,
} from "../player/player";
import { BlockType } from "../types";
import {
	createDayNight,
	type DayNightCycle,
	updateDayNight,
} from "../world/day-night";
import { generateWorld } from "../world/island-generator";
import {
	createLava,
	getLavaY,
	type LavaLayer,
	updateLava,
} from "../world/lava";
import { updateWater } from "../world/water-physics";
import {
	createWorldTextures,
	removeBlockSprite,
	renderWorld,
} from "../world/world-renderer";
import type { CharacterConfig } from "./title-scene";

export class GameScene extends Phaser.Scene {
	private player!: Player;
	private grid!: BlockType[][];
	private blockGroup!: Phaser.GameObjects.Group;
	private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
	private wasd!: {
		W: Phaser.Input.Keyboard.Key;
		A: Phaser.Input.Keyboard.Key;
		D: Phaser.Input.Keyboard.Key;
	};
	private spaceKey!: Phaser.Input.Keyboard.Key;
	private inventory!: Inventory;
	private blockInteraction!: BlockInteraction;
	private lava!: LavaLayer;
	private glideIndicator!: Phaser.GameObjects.Text;
	private hoverHighlight!: Phaser.GameObjects.Graphics;
	private dayNight!: DayNightCycle;
	private gpLBWasDown = false;
	private gpRBWasDown = false;
	private gpBWasDown = false;
	private livesText!: Phaser.GameObjects.Text;
	private fruitText!: Phaser.GameObjects.Text;

	// Clouds
	private clouds: Phaser.GameObjects.Container[] = [];

	// Falling leaves
	private leafParticles: {
		gfx: Phaser.GameObjects.Rectangle;
		startX: number;
		age: number;
	}[] = [];
	private leafSpawnTimer = 0;
	private lavaGlowGfx!: Phaser.GameObjects.Graphics;

	// Ambient upward-drifting particles
	private ambientParticles: {
		circle: Phaser.GameObjects.Arc;
		speed: number;
	}[] = [];

	constructor() {
		super({ key: "GameScene" });
	}

	shutdown(): void {
		// Clean up event listeners to prevent accumulation across restarts
		this.input.removeAllListeners();
		if (this.input.keyboard) {
			this.input.keyboard.removeAllListeners();
		}
	}

	create(data?: CharacterConfig): void {
		// Register shutdown cleanup
		this.events.on("shutdown", () => this.shutdown());
		// Sky gradient background (dark bottom → blue middle → golden top)
		this.drawSkyGradient();

		// Goal beacon at the top of the world
		this.drawGoalBeacon();

		// Background clouds (created before world so they sit behind everything)
		this.createClouds();

		// Generate world
		createWorldTextures(this);
		const { grid, spawnX, spawnY } = generateWorld();
		this.grid = grid;
		this.blockGroup = renderWorld(this, grid);

		// Ambient upward-drifting particles (world space)
		this.createAmbientParticles();

		// Lava lake at world bottom
		this.lava = createLava(this);

		// Lava danger glow (drawn above lava, updated each frame)
		this.lavaGlowGfx = this.add.graphics();
		this.lavaGlowGfx.setDepth(50);
		this.lavaGlowGfx.setBlendMode(Phaser.BlendModes.ADD);

		// Player
		this.player = createPlayer(this, spawnX, spawnY, data);

		// Camera
		this.cameras.main.setBounds(
			0,
			0,
			WORLD_WIDTH_TILES * TILE_SIZE,
			WORLD_HEIGHT_TILES * TILE_SIZE,
		);
		this.cameras.main.startFollow(
			this.player.container,
			true,
			CAMERA_LERP,
			CAMERA_LERP,
		);

		// Input
		if (!this.input.keyboard) {
			throw new Error("Keyboard input not available");
		}
		this.cursors = this.input.keyboard.createCursorKeys();
		this.wasd = {
			W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
			A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
			D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
		};
		this.spaceKey = this.input.keyboard.addKey(
			Phaser.Input.Keyboard.KeyCodes.SPACE,
		);

		// Number keys for inventory slot selection
		const KEY_NAMES = [
			"ONE",
			"TWO",
			"THREE",
			"FOUR",
			"FIVE",
			"SIX",
			"SEVEN",
			"EIGHT",
			"NINE",
		];
		for (let i = 0; i < INVENTORY_SLOTS; i++) {
			this.input.keyboard.on(`keydown-${KEY_NAMES[i]}`, () => {
				this.inventory.selectedIndex = i;
				renderInventory(this, this.inventory);
			});
		}

		// Scroll wheel to cycle inventory slots
		this.input.on(
			"wheel",
			(
				_pointer: Phaser.Input.Pointer,
				_gameObjects: Phaser.GameObjects.GameObject[],
				_deltaX: number,
				deltaY: number,
			) => {
				if (deltaY > 0) {
					this.inventory.selectedIndex =
						(this.inventory.selectedIndex + 1) % INVENTORY_SLOTS;
				} else if (deltaY < 0) {
					this.inventory.selectedIndex =
						(this.inventory.selectedIndex - 1 + INVENTORY_SLOTS) %
						INVENTORY_SLOTS;
				}
				renderInventory(this, this.inventory);
			},
		);

		// Right click to place
		this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
			if (pointer.rightButtonDown()) {
				handleBlockPlace(
					this,
					this.player,
					this.grid,
					this.inventory,
					this.blockGroup,
					pointer,
				);
			}
		});

		// Disable context menu
		this.input.mouse?.disableContextMenu();

		// Inventory
		this.inventory = createInventory(this);
		renderInventory(this, this.inventory);

		// Block interaction
		this.blockInteraction = createBlockInteraction();

		// Hover highlight
		this.hoverHighlight = this.add.graphics();

		// Day/night cycle
		this.dayNight = createDayNight(this);

		// -- HUD: Top-left status panel --
		const hudBgLeft = this.add.rectangle(8, 8, 180, 44, 0x000000, 0.5);
		hudBgLeft.setOrigin(0, 0);
		hudBgLeft.setScrollFactor(0);
		hudBgLeft.setDepth(99);
		const hudBgLeftBorder = this.add.graphics();
		hudBgLeftBorder.lineStyle(1, 0xffffff, 0.1);
		hudBgLeftBorder.strokeRoundedRect(8, 8, 180, 44, 6);
		hudBgLeftBorder.setScrollFactor(0);
		hudBgLeftBorder.setDepth(99);

		this.glideIndicator = this.add.text(18, 16, "", {
			fontSize: "16px",
			color: "#ffffff",
			fontStyle: "bold",
		});
		this.glideIndicator.setResolution(2);
		this.glideIndicator.setScrollFactor(0);
		this.glideIndicator.setDepth(100);

		// -- HUD: Top-right lives panel --
		const camW = this.cameras.main.width;
		const hudBgRight = this.add.rectangle(camW - 8, 8, 160, 52, 0x000000, 0.5);
		hudBgRight.setOrigin(1, 0);
		hudBgRight.setScrollFactor(0);
		hudBgRight.setDepth(99);
		const hudBgRightBorder = this.add.graphics();
		hudBgRightBorder.lineStyle(1, 0xffffff, 0.1);
		hudBgRightBorder.strokeRoundedRect(camW - 168, 8, 160, 52, 6);
		hudBgRightBorder.setScrollFactor(0);
		hudBgRightBorder.setDepth(99);

		this.livesText = this.add.text(camW - 18, 14, "", {
			fontSize: "22px",
			color: "#ff4444",
		});
		this.livesText.setResolution(2);
		this.livesText.setOrigin(1, 0);
		this.livesText.setScrollFactor(0);
		this.livesText.setDepth(100);

		this.fruitText = this.add.text(camW - 18, 40, "", {
			fontSize: "14px",
			color: "#ffaa33",
		});
		this.fruitText.setResolution(2);
		this.fruitText.setOrigin(1, 0);
		this.fruitText.setScrollFactor(0);
		this.fruitText.setDepth(100);

		this.updateLivesHUD();
	}

	private updateHoverHighlight = (): void => {
		this.hoverHighlight.clear();

		const pointer = this.input.activePointer;
		const worldX = pointer.worldX;
		const worldY = pointer.worldY;
		const gx = Math.floor(worldX / TILE_SIZE);
		const gy = Math.floor(worldY / TILE_SIZE);

		// Bounds check
		if (
			gy < 0 ||
			gy >= this.grid.length ||
			gx < 0 ||
			gx >= this.grid[0].length
		) {
			return;
		}

		// Don't highlight Air blocks
		if (this.grid[gy][gx] === BlockType.Air) {
			return;
		}

		// Range check against player position
		const playerGx = Math.floor(this.player.container.x / TILE_SIZE);
		const playerGy = Math.floor(this.player.container.y / TILE_SIZE);
		const dx = Math.abs(playerGx - gx);
		const dy = Math.abs(playerGy - gy);
		if (dx > BLOCK_INTERACT_RANGE || dy > BLOCK_INTERACT_RANGE) {
			return;
		}

		// Draw outline rectangle
		this.hoverHighlight.lineStyle(
			HOVER_HIGHLIGHT_LINE_WIDTH,
			HOVER_HIGHLIGHT_COLOR,
			HOVER_HIGHLIGHT_ALPHA,
		);
		this.hoverHighlight.strokeRect(
			gx * TILE_SIZE,
			gy * TILE_SIZE,
			TILE_SIZE,
			TILE_SIZE,
		);
	};

	update(_time: number, delta: number): void {
		// Lava (rises over time)
		updateLava(this.lava, delta);
		const lavaY = getLavaY(this.lava);
		this.updateLavaGlow(lavaY);

		// Update player
		const input = createGameInput(this.cursors, this.wasd, this.spaceKey);
		const gameOver = updatePlayer(this.player, input, this.grid, lavaY, delta);
		if (gameOver) {
			this.scene.start("GameOverScene");
			return;
		}
		this.collectFruit();
		this.updateLivesHUD();

		// Block breaking (left click held)
		handleBlockBreak(
			this,
			this.blockInteraction,
			this.player,
			this.grid,
			this.inventory,
			this.blockGroup,
			this.input.activePointer,
			delta,
		);

		// Gamepad: LB/RB to cycle inventory
		this.handleGamepadActions();

		// Water physics (fall if unsupported)
		updateWater(this, this.grid, this.blockGroup);

		// Hover highlight
		this.updateHoverHighlight();

		// Day/night cycle
		updateDayNight(
			this.dayNight,
			this,
			this.player.container.x,
			this.player.container.y,
			delta,
		);

		// Background clouds parallax
		this.updateClouds();

		// Falling leaf particles
		this.updateLeafParticles(delta);

		// Ambient upward-drifting particles
		this.updateAmbientParticles(delta);

		// Glide indicator
		if (this.player.isGliding) {
			this.glideIndicator.setText("GLIDING");
		} else if (!this.player.isGrounded) {
			this.glideIndicator.setText("Hold SPACE to glide");
		} else {
			this.glideIndicator.setText("");
		}
	}

	private handleGamepadActions = (): void => {
		const { lb, rb, x, b } = readGamepadButtons();

		// LB/RB cycle inventory
		if (lb && !this.gpLBWasDown) {
			this.inventory.selectedIndex =
				(this.inventory.selectedIndex - 1 + INVENTORY_SLOTS) % INVENTORY_SLOTS;
			renderInventory(this, this.inventory);
		}
		if (rb && !this.gpRBWasDown) {
			this.inventory.selectedIndex =
				(this.inventory.selectedIndex + 1) % INVENTORY_SLOTS;
			renderInventory(this, this.inventory);
		}
		this.gpLBWasDown = lb;
		this.gpRBWasDown = rb;

		// X = break block in front of player
		if (x) {
			const dir = this.player.facingRight ? 1 : -1;
			const gx = Math.floor(this.player.container.x / TILE_SIZE) + dir;
			const gy = Math.floor(this.player.container.y / TILE_SIZE);
			const fakePointer = {
				worldX: gx * TILE_SIZE + TILE_SIZE / 2,
				worldY: gy * TILE_SIZE + TILE_SIZE / 2,
				leftButtonDown: () => true,
			} as unknown as Phaser.Input.Pointer;
			handleBlockBreak(
				this,
				this.blockInteraction,
				this.player,
				this.grid,
				this.inventory,
				this.blockGroup,
				fakePointer,
				this.game.loop.delta,
			);
		}

		// B = place block in front of player (edge-triggered)
		if (b && !this.gpBWasDown) {
			const dir = this.player.facingRight ? 1 : -1;
			const gx = Math.floor(this.player.container.x / TILE_SIZE) + dir;
			const gy = Math.floor(this.player.container.y / TILE_SIZE);
			const fakePointer = {
				worldX: gx * TILE_SIZE + TILE_SIZE / 2,
				worldY: gy * TILE_SIZE + TILE_SIZE / 2,
			} as unknown as Phaser.Input.Pointer;
			handleBlockPlace(
				this,
				this.player,
				this.grid,
				this.inventory,
				this.blockGroup,
				fakePointer,
			);
		}
		this.gpBWasDown = b;
	};

	private collectFruit = (): void => {
		const FRUIT_TYPES = new Set([
			BlockType.Apple,
			BlockType.Pear,
			BlockType.Peach,
			BlockType.Strawberry,
			BlockType.Berry,
		]);

		// Check the tiles the player overlaps
		const px = this.player.container.x;
		const py = this.player.container.y;
		const halfW = PLAYER_WIDTH / 2;
		const halfH = PLAYER_HEIGHT / 2;

		const tiles = [
			[Math.floor((px - halfW) / TILE_SIZE), Math.floor(py / TILE_SIZE)],
			[Math.floor((px + halfW) / TILE_SIZE), Math.floor(py / TILE_SIZE)],
			[Math.floor(px / TILE_SIZE), Math.floor((py - halfH) / TILE_SIZE)],
			[Math.floor(px / TILE_SIZE), Math.floor((py + halfH) / TILE_SIZE)],
		];

		for (const [gx, gy] of tiles) {
			if (
				gx === undefined ||
				gy === undefined ||
				gy < 0 ||
				gy >= this.grid.length ||
				gx < 0 ||
				gx >= this.grid[0].length
			)
				continue;
			const block = this.grid[gy][gx];
			if (!FRUIT_TYPES.has(block)) continue;

			// Eat it!
			this.grid[gy][gx] = BlockType.Air;
			removeBlockSprite(this.blockGroup, gx, gy);
			this.player.fruitEaten++;

			// Check if we earned a life
			if (
				this.player.fruitEaten >= FRUIT_PER_LIFE &&
				this.player.lives < MAX_LIVES
			) {
				this.player.fruitEaten -= FRUIT_PER_LIFE;
				this.player.lives++;

				// Visual feedback
				const popup = this.add.text(px, py - 30, "+1 \u2764\ufe0f", {
					fontSize: "18px",
					color: "#ff4444",
				});
				popup.setOrigin(0.5);
				this.tweens.add({
					targets: popup,
					y: py - 60,
					alpha: 0,
					duration: 800,
					onComplete: () => popup.destroy(),
				});
			}
		}
	};

	private updateLivesHUD = (): void => {
		const hearts = "\u2764\ufe0f".repeat(this.player.lives);
		this.livesText.setText(hearts);

		if (this.player.lives < MAX_LIVES) {
			this.fruitText.setText(
				`\u{1f34e} ${this.player.fruitEaten}/${FRUIT_PER_LIFE}`,
			);
		} else {
			this.fruitText.setText("");
		}
	};

	private createClouds = (): void => {
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
		const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;

		for (let i = 0; i < CLOUD_COUNT; i++) {
			const cloudX = Math.random() * worldW;
			const cloudY = Math.random() * worldH * 0.5; // upper half of world
			const children: Phaser.GameObjects.Ellipse[] = [];

			// Each cloud is 2-3 overlapping white ellipses
			const circleCount = 2 + Math.floor(Math.random() * 2);
			for (let c = 0; c < circleCount; c++) {
				const ellipse = this.add.ellipse(
					(c - 1) * 30 + Math.random() * 20,
					Math.random() * 10 - 5,
					50 + Math.random() * 40,
					20 + Math.random() * 15,
					COLORS.white,
					CLOUD_ALPHA + Math.random() * 0.05,
				);
				children.push(ellipse);
			}

			const container = this.add.container(cloudX, cloudY, children);
			container.setDepth(-10); // Behind all game objects
			this.clouds.push(container);
		}
	};

	private updateClouds = (): void => {
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;

		for (const cloud of this.clouds) {
			cloud.x += CLOUD_SPEED;
			if (cloud.x > worldW + 100) {
				cloud.x = -100;
			}
		}
	};

	private updateLeafParticles = (delta: number): void => {
		// Update existing particles
		for (let i = this.leafParticles.length - 1; i >= 0; i--) {
			const leaf = this.leafParticles[i];
			leaf.age += delta;

			if (leaf.age >= LEAF_PARTICLE_LIFETIME) {
				leaf.gfx.destroy();
				this.leafParticles.splice(i, 1);
				continue;
			}

			// Drift down slowly
			const dt = delta / 1000;
			leaf.gfx.y += LEAF_PARTICLE_DRIFT_SPEED * dt;

			// Sine-wave horizontal wobble
			leaf.gfx.x =
				leaf.startX +
				Math.sin((leaf.age / 1000) * LEAF_PARTICLE_WOBBLE_SPEED) *
					LEAF_PARTICLE_WOBBLE_AMPLITUDE;

			// Fade out over lifetime
			const progress = leaf.age / LEAF_PARTICLE_LIFETIME;
			leaf.gfx.setAlpha(1 - progress);
		}

		// Spawn new leaves
		this.leafSpawnTimer += delta;
		if (
			this.leafSpawnTimer >= LEAF_PARTICLE_INTERVAL &&
			this.leafParticles.length < LEAF_PARTICLE_MAX
		) {
			this.leafSpawnTimer = 0;
			this.spawnLeafParticle();
		}
	};

	private drawSkyGradient = (): void => {
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
		const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;
		const gfx = this.add.graphics();
		gfx.setDepth(-20);

		const bands = Math.ceil(worldH / SKY_GRADIENT_BAND_HEIGHT);
		for (let i = 0; i < bands; i++) {
			const t = i / bands; // 0 = top, 1 = bottom
			let r: number;
			let g: number;
			let b: number;
			if (t < 0.5) {
				// Top to mid
				const lt = t * 2;
				r =
					SKY_GRADIENT_TOP_COLOR.r +
					(SKY_GRADIENT_MID_COLOR.r - SKY_GRADIENT_TOP_COLOR.r) * lt;
				g =
					SKY_GRADIENT_TOP_COLOR.g +
					(SKY_GRADIENT_MID_COLOR.g - SKY_GRADIENT_TOP_COLOR.g) * lt;
				b =
					SKY_GRADIENT_TOP_COLOR.b +
					(SKY_GRADIENT_MID_COLOR.b - SKY_GRADIENT_TOP_COLOR.b) * lt;
			} else {
				// Mid to bottom
				const lt = (t - 0.5) * 2;
				r =
					SKY_GRADIENT_MID_COLOR.r +
					(SKY_GRADIENT_BOTTOM_COLOR.r - SKY_GRADIENT_MID_COLOR.r) * lt;
				g =
					SKY_GRADIENT_MID_COLOR.g +
					(SKY_GRADIENT_BOTTOM_COLOR.g - SKY_GRADIENT_MID_COLOR.g) * lt;
				b =
					SKY_GRADIENT_MID_COLOR.b +
					(SKY_GRADIENT_BOTTOM_COLOR.b - SKY_GRADIENT_MID_COLOR.b) * lt;
			}
			const bandH = worldH / bands;
			gfx.fillStyle(
				Phaser.Display.Color.GetColor(
					Math.round(r),
					Math.round(g),
					Math.round(b),
				),
			);
			gfx.fillRect(0, i * bandH, worldW, bandH + 1);
		}
	};

	private drawGoalBeacon = (): void => {
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
		const beaconH = GOAL_BEACON_HEIGHT_TILES * TILE_SIZE;

		// Golden glow at the top
		const gfx = this.add.graphics();
		gfx.setDepth(-15);
		for (let i = 0; i < 10; i++) {
			const alpha = 0.15 * (1 - i / 10);
			gfx.fillStyle(GOAL_BEACON_COLOR, alpha);
			gfx.fillRect(0, i * (beaconH / 10), worldW, beaconH / 10 + 1);
		}

		// Central light beam
		const beamX = worldW / 2;
		const beam = this.add.rectangle(
			beamX,
			beaconH / 2,
			GOAL_BEACON_BEAM_WIDTH,
			beaconH,
			GOAL_BEACON_COLOR,
			0.08,
		);
		beam.setDepth(-14);
		beam.setBlendMode(Phaser.BlendModes.ADD);

		// Pulse the beam
		this.tweens.add({
			targets: beam,
			alpha: 0.15,
			scaleX: 1.2,
			duration: 2000,
			yoyo: true,
			repeat: -1,
			ease: "Sine.easeInOut",
		});
	};

	private updateLavaGlow = (lavaY: number): void => {
		this.lavaGlowGfx.clear();
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
		const glowH = LAVA_GLOW_HEIGHT;

		// Gradient: red at lava surface fading to transparent above
		const steps = 8;
		for (let i = 0; i < steps; i++) {
			const t = i / steps;
			const alpha = LAVA_GLOW_ALPHA * (1 - t);
			this.lavaGlowGfx.fillStyle(LAVA_GLOW_COLOR, alpha);
			this.lavaGlowGfx.fillRect(
				0,
				lavaY - glowH + (glowH / steps) * i,
				worldW,
				glowH / steps + 1,
			);
		}
	};

	private createAmbientParticles = (): void => {
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
		const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;

		for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
			const radius =
				AMBIENT_PARTICLE_RADIUS_MIN +
				Math.random() *
					(AMBIENT_PARTICLE_RADIUS_MAX - AMBIENT_PARTICLE_RADIUS_MIN);
			const alpha =
				AMBIENT_PARTICLE_ALPHA_MIN +
				Math.random() *
					(AMBIENT_PARTICLE_ALPHA_MAX - AMBIENT_PARTICLE_ALPHA_MIN);
			const speed =
				AMBIENT_PARTICLE_SPEED_MIN +
				Math.random() *
					(AMBIENT_PARTICLE_SPEED_MAX - AMBIENT_PARTICLE_SPEED_MIN);

			// Randomly pick white or light blue
			const color = Math.random() < 0.5 ? 0xffffff : 0xaaddff;

			const x = Math.random() * worldW;
			const y = Math.random() * worldH;

			const circle = this.add.circle(x, y, radius, color, alpha);
			circle.setDepth(-5); // Behind game objects, in front of sky

			this.ambientParticles.push({ circle, speed });
		}
	};

	private updateAmbientParticles = (delta: number): void => {
		const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
		const dt = delta / 1000;

		for (const particle of this.ambientParticles) {
			particle.circle.y -= particle.speed * dt;

			// Reset to bottom when reaching top
			if (particle.circle.y < 0) {
				particle.circle.y = worldH;
				particle.circle.x = Math.random() * worldW;
			}
		}
	};

	private spawnLeafParticle = (): void => {
		const cam = this.cameras.main;
		const viewLeft = Math.floor(cam.scrollX / TILE_SIZE);
		const viewRight = Math.ceil((cam.scrollX + cam.width) / TILE_SIZE);
		const viewTop = Math.floor(cam.scrollY / TILE_SIZE);
		const viewBottom = Math.ceil((cam.scrollY + cam.height) / TILE_SIZE);

		// Find leaf blocks visible on screen
		const leafPositions: { gx: number; gy: number }[] = [];
		for (
			let gy = Math.max(0, viewTop);
			gy < Math.min(this.grid.length, viewBottom);
			gy++
		) {
			for (
				let gx = Math.max(0, viewLeft);
				gx < Math.min(this.grid[0].length, viewRight);
				gx++
			) {
				if (this.grid[gy][gx] === BlockType.Leaf) {
					leafPositions.push({ gx, gy });
				}
			}
		}

		if (leafPositions.length === 0) return;

		// Pick a random leaf block
		const chosen =
			leafPositions[Math.floor(Math.random() * leafPositions.length)];
		const worldX = chosen.gx * TILE_SIZE + Math.random() * TILE_SIZE;
		const worldY = chosen.gy * TILE_SIZE + TILE_SIZE;

		const leafRect = this.add.rectangle(
			worldX,
			worldY,
			LEAF_PARTICLE_WIDTH,
			LEAF_PARTICLE_HEIGHT,
			COLORS.leaf,
		);
		leafRect.setDepth(5);

		this.leafParticles.push({
			gfx: leafRect,
			startX: worldX,
			age: 0,
		});
	};
}
