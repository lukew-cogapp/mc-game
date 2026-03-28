import type Toast from "phaser3-rex-plugins/templates/ui/toast/Toast";
import {
	createMusic,
	type MusicPlayer,
	setMusicVolume,
	startMusic,
	stopMusic,
} from "../audio/music";
import { loadSettings } from "../audio/settings";
import {
	BLOCK_INTERACT_RANGE,
	CAMERA_LERP,
	DEATH_INVULNERABLE_MS,
	ENEMY_BODY_HEIGHT,
	ENEMY_BODY_WIDTH,
	ENEMY_STOMP_BOUNCE,
	FRUIT_PER_LIFE,
	FRUIT_POPUP_DURATION,
	FRUIT_POPUP_OFFSET_Y,
	FRUIT_POPUP_RISE,
	GAMEPAD_RIGHT_STICK_DEADZONE,
	HOVER_HIGHLIGHT_ALPHA,
	HOVER_HIGHLIGHT_COLOR,
	HOVER_HIGHLIGHT_LINE_WIDTH,
	HOVER_TOOLTIP_BG,
	HOVER_TOOLTIP_FONT_SIZE,
	HOVER_TOOLTIP_OFFSET_Y,
	HUD_FRUIT_COLOR,
	HUD_FRUIT_FONT_SIZE,
	HUD_FRUIT_MARGIN_RIGHT,
	HUD_FRUIT_OFFSET_Y,
	HUD_FRUIT_Y,
	HUD_JETPACK_POPUP_COLOR,
	HUD_LIFE_POPUP_COLOR,
	HUD_LIVES_COLOR,
	HUD_LIVES_FONT_SIZE,
	HUD_LIVES_MARGIN_RIGHT,
	HUD_LIVES_OFFSET_X,
	HUD_LIVES_Y,
	HUD_TIMER_BG_COLOR,
	HUD_TIMER_COLOR,
	HUD_TIMER_FONT_SIZE,
	HUD_TIMER_PADDING_X,
	HUD_TIMER_PADDING_Y,
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
	MAX_LIVES,
	MUSIC_VOLUME,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	TEXT_RESOLUTION,
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
import { BLOCK_NAMES, InventoryBar } from "../player/inventory";
import {
	Player,
	readGamepadButtons,
	readGamepadRightStick,
} from "../player/player";
import { BlockType } from "../types";
import {
	createLavaMeter,
	type LavaMeterUI,
	updateLavaMeter,
} from "../ui/lava-meter";
import {
	type AmbientParticle,
	createAmbientParticles,
	createClouds,
	type LeafParticle,
	updateAmbientParticles,
	updateClouds,
	updateLeafParticles,
} from "../world/ambient";
import { DayNightCycle } from "../world/day-night";
import { Enemy } from "../world/enemies";
import { generateWorld } from "../world/island-generator";
import { Lava } from "../world/lava";
import { Npc } from "../world/npcs";
import { drawGoalBeacon, drawSkyGradient } from "../world/sky";
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
	private lava!: Lava;
	private hoverHighlight!: Phaser.GameObjects.Graphics;
	private hoverTooltip!: Phaser.GameObjects.Text;
	private toast!: Toast;
	private dayNight!: DayNightCycle;
	private lavaMeter!: LavaMeterUI;
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

	// Enemies
	private enemies: Enemy[] = [];

	// Clouds
	private clouds: Phaser.GameObjects.Container[] = [];

	// Falling leaves
	private leafParticles: LeafParticle[] = [];
	private leafSpawnTimer = 0;
	private lavaGlowGfx!: Phaser.GameObjects.Graphics;

	// Ambient upward-drifting particles
	private ambientParticles: AmbientParticle[] = [];

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
		drawSkyGradient(this);

		// Goal beacon at the top of the world
		drawGoalBeacon(this);

		// Background clouds (created before world so they sit behind everything)
		this.clouds = createClouds(this);

		// Generate world
		createWorldTextures(this);
		const { grid, spawnX, spawnY, npcPositions, enemyPositions } =
			generateWorld();
		this.grid = grid;
		this.blockGroup = renderWorld(this, grid);

		// Ambient upward-drifting particles (world space)
		this.ambientParticles = createAmbientParticles(this);

		// Lava lake at world bottom
		this.lava = new Lava(this);

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
		this.npcs = npcPositions.map(
			(pos) => new Npc(this, pos.x, pos.y, pos.name),
		);

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

		// Pass keyboard refs to the player for preUpdate input computation
		this.player.setInput(this.cursors, this.wasd, this.spaceKey);

		// Set initial grid on player so preUpdate can run immediately
		this.player.grid = this.grid;

		// Listen for player death events (emitted from Player.preUpdate)
		this.player.on("death", () => {
			this.scene.start("GameOverScene");
		});
		this.player.on("respawn", (lives: number) => {
			this.toast.showMessage(
				`You fell into the lava! ${lives} lives remaining`,
			);
		});
		this.player.on("crumbleBlock", (gx: number, gy: number) => {
			removeBlockSprite(this.blockGroup, gx, gy);
		});

		// Listen for NPC death events
		for (const npc of this.npcs) {
			npc.grid = this.grid;
			npc.on("death", (name: string) => {
				this.toast.showMessage(`${name} fell into the lava!`);
				const idx = this.npcs.indexOf(npc);
				if (idx !== -1) {
					this.npcs.splice(idx, 1);
				}
			});
		}

		// Enemies
		this.enemies = enemyPositions.map((pos) => new Enemy(this, pos.x, pos.y));
		for (const enemy of this.enemies) {
			enemy.grid = this.grid;
			enemy.on("death", () => {
				this.toast.showMessage("Enemy defeated!");
				const idx = this.enemies.indexOf(enemy);
				if (idx !== -1) {
					this.enemies.splice(idx, 1);
				}
			});
		}

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

		// Hover tooltip (screen-space, hidden initially)
		this.hoverTooltip = this.add
			.text(0, 0, "", {
				fontSize: HOVER_TOOLTIP_FONT_SIZE,
				backgroundColor: HOVER_TOOLTIP_BG,
				padding: { x: 4, y: 2 },
			})
			.setOrigin(0.5, 1)
			.setScrollFactor(0)
			.setDepth(UI_DEPTH)
			.setVisible(false);

		// Gamepad right-stick crosshair
		this.gamepadCrosshair = this.add.graphics();

		// Day/night cycle
		this.dayNight = new DayNightCycle(this);

		// -- HUD using rexUI --
		const camW = this.cameras.main.width;

		// Lives panel — manual positioning (rexUI anchor doesn't work with scrollFactor)
		this.livesText = this.add
			.text(camW - HUD_LIVES_MARGIN_RIGHT, HUD_LIVES_Y, "", {
				fontSize: HUD_LIVES_FONT_SIZE,
				color: HUD_LIVES_COLOR,
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(1, 0)
			.setScrollFactor(0)
			.setDepth(UI_DEPTH);
		this.fruitText = this.add
			.text(camW - HUD_FRUIT_MARGIN_RIGHT, HUD_FRUIT_OFFSET_Y, "", {
				fontSize: HUD_FRUIT_FONT_SIZE,
				color: HUD_FRUIT_COLOR,
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(1, 0)
			.setScrollFactor(0)
			.setDepth(UI_DEPTH);

		// Timer — top center with background
		this.timerText = this.add
			.text(camW / 2, HUD_LIVES_Y, "0:00", {
				fontSize: HUD_TIMER_FONT_SIZE,
				color: HUD_TIMER_COLOR,
				fontStyle: "bold",
				backgroundColor: HUD_TIMER_BG_COLOR,
				padding: { x: HUD_TIMER_PADDING_X, y: HUD_TIMER_PADDING_Y },
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5, 0)
			.setScrollFactor(0)
			.setDepth(UI_DEPTH);

		this.updateLivesHUD();
		this.gameTimer = 0;
		// Lava progress meter (left side vertical bar)
		this.lavaMeter = createLavaMeter(this);

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

		// Toast notifications (rexUI)
		this.toast = this.rexUI.add
			.toast({
				x: this.cameras.main.width - 20,
				y: this.cameras.main.height / 2,
				background: this.rexUI.add.roundRectangle(0, 0, 0, 0, 8, 0x000000, 0.7),
				text: this.add.text(0, 0, "", {
					fontSize: "16px",
					color: "#ffffff",
					fontStyle: "bold",
				}),
				space: { left: 12, right: 12, top: 8, bottom: 8 },
				duration: { in: 200, hold: 2500, out: 300 },
				transitIn: 1, // fadeIn
				transitOut: 1, // fadeOut
			})
			.setOrigin(1, 0.5)
			.setScrollFactor(0)
			.setDepth(101) as unknown as Toast;
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
			this.hoverTooltip.setVisible(false);
			return;
		}

		// Don't highlight Air blocks
		if (this.grid[gy][gx] === BlockType.Air) {
			this.hoverTooltip.setVisible(false);
			return;
		}

		// Range check against player position
		const playerGx = Math.floor(this.player.x / TILE_SIZE);
		const playerGy = Math.floor(this.player.y / TILE_SIZE);
		const dx = Math.abs(playerGx - gx);
		const dy = Math.abs(playerGy - gy);
		if (dx > BLOCK_INTERACT_RANGE || dy > BLOCK_INTERACT_RANGE) {
			this.hoverTooltip.setVisible(false);
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

		// Show block name tooltip at pointer
		const blockName = BLOCK_NAMES[this.grid[gy][gx]];
		this.hoverTooltip.setText(blockName);
		this.hoverTooltip.setPosition(
			pointer.x,
			pointer.y + HOVER_TOOLTIP_OFFSET_Y,
		);
		this.hoverTooltip.setVisible(true);
	};

	update(_time: number, delta: number): void {
		// Lava (rises over time — preUpdate handles animation)
		const lavaY = this.lava.getY();
		this.updateLavaGlow(lavaY);

		// Set per-frame properties on Player (preUpdate reads these)
		this.player.grid = this.grid;
		this.player.lavaY = lavaY;

		// Set per-frame properties on NPCs (preUpdate reads these)
		for (const npc of this.npcs) {
			npc.playerX = this.player.x;
			npc.playerY = this.player.y;
			npc.lavaY = lavaY;
			npc.grid = this.grid;
		}

		// Set per-frame properties on Enemies and check player collision
		for (const enemy of this.enemies) {
			enemy.playerX = this.player.x;
			enemy.playerY = this.player.y;
			enemy.lavaY = lavaY;
			enemy.grid = this.grid;
		}
		this.checkEnemyCollisions();

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
		updateLavaMeter(this.lavaMeter, this.player.y, lavaY);
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
		updateWater(this, this.grid, this.blockGroup, lavaY);

		// Hover highlight
		this.updateHoverHighlight();

		// Day/night cycle (preUpdate handles rendering)
		this.dayNight.playerX = this.player.x;
		this.dayNight.playerY = this.player.y;

		// Background clouds parallax
		updateClouds(this.clouds);

		// Falling leaf particles
		this.leafSpawnTimer = updateLeafParticles(
			this,
			this.grid,
			this.leafParticles,
			this.leafSpawnTimer,
			delta,
		);

		// Ambient upward-drifting particles
		updateAmbientParticles(this.ambientParticles, delta);
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
				popup.setResolution(TEXT_RESOLUTION);
				popup.setOrigin(0.5);
				this.tweens.add({
					targets: popup,
					y: py - FRUIT_POPUP_RISE,
					alpha: 0,
					duration: FRUIT_POPUP_DURATION,
					onComplete: () => popup.destroy(),
				});

				// Notification
				this.toast.showMessage("+1 Life! (from fruit)");
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
			popup.setResolution(TEXT_RESOLUTION);
			popup.setOrigin(0.5);
			this.tweens.add({
				targets: popup,
				y: py - FRUIT_POPUP_RISE,
				alpha: 0,
				duration: FRUIT_POPUP_DURATION,
				onComplete: () => popup.destroy(),
			});

			// Notification
			this.toast.showMessage("Jetpack fuel collected! +3s");
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

	private checkEnemyCollisions = (): void => {
		const pHalfW = PLAYER_WIDTH / 2;
		const pHalfH = PLAYER_HEIGHT / 2;
		const eHalfW = ENEMY_BODY_WIDTH / 2;
		const eHalfH = ENEMY_BODY_HEIGHT / 2;

		for (let i = this.enemies.length - 1; i >= 0; i--) {
			const enemy = this.enemies[i];
			if (!enemy.alive) continue;

			// AABB overlap check
			const overlapX = Math.abs(this.player.x - enemy.x) < pHalfW + eHalfW;
			const overlapY = Math.abs(this.player.y - enemy.y) < pHalfH + eHalfH;

			if (!overlapX || !overlapY) continue;

			// Player is above enemy center and moving downward: STOMP
			const playerBottom = this.player.y + pHalfH;

			if (playerBottom < enemy.y && this.player.velocityY > 0) {
				// Stomp kill
				enemy.alive = false;
				enemy.emit("death");
				enemy.destroy();
				this.player.velocityY = ENEMY_STOMP_BOUNCE;
			} else if (this.player.invulnerableTimer <= 0) {
				// Damage the player
				this.player.lives--;
				if (this.player.lives <= 0) {
					this.player.emit("death");
					return;
				}
				this.player.invulnerableTimer = DEATH_INVULNERABLE_MS;
				this.player.emit("respawn", this.player.lives);
			}
		}
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
}
