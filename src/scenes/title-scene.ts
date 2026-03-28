import type UIPlugin from "phaser3-rex-plugins/templates/ui/ui-plugin.js";
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
	TEXT_RESOLUTION,
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
	TITLE_GAMEPAD_CONNECTED_COLOR,
	TITLE_GLOW_ALPHA,
	TITLE_GLOW_COLOR,
	TITLE_HINT_COLOR,
	TITLE_HOVER_COLOR,
	TITLE_IDLE_BOUNCE_DURATION,
	TITLE_IDLE_BOUNCE_Y,
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
	TITLE_START_LABEL_COLOR,
	TITLE_SUBTITLE_COLOR,
	TITLE_SUBTITLE_Y,
	TITLE_TAB_ACTIVE_ALPHA,
	TITLE_TAB_ACTIVE_COLOR,
	TITLE_TAB_CONTENT_PADDING,
	TITLE_TAB_GAP,
	TITLE_TAB_HOVER_ALPHA,
	TITLE_TAB_HOVER_COLOR,
	TITLE_TAB_INACTIVE_ALPHA,
	TITLE_TAB_INACTIVE_COLOR,
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
	declare rexUI: UIPlugin;

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
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(TITLE_SHADOW_ALPHA);
		this.add
			.text(cx, TITLE_Y, "DRIFT LANDS", {
				fontSize: "52px",
				color: TITLE_TEXT_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5);
		// Subtle glow via duplicate
		const titleGlow = this.add
			.text(cx, TITLE_Y, "DRIFT LANDS", {
				fontSize: "52px",
				color: TITLE_GLOW_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5)
			.setAlpha(TITLE_GLOW_ALPHA);
		titleGlow.setBlendMode(Phaser.BlendModes.ADD);

		this.add
			.text(cx, TITLE_SUBTITLE_Y, "Reach the sky before the lava rises", {
				fontSize: "14px",
				color: TITLE_SUBTITLE_COLOR,
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5);

		// -- Left panel: Character preview --
		const leftPanelX = cx - 200;
		const panelTop = TITLE_PANEL_TOP;
		const panelW = TITLE_LEFT_PANEL_W;
		const panelH = TITLE_PANEL_H;

		// Panel background using rexUI roundRectangle
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
		const bodyHalfH = (PLAYER_HEIGHT * TITLE_PREVIEW_SCALE) / 2;
		const headRadius = TITLE_PREVIEW_HEAD_RADIUS;
		const headY = charY - bodyHalfH - headRadius - TITLE_PREVIEW_HEAD_OFFSET_Y;
		this.previewHead = this.add.circle(
			leftPanelX,
			headY,
			headRadius,
			SKIN_COLORS[this.selected.skin],
		);
		this.previewHat = this.add
			.text(leftPanelX, headY - headRadius - TITLE_PREVIEW_HAT_OFFSET_Y, "", {
				fontSize: "24px",
			})
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5);
		this.previewFaceGfx = this.add.graphics();
		this.previewFaceGfx.setPosition(leftPanelX, headY);
		this.previewTrail = this.add
			.text(leftPanelX, charY + bodyHalfH + TITLE_PREVIEW_HEAD_OFFSET_Y, "", {
				fontSize: "14px",
			})
			.setResolution(TEXT_RESOLUTION)
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
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5);

		// Randomize button — rexUI Label with RoundRectangle background
		const diceBtnLabel = this.rexUI.add.label({
			background: this.rexUI.add.roundRectangle(
				0,
				0,
				0,
				0,
				6,
				Phaser.Display.Color.HexStringToColor(TITLE_DICE_BG_COLOR).color,
			),
			text: this.add
				.text(0, 0, "\u{1f3b2} Randomize", {
					fontSize: "14px",
					color: TITLE_DICE_COLOR,
				})
				.setResolution(TEXT_RESOLUTION),
			space: { left: 10, right: 10, top: 4, bottom: 4 },
		});
		diceBtnLabel.setPosition(leftPanelX, panelTop + panelH - 20);
		diceBtnLabel.layout();
		diceBtnLabel.setInteractive({ useHandCursor: true });
		diceBtnLabel.on("pointerover", () => {
			const txt = diceBtnLabel.getElement("text") as Phaser.GameObjects.Text;
			txt.setColor(TITLE_DICE_HOVER_COLOR);
		});
		diceBtnLabel.on("pointerout", () => {
			const txt = diceBtnLabel.getElement("text") as Phaser.GameObjects.Text;
			txt.setColor(TITLE_DICE_COLOR);
		});
		diceBtnLabel.on("pointerdown", () => {
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
		const rightPanelX = cx + 120;
		const rightPanelW = 320;

		this.drawPanel(
			rightPanelX - rightPanelW / 2,
			panelTop,
			rightPanelW,
			panelH,
		);

		// Tab bar
		const tabY = panelTop + 20;
		this.tabButtons = [];
		this.tabIndicators = [];
		const tabGap = TITLE_TAB_GAP;
		const tabPadding = TITLE_TAB_CONTENT_PADDING;
		const tabAreaWidth = rightPanelW - tabPadding * 2;
		const tabWidth =
			(tabAreaWidth - tabGap * (TAB_LABELS.length - 1)) / TAB_LABELS.length;

		for (let i = 0; i < TAB_LABELS.length; i++) {
			const tabName = TAB_LABELS[i];
			const tabX =
				rightPanelX -
				rightPanelW / 2 +
				tabPadding +
				(tabWidth + tabGap) * i +
				tabWidth / 2;
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
					fontSize: "14px",
					color: isActive ? TITLE_TAB_ACTIVE_COLOR : TITLE_TAB_INACTIVE_COLOR,
					fontStyle: isActive ? "bold" : "",
				})
				.setResolution(TEXT_RESOLUTION)
				.setOrigin(0.5)
				.setAlpha(isActive ? TITLE_TAB_ACTIVE_ALPHA : TITLE_TAB_INACTIVE_ALPHA)
				.setInteractive({ useHandCursor: true });

			tabBtn.on("pointerdown", () => {
				this.activeTab = tabName;
				this.renderTabContent(rightPanelX, panelTop + 42, rightPanelW);
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
		this.renderTabContent(rightPanelX, panelTop + 42, rightPanelW);

		// -- Bottom: Start button --
		const bottomY = panelTop + panelH + TITLE_START_BTN_OFFSET_Y;

		// Start button — rexUI Label with RoundRectangle background
		const startBtnBg = this.rexUI.add.roundRectangle(
			0,
			0,
			TITLE_START_BTN_W,
			TITLE_START_BTN_H,
			TITLE_START_BTN_RADIUS,
			TITLE_START_BTN_FILL,
		);
		startBtnBg.setStrokeStyle(2, TITLE_START_BTN_STROKE);

		const startLabel = this.add
			.text(0, 0, "\u25b6  PLAY", {
				fontSize: "30px",
				color: TITLE_START_LABEL_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION);

		const startBtnLabel = this.rexUI.add.label({
			background: startBtnBg,
			text: startLabel,
			space: { left: 20, right: 20, top: 8, bottom: 8 },
			align: "center",
		});
		startBtnLabel.setPosition(cx, bottomY);
		startBtnLabel.layout();
		startBtnLabel.setInteractive({ useHandCursor: true });

		const startGame = () => {
			this.scene.start("GameScene", this.buildConfig());
		};

		startBtnLabel.on("pointerover", () => {
			startBtnBg.setFillStyle(TITLE_START_BTN_HOVER_FILL);
			startBtnBg.setStrokeStyle(2, TITLE_START_BTN_HOVER_STROKE);
		});
		startBtnLabel.on("pointerout", () => {
			startBtnBg.setFillStyle(TITLE_START_BTN_FILL);
			startBtnBg.setStrokeStyle(2, TITLE_START_BTN_STROKE);
		});
		startBtnLabel.on("pointerdown", startGame);

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
						fontSize: "14px",
						color: TITLE_HINT_COLOR,
					},
				)
				.setResolution(TEXT_RESOLUTION)
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
				fontSize: "14px",
				color: TITLE_HINT_COLOR,
			})
			.setResolution(TEXT_RESOLUTION)
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

			// Cell background — rexUI RoundRectangle
			const cellBg = this.rexUI.add.roundRectangle(
				cellX,
				cellY,
				TITLE_CELL_SIZE,
				TITLE_CELL_SIZE,
				4,
				TITLE_CELL_BG,
			);
			cellBg.setStrokeStyle(
				isSelected ? 3 : 2,
				isSelected ? TITLE_CELL_SELECTED_BORDER : TITLE_CELL_UNSELECTED_BORDER,
			);
			cellBg.setInteractive({ useHandCursor: true });
			this.tabContainer.add(cellBg);

			// Color swatch — rexUI RoundRectangle
			const swatch = this.rexUI.add.roundRectangle(
				cellX,
				cellY,
				TITLE_CELL_SIZE - 10,
				TITLE_CELL_SIZE - 10,
				3,
				colors[i],
			);
			this.tabContainer.add(swatch);

			// Hover
			cellBg.on("pointerover", () => {
				if (i !== selectedIdx) {
					cellBg.setFillStyle(TITLE_CELL_BG_HOVER);
					cellBg.setScale(1.05);
					swatch.setScale(1.05);
				}
			});
			cellBg.on("pointerout", () => {
				cellBg.setFillStyle(TITLE_CELL_BG);
				cellBg.setScale(1);
				swatch.setScale(1);
			});
			cellBg.on("pointerdown", () => {
				// Scale tween on select
				this.tweens.add({
					targets: [cellBg, swatch],
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

			// Cell background — rexUI RoundRectangle
			const cellBg = this.rexUI.add.roundRectangle(
				cellX,
				cellY,
				TITLE_CELL_SIZE,
				TITLE_CELL_SIZE,
				4,
				TITLE_CELL_BG,
			);
			cellBg.setStrokeStyle(
				isSelected ? 3 : 2,
				isSelected ? TITLE_CELL_SELECTED_BORDER : TITLE_CELL_UNSELECTED_BORDER,
			);
			cellBg.setInteractive({ useHandCursor: true });
			this.tabContainer.add(cellBg);

			const emoji = this.add
				.text(cellX, cellY, emojis[key], { fontSize: "20px" })
				.setResolution(TEXT_RESOLUTION)
				.setOrigin(0.5);
			this.tabContainer.add(emoji);

			cellBg.on("pointerover", () => {
				if (i !== selectedIdx) {
					cellBg.setFillStyle(TITLE_CELL_BG_HOVER);
					cellBg.setScale(1.05);
					emoji.setScale(1.05);
				}
			});
			cellBg.on("pointerout", () => {
				cellBg.setFillStyle(TITLE_CELL_BG);
				cellBg.setScale(1);
				emoji.setScale(1);
			});
			cellBg.on("pointerdown", () => {
				// Quick scale tween on the cell
				this.tweens.add({
					targets: [cellBg, emoji],
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

		// Card — rexUI RoundRectangle for background
		const cardW = TITLE_CONTROLS_CARD_W;
		const cardH = TITLE_CONTROLS_CARD_H;

		const cardBg = this.rexUI.add.roundRectangle(
			cx,
			cy,
			cardW,
			cardH,
			TITLE_PANEL_RADIUS,
			TITLE_PANEL_BG,
			TITLE_PANEL_ALPHA,
		);
		cardBg.setStrokeStyle(1, TITLE_PANEL_BORDER);
		this.controlsOverlay.add(cardBg);

		const headerText = this.add
			.text(cx, cy - cardH / 2 + 24, "CONTROLS", {
				fontSize: "16px",
				color: TITLE_CONTROLS_HEADER_COLOR,
				fontStyle: "bold",
			})
			.setResolution(TEXT_RESOLUTION)
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
						fontSize: "14px",
						color: TITLE_TAB_ACTIVE_COLOR,
					},
				)
				.setResolution(TEXT_RESOLUTION)
				.setOrigin(0, 0.5);
			this.controlsOverlay.add(keyText);

			const descText = this.add
				.text(
					cx + TITLE_CONTROLS_DESC_OFFSET_X,
					startY + i * TITLE_CONTROLS_ROW_HEIGHT,
					desc ?? "",
					{
						fontSize: "14px",
						color: TITLE_CONTROLS_DESC_COLOR,
					},
				)
				.setResolution(TEXT_RESOLUTION)
				.setOrigin(0, 0.5);
			this.controlsOverlay.add(descText);
		}

		const closeText = this.add
			.text(cx, cy + cardH / 2 - 20, "Click anywhere to close", {
				fontSize: "14px",
				color: TITLE_CONTROLS_CLOSE_COLOR,
			})
			.setResolution(TEXT_RESOLUTION)
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
		const rightPanelX = cx + 120;
		this.renderTabContent(rightPanelX, TITLE_PANEL_TOP + 42, 320);
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
						fontSize: "14px",
						color: enabled ? TITLE_TOGGLE_ON_COLOR : TITLE_TOGGLE_OFF_COLOR,
					},
				)
				.setResolution(TEXT_RESOLUTION)
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
			.setResolution(TEXT_RESOLUTION)
			.setOrigin(0.5);

		if (scores.length === 0) {
			this.add
				.text(cx, topY + TITLE_SCORES_ROW_HEIGHT, "No scores yet", {
					fontSize: TITLE_SCORES_EMPTY_FONT_SIZE,
					color: TITLE_SCORES_EMPTY_COLOR,
					fontStyle: "italic",
				})
				.setResolution(TEXT_RESOLUTION)
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
					.setResolution(TEXT_RESOLUTION)
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
			.setResolution(TEXT_RESOLUTION)
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
