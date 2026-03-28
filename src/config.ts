// -- Grid & Tiles --
export const TILE_SIZE = 32;
export const WORLD_WIDTH_TILES = 200;
export const WORLD_HEIGHT_TILES = 100;

// -- Physics --
export const GRAVITY = 800;
export const PLAYER_SPEED = 200;
export const PLAYER_ACCELERATION = 2000;
export const PLAYER_DECELERATION = 1500;
export const JUMP_VELOCITY = -350;
export const GLIDE_GRAVITY = 100;
export const GLIDE_HORIZONTAL_BOOST = 1.3;
export const GLIDE_MAX_DURATION_MS = 3000;
export const DOUBLE_JUMP_VELOCITY = -300;
export const COYOTE_TIME_MS = 80;
export const JUMP_BUFFER_MS = 100;
export const PLAYER_STEP_UP_HEIGHT = 1;

// -- Island Generation --
export const HOME_ISLAND_WIDTH = 16;
export const HOME_ISLAND_HEIGHT = 8;
export const ISLAND_COUNT_MIN = 12;
export const ISLAND_COUNT_MAX = 18;
export const ISLAND_WIDTH_MIN = 6;
export const ISLAND_WIDTH_MAX = 22;
export const ISLAND_HEIGHT_MIN = 4;
export const ISLAND_HEIGHT_MAX = 7;
export const ISLAND_MARGIN = 5;
export const ISLAND_MIN_GAP = 4;
export const ISLAND_PLACEMENT_ATTEMPTS = 50;
export const ISLAND_Y_MIN = 15;
export const ISLAND_Y_BOTTOM_MARGIN = 10;
export const ISLAND_GRASS_DEPTH_RATIO = 0.4;
export const ISLAND_TOP_WIDTH_RATIO = 0.6;

// -- Trees --
export const TREE_TRUNK_MIN = 3;
export const TREE_TRUNK_MAX = 5;
export const TREE_CANOPY_RADIUS = 2;
export const TREE_CANOPY_MAX_DIST = 2;

// -- Small Trees --
export const SMALL_TREE_TRUNK_MIN = 2;
export const SMALL_TREE_TRUNK_MAX = 3;
export const SMALL_TREE_CANOPY_RADIUS = 1;
export const SMALL_TREE_CANOPY_MAX_DIST = 1;

// -- Large Trees --
export const LARGE_TREE_TRUNK_MIN = 5;
export const LARGE_TREE_TRUNK_MAX = 7;
export const LARGE_TREE_CANOPY_RADIUS = 3;
export const LARGE_TREE_CANOPY_MAX_DIST = 3;

// -- Dead Trees --
export const DEAD_TREE_TRUNK_MIN = 2;
export const DEAD_TREE_TRUNK_MAX = 4;

// -- Water --
export const WATER_SPEED_MULTIPLIER = 0.5;
export const WATER_ALPHA = 0.6;
export const WATER_POOL_WIDTH_MIN = 2;
export const WATER_POOL_WIDTH_MAX = 4;
export const WATER_POOL_DEPTH_MIN = 1;
export const WATER_POOL_DEPTH_MAX = 5;
export const WATER_POOL_CHANCE = 0.3;

// -- Island Shape Variety --
export const ISLAND_SHAPE_OVERHANG_CHANCE = 0.2;
export const ISLAND_SHAPE_TALL_NARROW_CHANCE = 0.2;
export const ISLAND_SHAPE_FLAT_WIDE_CHANCE = 0.2;
export const ISLAND_TALL_NARROW_WIDTH_MIN = 4;
export const ISLAND_TALL_NARROW_WIDTH_MAX = 7;
export const ISLAND_TALL_NARROW_HEIGHT_MIN = 7;
export const ISLAND_TALL_NARROW_HEIGHT_MAX = 10;
export const ISLAND_FLAT_WIDE_WIDTH_MIN = 12;
export const ISLAND_FLAT_WIDE_WIDTH_MAX = 28;
export const ISLAND_FLAT_WIDE_HEIGHT_MIN = 3;
export const ISLAND_FLAT_WIDE_HEIGHT_MAX = 5;
export const ISLAND_OVERHANG_INDENT = 2;

// -- Climb Path Generation (legacy) --
export const CLIMB_BAND_HEIGHT = 9;
export const CLIMB_BAND_MIN_ISLANDS = 1;
export const CLIMB_BAND_MAX_ISLANDS = 2;
export const CLIMB_HORIZONTAL_REACH = 15;
export const CLIMB_TOP_SHRINK_RATIO = 0.6;
export const CLIMB_TOP_BAND_THRESHOLD = 0.75;

// -- Ascent Chain Generation --
export const ASCENT_VERTICAL_GAP_MIN = 6;
export const ASCENT_VERTICAL_GAP_MAX = 10;
export const ASCENT_HORIZONTAL_REACH_MIN = 8;
export const ASCENT_HORIZONTAL_REACH_MAX = 15;
export const SIDE_ISLAND_CHANCE = 0.4;
export const TRANSIT_ISLAND_WIDTH_MIN = 3;
export const TRANSIT_ISLAND_WIDTH_MAX = 5;
export const TRANSIT_ISLAND_HEIGHT_MIN = 2;
export const TRANSIT_ISLAND_HEIGHT_MAX = 3;
export const SAFE_ISLAND_WIDTH_MIN = 14;
export const SAFE_ISLAND_WIDTH_MAX = 20;
export const SAFE_ISLAND_HEIGHT_MIN = 5;
export const SAFE_ISLAND_HEIGHT_MAX = 7;
export const RESOURCE_ISLAND_WIDTH_MIN = 8;
export const RESOURCE_ISLAND_WIDTH_MAX = 14;
export const RESOURCE_ISLAND_HEIGHT_MIN = 4;
export const RESOURCE_ISLAND_HEIGHT_MAX = 6;
export const REWARD_ISLAND_WIDTH_MIN = 7;
export const REWARD_ISLAND_WIDTH_MAX = 12;
export const REWARD_ISLAND_HEIGHT_MIN = 3;
export const REWARD_ISLAND_HEIGHT_MAX = 5;
export const GOAL_ISLAND_WIDTH = 12;
export const GOAL_ISLAND_HEIGHT = 5;
export const STARTER_ZONE_RATIO = 0.2;
export const MID_CLIMB_RATIO = 0.5;
export const HIGH_CLIMB_RATIO = 0.3;
export const STARTER_ISLAND_COUNT = 3;
export const SAFE_ISLAND_INTERVAL = 4;
export const RESOURCE_VISIBLE_INTERVAL = 3;
export const SIDE_ISLAND_HORIZONTAL_OFFSET_MIN = 12;
export const SIDE_ISLAND_HORIZONTAL_OFFSET_MAX = 20;
export const SIDE_ISLAND_VERTICAL_JITTER = 3;

// -- Island Edge Irregularity --
export const ISLAND_EDGE_INDENT_CHANCE = 0.35;
export const ISLAND_EDGE_INDENT_MAX = 1;

// -- Platform Shadow --
export const PLATFORM_SHADOW_ALPHA = 0.15;
export const PLATFORM_SHADOW_HEIGHT = 4;

// -- Decorations --
export const DECORATION_FLOWER_CHANCE = 0.15;
export const DECORATION_MUSHROOM_CHANCE = 0.1;

// -- Fruit --
export const FRUIT_PER_TREE_MIN = 1;
export const FRUIT_PER_TREE_MAX = 3;
export const STRAWBERRY_BUSH_CHANCE = 0.12;

// -- Player --
export const PLAYER_WIDTH = 20;
export const PLAYER_HEIGHT = 30;
export const PLAYER_RESPAWN_OFFSET_Y = 2;
export const SPAWN_CLEAR_HALF_WIDTH = 2;
export const SPAWN_CLEAR_HEIGHT = 6;

// -- Interaction --
export const BLOCK_INTERACT_RANGE = 4;
export const BREAK_TIME_MS = 300;

// -- Camera --
export const CAMERA_LERP = 0.1;

// -- Inventory --
export const INVENTORY_SLOTS = 9;
export const INVENTORY_BAR_HEIGHT = 100;
export const INVENTORY_SLOT_SIZE = 80;
export const INVENTORY_SLOT_GAP = 8;

// -- Lava --
export const LAVA_INITIAL_HEIGHT_TILES = 3;
export const LAVA_RISE_RATE = 10.0;
export const LAVA_ANIMATION_SPEED = 0.002;
export const LAVA_COLOR_1 = 0xff4500;
export const LAVA_COLOR_2 = 0xff6600;

// -- Sky Gradient --
export const SKY_GRADIENT_TOP_COLOR = { r: 255, g: 245, b: 200 }; // soft golden/white
export const SKY_GRADIENT_MID_COLOR = { r: 135, g: 206, b: 235 }; // bright sky blue
export const SKY_GRADIENT_BOTTOM_COLOR = { r: 20, g: 10, b: 50 }; // dark blue near lava
export const SKY_GRADIENT_BAND_HEIGHT = 4;

// -- Goal / Win --
export const GOAL_BEACON_HEIGHT_TILES = 5;
export const WIN_ZONE_Y_TILES = 8;
export const GOAL_BEACON_COLOR = 0xffd700;
export const GOAL_BEACON_BEAM_WIDTH = 120;

// -- Ambient Particles --
export const AMBIENT_PARTICLE_COUNT = 25;
export const AMBIENT_PARTICLE_RADIUS_MIN = 1;
export const AMBIENT_PARTICLE_RADIUS_MAX = 2;
export const AMBIENT_PARTICLE_ALPHA_MIN = 0.1;
export const AMBIENT_PARTICLE_ALPHA_MAX = 0.3;
export const AMBIENT_PARTICLE_SPEED_MIN = 10;
export const AMBIENT_PARTICLE_SPEED_MAX = 30;

// -- Lava Glow --
export const LAVA_GLOW_HEIGHT = 100;
export const LAVA_GLOW_ALPHA = 0.3;
export const LAVA_GLOW_COLOR = 0xff4400;

// -- Jetpack --
export const JETPACK_FUEL_MS = 3000;
export const JETPACK_THRUST = -500;
export const JETPACK_COLOR = 0xdd4400;
export const JETPACK_PARTICLE_LIFESPAN = 300;
export const JETPACK_PARTICLE_SPEED = 60;
export const JETPACK_PARTICLE_GRAVITY_Y = 80;
export const JETPACK_PARTICLE_FREQUENCY = 30;
export const JETPACK_HUD_BAR_WIDTH = 60;
export const JETPACK_HUD_BAR_HEIGHT = 8;
export const JETPACK_HUD_OFFSET_Y = 4;
export const JETPACK_SPAWN_COUNT_MIN = 2;
export const JETPACK_SPAWN_COUNT_MAX = 3;

// -- Colors --
export const COLORS = {
	sky: 0x87ceeb,
	void: 0x1a1a2e,
	lava: 0xff4500,
	dirt: 0x8b6914,
	grass: 0x4a7c2e,
	stone: 0x808080,
	sand: 0xc2b280,
	wood: 0x6b4226,
	leaf: 0x2d5a1e,
	water: 0x3a8fd6,
	mossyStone: 0x5a7a4a,
	crystalBlock: 0x9b59b6,
	flower: 0xff69b4,
	mushroom: 0xcc4444,
	deadWood: 0x5a4a3a,
	apple: 0xe74c3c,
	pear: 0xc4d63b,
	peach: 0xffb07c,
	strawberry: 0xcc2244,
	berry: 0x6622aa,
	jetpack: 0xdd4400,
	playerBody: 0x3498db,
	playerHead: 0xf1c27d,
	selected: 0xffff00,
	inventoryBg: 0x000000,
	inventorySlot: 0x333333,
	inventorySlotActive: 0x555555,
	white: 0xffffff,
} as const;

// -- Character Customization --
export const CHARACTER_COLORS = [
	0x3498db, 0xe74c3c, 0x2ecc71, 0xf39c12, 0x9b59b6, 0x1abc9c, 0xe67e22,
	0xff6b81,
] as const;
export const SKIN_COLORS = [
	0xf1c27d, 0xffdbac, 0xc68642, 0x8d5524, 0xe0ac69, 0xf5cba7,
] as const;

export const LOCAL_STORAGE_KEY = "drift-lands-character";

// -- Hats & Accessories --
export const HAT_TYPES = [
	"none",
	"tophat",
	"crown",
	"propeller",
	"antenna",
	"halo",
	"horns",
	"party",
	"poo",
] as const;
export const FACE_TYPES = [
	"none",
	"happy",
	"cool",
	"angry",
	"surprised",
	"sleepy",
	"silly",
	"cyclops",
] as const;
export const TRAIL_TYPES = [
	"none",
	"sparkles",
	"hearts",
	"bubbles",
	"fire",
	"rainbow",
] as const;

// -- Lives --
export const STARTING_LIVES = 3;
export const MAX_LIVES = 3;
export const DEATH_INVULNERABLE_MS = 1500;
export const FRUIT_PER_LIFE = 10;

// -- Gamepad --
export const GAMEPAD_STICK_DEADZONE = 0.3;
export const GAMEPAD_RIGHT_STICK_DEADZONE = 0.3;

// -- Day/Night Cycle --
export const DAY_NIGHT_CYCLE_MS = 120_000;
export const VISION_RADIUS_DAY = 600;
export const VISION_RADIUS_NIGHT = 150;
export const NIGHT_OVERLAY_COLOR = 0x000022;
export const NIGHT_SKY_COLOR = 0x0a0a2e;
export const DAY_SKY_COLOR = 0x87ceeb;

// -- Lava Meter --
export const LAVA_METER_X = 16;
export const LAVA_METER_WIDTH = 12;
export const LAVA_METER_HEIGHT = 200;
export const LAVA_METER_MARGIN_TOP = 60;
export const LAVA_METER_TRACK_BG_COLOR = 0x000000;
export const LAVA_METER_TRACK_BG_ALPHA = 0.5;
export const LAVA_METER_BORDER_COLOR = 0xffffff;
export const LAVA_METER_BORDER_ALPHA = 0.15;
export const LAVA_METER_FILL_COLOR = 0xff4400;
export const LAVA_METER_FILL_ALPHA = 0.6;
export const LAVA_METER_GOAL_COLOR = 0xffd700;
export const LAVA_METER_GOAL_ALPHA = 0.4;
export const LAVA_METER_GOAL_HEIGHT = 8;
export const LAVA_METER_PLAYER_COLOR = 0xffffff;
export const LAVA_METER_PLAYER_RADIUS = 4;
export const LAVA_METER_PLAYER_OUTLINE_COLOR = 0x000000;
export const LAVA_METER_PLAYER_OUTLINE_ALPHA = 0.5;
export const LAVA_METER_LABEL_BG_COLOR = "#00000088";
export const LAVA_METER_LABEL_PADDING_X = 4;
export const LAVA_METER_LABEL_PADDING_Y = 2;
export const LAVA_METER_LABEL_FONT_SIZE = "14px";
export const LAVA_METER_LABEL_OFFSET_X = 4;
export const LAVA_METER_LABEL_OFFSET_Y = -12;
export const LAVA_METER_TRACK_RADIUS = 4;
export const LAVA_METER_FILL_INSET = 1;
export const LAVA_METER_FILL_WIDTH_INSET = 2;
export const LAVA_METER_BORDER_WIDTH = 1;

// -- Hover Highlight --
export const HOVER_HIGHLIGHT_COLOR = 0xffffff;
export const HOVER_HIGHLIGHT_ALPHA = 0.35;
export const HOVER_HIGHLIGHT_LINE_WIDTH = 2;

// -- Mining Crack Overlay --
export const CRACK_LINE_COLOR = 0x000000;
export const CRACK_LINE_ALPHA = 0.7;
export const CRACK_LINE_WIDTH = 2;
export const CRACK_STAGES = 4;

// -- UI --
export const UI_DEPTH = 100;
export const INVENTORY_COUNT_SIZE = "16px";
export const INVENTORY_SWATCH_SIZE = 50;
export const INVENTORY_NAME_FONT_SIZE = "20px";
export const INVENTORY_NAME_OFFSET_Y = 36;

// -- Player Visual Effects --
export const PLAYER_SHADOW_ALPHA = 0.2;
export const PLAYER_OUTLINE_OFFSET = 1;

// -- Background Clouds --
export const CLOUD_COUNT = 10;
export const CLOUD_SPEED = 0.2;
export const CLOUD_ALPHA = 0.1;

// -- NPCs --
export const NPC_COUNT = 5;
export const NPC_INTERACT_RANGE = 3;
export const NPC_DIALOGUE_CYCLE_MS = 4000;
export const NPC_BODY_COLOR = 0xdd8833;
export const NPC_HEAD_COLOR = 0xffcc88;
export const NPC_BODY_WIDTH = 14;
export const NPC_BODY_HEIGHT = 22;
export const NPC_HEAD_RADIUS = 5;
export const NPC_BOB_AMPLITUDE = 3;
export const NPC_BOB_DURATION = 1200;
export const NPC_BUBBLE_PADDING_X = 10;
export const NPC_BUBBLE_PADDING_Y = 6;
export const NPC_BUBBLE_ALPHA = 0.8;
export const NPC_BUBBLE_OFFSET_Y = 30;
export const NPC_BUBBLE_POINTER_SIZE = 6;
export const NPC_BUBBLE_FONT_SIZE = "16px";
export const NPC_BUBBLE_MAX_WIDTH = 260;
export const NPC_BUBBLE_FADE_DURATION = 300;

// -- Player Trail Particles --
export const TRAIL_PARTICLE_SIZE = 4;
export const TRAIL_PARTICLE_OFFSET_Y = 10;
export const TRAIL_SPARKLE_SPEED = 30;
export const TRAIL_SPARKLE_GRAVITY_Y = -20;
export const TRAIL_SPARKLE_LIFESPAN = 600;
export const TRAIL_HEARTS_SPEED = 20;
export const TRAIL_HEARTS_GRAVITY_Y = -15;
export const TRAIL_HEARTS_LIFESPAN = 800;
export const TRAIL_BUBBLES_SPEED = 40;
export const TRAIL_BUBBLES_GRAVITY_Y = -40;
export const TRAIL_BUBBLES_LIFESPAN = 500;
export const TRAIL_FIRE_SPEED = 50;
export const TRAIL_FIRE_GRAVITY_Y = 20;
export const TRAIL_FIRE_LIFESPAN = 400;
export const TRAIL_RAINBOW_SPEED = 30;
export const TRAIL_RAINBOW_LIFESPAN = 500;
export const TRAIL_EMIT_FREQUENCY = 50;

// -- Falling Leaves --
export const LEAF_PARTICLE_MAX = 10;
export const LEAF_PARTICLE_INTERVAL = 2500;
export const LEAF_PARTICLE_LIFETIME = 3500;
export const LEAF_PARTICLE_WIDTH = 3;
export const LEAF_PARTICLE_HEIGHT = 2;
export const LEAF_PARTICLE_DRIFT_SPEED = 15;
export const LEAF_PARTICLE_WOBBLE_AMPLITUDE = 8;
export const LEAF_PARTICLE_WOBBLE_SPEED = 3;

// -- Music --
export const MUSIC_VOLUME = 0.1;
export const MUSIC_BPM = 72;
export const MUSIC_LEAD_VOLUME = 0.2;
export const MUSIC_BASS_VOLUME = 0.12;
export const MUSIC_ATTACK_TIME = 0.04;
export const MUSIC_DECAY_TIME = 0.1;
export const MUSIC_SUSTAIN_LEVEL = 0.4;

// -- Title Scene Layout --
export const TITLE_BG_COLOR_TOP = 0x0a0a2e;
export const TITLE_BG_COLOR_BOTTOM = 0x1a1a3e;
export const TITLE_PANEL_BG = 0x111133;
export const TITLE_PANEL_BORDER = 0x444477;
export const TITLE_PANEL_ALPHA = 0.85;
export const TITLE_PANEL_INNER_GLOW_COLOR = 0x223366;
export const TITLE_PANEL_INNER_GLOW_ALPHA = 0.3;
export const TITLE_PANEL_RADIUS = 16;
export const TITLE_CELL_BG = 0x1a1a44;
export const TITLE_CELL_BG_HOVER = 0x2a2a55;
export const TITLE_CELL_SELECTED_BORDER = 0xffdd44;
export const TITLE_CELL_UNSELECTED_BORDER = 0x444466;
export const TITLE_CELL_SIZE = 56;
export const TITLE_CELL_GAP = 12;
export const TITLE_PREVIEW_SCALE = 4;
export const TITLE_PARTICLE_COUNT = 15;
export const TITLE_PARTICLE_RADIUS = 1.5;
export const TITLE_PARTICLE_ALPHA_BASE = 0.15;
export const TITLE_PARTICLE_ALPHA_RANGE = 0.2;
export const TITLE_PARTICLE_DRIFT_BASE = 30;
export const TITLE_PARTICLE_DRIFT_RANGE = 40;
export const TITLE_PARTICLE_DURATION_BASE = 3000;
export const TITLE_PARTICLE_DURATION_RANGE = 4000;
export const TITLE_Y = 36;
export const TITLE_SHADOW_OFFSET = 2;
export const TITLE_SUBTITLE_Y = 80;
export const TITLE_GLOW_ALPHA = 0.3;
export const TITLE_SHADOW_ALPHA = 0.5;
export const TITLE_LEFT_PANEL_OFFSET_X = -230;
export const TITLE_PANEL_TOP = 120;
export const TITLE_LEFT_PANEL_W = 220;
export const TITLE_PANEL_H = 340;
export const TITLE_PLATFORM_OFFSET_Y = 160;
export const TITLE_CHAR_OFFSET_Y = 30;
export const TITLE_CHAR_GLOW_RADIUS = 60;
export const TITLE_CHAR_GLOW_ALPHA = 0.15;
export const TITLE_CHAR_GLOW_COLOR = 0x4488cc;
export const TITLE_IDLE_BOUNCE_Y = -8;
export const TITLE_IDLE_BOUNCE_DURATION = 1200;
export const TITLE_NAME_OFFSET_Y = 40;
export const TITLE_DICE_OFFSET_Y = 20;
export const TITLE_RIGHT_PANEL_OFFSET_X = 140;
export const TITLE_RIGHT_PANEL_W = 380;
export const TITLE_TAB_OFFSET_Y = 24;
export const TITLE_TAB_GAP = 8;
export const TITLE_TAB_INDICATOR_HEIGHT = 4;
export const TITLE_TAB_ACTIVE_COLOR = "#ffdd44";
export const TITLE_TAB_INACTIVE_COLOR = "#bbccdd";
export const TITLE_TAB_HOVER_COLOR = "#ddeeff";
export const TITLE_TAB_ACTIVE_ALPHA = 1;
export const TITLE_TAB_INACTIVE_ALPHA = 0.8;
export const TITLE_TAB_HOVER_ALPHA = 0.85;
export const TITLE_TAB_CONTENT_OFFSET_Y = 42;
export const TITLE_TAB_CONTENT_PADDING = 24;
export const TITLE_START_BTN_OFFSET_Y = 60;
export const TITLE_START_GLOW_W = 280;
export const TITLE_START_GLOW_H = 64;
export const TITLE_START_GLOW_COLOR = 0xff8800;
export const TITLE_START_GLOW_ALPHA = 0.2;
export const TITLE_START_BTN_W = 300;
export const TITLE_START_BTN_H = 64;
export const TITLE_START_BTN_RADIUS = 10;
export const TITLE_START_BTN_FILL = 0xff8800;
export const TITLE_START_BTN_STROKE = 0xff8800;
export const TITLE_START_BTN_HOVER_FILL = 0xffaa22;
export const TITLE_START_BTN_HOVER_STROKE = 0xffaa33;
export const TITLE_PREVIEW_HEAD_RADIUS = 16;
export const TITLE_PREVIEW_HEAD_OFFSET_Y = 6;
export const TITLE_PREVIEW_HAT_OFFSET_Y = 22;
export const TITLE_CONTROLS_CARD_W = 340;
export const TITLE_CONTROLS_CARD_H = 260;
export const TITLE_CONTROLS_OVERLAY_DEPTH = 50;
export const TITLE_CONTROLS_BACKDROP_ALPHA = 0.7;
export const TITLE_CONTROLS_ROW_HEIGHT = 30;
export const TITLE_CONTROLS_KEY_OFFSET_X = -140;
export const TITLE_CONTROLS_DESC_OFFSET_X = 40;
export const TITLE_CONTROLS_START_OFFSET_Y = 56;

// -- Game Over Scene --
export const GAMEOVER_TITLE_FONT_SIZE = "64px";
export const GAMEOVER_SUBTITLE_FONT_SIZE = "18px";
export const GAMEOVER_PROMPT_FONT_SIZE = "16px";
export const GAMEOVER_BG_COLOR = 0x0a0a0a;
export const GAMEOVER_OVERLAY_COLOR = 0x110000;
export const GAMEOVER_OVERLAY_ALPHA = 0.6;
export const GAMEOVER_TITLE_OFFSET_Y = -60;
export const GAMEOVER_TITLE_FADE_DURATION = 800;
export const GAMEOVER_SUBTITLE_FADE_DURATION = 600;
export const GAMEOVER_SUBTITLE_DELAY = 500;
export const GAMEOVER_PROMPT_OFFSET_Y = 80;
export const GAMEOVER_PROMPT_FADE_DURATION = 500;
export const GAMEOVER_PROMPT_DELAY = 1500;
export const GAMEOVER_PROMPT_PULSE_ALPHA = 0.4;
export const GAMEOVER_PROMPT_PULSE_DURATION = 800;
export const GAMEOVER_INPUT_DELAY = 1500;

// -- HUD --
export const HUD_LEFT_X = 8;
export const HUD_LEFT_W = 180;
export const HUD_LEFT_H = 44;
export const HUD_BG_ALPHA = 0.5;
export const HUD_BORDER_ALPHA = 0.1;
export const HUD_BORDER_RADIUS = 6;
export const HUD_GLIDE_X = 18;
export const HUD_GLIDE_Y = 16;
export const HUD_RIGHT_W = 160;
export const HUD_RIGHT_H = 52;
export const HUD_LIVES_OFFSET_X = 18;
export const HUD_LIVES_Y = 14;
export const HUD_FRUIT_Y = 40;
export const HUD_DEPTH = 99;
export const HUD_LIVES_FONT_SIZE = "24px";
export const HUD_FRUIT_FONT_SIZE = "16px";
export const HUD_TIMER_FONT_SIZE = "20px";
export const HUD_TIMER_BG_COLOR = "#00000088";
export const HUD_TIMER_PADDING_X = 12;
export const HUD_TIMER_PADDING_Y = 6;
export const HUD_LIVES_MARGIN_RIGHT = 20;
export const HUD_FRUIT_MARGIN_RIGHT = 20;
export const HUD_FRUIT_OFFSET_Y = 42;
export const HUD_POPUP_FONT_SIZE = "18px";

// -- Fruit Popup --
export const FRUIT_POPUP_OFFSET_Y = 30;
export const FRUIT_POPUP_RISE = 60;
export const FRUIT_POPUP_DURATION = 800;

// -- Player Visual --
export const PLAYER_HEAD_RADIUS = 6;
export const PLAYER_HEAD_OFFSET_Y = 4;
export const PLAYER_FOOT_SHADOW_OFFSET_Y = 2;
export const PLAYER_FOOT_SHADOW_WIDTH_EXTRA = 4;
export const PLAYER_FOOT_SHADOW_HEIGHT = 6;
export const PLAYER_HAT_OFFSET_Y = 16;
export const PLAYER_OUTLINE_ALPHA = 0.3;
export const PLAYER_OUTLINE_EXTRA = 2;
export const PLAYER_BOB_SPEED = 0.003;
export const PLAYER_BOB_AMPLITUDE = 1.5;
export const PLAYER_INVULNERABLE_FLASH_SPEED = 0.01;
export const PLAYER_INVULNERABLE_DIM_ALPHA = 0.3;
export const PLAYER_COLLISION_INSET = 2;

// -- NPC Visual --
export const NPC_EYE_OFFSET_X = 2;
export const NPC_EYE_RADIUS = 1;
export const NPC_EYE_COLOR = 0x000000;
export const NPC_CONTAINER_DEPTH = 10;
export const NPC_DIALOGUE_LINE_COUNT = 3;
export const NPC_BUBBLE_CORNER_RADIUS = 6;
export const NPC_BUBBLE_BG_COLOR = 0x000000;
export const NPC_BUBBLE_DEPTH = 20;
export const NPC_BUBBLE_FALLBACK_HEIGHT = 30;

// -- Lava Visual --
export const LAVA_STRIPE_COUNT = 20;
export const LAVA_SURFACE_HEIGHT = 4;
export const LAVA_SURFACE_STEP = 8;
export const LAVA_SURFACE_WAVE_AMP = 3;
export const LAVA_SURFACE_COLOR = 0xffaa00;
export const LAVA_SURFACE_ALPHA = 0.6;
export const LAVA_STRIPE_ALPHA_BASE = 0.3;
export const LAVA_STRIPE_ALPHA_RANGE = 0.3;
export const LAVA_STRIPE_WIDTH_RATIO = 0.6;
export const LAVA_GLOW_STEPS = 8;

// -- Day/Night Visual --
export const DAY_NIGHT_VISION_EDGE_STEPS = 8;
export const DAY_NIGHT_VISION_EDGE_WIDTH = 10;
export const DAY_NIGHT_OVERLAY_MAX_ALPHA = 0.85;

// -- Cloud Visual --
export const CLOUD_CIRCLE_COUNT_BASE = 2;
export const CLOUD_CIRCLE_COUNT_RANGE = 2;
export const CLOUD_CIRCLE_SPACING = 30;
export const CLOUD_CIRCLE_JITTER_X = 20;
export const CLOUD_CIRCLE_JITTER_Y = 10;
export const CLOUD_ELLIPSE_WIDTH_BASE = 50;
export const CLOUD_ELLIPSE_WIDTH_RANGE = 40;
export const CLOUD_ELLIPSE_HEIGHT_BASE = 20;
export const CLOUD_ELLIPSE_HEIGHT_RANGE = 15;
export const CLOUD_ALPHA_JITTER = 0.05;
export const CLOUD_DEPTH = -10;
export const CLOUD_WRAP_MARGIN = 100;

// -- Inventory Visual --
export const INVENTORY_BG_COLOR = 0x1a1a33;
export const INVENTORY_BG_ALPHA = 0.85;
export const INVENTORY_BG_PADDING_X = 24;
export const INVENTORY_BG_PADDING_Y = 8;
export const INVENTORY_BG_RADIUS = 8;
export const INVENTORY_BORDER_ALPHA = 0.15;
export const INVENTORY_SLOT_SELECTED_BG = 0x555577;
export const INVENTORY_SLOT_BG = 0x333344;
export const INVENTORY_SLOT_SELECTED_BORDER_WIDTH = 3;
export const INVENTORY_SLOT_BORDER_WIDTH = 1;
export const INVENTORY_SLOT_BORDER_COLOR = 0x555566;
export const INVENTORY_SELECTED_SCALE = 1.05;
export const INVENTORY_PREVIEW_OFFSET_Y = 6;
export const INVENTORY_COUNT_OFFSET = 5;
export const INVENTORY_COUNT_SHADOW_OFFSET = 1;
export const INVENTORY_COUNT_SHADOW_ALPHA = 0.5;
export const INVENTORY_BOTTOM_MARGIN = 10;

// -- Goal Beacon Visual --
export const GOAL_BEACON_GLOW_STEPS = 10;
export const GOAL_BEACON_GLOW_ALPHA = 0.15;
export const GOAL_BEACON_BEAM_ALPHA = 0.08;
export const GOAL_BEACON_PULSE_ALPHA = 0.15;
export const GOAL_BEACON_PULSE_SCALE_X = 1.2;
export const GOAL_BEACON_PULSE_DURATION = 2000;

// -- Ambient Particle Visual --
export const AMBIENT_PARTICLE_DEPTH = -5;
export const AMBIENT_PARTICLE_COLOR_CHANCE = 0.5;
export const AMBIENT_PARTICLE_ALT_COLOR = 0xaaddff;

// -- Sky Gradient Visual --
export const SKY_GRADIENT_DEPTH = -20;

// -- Block Interaction Visual --
export const BLOCK_BREAK_OVERLAY_ALPHA = 0.3;
export const BLOCK_BREAK_OVERLAY_COLOR = 0xffffff;
export const BLOCK_BREAK_PROGRESS_ALPHA_RANGE = 0.4;

// -- World Renderer Visual --
export const BLOCK_OUTLINE_ALPHA = 0.2;

// -- High Scores --
export const HIGH_SCORES_KEY = "drift-lands-high-scores";
export const HIGH_SCORES_MAX = 5;
export const HIGH_SCORE_RESET_CONFIRM_MS = 3000;

// -- Victory Scene Layout --
export const VICTORY_BG_COLOR = 0x1a1a0a;
export const VICTORY_OVERLAY_COLOR = 0x332200;
export const VICTORY_OVERLAY_ALPHA = 0.4;
export const VICTORY_TITLE_OFFSET_Y = -100;
export const VICTORY_TITLE_FONT_SIZE = "48px";
export const VICTORY_TITLE_SCALE_UP = 1.1;
export const VICTORY_TITLE_FADE_DURATION = 1000;
export const VICTORY_TIME_OFFSET_Y = -30;
export const VICTORY_TIME_FONT_SIZE = "28px";
export const VICTORY_TIME_FADE_DURATION = 600;
export const VICTORY_TIME_FADE_DELAY = 800;
export const VICTORY_SUBTITLE_OFFSET_Y = 10;
export const VICTORY_SUBTITLE_FONT_SIZE = "16px";
export const VICTORY_SUBTITLE_FADE_DURATION = 600;
export const VICTORY_SUBTITLE_FADE_DELAY = 1000;
export const VICTORY_HIGH_SCORE_OFFSET_Y = 45;
export const VICTORY_HIGH_SCORE_FONT_SIZE = "22px";
export const VICTORY_HIGH_SCORE_FADE_DELAY = 1200;
export const VICTORY_LEADERBOARD_OFFSET_Y = 80;
export const VICTORY_LEADERBOARD_ROW_HEIGHT = 24;
export const VICTORY_LEADERBOARD_FONT_SIZE = "16px";
export const VICTORY_LEADERBOARD_FADE_DELAY = 1400;
export const VICTORY_PROMPT_OFFSET_Y = 260;
export const VICTORY_PROMPT_FONT_SIZE = "16px";
export const VICTORY_PROMPT_FADE_DURATION = 500;
export const VICTORY_PROMPT_FADE_DELAY = 2000;
export const VICTORY_PROMPT_PULSE_ALPHA = 0.4;
export const VICTORY_PROMPT_PULSE_DURATION = 800;
export const VICTORY_SPARKLE_COUNT = 20;
export const VICTORY_SPARKLE_RADIUS = 2;
export const VICTORY_SPARKLE_ALPHA_MIN = 0.2;
export const VICTORY_SPARKLE_ALPHA_RANGE = 0.4;
export const VICTORY_SPARKLE_DRIFT_MIN = 40;
export const VICTORY_SPARKLE_DRIFT_RANGE = 60;
export const VICTORY_SPARKLE_DURATION_MIN = 2000;
export const VICTORY_SPARKLE_DURATION_RANGE = 3000;
export const VICTORY_SPARKLE_DELAY_RANGE = 2000;
export const VICTORY_INPUT_DELAY = 2000;
export const VICTORY_SPARKLE_COLOR = 0xffd700;

// -- Title High Scores Section --
export const TITLE_SCORES_OFFSET_Y = 120;
export const TITLE_SCORES_HEADER_FONT_SIZE = "20px";
export const TITLE_SCORES_ROW_FONT_SIZE = "16px";
export const TITLE_SCORES_ROW_HEIGHT = 20;
export const TITLE_SCORES_EMPTY_FONT_SIZE = "16px";
export const TITLE_RESET_BTN_FONT_SIZE = "16px";
export const TITLE_RESET_BTN_OFFSET_Y = 14;

// -- Title Scene Text Colors --
export const TITLE_TEXT_COLOR = "#ffffff";
export const TITLE_TEXT_SHADOW_COLOR = "#000000";
export const TITLE_GLOW_COLOR = "#4488cc";
export const TITLE_SUBTITLE_COLOR = "#99ddff";
export const TITLE_NAME_COLOR = "#ffee66";
export const TITLE_HINT_COLOR = "#99aacc";
export const TITLE_HOVER_COLOR = "#ddddee";
export const TITLE_DICE_COLOR = "#bbbbcc";
export const TITLE_DICE_BG_COLOR = "#222255";
export const TITLE_DICE_HOVER_COLOR = "#ffdd44";
export const TITLE_TOGGLE_ON_COLOR = "#88cc88";
export const TITLE_TOGGLE_OFF_COLOR = "#99aacc";
export const TITLE_SCORE_GOLD_COLOR = "#ffd700";
export const TITLE_SCORE_COLOR = "#bbbbcc";
export const TITLE_SCORES_HEADER_COLOR = "#ffdd44";
export const TITLE_SCORES_EMPTY_COLOR = "#99aacc";
export const TITLE_RESET_COLOR = "#99aacc";
export const TITLE_RESET_HOVER_COLOR = "#ddddee";
export const TITLE_RESET_CONFIRM_COLOR = "#ff4444";
export const TITLE_RESET_CONFIRM_HOVER_COLOR = "#ff6666";
export const TITLE_CONTROLS_HEADER_COLOR = "#ffffff";
export const TITLE_CONTROLS_DESC_COLOR = "#cccccc";
export const TITLE_CONTROLS_CLOSE_COLOR = "#99aacc";
export const TITLE_START_LABEL_COLOR = "#ffffff";
export const TITLE_GAMEPAD_CONNECTED_COLOR = "#44aa44";

// -- Game Over Scene Text Colors --
export const GAMEOVER_TITLE_COLOR = "#ff4444";
export const GAMEOVER_SUBTITLE_COLOR = "#cc8888";
export const GAMEOVER_PROMPT_COLOR = "#bbbbcc";

// -- Victory Scene Text Colors --
export const VICTORY_TITLE_COLOR = "#ffd700";
export const VICTORY_TIME_COLOR = "#ffffff";
export const VICTORY_SUBTITLE_COLOR = "#ccaa44";
export const VICTORY_HIGH_SCORE_COLOR = "#ffd700";
export const VICTORY_LEADERBOARD_HEADER_COLOR = "#ffdd44";
export const VICTORY_SCORE_HIGHLIGHT_COLOR = "#ffd700";
export const VICTORY_SCORE_COLOR = "#bbbbcc";
export const VICTORY_PROMPT_COLOR = "#bbbbcc";

// -- Day/Night Text Colors --
export const DAY_NIGHT_TEXT_COLOR = "#ffffff";
export const DAY_NIGHT_TEXT_BG_COLOR = "#00000088";
export const DAY_NIGHT_DAY_COLOR = "#ffdd44";
export const DAY_NIGHT_NIGHT_COLOR = "#8888ff";

// -- Game Scene HUD Text Colors --
export const HUD_GLIDE_COLOR = "#ffffff";
export const HUD_LIVES_COLOR = "#ff4444";
export const HUD_FRUIT_COLOR = "#ffaa33";
export const HUD_TIMER_COLOR = "#ffffff";
export const HUD_LAVA_LABEL_COLOR = "#bbbbcc";
export const HUD_LIFE_POPUP_COLOR = "#ff4444";
export const HUD_JETPACK_POPUP_COLOR = "#ff8800";

// -- NPC Text Colors --
export const NPC_TEXT_COLOR = "#ffffff";

// -- Inventory Text Colors --
export const INVENTORY_NAME_COLOR = "#ffffff";
export const INVENTORY_COUNT_SHADOW_COLOR = "#000000";
export const INVENTORY_COUNT_COLOR = "#ffffff";
export const INVENTORY_SLOT_NUM_COLOR = "#99aacc";

// -- Notifications --
export const NOTIFICATION_DURATION = 3000;
export const NOTIFICATION_FADE_DURATION = 300;
export const NOTIFICATION_MAX_VISIBLE = 4;
export const NOTIFICATION_OFFSET_X = 20;
export const NOTIFICATION_OFFSET_Y = -80;
export const NOTIFICATION_SPACING = 36;
export const NOTIFICATION_FONT_SIZE = "16px";
export const NOTIFICATION_BG_COLOR = 0x000000;
export const NOTIFICATION_BG_ALPHA = 0.7;
export const NOTIFICATION_SLIDE_IN_OFFSET = 100;
export const NOTIFICATION_SLIDE_IN_DURATION = 200;
export const NOTIFICATION_SLIDE_OUT_OFFSET = 50;
export const NOTIFICATION_REPOSITION_DURATION = 150;
export const NOTIFICATION_EASE = "Power2";

// -- Block Mining Times (ms per block type) --
export const MINE_TIME_DIRT = 200;
export const MINE_TIME_GRASS = 250;
export const MINE_TIME_SAND = 150;
export const MINE_TIME_WOOD = 400;
export const MINE_TIME_LEAF = 100;
export const MINE_TIME_STONE = 600;
export const MINE_TIME_MOSSY_STONE = 500;
export const MINE_TIME_CRYSTAL = 800;
export const MINE_TIME_DEAD_WOOD = 300;
export const MINE_TIME_DEFAULT = 300;

// -- NPC Physics --
export const NPC_GRAVITY = 600;
export const NPC_FALL_CHECK_OFFSET = 1;

// -- Text Resolution --
export const TEXT_RESOLUTION = 3;

// -- Water Sideways Spread --
export const WATER_SPREAD_CHANCE = 0.3;

// -- NPC Names --
export const NPC_NAMES: readonly string[] = [
	"Chip",
	"Pixel",
	"Blocky",
	"Drift",
	"Sky",
	"Pebble",
	"Mossy",
	"Sandy",
	"Leaf",
	"Spark",
] as const;
