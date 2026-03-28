// -- Grid & Tiles --
export const TILE_SIZE = 32;
export const WORLD_WIDTH_TILES = 200;
export const WORLD_HEIGHT_TILES = 100;

// -- Physics --
export const GRAVITY = 800;
export const PLAYER_SPEED = 200;
export const JUMP_VELOCITY = -350;
export const GLIDE_GRAVITY = 100;
export const GLIDE_HORIZONTAL_BOOST = 1.3;
export const DOUBLE_JUMP_VELOCITY = -300;

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
export const WATER_POOL_DEPTH = 1;
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

// -- Goal Beacon --
export const GOAL_BEACON_HEIGHT_TILES = 5;
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
export const NPC_BUBBLE_FONT_SIZE = "11px";
export const NPC_BUBBLE_MAX_WIDTH = 180;
export const NPC_BUBBLE_FADE_DURATION = 300;

// -- Falling Leaves --
export const LEAF_PARTICLE_MAX = 10;
export const LEAF_PARTICLE_INTERVAL = 2500;
export const LEAF_PARTICLE_LIFETIME = 3500;
export const LEAF_PARTICLE_WIDTH = 3;
export const LEAF_PARTICLE_HEIGHT = 2;
export const LEAF_PARTICLE_DRIFT_SPEED = 15;
export const LEAF_PARTICLE_WOBBLE_AMPLITUDE = 8;
export const LEAF_PARTICLE_WOBBLE_SPEED = 3;
