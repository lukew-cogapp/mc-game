import { describe, expect, it } from "vitest";
import { BlockType, NON_SOLID_BLOCKS } from "../types";

describe("BlockType enum", () => {
	it("has Air as 0", () => {
		expect(BlockType.Air).toBe(0);
	});

	it("has expected block type values", () => {
		expect(BlockType.Dirt).toBe(1);
		expect(BlockType.Grass).toBe(2);
		expect(BlockType.Stone).toBe(3);
		expect(BlockType.Water).toBe(7);
		expect(BlockType.Jetpack).toBe(18);
	});
});

describe("NON_SOLID_BLOCKS", () => {
	it("contains Air", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Air)).toBe(true);
	});

	it("contains Water", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Water)).toBe(true);
	});

	it("contains Flower", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Flower)).toBe(true);
	});

	it("contains Mushroom", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Mushroom)).toBe(true);
	});

	it("contains all fruit types", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Apple)).toBe(true);
		expect(NON_SOLID_BLOCKS.has(BlockType.Pear)).toBe(true);
		expect(NON_SOLID_BLOCKS.has(BlockType.Peach)).toBe(true);
		expect(NON_SOLID_BLOCKS.has(BlockType.Strawberry)).toBe(true);
		expect(NON_SOLID_BLOCKS.has(BlockType.Berry)).toBe(true);
	});

	it("contains Jetpack", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Jetpack)).toBe(true);
	});

	it("does NOT contain Dirt", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Dirt)).toBe(false);
	});

	it("does NOT contain Stone", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Stone)).toBe(false);
	});

	it("does NOT contain Grass", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Grass)).toBe(false);
	});

	it("does NOT contain Wood", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Wood)).toBe(false);
	});

	it("does NOT contain Leaf", () => {
		expect(NON_SOLID_BLOCKS.has(BlockType.Leaf)).toBe(false);
	});
});
