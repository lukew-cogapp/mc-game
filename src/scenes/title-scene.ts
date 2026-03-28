import {
	formatTimeMs,
	loadHighScores,
	resetHighScores,
} from "../audio/high-scores";
import {
	type GameSettings,
	loadSettings,
	saveSettings,
} from "../audio/settings";
import {
	CHARACTER_COLORS,
	COLORS,
	FACE_TYPES,
	HAT_TYPES,
	HIGH_SCORE_RESET_CONFIRM_MS,
	LOCAL_STORAGE_KEY,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	SKIN_COLORS,
	TITLE_BG_COLOR_BOTTOM,
	TITLE_BG_COLOR_TOP,
	TITLE_CELL_BG,
	TITLE_CELL_BG_HOVER,
	TITLE_CELL_GAP,
	TITLE_CELL_SELECTED_BORDER,
	TITLE_CELL_SIZE,
	TITLE_CELL_UNSELECTED_BORDER,
	TITLE_CHAR_GLOW_ALPHA,
	TITLE_CHAR_GLOW_COLOR,
	TITLE_CHAR_GLOW_RADIUS,
	TITLE_CHAR_OFFSET_Y,
	TITLE_CONTROLS_BACKDROP_ALPHA,
	TITLE_CONTROLS_CARD_H,
	TITLE_CONTROLS_CARD_W,
	TITLE_CONTROLS_CLOSE_COLOR,
	TITLE_CONTROLS_DESC_COLOR,
	TITLE_CONTROLS_DESC_OFFSET_X,
	TITLE_CONTROLS_HEADER_COLOR,
	TITLE_CONTROLS_KEY_OFFSET_X,
	TITLE_CONTROLS_OVERLAY_DEPTH,
	TITLE_CONTROLS_ROW_HEIGHT,
	TITLE_CONTROLS_START_OFFSET_Y,
	TITLE_DICE_BG_COLOR,
	TITLE_DICE_COLOR,
	TITLE_DICE_HOVER_COLOR,
	TITLE_DICE_OFFSET_Y,
	TITLE_GAMEPAD_CONNECTED_COLOR,
	TITLE_GLOW_ALPHA,
	TITLE_GLOW_COLOR,
	TITLE_HINT_COLOR,
	TITLE_HOVER_COLOR,
	TITLE_IDLE_BOUNCE_DURATION,
	TITLE_IDLE_BOUNCE_Y,
	TITLE_LEFT_PANEL_OFFSET_X,
	TITLE_LEFT_PANEL_W,
	TITLE_NAME_COLOR,
	TITLE_NAME_OFFSET_Y,
	TITLE_PANEL_ALPHA,
	TITLE_PANEL_BG,
	TITLE_PANEL_BORDER,
	TITLE_PANEL_H,
	TITLE_PANEL_INNER_GLOW_ALPHA,
	TITLE_PANEL_INNER_GLOW_COLOR,
	TITLE_PANEL_RADIUS,
	TITLE_PANEL_TOP,
	TITLE_PARTICLE_ALPHA_BASE,
	TITLE_PARTICLE_ALPHA_RANGE,
	TITLE_PARTICLE_COUNT,
	TITLE_PARTICLE_DRIFT_BASE,
	TITLE_PARTICLE_DRIFT_RANGE,
	TITLE_PARTICLE_DURATION_BASE,
	TITLE_PARTICLE_DURATION_RANGE,
	TITLE_PARTICLE_RADIUS,
	TITLE_PLATFORM_OFFSET_Y,
	TITLE_PREVIEW_HAT_OFFSET_Y,
	TITLE_PREVIEW_HEAD_OFFSET_Y,
	TITLE_PREVIEW_HEAD_RADIUS,
	TITLE_PREVIEW_SCALE,
	TITLE_RESET_BTN_FONT_SIZE,
	TITLE_RESET_BTN_OFFSET_Y,
	TITLE_RESET_COLOR,
	TITLE_RESET_CONFIRM_COLOR,
	TITLE_RESET_CONFIRM_HOVER_COLOR,
	TITLE_RESET_HOVER_COLOR,
	TITLE_RIGHT_PANEL_OFFSET_X,
	TITLE_RIGHT_PANEL_W,
	TITLE_SCORE_COLOR,
	TITLE_SCORE_GOLD_COLOR,
	TITLE_SCORES_EMPTY_COLOR,
	TITLE_SCORES_EMPTY_FONT_SIZE,
	TITLE_SCORES_HEADER_COLOR,
	TITLE_SCORES_HEADER_FONT_SIZE,
	TITLE_SCORES_OFFSET_Y,
	TITLE_SCORES_ROW_FONT_SIZE,
	TITLE_SCORES_ROW_HEIGHT,
	TITLE_SHADOW_ALPHA,
	TITLE_SHADOW_OFFSET,
	TITLE_START_BTN_FILL,
	TITLE_START_BTN_H,
	TITLE_START_BTN_HOVER_FILL,
	TITLE_START_BTN_HOVER_STROKE,
	TITLE_START_BTN_OFFSET_Y,
	TITLE_START_BTN_RADIUS,
	TITLE_START_BTN_STROKE,
	TITLE_START_BTN_W,
	TITLE_START_GLOW_ALPHA,
	TITLE_START_GLOW_COLOR,
	TITLE_START_GLOW_H,
	TITLE_START_GLOW_W,
	TITLE_START_LABEL_COLOR,
	TITLE_SUBTITLE_COLOR,
	TITLE_SUBTITLE_Y,
	TITLE_TAB_ACTIVE_ALPHA,
	TITLE_TAB_ACTIVE_COLOR,
	TITLE_TAB_CONTENT_OFFSET_Y,
	TITLE_TAB_CONTENT_PADDING,
	TITLE_TAB_GAP,
	TITLE_TAB_HOVER_ALPHA,
	TITLE_TAB_HOVER_COLOR,
	TITLE_TAB_INACTIVE_ALPHA,
	TITLE_TAB_INACTIVE_COLOR,
	TITLE_TAB_OFFSET_Y,
	TITLE_TEXT_COLOR,
	TITLE_TEXT_SHADOW_COLOR,
	TITLE_TOGGLE_OFF_COLOR,
	TITLE_TOGGLE_ON_COLOR,
	TITLE_Y,
	TRAIL_TYPES,
} from "../config";
import { drawFace } from "../player/face-renderer";

export interface CharacterConfig {
	bodyColor: number;
	skinColor: number;
	hat: (typeof HAT_TYPES)[number];
	face: (typeof FACE_TYPES)[number];
	trail: (typeof TRAIL_TYPES)[number];
}

// -- Persistence --

interface SavedConfig {
	body: number;
	skin: number;
	hat: number;
	face: number;
	trail: number;
}

const loadSavedConfig = (): SavedConfig => {
	try {
		const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				body: typeof parsed.body === "number" ? parsed.body : 0,
				skin: typeof parsed.skin === "number" ? parsed.skin : 0,
				hat: typeof parsed.hat === "number" ? parsed.hat : 0,
				face: typeof parsed.face === "number" ? parsed.face : 0,
				trail: typeof parsed.trail === "number" ? parsed.trail : 0,
			};
		}
	} catch {
		// Ignore
	}
	return { body: 0, skin: 0, hat: 0, face: 0, trail: 0 };
};

const saveConfig = (config: SavedConfig): void => {
	try {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(config));
	} catch {
		// Ignore
	}
};

// -- Emoji Maps --

const HAT_EMOJIS: Record<(typeof HAT_TYPES)[number], string> = {
	none: "\u2205",
	tophat: "\u{1f3a9}",
	crown: "\u{1f451}",
	propeller: "\u{1fa81}",
	antenna: "\u{1f4e1}",
	halo: "\u{1f607}",
	horns: "\u{1f608}",
	party: "\u{1f389}",
	poo: "\u{1f4a9}",
};

const FACE_LABELS: Record<(typeof FACE_TYPES)[number], string> = {
	none: "\u2205",
	happy: ":)",
	cool: "B)",
	angry: ">:(",
	surprised: ":O",
	sleepy: "-.-",
	silly: ":P",
	cyclops: "(o)",
};

const TRAIL_EMOJIS: Record<(typeof TRAIL_TYPES)[number], string> = {
	none: "\u2205",
	sparkles: "\u2728",
	hearts: "\u{1f496}",
	bubbles: "\u{1fae7}",
	fire: "\u{1f525}",
	rainbow: "\u{1f308}",
};

const SILLY_FIRST = [
	"Captain",
	"Lord",
	"Sir",
	"Professor",
	"Doctor",
	"The Great",
	"Baron",
	"Count",
	"Tiny",
	"Big",
	"Fancy",
	"Mega",
	"Ultra",
];
const SILLY_SECOND = [
	"Blocksworth",
	"McBridgeFace",
	"Glidington",
	"Voidwalker",
	"Lavadodger",
	"Skyreach",
	"Plonkington",
	"Wobblebeam",
	"Chunkmaster",
	"Bricksworth",
	"Floaterson",
	"Driftwood",
	"Gappington",
];

const TAB_LABELS = ["Outfit", "Skin", "Hat", "Face", "Trail"] as const;

type TabName = (typeof TAB_LABELS)[number];

// -- Scene --

export class TitleScene extends Phaser.Scene {
	private selected = { body: 0, skin: 0, hat: 0, face: 0, trail: 0 };
	private activeTab: TabName = "Outfit";

	// Preview elements
	private previewBody!: Phaser.GameObjects.Rectangle;
	private previewHead!: Phaser.GameObjects.Arc;
	private previewHat!: Phaser.GameObjects.Text;
	private previewFaceGfx!: Phaser.GameObjects.Graphics;
	private previewTrail!: Phaser.GameObjects.Text;
	private nameLabel!: Phaser.GameObjects.Text;
	private previewContainer!: Phaser.GameObjects.Container;

	// Tab content
	private tabContainer!: Phaser.GameObjects.Container;
	private tabButtons: Phaser.GameObjects.Text[] = [];
	private tabIndicators: Phaser.GameObjects.Rectangle[] = [];

	// Controls overlay
	private controlsOverlay!: Phaser.GameObjects.Container;
	private controlsVisible = false;
	private settings!: GameSettings;

	// Start button glow
	private startGlow!: Phaser.GameObjects.Rectangle;

	constructor() {
		super({ key: "TitleScene" });
	}

	create(): void {
		this.events.on("shutdown", () => {
			this.input.removeAllListeners();
			if (this.input.keyboard) this.input.keyboard.removeAllListeners();
		});

		const saved = loadSavedConfig();
		this.selected = { ...saved };
		this.settings = loadSettings();

		const { width, height } = this.cameras.main;
		const cx = width / 2;

		// -- Background gradient --
		const bgGfx = this.add.graphics();
		const bgTop = Phaser.Display.Color.IntegerToColor(TITLE_BG_COLOR_TOP);
		const bgBottom = Phaser.Display.Color.IntegerToColor(TITLE_BG_COLOR_BOTTOM);
		const steps = TITLE_PARTICLE_COUNT;
		for (let i = 0; i < steps; i++) {
			const color = Phaser.Display.Color.Interpolate.ColorWithColor(
				bgTop,
				bgBottom,
				steps,
				i,
			);
			bgGfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
			bgGfx.fillRect(0, (height / steps) * i, width, height / steps + 1);
		}

		// -- Floating particles (ambient) --
		for (let i = 0; i < TITLE_PARTICLE_COUNT; i++) {
			const px = Math.random() * width;
			const py = Math.random() * height;
			const dot = this.add.circle(
				px,
				py,
				TITLE_PARTICLE_RADIUS,
				0xffffff,
				TITLE_PARTICLE_ALPHA_BASE + Math.random() * TITLE_PARTICLE_ALPHA_RANGE,
			);
			this.tweens.add({
				targets: dot,
				y:
					py -
					TITLE_PARTICLE_DRIFT_BASE -
					Math.random() * TITLE_PARTICLE_DRIFT_RANGE,
				alpha: 0,
				duration:
					TITLE_PARTICLE_DURATION_BASE +
					Math.random() * TITLE_PARTICLE_DURATION_RANGE,
				repeat: -1,
				yoyo: true,
				delay: Math.random() * TITLE_PARTICLE_DURATION_BASE,
			});
		}

		// -- Title --
		// Text shadow (drawn first, offset)
		this.add
			.text(
				cx + TITLE_SHADOW_OFFSET,
				TITLE_Y + TITLE_SHADOW_OFFSET,
				"DRIFT LANDS",
				{
					fontSize: "52px",
					color: TITLE_TEXT_SHADOW_COLOR,
					fontStyle: "bold",
				},
			)
			.setOrigin(0.5)
			.setAlpha(TITLE_SHADOW_ALPHA);
		this.add
			.text(cx, TITLE_Y, "DRIFT LANDS", {
				fontSize: "52px",
				color: TITLE_TEXT_COLOR,
				fontStyle: "bold",
			})
			.setOrigin(0.5);
		// Subtle glow via duplicate
		const titleGlow = this.add
			.text(cx, TITLE_Y, "DRIFT LANDS", {
				fontSize: "52px",
				color: TITLE_GLOW_COLOR,
				fontStyle: "bold",
			})
			.setOrigin(0.5)
			.setAlpha(TITLE_GLOW_ALPHA);
		titleGlow.setBlendMode(Phaser.BlendModes.ADD);

		this.add
			.text(cx, TITLE_SUBTITLE_Y, "Reach the sky before the lava rises", {
				fontSize: "14px",
				color: TITLE_SUBTITLE_COLOR,
			})
			.setOrigin(0.5);

		// -- Left panel: Character preview --
		const leftPanelX = cx + TITLE_LEFT_PANEL_OFFSET_X;
		const panelTop = TITLE_PANEL_TOP;
		const panelW = TITLE_LEFT_PANEL_W;
		const panelH = TITLE_PANEL_H;

		// Panel background
		this.drawPanel(leftPanelX - panelW / 2, panelTop, panelW, panelH);

		// Mini floating island platform
		const platformY = panelTop + TITLE_PLATFORM_OFFSET_Y;
		const platform = this.add.graphics();
		platform.fillStyle(COLORS.grass);
		platform.fillRoundedRect(leftPanelX - 40, platformY, 80, 12, 4);
		platform.fillStyle(COLORS.dirt);
		platform.fillRoundedRect(leftPanelX - 35, platformY + 10, 70, 10, 4);

		// Character preview
		const charY = platformY - TITLE_CHAR_OFFSET_Y;
		this.previewBody = this.add.rectangle(
			leftPanelX,
			charY,
			PLAYER_WIDTH * TITLE_PREVIEW_SCALE,
			PLAYER_HEIGHT * TITLE_PREVIEW_SCALE,
			CHARACTER_COLORS[this.selected.body],
		);
		const headY = charY - PLAYER_HEIGHT * 1.2 - TITLE_PREVIEW_HEAD_OFFSET_Y;
		this.previewHead = this.add.circle(
			leftPanelX,
			headY,
			TITLE_PREVIEW_HEAD_RADIUS,
			SKIN_COLORS[this.selected.skin],
		);
		this.previewHat = this.add
			.text(
				leftPanelX,
				charY - PLAYER_HEIGHT * 1.2 - TITLE_PREVIEW_HAT_OFFSET_Y,
				"",
				{ fontSize: "24px" },
			)
			.setOrigin(0.5);
		this.previewFaceGfx = this.add.graphics();
		this.previewFaceGfx.setPosition(leftPanelX, headY);
		this.previewTrail = this.add
			.text(
				leftPanelX,
				charY + PLAYER_HEIGHT * 1.2 + TITLE_PREVIEW_HEAD_OFFSET_Y,
				"",
				{ fontSize: "12px" },
			)
			.setOrigin(0.5);

		// Soft circular glow behind character
		const charGlow = this.add.circle(
			leftPanelX,
			charY - 10,
			TITLE_CHAR_GLOW_RADIUS,
			TITLE_CHAR_GLOW_COLOR,
			TITLE_CHAR_GLOW_ALPHA,
		);

		// Group for idle animation
		this.previewContainer = this.add.container(0, 0, [
			charGlow,
			this.previewBody,
			this.previewHead,
			this.previewHat,
			this.previewFaceGfx,
			this.previewTrail,
		]);

		// Idle bounce
		this.tweens.add({
			targets: this.previewContainer,
			y: TITLE_IDLE_BOUNCE_Y,
			duration: TITLE_IDLE_BOUNCE_DURATION,
			yoyo: true,
			repeat: -1,
			ease: "Sine.easeInOut",
		});

		// Name label
		this.nameLabel = this.add
			.text(leftPanelX, panelTop + panelH - TITLE_NAME_OFFSET_Y, "", {
				fontSize: "14px",
				color: TITLE_NAME_COLOR,
				fontStyle: "italic",
			})
			.setOrigin(0.5);

		// Randomize button under name
		const diceBtn = this.add
			.text(
				leftPanelX,
				panelTop + panelH - TITLE_DICE_OFFSET_Y,
				"\u{1f3b2} Randomize",
				{
					fontSize: "14px",
					color: TITLE_DICE_COLOR,
					backgroundColor: TITLE_DICE_BG_COLOR,
					padding: { x: 10, y: 4 },
				},
			)
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		diceBtn.on("pointerover", () => diceBtn.setColor(TITLE_DICE_HOVER_COLOR));
		diceBtn.on("pointerout", () => diceBtn.setColor(TITLE_DICE_COLOR));
		diceBtn.on("pointerdown", () => {
			this.selected.body = Math.floor(Math.random() * CHARACTER_COLORS.length);
			this.selected.skin = Math.floor(Math.random() * SKIN_COLORS.length);
			this.selected.hat = Math.floor(Math.random() * HAT_TYPES.length);
			this.selected.face = Math.floor(Math.random() * FACE_TYPES.length);
			this.selected.trail = Math.floor(Math.random() * TRAIL_TYPES.length);
			// Bounce animation on randomize
			this.tweens.add({
				targets: this.previewContainer,
				scaleX: 1.2,
				scaleY: 0.85,
				duration: 80,
				yoyo: true,
			});
			this.updatePreview();
		});

		// -- Right panel: Customization --
		const rightPanelX = cx + TITLE_RIGHT_PANEL_OFFSET_X;
		const rightPanelW = TITLE_RIGHT_PANEL_W;

		this.drawPanel(
			rightPanelX - rightPanelW / 2,
			panelTop,
			rightPanelW,
			panelH,
		);

		// Tab bar
		const tabY = panelTop + TITLE_TAB_OFFSET_Y;
		this.tabButtons = [];
		this.tabIndicators = [];
		const tabGap = TITLE_TAB_GAP;
		const tabWidth =
			(rightPanelW - tabGap * (TAB_LABELS.length - 1)) / TAB_LABELS.length;

		for (let i = 0; i < TAB_LABELS.length; i++) {
			const tabName = TAB_LABELS[i];
			const tabX =
				rightPanelX - rightPanelW / 2 + (tabWidth + tabGap) * i + tabWidth / 2;
			const isActive = tabName === this.activeTab;

			// Underline indicator
			const indicator = this.add.rectangle(
				tabX,
				tabY + 12,
				tabWidth - 8,
				4,
				TITLE_CELL_SELECTED_BORDER,
			);
			indicator.setVisible(isActive);
			this.tabIndicators.push(indicator);

			// Tab label
			const tabBtn = this.add
				.text(tabX, tabY, tabName, {
					fontSize: "13px",
					color: isActive ? TITLE_TAB_ACTIVE_COLOR : TITLE_TAB_INACTIVE_COLOR,
					fontStyle: isActive ? "bold" : "",
				})
				.setOrigin(0.5)
				.setAlpha(isActive ? TITLE_TAB_ACTIVE_ALPHA : TITLE_TAB_INACTIVE_ALPHA)
				.setInteractive({ useHandCursor: true });

			tabBtn.on("pointerdown", () => {
				this.activeTab = tabName;
				this.renderTabContent(
					rightPanelX,
					panelTop + TITLE_TAB_CONTENT_OFFSET_Y,
					rightPanelW,
				);
				this.updateTabBar();
			});
			tabBtn.on("pointerover", () => {
				if (tabName !== this.activeTab) {
					tabBtn.setColor(TITLE_TAB_HOVER_COLOR);
					tabBtn.setAlpha(TITLE_TAB_HOVER_ALPHA);
				}
			});
			tabBtn.on("pointerout", () => {
				const active = tabName === this.activeTab;
				tabBtn.setColor(
					active ? TITLE_TAB_ACTIVE_COLOR : TITLE_TAB_INACTIVE_COLOR,
				);
				tabBtn.setAlpha(
					active ? TITLE_TAB_ACTIVE_ALPHA : TITLE_TAB_INACTIVE_ALPHA,
				);
			});

			this.tabButtons.push(tabBtn);
		}

		// Tab content container
		this.tabContainer = this.add.container(0, 0);
		this.renderTabContent(
			rightPanelX,
			panelTop + TITLE_TAB_CONTENT_OFFSET_Y,
			rightPanelW,
		);

		// -- Bottom: Start button --
		const bottomY = panelTop + panelH + TITLE_START_BTN_OFFSET_Y;

		// Glow behind button
		this.startGlow = this.add.rectangle(
			cx,
			bottomY,
			TITLE_START_GLOW_W,
			TITLE_START_GLOW_H,
			TITLE_START_GLOW_COLOR,
			TITLE_START_GLOW_ALPHA,
		);
		this.startGlow.setBlendMode(Phaser.BlendModes.ADD);
		this.tweens.add({
			targets: this.startGlow,
			alpha: 0.4,
			scaleX: 1.12,
			scaleY: 1.15,
			duration: 1000,
			yoyo: true,
			repeat: -1,
			ease: "Sine.easeInOut",
		});

		// Start button — clickable zone covers the full button area
		const btnW = TITLE_START_BTN_W;
		const btnH = TITLE_START_BTN_H;
		const startBg = this.add.graphics();

		const drawStartBg = (fill: number, stroke: number) => {
			startBg.clear();
			startBg.fillStyle(fill);
			startBg.fillRoundedRect(
				cx - btnW / 2,
				bottomY - btnH / 2,
				btnW,
				btnH,
				TITLE_START_BTN_RADIUS,
			);
			startBg.lineStyle(2, stroke);
			startBg.strokeRoundedRect(
				cx - btnW / 2,
				bottomY - btnH / 2,
				btnW,
				btnH,
				TITLE_START_BTN_RADIUS,
			);
		};
		drawStartBg(TITLE_START_BTN_FILL, TITLE_START_BTN_STROKE);

		const startLabel = this.add
			.text(cx, bottomY, "\u25b6  PLAY", {
				fontSize: "30px",
				color: TITLE_START_LABEL_COLOR,
				fontStyle: "bold",
			})
			.setOrigin(0.5);

		// Idle pulse on the label
		this.tweens.add({
			targets: startLabel,
			scaleX: 1.03,
			scaleY: 1.03,
			duration: 800,
			yoyo: true,
			repeat: -1,
			ease: "Sine.easeInOut",
		});

		// Invisible interactive rect over the entire button
		const startHitZone = this.add
			.rectangle(cx, bottomY, btnW, btnH, 0x000000, 0)
			.setInteractive({ useHandCursor: true });

		const startGame = () => {
			this.scene.start("GameScene", this.buildConfig());
		};

		startHitZone.on("pointerover", () => {
			startLabel.setScale(1.08);
			drawStartBg(TITLE_START_BTN_HOVER_FILL, TITLE_START_BTN_HOVER_STROKE);
		});
		startHitZone.on("pointerout", () => {
			startLabel.setScale(1);
			drawStartBg(TITLE_START_BTN_FILL, TITLE_START_BTN_STROKE);
		});
		startHitZone.on("pointerdown", startGame);

		// Enter to start
		if (this.input.keyboard) {
			this.input.keyboard.on("keydown-ENTER", startGame);
		}

		// -- High Scores Section --
		this.buildHighScoresSection(cx, bottomY + TITLE_SCORES_OFFSET_Y);

		// Gamepad support
		if (this.input.gamepad) {
			// Show hint if no gamepad detected yet
			const gpHint = this.add
				.text(
					cx,
					height - 40,
					"\u{1f3ae} Press any gamepad button to connect",
					{
						fontSize: "11px",
						color: TITLE_HINT_COLOR,
					},
				)
				.setOrigin(0.5);

			// Listen for any button press (works even before pad1 exists)
			this.input.gamepad.on(
				"connected",
				(pad: Phaser.Input.Gamepad.Gamepad) => {
					gpHint.setText(`\u{1f3ae} ${pad.id.substring(0, 30)} connected`);
					gpHint.setColor(TITLE_GAMEPAD_CONNECTED_COLOR);
					this.time.delayedCall(2000, () => {
						gpHint.setColor(TITLE_HINT_COLOR);
						gpHint.setText("\u{1f3ae} Gamepad ready \u2014 A to start");
					});
				},
			);

			this.input.gamepad.on(
				"down",
				(
					_pad: Phaser.Input.Gamepad.Gamepad,
					button: Phaser.Input.Gamepad.Button,
				) => {
					// A button = index 0, Start button = index 9
					if (button.index === 0 || button.index === 9) {
						startGame();
					}
				},
			);

			// If already connected (page was trusted)
			if (this.input.gamepad.total > 0) {
				gpHint.setText("\u{1f3ae} Gamepad ready \u2014 A to start");
			}
		}

		// Controls toggle (bottom right)
		const controlsBtn = this.add
			.text(width - 16, height - 16, "? Controls", {
				fontSize: "12px",
				color: TITLE_HINT_COLOR,
			})
			.setOrigin(1, 1)
			.setInteractive({ useHandCursor: true });
		controlsBtn.on("pointerover", () =>
			controlsBtn.setColor(TITLE_HOVER_COLOR),
		);
		controlsBtn.on("pointerout", () => controlsBtn.setColor(TITLE_HINT_COLOR));
		controlsBtn.on("pointerdown", () => this.toggleControls());

		// Audio settings toggles (bottom-left)
		this.buildAudioToggles(height);

		// Controls overlay (hidden)
		this.controlsOverlay = this.add.container(0, 0);
		this.controlsOverlay.setVisible(false);
		this.controlsOverlay.setDepth(TITLE_CONTROLS_OVERLAY_DEPTH);
		this.buildControlsOverlay();

		this.updatePreview();
	}

	// -- Tab Content Rendering --

	private renderTabContent = (
		cx: number,
		top: number,
		panelW: number,
	): void => {
		this.tabContainer.removeAll(true);

		const contentX = cx - panelW / 2 + TITLE_TAB_CONTENT_PADDING;
		const contentW = panelW - TITLE_TAB_CONTENT_PADDING * 2;
		const cellsPerRow = Math.floor(
			(contentW + TITLE_CELL_GAP) / (TITLE_CELL_SIZE + TITLE_CELL_GAP),
		);

		switch (this.activeTab) {
			case "Outfit":
				this.renderColorGrid(
					contentX,
					top + 10,
					cellsPerRow,
					CHARACTER_COLORS,
					this.selected.body,
					(i) => {
						this.selected.body = i;
						this.updatePreview();
					},
				);
				break;
			case "Skin":
				this.renderColorGrid(
					contentX,
					top + 10,
					cellsPerRow,
					SKIN_COLORS,
					this.selected.skin,
					(i) => {
						this.selected.skin = i;
						this.updatePreview();
					},
				);
				break;
			case "Hat":
				this.renderEmojiGrid(
					contentX,
					top + 10,
					cellsPerRow,
					HAT_TYPES,
					HAT_EMOJIS,
					this.selected.hat,
					(i) => {
						this.selected.hat = i;
						this.updatePreview();
					},
				);
				break;
			case "Face":
				this.renderEmojiGrid(
					contentX,
					top + 10,
					cellsPerRow,
					FACE_TYPES,
					FACE_LABELS,
					this.selected.face,
					(i) => {
						this.selected.face = i;
						this.updatePreview();
					},
				);
				break;
			case "Trail":
				this.renderEmojiGrid(
					contentX,
					top + 10,
					cellsPerRow,
					TRAIL_TYPES,
					TRAIL_EMOJIS,
					this.selected.trail,
					(i) => {
						this.selected.trail = i;
						this.updatePreview();
					},
				);
				break;
		}
	};

	private renderColorGrid = (
		x: number,
		y: number,
		perRow: number,
		colors: readonly number[],
		selectedIdx: number,
		onSelect: (i: number) => void,
	): void => {
		for (let i = 0; i < colors.length; i++) {
			const col = i % perRow;
			const row = Math.floor(i / perRow);
			const cellX =
				x + col * (TITLE_CELL_SIZE + TITLE_CELL_GAP) + TITLE_CELL_SIZE / 2;
			const cellY =
				y + row * (TITLE_CELL_SIZE + TITLE_CELL_GAP) + TITLE_CELL_SIZE / 2;
			const isSelected = i === selectedIdx;

			// Cell background
			const cell = this.add.rectangle(
				cellX,
				cellY,
				TITLE_CELL_SIZE,
				TITLE_CELL_SIZE,
				TITLE_CELL_BG,
			);
			cell.setStrokeStyle(
				isSelected ? 3 : 2,
				isSelected ? TITLE_CELL_SELECTED_BORDER : TITLE_CELL_UNSELECTED_BORDER,
			);
			cell.setInteractive({ useHandCursor: true });
			this.tabContainer.add(cell);

			// Color swatch
			const swatch = this.add.rectangle(
				cellX,
				cellY,
				TITLE_CELL_SIZE - 10,
				TITLE_CELL_SIZE - 10,
				colors[i],
			);
			this.tabContainer.add(swatch);

			// Hover
			cell.on("pointerover", () => {
				if (i !== selectedIdx) {
					cell.setFillStyle(TITLE_CELL_BG_HOVER);
					cell.setScale(1.05);
					swatch.setScale(1.05);
				}
			});
			cell.on("pointerout", () => {
				cell.setFillStyle(TITLE_CELL_BG);
				cell.setScale(1);
				swatch.setScale(1);
			});
			cell.on("pointerdown", () => {
				// Scale tween on select
				this.tweens.add({
					targets: [cell, swatch],
					scale: 1.12,
					duration: 50,
					yoyo: true,
					ease: "Sine.easeOut",
				});
				onSelect(i);
			});
		}
	};

	private renderEmojiGrid = <T extends readonly string[]>(
		x: number,
		y: number,
		perRow: number,
		types: T,
		emojis: Record<T[number], string>,
		selectedIdx: number,
		onSelect: (i: number) => void,
	): void => {
		for (let i = 0; i < types.length; i++) {
			const col = i % perRow;
			const row = Math.floor(i / perRow);
			const cellX =
				x + col * (TITLE_CELL_SIZE + TITLE_CELL_GAP) + TITLE_CELL_SIZE / 2;
			const cellY =
				y + row * (TITLE_CELL_SIZE + TITLE_CELL_GAP) + TITLE_CELL_SIZE / 2;
			const isSelected = i === selectedIdx;
			const key = types[i] as T[number];

			const cell = this.add.rectangle(
				cellX,
				cellY,
				TITLE_CELL_SIZE,
				TITLE_CELL_SIZE,
				TITLE_CELL_BG,
			);
			cell.setStrokeStyle(
				isSelected ? 3 : 2,
				isSelected ? TITLE_CELL_SELECTED_BORDER : TITLE_CELL_UNSELECTED_BORDER,
			);
			cell.setInteractive({ useHandCursor: true });
			this.tabContainer.add(cell);

			const emoji = this.add
				.text(cellX, cellY, emojis[key], { fontSize: "20px" })
				.setOrigin(0.5);
			this.tabContainer.add(emoji);

			cell.on("pointerover", () => {
				if (i !== selectedIdx) {
					cell.setFillStyle(TITLE_CELL_BG_HOVER);
					cell.setScale(1.05);
					emoji.setScale(1.05);
				}
			});
			cell.on("pointerout", () => {
				cell.setFillStyle(TITLE_CELL_BG);
				cell.setScale(1);
				emoji.setScale(1);
			});
			cell.on("pointerdown", () => {
				// Quick scale tween on the cell
				this.tweens.add({
					targets: [cell, emoji],
					scale: 1.15,
					duration: 40,
					yoyo: true,
					ease: "Sine.easeOut",
				});
				onSelect(i);
				// Bounce the preview on select
				this.tweens.add({
					targets: this.previewContainer,
					scaleX: 1.1,
					scaleY: 0.9,
					duration: 60,
					yoyo: true,
				});
			});
		}
	};

	// -- Tab Bar Update --

	private updateTabBar = (): void => {
		for (let i = 0; i < TAB_LABELS.length; i++) {
			const isActive = TAB_LABELS[i] === this.activeTab;
			this.tabButtons[i].setColor(
				isActive ? TITLE_TAB_ACTIVE_COLOR : TITLE_TAB_INACTIVE_COLOR,
			);
			this.tabButtons[i].setFontStyle(isActive ? "bold" : "");
			this.tabButtons[i].setAlpha(
				isActive ? TITLE_TAB_ACTIVE_ALPHA : TITLE_TAB_INACTIVE_ALPHA,
			);
			this.tabIndicators[i].setVisible(isActive);
		}
	};

	// -- Controls Overlay --

	private buildControlsOverlay = (): void => {
		const { width, height } = this.cameras.main;
		const cx = width / 2;
		const cy = height / 2;

		// Dimmed backdrop
		const backdrop = this.add
			.rectangle(cx, cy, width, height, 0x000000, TITLE_CONTROLS_BACKDROP_ALPHA)
			.setInteractive();
		backdrop.on("pointerdown", () => this.toggleControls());
		this.controlsOverlay.add(backdrop);

		// Card
		const cardW = TITLE_CONTROLS_CARD_W;
		const cardH = TITLE_CONTROLS_CARD_H;
		const cardGfx = this.add.graphics();
		cardGfx.fillStyle(TITLE_PANEL_BG, 0.95);
		cardGfx.lineStyle(1, TITLE_PANEL_BORDER);
		cardGfx.fillRoundedRect(
			cx - cardW / 2,
			cy - cardH / 2,
			cardW,
			cardH,
			TITLE_PANEL_RADIUS,
		);
		cardGfx.strokeRoundedRect(
			cx - cardW / 2,
			cy - cardH / 2,
			cardW,
			cardH,
			TITLE_PANEL_RADIUS,
		);
		this.controlsOverlay.add(cardGfx);

		const headerText = this.add
			.text(cx, cy - cardH / 2 + 24, "CONTROLS", {
				fontSize: "16px",
				color: TITLE_CONTROLS_HEADER_COLOR,
				fontStyle: "bold",
			})
			.setOrigin(0.5);
		this.controlsOverlay.add(headerText);

		const controls = [
			["A / D  or  \u2190 / \u2192", "Move left / right"],
			["W / \u2191 / SPACE", "Jump"],
			["Hold SPACE (falling)", "Glide"],
			["Left Click (hold)", "Break block"],
			["Right Click", "Place block"],
			["1-9 / Scroll Wheel", "Select inventory"],
		];

		const startY = cy - cardH / 2 + TITLE_CONTROLS_START_OFFSET_Y;
		for (let i = 0; i < controls.length; i++) {
			const [key, desc] = controls[i];
			const keyText = this.add
				.text(
					cx + TITLE_CONTROLS_KEY_OFFSET_X,
					startY + i * TITLE_CONTROLS_ROW_HEIGHT,
					key ?? "",
					{
						fontSize: "13px",
						color: TITLE_TAB_ACTIVE_COLOR,
					},
				)
				.setOrigin(0, 0.5);
			this.controlsOverlay.add(keyText);

			const descText = this.add
				.text(
					cx + TITLE_CONTROLS_DESC_OFFSET_X,
					startY + i * TITLE_CONTROLS_ROW_HEIGHT,
					desc ?? "",
					{
						fontSize: "13px",
						color: TITLE_CONTROLS_DESC_COLOR,
					},
				)
				.setOrigin(0, 0.5);
			this.controlsOverlay.add(descText);
		}

		const closeText = this.add
			.text(cx, cy + cardH / 2 - 20, "Click anywhere to close", {
				fontSize: "11px",
				color: TITLE_CONTROLS_CLOSE_COLOR,
			})
			.setOrigin(0.5);
		this.controlsOverlay.add(closeText);
	};

	private drawPanel = (x: number, y: number, w: number, h: number): void => {
		const gfx = this.add.graphics();
		gfx.fillStyle(TITLE_PANEL_BG, TITLE_PANEL_ALPHA);
		gfx.lineStyle(1, TITLE_PANEL_BORDER);
		gfx.fillRoundedRect(x, y, w, h, TITLE_PANEL_RADIUS);
		gfx.strokeRoundedRect(x, y, w, h, TITLE_PANEL_RADIUS);
		// Subtle inner glow
		const inset = 4;
		gfx.fillStyle(TITLE_PANEL_INNER_GLOW_COLOR, TITLE_PANEL_INNER_GLOW_ALPHA);
		gfx.fillRoundedRect(
			x + inset,
			y + inset,
			w - inset * 2,
			h - inset * 2,
			TITLE_PANEL_RADIUS - 2,
		);
	};

	private toggleControls = (): void => {
		this.controlsVisible = !this.controlsVisible;
		this.controlsOverlay.setVisible(this.controlsVisible);
	};

	// -- Config & Preview --

	private buildConfig = (): CharacterConfig => ({
		bodyColor: CHARACTER_COLORS[this.selected.body],
		skinColor: SKIN_COLORS[this.selected.skin],
		hat: HAT_TYPES[this.selected.hat],
		face: FACE_TYPES[this.selected.face],
		trail: TRAIL_TYPES[this.selected.trail],
	});

	private generateSillyName = (): string => {
		const first = SILLY_FIRST[Math.floor(Math.random() * SILLY_FIRST.length)];
		const second =
			SILLY_SECOND[Math.floor(Math.random() * SILLY_SECOND.length)];
		return `"${first} ${second}"`;
	};

	private updatePreview = (): void => {
		this.previewBody.setFillStyle(CHARACTER_COLORS[this.selected.body]);
		this.previewHead.setFillStyle(SKIN_COLORS[this.selected.skin]);

		const hat = HAT_TYPES[this.selected.hat];
		this.previewHat.setText(hat === "none" ? "" : HAT_EMOJIS[hat]);

		const faceType = FACE_TYPES[this.selected.face];
		this.previewFaceGfx.clear();
		if (faceType !== "none") {
			drawFace(this.previewFaceGfx, faceType, 3);
		}

		const trail = TRAIL_TYPES[this.selected.trail];
		this.previewTrail.setText(trail === "none" ? "" : TRAIL_EMOJIS[trail]);

		this.nameLabel.setText(this.generateSillyName());

		// Re-render active tab to update selection highlights
		const { width } = this.cameras.main;
		const cx = width / 2;
		const rightPanelX = cx + TITLE_RIGHT_PANEL_OFFSET_X;
		this.renderTabContent(
			rightPanelX,
			TITLE_PANEL_TOP + TITLE_TAB_CONTENT_OFFSET_Y,
			TITLE_RIGHT_PANEL_W,
		);
		this.updateTabBar();

		saveConfig(this.selected);
	};

	private buildAudioToggles = (screenHeight: number): void => {
		const x = 16;
		const y = screenHeight - 16;

		const createToggle = (
			label: string,
			enabled: boolean,
			yOffset: number,
			onToggle: (val: boolean) => void,
		): void => {
			const text = this.add
				.text(
					x,
					y - yOffset,
					`${enabled ? "\u{1f50a}" : "\u{1f507}"} ${label}: ${enabled ? "ON" : "OFF"}`,
					{
						fontSize: "12px",
						color: enabled ? TITLE_TOGGLE_ON_COLOR : TITLE_TOGGLE_OFF_COLOR,
					},
				)
				.setOrigin(0, 1)
				.setInteractive({ useHandCursor: true });

			text.on("pointerdown", () => {
				const newVal = !enabled;
				onToggle(newVal);
				text.setText(
					`${newVal ? "\u{1f50a}" : "\u{1f507}"} ${label}: ${newVal ? "ON" : "OFF"}`,
				);
				text.setColor(newVal ? TITLE_TOGGLE_ON_COLOR : TITLE_TOGGLE_OFF_COLOR);
				enabled = newVal;
			});
			text.on("pointerover", () => text.setColor(TITLE_TEXT_COLOR));
			text.on("pointerout", () =>
				text.setColor(enabled ? TITLE_TOGGLE_ON_COLOR : TITLE_TOGGLE_OFF_COLOR),
			);
		};

		createToggle("Music", this.settings.musicEnabled, 22, (val) => {
			this.settings.musicEnabled = val;
			saveSettings(this.settings);
		});
		createToggle("SFX", this.settings.sfxEnabled, 0, (val) => {
			this.settings.sfxEnabled = val;
			saveSettings(this.settings);
		});
	};

	private buildHighScoresSection = (cx: number, topY: number): void => {
		const scores = loadHighScores();

		// Header
		this.add
			.text(cx, topY, "HIGH SCORES", {
				fontSize: TITLE_SCORES_HEADER_FONT_SIZE,
				color: TITLE_SCORES_HEADER_COLOR,
				fontStyle: "bold",
			})
			.setOrigin(0.5);

		if (scores.length === 0) {
			this.add
				.text(cx, topY + TITLE_SCORES_ROW_HEIGHT, "No scores yet", {
					fontSize: TITLE_SCORES_EMPTY_FONT_SIZE,
					color: TITLE_SCORES_EMPTY_COLOR,
					fontStyle: "italic",
				})
				.setOrigin(0.5);
		} else {
			for (let i = 0; i < scores.length; i++) {
				const entry = scores[i];
				const rowY = topY + TITLE_SCORES_ROW_HEIGHT * (i + 1);
				this.add
					.text(cx, rowY, `#${i + 1}  ${formatTimeMs(entry.timeMs)}`, {
						fontSize: TITLE_SCORES_ROW_FONT_SIZE,
						color: i === 0 ? TITLE_SCORE_GOLD_COLOR : TITLE_SCORE_COLOR,
					})
					.setOrigin(0.5);
			}
		}

		// Reset button
		const resetY =
			topY +
			TITLE_SCORES_ROW_HEIGHT * (Math.max(scores.length, 1) + 1) +
			TITLE_RESET_BTN_OFFSET_Y;

		let confirmPending = false;
		let confirmTimer: Phaser.Time.TimerEvent | null = null;

		const resetBtn = this.add
			.text(cx, resetY, "Reset Scores", {
				fontSize: TITLE_RESET_BTN_FONT_SIZE,
				color: TITLE_RESET_COLOR,
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });

		const revertReset = () => {
			confirmPending = false;
			confirmTimer = null;
			resetBtn.setText("Reset Scores");
			resetBtn.setColor(TITLE_RESET_COLOR);
		};

		resetBtn.on("pointerover", () => {
			resetBtn.setColor(
				confirmPending
					? TITLE_RESET_CONFIRM_HOVER_COLOR
					: TITLE_RESET_HOVER_COLOR,
			);
		});
		resetBtn.on("pointerout", () => {
			resetBtn.setColor(
				confirmPending ? TITLE_RESET_CONFIRM_COLOR : TITLE_RESET_COLOR,
			);
		});
		resetBtn.on("pointerdown", () => {
			if (confirmPending) {
				// Second click — reset
				if (confirmTimer) confirmTimer.destroy();
				confirmTimer = null;
				confirmPending = false;
				resetHighScores();
				// Rebuild the scene to reflect cleared scores
				this.scene.restart();
			} else {
				// First click — ask for confirmation
				confirmPending = true;
				resetBtn.setText("Are you sure? Click again");
				resetBtn.setColor(TITLE_RESET_CONFIRM_COLOR);
				confirmTimer = this.time.delayedCall(
					HIGH_SCORE_RESET_CONFIRM_MS,
					revertReset,
				);
			}
		});
	};
}
