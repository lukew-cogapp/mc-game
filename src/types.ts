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
