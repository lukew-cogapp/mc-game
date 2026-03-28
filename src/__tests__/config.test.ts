import { describe, expect, it } from "vitest";
import {
	BLOCK_INTERACT_RANGE,
	BREAK_TIME_MS,
	COLORS,
	GRAVITY,
	INVENTORY_SLOTS,
	JUMP_VELOCITY,
	MAX_LIVES,
	PLAYER_HEIGHT,
	PLAYER_SPEED,
	PLAYER_WIDTH,
	STARTING_LIVES,
	TILE_SIZE,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";

describe("config constants", () => {
	describe("tile and world dimensions", () => {
		it("TILE_SIZE is positive", () => {
			expect(TILE_SIZE).toBeGreaterThan(0);
		});

		it("WORLD_WIDTH_TILES is positive", () => {
			expect(WORLD_WIDTH_TILES).toBeGreaterThan(0);
		});

		it("WORLD_HEIGHT_TILES is positive", () => {
			expect(WORLD_HEIGHT_TILES).toBeGreaterThan(0);
		});
	});

	describe("player constants", () => {
		it("STARTING_LIVES is positive", () => {
			expect(STARTING_LIVES).toBeGreaterThan(0);
		});

		it("MAX_LIVES is at least STARTING_LIVES", () => {
			expect(MAX_LIVES).toBeGreaterThanOrEqual(STARTING_LIVES);
		});

		it("PLAYER_SPEED is positive", () => {
			expect(PLAYER_SPEED).toBeGreaterThan(0);
		});

		it("PLAYER_WIDTH is positive", () => {
			expect(PLAYER_WIDTH).toBeGreaterThan(0);
		});

		it("PLAYER_HEIGHT is positive", () => {
			expect(PLAYER_HEIGHT).toBeGreaterThan(0);
		});

		it("JUMP_VELOCITY is negative (upward)", () => {
			expect(JUMP_VELOCITY).toBeLessThan(0);
		});
	});

	describe("physics", () => {
		it("GRAVITY is positive", () => {
			expect(GRAVITY).toBeGreaterThan(0);
		});
	});

	describe("interaction", () => {
		it("BLOCK_INTERACT_RANGE is positive", () => {
			expect(BLOCK_INTERACT_RANGE).toBeGreaterThan(0);
		});

		it("BREAK_TIME_MS is positive", () => {
			expect(BREAK_TIME_MS).toBeGreaterThan(0);
		});

		it("INVENTORY_SLOTS is positive", () => {
			expect(INVENTORY_SLOTS).toBeGreaterThan(0);
		});
	});

	describe("COLORS object", () => {
		it("has sky color", () => {
			expect(COLORS.sky).toBeDefined();
		});

		it("has dirt color", () => {
			expect(COLORS.dirt).toBeDefined();
		});

		it("has grass color", () => {
			expect(COLORS.grass).toBeDefined();
		});

		it("has stone color", () => {
			expect(COLORS.stone).toBeDefined();
		});

		it("has water color", () => {
			expect(COLORS.water).toBeDefined();
		});

		it("has lava color", () => {
			expect(COLORS.lava).toBeDefined();
		});

		it("has playerBody color", () => {
			expect(COLORS.playerBody).toBeDefined();
		});

		it("has playerHead color", () => {
			expect(COLORS.playerHead).toBeDefined();
		});

		it("all color values are numbers", () => {
			for (const [_key, value] of Object.entries(COLORS)) {
				expect(typeof value).toBe("number");
			}
		});
	});
});
