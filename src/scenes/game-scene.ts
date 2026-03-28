import {
	createMusic,
	type MusicPlayer,
	setMusicVolume,
	startMusic,
	stopMusic,
} from "../audio/music";
import { loadSettings } from "../audio/settings";
import {
	AMBIENT_PARTICLE_ALPHA_MAX,
	AMBIENT_PARTICLE_ALPHA_MIN,
	AMBIENT_PARTICLE_ALT_COLOR,
	AMBIENT_PARTICLE_COLOR_CHANCE,
	AMBIENT_PARTICLE_COUNT,
	AMBIENT_PARTICLE_DEPTH,
	AMBIENT_PARTICLE_RADIUS_MAX,
	AMBIENT_PARTICLE_RADIUS_MIN,
	AMBIENT_PARTICLE_SPEED_MAX,
	AMBIENT_PARTICLE_SPEED_MIN,
	BLOCK_INTERACT_RANGE,
	CAMERA_LERP,
	CLOUD_ALPHA,
	CLOUD_ALPHA_JITTER,
	CLOUD_CIRCLE_COUNT_BASE,
	CLOUD_CIRCLE_COUNT_RANGE,
	CLOUD_CIRCLE_JITTER_X,
	CLOUD_CIRCLE_JITTER_Y,
	CLOUD_CIRCLE_SPACING,
	CLOUD_COUNT,
	CLOUD_DEPTH,
	CLOUD_ELLIPSE_HEIGHT_BASE,
	CLOUD_ELLIPSE_HEIGHT_RANGE,
	CLOUD_ELLIPSE_WIDTH_BASE,
	CLOUD_ELLIPSE_WIDTH_RANGE,
	CLOUD_SPEED,
	CLOUD_WRAP_MARGIN,
	COLORS,
	FRUIT_PER_LIFE,
	FRUIT_POPUP_DURATION,
	FRUIT_POPUP_OFFSET_Y,
	FRUIT_POPUP_RISE,
	GAMEPAD_RIGHT_STICK_DEADZONE,
	GOAL_BEACON_BEAM_ALPHA,
	GOAL_BEACON_BEAM_WIDTH,
	GOAL_BEACON_COLOR,
	GOAL_BEACON_GLOW_ALPHA,
	GOAL_BEACON_GLOW_STEPS,
	GOAL_BEACON_HEIGHT_TILES,
	GOAL_BEACON_PULSE_ALPHA,
	GOAL_BEACON_PULSE_DURATION,
	GOAL_BEACON_PULSE_SCALE_X,
	HOVER_HIGHLIGHT_ALPHA,
	HOVER_HIGHLIGHT_COLOR,
	HOVER_HIGHLIGHT_LINE_WIDTH,
	HUD_BG_ALPHA,
	HUD_BORDER_ALPHA,
	HUD_BORDER_RADIUS,
	HUD_DEPTH,
	HUD_FRUIT_COLOR,
	HUD_FRUIT_Y,
	HUD_GLIDE_COLOR,
	HUD_GLIDE_X,
	HUD_GLIDE_Y,
	HUD_JETPACK_POPUP_COLOR,
	HUD_LAVA_LABEL_COLOR,
	HUD_LEFT_H,
	HUD_LEFT_W,
	HUD_LEFT_X,
	HUD_LIFE_POPUP_COLOR,
	HUD_LIVES_COLOR,
	HUD_LIVES_OFFSET_X,
	HUD_LIVES_Y,
	HUD_RIGHT_H,
	HUD_RIGHT_W,
	HUD_TIMER_COLOR,
	INVENTORY_SLOTS,
	JETPACK_COLOR,
	JETPACK_FUEL_MS,
	JETPACK_HUD_BAR_HEIGHT,
	JETPACK_HUD_BAR_WIDTH,
	JETPACK_HUD_OFFSET_Y,
	LAVA_GLOW_ALPHA,
	LAVA_GLOW_COLOR,
	LAVA_GLOW_HEIGHT,
	LAVA_GLOW_STEPS,
	LAVA_METER_HEIGHT,
	LAVA_METER_MARGIN_TOP,
	LAVA_METER_WIDTH,
	LAVA_METER_X,
	LEAF_PARTICLE_DRIFT_SPEED,
	LEAF_PARTICLE_HEIGHT,
	LEAF_PARTICLE_INTERVAL,
	LEAF_PARTICLE_LIFETIME,
	LEAF_PARTICLE_MAX,
	LEAF_PARTICLE_WIDTH,
	LEAF_PARTICLE_WOBBLE_AMPLITUDE,
	LEAF_PARTICLE_WOBBLE_SPEED,
	MAX_LIVES,
	MUSIC_VOLUME,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	SKY_GRADIENT_BAND_HEIGHT,
	SKY_GRADIENT_BOTTOM_COLOR,
	SKY_GRADIENT_DEPTH,
	SKY_GRADIENT_MID_COLOR,
	SKY_GRADIENT_TOP_COLOR,
	TILE_SIZE,
	TRAIL_PARTICLE_SIZE,
	UI_DEPTH,
	WIN_ZONE_Y_TILES,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";
import {
	type BlockInteraction,
	createBlockInteraction,
	handleBlockBreak,
	handleBlockPlace,
} from "../player/block-interaction";
import { InventoryBar } from "../player/inventory";
import {
	createGameInput,
	Player,
	readGamepadButtons,
	readGamepadRightStick,
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
import { Npc } from "../world/npcs";
import { updateWater } from "../world/water-physics";
import {
	createWorldTextures,
	removeBlockSprite,
	renderWorld,
} from "../world/world-renderer";
import type { CharacterConfig } from "./title-scene";

const FRUIT_TYPES: ReadonlySet<BlockType> = new Set([
	BlockType.Apple,
	BlockType.Pear,
	BlockType.Peach,
	BlockType.Strawberry,
	BlockType.Berry,
]);

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
	private inventory!: InventoryBar;
	private blockInteraction!: BlockInteraction;
	private lava!: LavaLayer;
	private glideIndicator!: Phaser.GameObjects.Text;
	private hoverHighlight!: Phaser.GameObjects.Graphics;
	private dayNight!: DayNightCycle;
	private lavaMeterGfx!: Phaser.GameObjects.Graphics;
	private lavaMeterLabel!: Phaser.GameObjects.Text;
	private gpLBWasDown = false;
	private gpRBWasDown = false;
	private gpBWasDown = false;
	private gamepadCrosshair!: Phaser.GameObjects.Graphics;
	private gameTimer = 0;
	private timerText!: Phaser.GameObjects.Text;
	private livesText!: Phaser.GameObjects.Text;
	private fruitText!: Phaser.GameObjects.Text;
	private jetpackBarGfx!: Phaser.GameObjects.Graphics;

	// NPCs
	private npcs: Npc[] = [];

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

	// Music
	private music!: MusicPlayer;
	private musicMuted = false;

	constructor() {
		super({ key: "GameScene" });
	}

	shutdown(): void {
		// Clean up event listeners to prevent accumulation across restarts
		this.input.removeAllListeners();
		if (this.input.keyboard) {
			this.input.keyboard.removeAllListeners();
		}
		// Stop background music
		stopMusic(this.music);
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
		const { grid, spawnX, spawnY, npcPositions } = generateWorld();
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

		// Generate particle dot texture for trail effects
		if (!this.textures.exists("particle_dot")) {
			const gfx = this.add.graphics();
			gfx.fillStyle(0xffffff);
			gfx.fillCircle(
				TRAIL_PARTICLE_SIZE / 2,
				TRAIL_PARTICLE_SIZE / 2,
				TRAIL_PARTICLE_SIZE / 2,
			);
			gfx.generateTexture(
				"particle_dot",
				TRAIL_PARTICLE_SIZE,
				TRAIL_PARTICLE_SIZE,
			);
			gfx.destroy();
		}

		// Player
		this.player = new Player(this, spawnX, spawnY, data);

		// NPCs
		this.npcs = npcPositions.map((pos) => new Npc(this, pos.x, pos.y));

		// Camera
		this.cameras.main.setBounds(
			0,
			0,
			WORLD_WIDTH_TILES * TILE_SIZE,
			WORLD_HEIGHT_TILES * TILE_SIZE,
		);
		this.cameras.main.startFollow(this.player, true, CAMERA_LERP, CAMERA_LERP);

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
				this.inventory.render();
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
				this.inventory.render();
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
		this.inventory = new InventoryBar(this);
		this.inventory.render();

		// Block interaction
		this.blockInteraction = createBlockInteraction();

		// Hover highlight
		this.hoverHighlight = this.add.graphics();

		// Gamepad right-stick crosshair
		this.gamepadCrosshair = this.add.graphics();

		// Day/night cycle
		this.dayNight = createDayNight(this);

		// -- HUD: Top-left status panel --
		const hudBgLeft = this.add.rectangle(
			HUD_LEFT_X,
			HUD_LEFT_X,
			HUD_LEFT_W,
			HUD_LEFT_H,
			0x000000,
			HUD_BG_ALPHA,
		);
		hudBgLeft.setOrigin(0, 0);
		hudBgLeft.setScrollFactor(0);
		hudBgLeft.setDepth(HUD_DEPTH);
		const hudBgLeftBorder = this.add.graphics();
		hudBgLeftBorder.lineStyle(1, 0xffffff, HUD_BORDER_ALPHA);
		hudBgLeftBorder.strokeRoundedRect(
			HUD_LEFT_X,
			HUD_LEFT_X,
			HUD_LEFT_W,
			HUD_LEFT_H,
			HUD_BORDER_RADIUS,
		);
		hudBgLeftBorder.setScrollFactor(0);
		hudBgLeftBorder.setDepth(HUD_DEPTH);

		this.glideIndicator = this.add.text(HUD_GLIDE_X, HUD_GLIDE_Y, "", {
			fontSize: "16px",
			color: HUD_GLIDE_COLOR,
			fontStyle: "bold",
		});
		this.glideIndicator.setResolution(2);
		this.glideIndicator.setScrollFactor(0);
		this.glideIndicator.setDepth(UI_DEPTH);

		// -- HUD: Top-right lives panel --
		const camW = this.cameras.main.width;
		const hudBgRight = this.add.rectangle(
			camW - HUD_LEFT_X,
			HUD_LEFT_X,
			HUD_RIGHT_W,
			HUD_RIGHT_H,
			0x000000,
			HUD_BG_ALPHA,
		);
		hudBgRight.setOrigin(1, 0);
		hudBgRight.setScrollFactor(0);
		hudBgRight.setDepth(HUD_DEPTH);
		const hudBgRightBorder = this.add.graphics();
		hudBgRightBorder.lineStyle(1, 0xffffff, HUD_BORDER_ALPHA);
		hudBgRightBorder.strokeRoundedRect(
			camW - HUD_LEFT_X - HUD_RIGHT_W,
			HUD_LEFT_X,
			HUD_RIGHT_W,
			HUD_RIGHT_H,
			HUD_BORDER_RADIUS,
		);
		hudBgRightBorder.setScrollFactor(0);
		hudBgRightBorder.setDepth(HUD_DEPTH);

		this.livesText = this.add.text(camW - HUD_LIVES_OFFSET_X, HUD_LIVES_Y, "", {
			fontSize: "22px",
			color: HUD_LIVES_COLOR,
		});
		this.livesText.setResolution(2);
		this.livesText.setOrigin(1, 0);
		this.livesText.setScrollFactor(0);
		this.livesText.setDepth(UI_DEPTH);

		this.fruitText = this.add.text(camW - HUD_LIVES_OFFSET_X, HUD_FRUIT_Y, "", {
			fontSize: "14px",
			color: HUD_FRUIT_COLOR,
		});
		this.fruitText.setResolution(2);
		this.fruitText.setOrigin(1, 0);
		this.fruitText.setScrollFactor(0);
		this.fruitText.setDepth(UI_DEPTH);

		this.updateLivesHUD();

		// Timer HUD (top center)
		this.timerText = this.add.text(this.cameras.main.width / 2, 14, "0:00", {
			fontSize: "18px",
			color: HUD_TIMER_COLOR,
			fontStyle: "bold",
		});
		this.timerText.setResolution(2);
		this.timerText.setOrigin(0.5, 0);
		this.timerText.setScrollFactor(0);
		this.timerText.setDepth(100);
		this.gameTimer = 0;
		// Lava progress meter (left side vertical bar)
		this.lavaMeterGfx = this.add.graphics();
		this.lavaMeterGfx.setScrollFactor(0);
		this.lavaMeterGfx.setDepth(100);
		this.lavaMeterLabel = this.add.text(
			LAVA_METER_X + LAVA_METER_WIDTH + 4,
			LAVA_METER_MARGIN_TOP - 12,
			"",
			{
				fontSize: "10px",
				color: HUD_LAVA_LABEL_COLOR,
			},
		);
		this.lavaMeterLabel.setResolution(2);
		this.lavaMeterLabel.setScrollFactor(0);
		this.lavaMeterLabel.setDepth(100);

		// Jetpack fuel HUD bar (drawn next to lives display, only visible when fuel > 0)
		this.jetpackBarGfx = this.add.graphics();
		this.jetpackBarGfx.setScrollFactor(0);
		this.jetpackBarGfx.setDepth(UI_DEPTH);

		// Background music (respects settings toggle)
		this.music = createMusic();
		const audioSettings = loadSettings();
		if (audioSettings.musicEnabled) {
			startMusic(this.music);
		}

		// M key toggles music on/off
		this.input.keyboard.on("keydown-M", () => {
			this.musicMuted = !this.musicMuted;
			setMusicVolume(this.music, this.musicMuted ? 0 : MUSIC_VOLUME);
		});
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
		const playerGx = Math.floor(this.player.x / TILE_SIZE);
		const playerGy = Math.floor(this.player.y / TILE_SIZE);
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
		const gameOver = this.player.update(input, this.grid, lavaY, delta);
		if (gameOver) {
			this.scene.start("GameOverScene");
			return;
		}

		// Win check — reached the top of the world
		if (this.player.y < WIN_ZONE_Y_TILES * TILE_SIZE) {
			this.scene.start("VictoryScene", { timeMs: this.gameTimer });
			return;
		}

		// Timer
		this.gameTimer += delta;
		const mins = Math.floor(this.gameTimer / 60000);
		const secs = Math.floor((this.gameTimer % 60000) / 1000);
		this.timerText.setText(`${mins}:${secs.toString().padStart(2, "0")}`);

		this.collectFruit();
		this.collectJetpack();
		this.updateLivesHUD();
		this.updateJetpackHUD();
		this.updateLavaMeter(lavaY);
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
		updateDayNight(this.dayNight, this, this.player.x, this.player.y, delta);

		// Background clouds parallax
		this.updateClouds();

		// Falling leaf particles
		this.updateLeafParticles(delta);

		// Ambient upward-drifting particles
		this.updateAmbientParticles(delta);

		// NPC dialogue
		for (const npc of this.npcs) {
			npc.update(this.player.x, this.player.y, delta);
		}

		// Glide / Jetpack indicator
		if (this.player.jetpackActive) {
			this.glideIndicator.setText("JETPACK");
		} else if (this.player.isGliding) {
			this.glideIndicator.setText("GLIDING");
		} else if (!this.player.isGrounded) {
			this.glideIndicator.setText("Hold SPACE to glide");
		} else {
			this.glideIndicator.setText("");
		}
	}

	private getGamepadTargetTile = (): { gx: number; gy: number } => {
		const playerGx = Math.floor(this.player.x / TILE_SIZE);
		const playerGy = Math.floor(this.player.y / TILE_SIZE);

		const rightStick = readGamepadRightStick();
		const magnitude = Math.sqrt(
			rightStick.x * rightStick.x + rightStick.y * rightStick.y,
		);

		if (magnitude > GAMEPAD_RIGHT_STICK_DEADZONE) {
			// Snap angle to 8 directions (N, NE, E, SE, S, SW, W, NW)
			const angle = Math.atan2(rightStick.y, rightStick.x);
			const snapped = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);
			const dx = Math.round(Math.cos(snapped));
			const dy = Math.round(Math.sin(snapped));
			return { gx: playerGx + dx, gy: playerGy + dy };
		}

		// Fallback: one tile in the facing direction
		const dir = this.player.facingRight ? 1 : -1;
		return { gx: playerGx + dir, gy: playerGy };
	};

	private updateGamepadCrosshair = (): void => {
		this.gamepadCrosshair.clear();

		const rightStick = readGamepadRightStick();
		const magnitude = Math.sqrt(
			rightStick.x * rightStick.x + rightStick.y * rightStick.y,
		);

		if (magnitude <= GAMEPAD_RIGHT_STICK_DEADZONE) {
			return;
		}

		const { gx, gy } = this.getGamepadTargetTile();

		// Bounds check
		if (
			gy < 0 ||
			gy >= this.grid.length ||
			gx < 0 ||
			gx >= this.grid[0].length
		) {
			return;
		}

		this.gamepadCrosshair.lineStyle(
			HOVER_HIGHLIGHT_LINE_WIDTH,
			HOVER_HIGHLIGHT_COLOR,
			HOVER_HIGHLIGHT_ALPHA,
		);
		this.gamepadCrosshair.strokeRect(
			gx * TILE_SIZE,
			gy * TILE_SIZE,
			TILE_SIZE,
			TILE_SIZE,
		);
	};

	private handleGamepadActions = (): void => {
		const { lb, rb, x, b } = readGamepadButtons();

		// LB/RB cycle inventory
		if (lb && !this.gpLBWasDown) {
			this.inventory.selectedIndex =
				(this.inventory.selectedIndex - 1 + INVENTORY_SLOTS) % INVENTORY_SLOTS;
			this.inventory.render();
		}
		if (rb && !this.gpRBWasDown) {
			this.inventory.selectedIndex =
				(this.inventory.selectedIndex + 1) % INVENTORY_SLOTS;
			this.inventory.render();
		}
		this.gpLBWasDown = lb;
		this.gpRBWasDown = rb;

		// Determine target tile (right stick or facing direction fallback)
		const { gx, gy } = this.getGamepadTargetTile();

		// X = break block at target tile
		if (x) {
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

		// B = place block at target tile (edge-triggered)
		if (b && !this.gpBWasDown) {
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

		// Update crosshair indicator
		this.updateGamepadCrosshair();
	};

	private collectFruit = (): void => {
		// Check the tiles the player overlaps
		const px = this.player.x;
		const py = this.player.y;
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
				const popup = this.add.text(
					px,
					py - FRUIT_POPUP_OFFSET_Y,
					"+1 \u2764\ufe0f",
					{
						fontSize: "18px",
						color: HUD_LIFE_POPUP_COLOR,
					},
				);
				popup.setOrigin(0.5);
				this.tweens.add({
					targets: popup,
					y: py - FRUIT_POPUP_RISE,
					alpha: 0,
					duration: FRUIT_POPUP_DURATION,
					onComplete: () => popup.destroy(),
				});
			}
		}
	};

	private collectJetpack = (): void => {
		const px = this.player.x;
		const py = this.player.y;
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
			if (this.grid[gy][gx] !== BlockType.Jetpack) continue;

			// Consume jetpack block
			this.grid[gy][gx] = BlockType.Air;
			removeBlockSprite(this.blockGroup, gx, gy);

			// Add fuel (cumulative)
			this.player.jetpackFuel += JETPACK_FUEL_MS;

			// Popup text
			const popup = this.add.text(
				px,
				py - FRUIT_POPUP_OFFSET_Y,
				"+3s JETPACK",
				{
					fontSize: "18px",
					color: HUD_JETPACK_POPUP_COLOR,
					fontStyle: "bold",
				},
			);
			popup.setOrigin(0.5);
			this.tweens.add({
				targets: popup,
				y: py - FRUIT_POPUP_RISE,
				alpha: 0,
				duration: FRUIT_POPUP_DURATION,
				onComplete: () => popup.destroy(),
			});
		}
	};

	private updateJetpackHUD = (): void => {
		this.jetpackBarGfx.clear();

		if (this.player.jetpackFuel <= 0) return;

		// Position next to the lives display (top-right area)
		const camW = this.cameras.main.width;
		const barX = camW - HUD_LIVES_OFFSET_X - JETPACK_HUD_BAR_WIDTH;
		const barY = HUD_FRUIT_Y + 20 + JETPACK_HUD_OFFSET_Y;

		// Background
		this.jetpackBarGfx.fillStyle(0x000000, 0.5);
		this.jetpackBarGfx.fillRect(
			barX,
			barY,
			JETPACK_HUD_BAR_WIDTH,
			JETPACK_HUD_BAR_HEIGHT,
		);

		// Orange fuel fill
		const fuelRatio = Math.min(this.player.jetpackFuel / JETPACK_FUEL_MS, 1);
		this.jetpackBarGfx.fillStyle(JETPACK_COLOR);
		this.jetpackBarGfx.fillRect(
			barX,
			barY,
			JETPACK_HUD_BAR_WIDTH * fuelRatio,
			JETPACK_HUD_BAR_HEIGHT,
		);

		// Border
		this.jetpackBarGfx.lineStyle(1, 0xffffff, 0.3);
		this.jetpackBarGfx.strokeRect(
			barX,
			barY,
			JETPACK_HUD_BAR_WIDTH,
			JETPACK_HUD_BAR_HEIGHT,
		);
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

	private updateLavaMeter = (lavaY: number): void => {
		const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;
		const meterX = LAVA_METER_X;
		const meterY = LAVA_METER_MARGIN_TOP;
		const meterW = LAVA_METER_WIDTH;
		const meterH = LAVA_METER_HEIGHT;

		const playerY = this.player.y;

		// Normalize positions (0 = top of world, 1 = bottom)
		const playerNorm = Math.max(0, Math.min(1, playerY / worldH));
		const lavaNorm = Math.max(0, Math.min(1, lavaY / worldH));

		this.lavaMeterGfx.clear();

		// Background track
		this.lavaMeterGfx.fillStyle(0x000000, 0.5);
		this.lavaMeterGfx.fillRoundedRect(meterX, meterY, meterW, meterH, 4);
		this.lavaMeterGfx.lineStyle(1, 0xffffff, 0.15);
		this.lavaMeterGfx.strokeRoundedRect(meterX, meterY, meterW, meterH, 4);

		// Lava fill (red, from bottom up to lava position)
		const lavaFillH = (1 - lavaNorm) * meterH;
		if (lavaFillH > 0) {
			this.lavaMeterGfx.fillStyle(0xff4400, 0.6);
			this.lavaMeterGfx.fillRect(
				meterX + 1,
				meterY + meterH - lavaFillH,
				meterW - 2,
				lavaFillH,
			);
		}

		// Goal zone at top (golden)
		this.lavaMeterGfx.fillStyle(0xffd700, 0.4);
		this.lavaMeterGfx.fillRect(meterX + 1, meterY, meterW - 2, 8);

		// Player position marker (white dot)
		const playerMeterY = meterY + playerNorm * meterH;
		this.lavaMeterGfx.fillStyle(0xffffff);
		this.lavaMeterGfx.fillCircle(meterX + meterW / 2, playerMeterY, 4);
		this.lavaMeterGfx.lineStyle(1, 0x000000, 0.5);
		this.lavaMeterGfx.strokeCircle(meterX + meterW / 2, playerMeterY, 4);

		// Height label in meters (1 tile = 1m)
		const heightInMeters = Math.floor((worldH - playerY) / TILE_SIZE);
		this.lavaMeterLabel.setText(`${heightInMeters}m`);
	};

	private createClouds = (): void => {
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
		const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;

		for (let i = 0; i < CLOUD_COUNT; i++) {
			const cloudX = Math.random() * worldW;
			const cloudY = Math.random() * worldH * 0.5; // upper half of world
			const children: Phaser.GameObjects.Ellipse[] = [];

			// Each cloud is 2-3 overlapping white ellipses
			const circleCount =
				CLOUD_CIRCLE_COUNT_BASE +
				Math.floor(Math.random() * CLOUD_CIRCLE_COUNT_RANGE);
			for (let c = 0; c < circleCount; c++) {
				const ellipse = this.add.ellipse(
					(c - 1) * CLOUD_CIRCLE_SPACING +
						Math.random() * CLOUD_CIRCLE_JITTER_X,
					Math.random() * CLOUD_CIRCLE_JITTER_Y - CLOUD_CIRCLE_JITTER_Y / 2,
					CLOUD_ELLIPSE_WIDTH_BASE + Math.random() * CLOUD_ELLIPSE_WIDTH_RANGE,
					CLOUD_ELLIPSE_HEIGHT_BASE +
						Math.random() * CLOUD_ELLIPSE_HEIGHT_RANGE,
					COLORS.white,
					CLOUD_ALPHA + Math.random() * CLOUD_ALPHA_JITTER,
				);
				children.push(ellipse);
			}

			const container = this.add.container(cloudX, cloudY, children);
			container.setDepth(CLOUD_DEPTH);
			this.clouds.push(container);
		}
	};

	private updateClouds = (): void => {
		const worldW = WORLD_WIDTH_TILES * TILE_SIZE;

		for (const cloud of this.clouds) {
			cloud.x += CLOUD_SPEED;
			if (cloud.x > worldW + CLOUD_WRAP_MARGIN) {
				cloud.x = -CLOUD_WRAP_MARGIN;
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
		gfx.setDepth(SKY_GRADIENT_DEPTH);

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
		for (let i = 0; i < GOAL_BEACON_GLOW_STEPS; i++) {
			const alpha = GOAL_BEACON_GLOW_ALPHA * (1 - i / GOAL_BEACON_GLOW_STEPS);
			gfx.fillStyle(GOAL_BEACON_COLOR, alpha);
			gfx.fillRect(
				0,
				i * (beaconH / GOAL_BEACON_GLOW_STEPS),
				worldW,
				beaconH / GOAL_BEACON_GLOW_STEPS + 1,
			);
		}

		// Central light beam
		const beamX = worldW / 2;
		const beam = this.add.rectangle(
			beamX,
			beaconH / 2,
			GOAL_BEACON_BEAM_WIDTH,
			beaconH,
			GOAL_BEACON_COLOR,
			GOAL_BEACON_BEAM_ALPHA,
		);
		beam.setDepth(-14);
		beam.setBlendMode(Phaser.BlendModes.ADD);

		// Pulse the beam
		this.tweens.add({
			targets: beam,
			alpha: GOAL_BEACON_PULSE_ALPHA,
			scaleX: GOAL_BEACON_PULSE_SCALE_X,
			duration: GOAL_BEACON_PULSE_DURATION,
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
		const steps = LAVA_GLOW_STEPS;
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
			const color =
				Math.random() < AMBIENT_PARTICLE_COLOR_CHANCE
					? 0xffffff
					: AMBIENT_PARTICLE_ALT_COLOR;

			const x = Math.random() * worldW;
			const y = Math.random() * worldH;

			const circle = this.add.circle(x, y, radius, color, alpha);
			circle.setDepth(AMBIENT_PARTICLE_DEPTH);

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
