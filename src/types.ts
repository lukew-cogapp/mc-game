export enum BlockType {
	Air = 0,
	Dirt = 1,
	Grass = 2,
	Stone = 3,
	Sand = 4,
	Wood = 5,
	Leaf = 6,
	Water = 7,
	MossyStone = 8,
	CrystalBlock = 9,
	Flower = 10,
	Mushroom = 11,
	DeadWood = 12,
	Apple = 13,
	Pear = 14,
	Peach = 15,
	Strawberry = 16,
	Berry = 17,
	Jetpack = 18,
	Ice = 19,
	Thorns = 20,
	CrumblingBlock = 21,
	WindBlock = 22,
}

export type IslandRole = "safe" | "resource" | "reward" | "transit" | "goal";

export interface Island {
	x: number;
	y: number;
	width: number;
	height: number;
	biome: "grassland" | "rocky" | "sandy" | "mossy" | "crystal";
	role: IslandRole;
}

export interface InventorySlot {
	blockType: BlockType;
	count: number;
}

/** Blocks that do not count as solid for collision or adjacency checks. */
export const NON_SOLID_BLOCKS: ReadonlySet<BlockType> = new Set([
	BlockType.Air,
	BlockType.Water,
	BlockType.Flower,
	BlockType.Mushroom,
	BlockType.Apple,
	BlockType.Pear,
	BlockType.Peach,
	BlockType.Strawberry,
	BlockType.Berry,
	BlockType.Jetpack,
	BlockType.Thorns,
]);
