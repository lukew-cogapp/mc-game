import {
	CHARACTER_COLORS,
	FACE_TYPES,
	HAT_TYPES,
	LOCAL_STORAGE_KEY,
	PLAYER_HEIGHT,
	PLAYER_WIDTH,
	SKIN_COLORS,
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

// -- Style Constants --

const BG_COLOR_TOP = 0x0a0a2e;
const BG_COLOR_BOTTOM = 0x1a1a3e;
const PANEL_BG = 0x111133;
const PANEL_BORDER = 0x444477;
const PANEL_ALPHA = 0.85;
const CELL_BG = 0x1a1a44;
const CELL_BG_HOVER = 0x2a2a55;
const CELL_SELECTED_BORDER = 0xffdd44;
const CELL_UNSELECTED_BORDER = 0x444466;
const CELL_SIZE = 44;
const CELL_GAP = 8;
const PREVIEW_SCALE = 5;
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

		const { width, height } = this.cameras.main;
		const cx = width / 2;

		// -- Background gradient --
		const bgGfx = this.add.graphics();
		const steps = 20;
		for (let i = 0; i < steps; i++) {
			const _t = i / steps;
			const color = Phaser.Display.Color.Interpolate.ColorWithColor(
				Phaser.Display.Color.IntegerToColor(BG_COLOR_TOP),
				Phaser.Display.Color.IntegerToColor(BG_COLOR_BOTTOM),
				steps,
				i,
			);
			bgGfx.fillStyle(Phaser.Display.Color.GetColor(color.r, color.g, color.b));
			bgGfx.fillRect(0, (height / steps) * i, width, height / steps + 1);
		}

		// -- Floating particles (ambient) --
		for (let i = 0; i < 15; i++) {
			const px = Math.random() * width;
			const py = Math.random() * height;
			const dot = this.add.circle(
				px,
				py,
				1.5,
				0xffffff,
				0.15 + Math.random() * 0.2,
			);
			this.tweens.add({
				targets: dot,
				y: py - 30 - Math.random() * 40,
				alpha: 0,
				duration: 3000 + Math.random() * 4000,
				repeat: -1,
				yoyo: true,
				delay: Math.random() * 3000,
			});
		}

		// -- Title --
		// Text shadow (drawn first, offset by 2px)
		this.add
			.text(cx + 2, 38, "DRIFT LANDS", {
				fontSize: "52px",
				color: "#000000",
				fontStyle: "bold",
			})
			.setOrigin(0.5)
			.setAlpha(0.5);
		const _title = this.add
			.text(cx, 36, "DRIFT LANDS", {
				fontSize: "52px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0.5);
		// Subtle glow via duplicate
		const titleGlow = this.add
			.text(cx, 36, "DRIFT LANDS", {
				fontSize: "52px",
				color: "#4488cc",
				fontStyle: "bold",
			})
			.setOrigin(0.5)
			.setAlpha(0.3);
		titleGlow.setBlendMode(Phaser.BlendModes.ADD);

		this.add
			.text(cx, 80, "Reach the sky before the lava rises", {
				fontSize: "14px",
				color: "#99ddff",
			})
			.setOrigin(0.5);

		// -- Left panel: Character preview --
		const leftPanelX = cx - 170;
		const panelTop = 110;
		const panelW = 200;
		const panelH = 320;

		// Panel background
		const leftBg = this.add.graphics();
		leftBg.fillStyle(PANEL_BG, PANEL_ALPHA);
		leftBg.lineStyle(1, PANEL_BORDER);
		leftBg.fillRoundedRect(
			leftPanelX - panelW / 2,
			panelTop,
			panelW,
			panelH,
			16,
		);
		leftBg.strokeRoundedRect(
			leftPanelX - panelW / 2,
			panelTop,
			panelW,
			panelH,
			16,
		);
		// Subtle inner glow
		leftBg.fillStyle(0x223366, 0.3);
		leftBg.fillRoundedRect(
			leftPanelX - panelW / 2 + 4,
			panelTop + 4,
			panelW - 8,
			panelH - 8,
			14,
		);

		// Mini floating island platform
		const platformY = panelTop + 170;
		const platform = this.add.graphics();
		platform.fillStyle(0x4a7c2e);
		platform.fillRoundedRect(leftPanelX - 40, platformY, 80, 12, 4);
		platform.fillStyle(0x8b6914);
		platform.fillRoundedRect(leftPanelX - 35, platformY + 10, 70, 10, 4);

		// Character preview
		const charY = platformY - 30;
		this.previewBody = this.add.rectangle(
			leftPanelX,
			charY,
			PLAYER_WIDTH * PREVIEW_SCALE,
			PLAYER_HEIGHT * PREVIEW_SCALE,
			CHARACTER_COLORS[this.selected.body],
		);
		this.previewHead = this.add.circle(
			leftPanelX,
			charY - PLAYER_HEIGHT * 2 - 8,
			20,
			SKIN_COLORS[this.selected.skin],
		);
		this.previewHat = this.add
			.text(leftPanelX, charY - PLAYER_HEIGHT * 2 - 36, "", {
				fontSize: "24px",
			})
			.setOrigin(0.5);
		this.previewFaceGfx = this.add.graphics();
		this.previewFaceGfx.setPosition(leftPanelX, charY - PLAYER_HEIGHT * 2 - 8);
		this.previewTrail = this.add
			.text(leftPanelX, charY + PLAYER_HEIGHT * 2 + 8, "", { fontSize: "16px" })
			.setOrigin(0.5);

		// Soft circular glow behind character
		const charGlow = this.add.circle(
			leftPanelX,
			charY - 10,
			60,
			0x4488cc,
			0.15,
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
			y: -8,
			duration: 1200,
			yoyo: true,
			repeat: -1,
			ease: "Sine.easeInOut",
		});

		// Name label
		this.nameLabel = this.add
			.text(leftPanelX, panelTop + panelH - 40, "", {
				fontSize: "14px",
				color: "#ffee66",
				fontStyle: "italic",
			})
			.setOrigin(0.5);

		// Randomize button under name
		const diceBtn = this.add
			.text(leftPanelX, panelTop + panelH - 20, "\u{1f3b2} Randomize", {
				fontSize: "14px",
				color: "#aaaaaa",
				backgroundColor: "#222255",
				padding: { x: 10, y: 4 },
			})
			.setOrigin(0.5)
			.setInteractive({ useHandCursor: true });
		diceBtn.on("pointerover", () => diceBtn.setColor("#ffdd44"));
		diceBtn.on("pointerout", () => diceBtn.setColor("#aaaaaa"));
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
		const rightPanelX = cx + 80;
		const rightPanelW = 280;

		const rightBg = this.add.graphics();
		rightBg.fillStyle(PANEL_BG, PANEL_ALPHA);
		rightBg.lineStyle(1, PANEL_BORDER);
		rightBg.fillRoundedRect(
			rightPanelX - rightPanelW / 2,
			panelTop,
			rightPanelW,
			panelH,
			16,
		);
		rightBg.strokeRoundedRect(
			rightPanelX - rightPanelW / 2,
			panelTop,
			rightPanelW,
			panelH,
			16,
		);
		// Subtle inner glow
		rightBg.fillStyle(0x223366, 0.3);
		rightBg.fillRoundedRect(
			rightPanelX - rightPanelW / 2 + 4,
			panelTop + 4,
			rightPanelW - 8,
			panelH - 8,
			14,
		);

		// Tab bar
		const tabY = panelTop + 20;
		this.tabButtons = [];
		this.tabIndicators = [];
		const tabGap = 2;
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
				CELL_SELECTED_BORDER,
			);
			indicator.setVisible(isActive);
			this.tabIndicators.push(indicator);

			// Tab label
			const tabBtn = this.add
				.text(tabX, tabY, tabName, {
					fontSize: "13px",
					color: isActive ? "#ffdd44" : "#888899",
					fontStyle: isActive ? "bold" : "",
				})
				.setOrigin(0.5)
				.setAlpha(isActive ? 1 : 0.6)
				.setInteractive({ useHandCursor: true });

			tabBtn.on("pointerdown", () => {
				this.activeTab = tabName;
				this.renderTabContent(rightPanelX, panelTop + 42, rightPanelW);
				this.updateTabBar();
			});
			tabBtn.on("pointerover", () => {
				if (tabName !== this.activeTab) {
					tabBtn.setColor("#bbbbcc");
					tabBtn.setAlpha(0.85);
				}
			});
			tabBtn.on("pointerout", () => {
				const active = tabName === this.activeTab;
				tabBtn.setColor(active ? "#ffdd44" : "#888899");
				tabBtn.setAlpha(active ? 1 : 0.6);
			});

			this.tabButtons.push(tabBtn);
		}

		// Tab content container
		this.tabContainer = this.add.container(0, 0);
		this.renderTabContent(rightPanelX, panelTop + 42, rightPanelW);

		// -- Bottom: Start button --
		const bottomY = panelTop + panelH + 30;

		// Glow behind button
		this.startGlow = this.add.rectangle(cx, bottomY, 280, 64, 0xff8800, 0.2);
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
		const btnW = 260;
		const btnH = 56;
		const startBg = this.add.graphics();

		const drawStartBg = (fill: number, stroke: number) => {
			startBg.clear();
			startBg.fillStyle(fill);
			startBg.fillRoundedRect(
				cx - btnW / 2,
				bottomY - btnH / 2,
				btnW,
				btnH,
				10,
			);
			startBg.lineStyle(2, stroke);
			startBg.strokeRoundedRect(
				cx - btnW / 2,
				bottomY - btnH / 2,
				btnW,
				btnH,
				10,
			);
		};
		drawStartBg(0xff7700, 0xff8800);

		const startLabel = this.add
			.text(cx, bottomY, "\u25b6  PLAY", {
				fontSize: "30px",
				color: "#ffffff",
				fontStyle: "bold",
			})
			.setOrigin(0.5);

		// Invisible interactive rect over the entire button
		const startHitZone = this.add
			.rectangle(cx, bottomY, btnW, btnH, 0x000000, 0)
			.setInteractive({ useHandCursor: true });

		const startGame = () => {
			this.scene.start("GameScene", this.buildConfig());
		};

		startHitZone.on("pointerover", () => {
			startLabel.setScale(1.08);
			drawStartBg(0xff8800, 0xffaa33);
		});
		startHitZone.on("pointerout", () => {
			startLabel.setScale(1);
			drawStartBg(0xff7700, 0xff8800);
		});
		startHitZone.on("pointerdown", startGame);

		// Enter to start
		if (this.input.keyboard) {
			this.input.keyboard.on("keydown-ENTER", startGame);
		}

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
						color: "#555577",
					},
				)
				.setOrigin(0.5);

			// Listen for any button press (works even before pad1 exists)
			this.input.gamepad.on(
				"connected",
				(pad: Phaser.Input.Gamepad.Gamepad) => {
					gpHint.setText(`\u{1f3ae} ${pad.id.substring(0, 30)} connected`);
					gpHint.setColor("#44aa44");
					this.time.delayedCall(2000, () => {
						gpHint.setColor("#555577");
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
				color: "#666688",
			})
			.setOrigin(1, 1)
			.setInteractive({ useHandCursor: true });
		controlsBtn.on("pointerover", () => controlsBtn.setColor("#aaaacc"));
		controlsBtn.on("pointerout", () => controlsBtn.setColor("#666688"));
		controlsBtn.on("pointerdown", () => this.toggleControls());

		// Controls overlay (hidden)
		this.controlsOverlay = this.add.container(0, 0);
		this.controlsOverlay.setVisible(false);
		this.controlsOverlay.setDepth(50);
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

		const contentX = cx - panelW / 2 + 16;
		const contentW = panelW - 32;
		const cellsPerRow = Math.floor(
			(contentW + CELL_GAP) / (CELL_SIZE + CELL_GAP),
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
			const cellX = x + col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
			const cellY = y + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
			const isSelected = i === selectedIdx;

			// Cell background
			const cell = this.add.rectangle(
				cellX,
				cellY,
				CELL_SIZE,
				CELL_SIZE,
				CELL_BG,
			);
			cell.setStrokeStyle(
				isSelected ? 3 : 2,
				isSelected ? CELL_SELECTED_BORDER : CELL_UNSELECTED_BORDER,
			);
			cell.setInteractive({ useHandCursor: true });
			this.tabContainer.add(cell);

			// Color swatch
			const swatch = this.add.rectangle(
				cellX,
				cellY,
				CELL_SIZE - 10,
				CELL_SIZE - 10,
				colors[i],
			);
			this.tabContainer.add(swatch);

			// Hover
			cell.on("pointerover", () => {
				if (i !== selectedIdx) {
					cell.setFillStyle(CELL_BG_HOVER);
					cell.setScale(1.05);
					swatch.setScale(1.05);
				}
			});
			cell.on("pointerout", () => {
				cell.setFillStyle(CELL_BG);
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
			const cellX = x + col * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
			const cellY = y + row * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2;
			const isSelected = i === selectedIdx;
			const key = types[i] as T[number];

			const cell = this.add.rectangle(
				cellX,
				cellY,
				CELL_SIZE,
				CELL_SIZE,
				CELL_BG,
			);
			cell.setStrokeStyle(
				isSelected ? 3 : 2,
				isSelected ? CELL_SELECTED_BORDER : CELL_UNSELECTED_BORDER,
			);
			cell.setInteractive({ useHandCursor: true });
			this.tabContainer.add(cell);

			const emoji = this.add
				.text(cellX, cellY, emojis[key], { fontSize: "20px" })
				.setOrigin(0.5);
			this.tabContainer.add(emoji);

			cell.on("pointerover", () => {
				if (i !== selectedIdx) {
					cell.setFillStyle(CELL_BG_HOVER);
					cell.setScale(1.05);
					emoji.setScale(1.05);
				}
			});
			cell.on("pointerout", () => {
				cell.setFillStyle(CELL_BG);
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
			this.tabButtons[i].setColor(isActive ? "#ffdd44" : "#888899");
			this.tabButtons[i].setFontStyle(isActive ? "bold" : "");
			this.tabButtons[i].setAlpha(isActive ? 1 : 0.6);
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
			.rectangle(cx, cy, width, height, 0x000000, 0.7)
			.setInteractive();
		backdrop.on("pointerdown", () => this.toggleControls());
		this.controlsOverlay.add(backdrop);

		// Card
		const cardW = 340;
		const cardH = 260;
		const cardGfx = this.add.graphics();
		cardGfx.fillStyle(PANEL_BG, 0.95);
		cardGfx.lineStyle(1, PANEL_BORDER);
		cardGfx.fillRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 16);
		cardGfx.strokeRoundedRect(cx - cardW / 2, cy - cardH / 2, cardW, cardH, 16);
		this.controlsOverlay.add(cardGfx);

		const headerText = this.add
			.text(cx, cy - cardH / 2 + 24, "CONTROLS", {
				fontSize: "16px",
				color: "#ffffff",
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

		const startY = cy - cardH / 2 + 56;
		for (let i = 0; i < controls.length; i++) {
			const [key, desc] = controls[i];
			const keyText = this.add
				.text(cx - 140, startY + i * 30, key ?? "", {
					fontSize: "13px",
					color: "#ffdd44",
				})
				.setOrigin(0, 0.5);
			this.controlsOverlay.add(keyText);

			const descText = this.add
				.text(cx + 40, startY + i * 30, desc ?? "", {
					fontSize: "13px",
					color: "#cccccc",
				})
				.setOrigin(0, 0.5);
			this.controlsOverlay.add(descText);
		}

		const closeText = this.add
			.text(cx, cy + cardH / 2 - 20, "Click anywhere to close", {
				fontSize: "11px",
				color: "#666688",
			})
			.setOrigin(0.5);
		this.controlsOverlay.add(closeText);
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
		const rightPanelX = cx + 80;
		this.renderTabContent(rightPanelX, 152, 280);
		this.updateTabBar();

		saveConfig(this.selected);
	};
}
