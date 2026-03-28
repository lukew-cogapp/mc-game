import {
	COLORS,
	INVENTORY_BAR_HEIGHT,
	INVENTORY_COUNT_SIZE,
	INVENTORY_NAME_FONT_SIZE,
	INVENTORY_NAME_OFFSET_Y,
	INVENTORY_SLOT_GAP,
	INVENTORY_SLOT_SIZE,
	INVENTORY_SLOTS,
	INVENTORY_SWATCH_SIZE,
	TILE_SIZE,
	UI_DEPTH,
} from "../config";
import { BlockType, type InventorySlot } from "../types";

const BLOCK_NAMES: Record<BlockType, string> = {
	[BlockType.Air]: "Air",
	[BlockType.Dirt]: "Dirt",
	[BlockType.Grass]: "Grass",
	[BlockType.Stone]: "Stone",
	[BlockType.Sand]: "Sand",
	[BlockType.Wood]: "Wood",
	[BlockType.Leaf]: "Leaf",
	[BlockType.Water]: "Water",
	[BlockType.MossyStone]: "Mossy Stone",
	[BlockType.CrystalBlock]: "Crystal",
	[BlockType.Flower]: "Flower",
	[BlockType.Mushroom]: "Mushroom",
	[BlockType.DeadWood]: "Dead Wood",
	[BlockType.Apple]: "Apple",
	[BlockType.Pear]: "Pear",
	[BlockType.Peach]: "Peach",
	[BlockType.Strawberry]: "Strawberry",
	[BlockType.Berry]: "Berry",
	[BlockType.Jetpack]: "Jetpack",
};

export interface Inventory {
	slots: InventorySlot[];
	selectedIndex: number;
	container: Phaser.GameObjects.Container;
}

export const createInventory = (scene: Phaser.Scene): Inventory => {
	const slots: InventorySlot[] = Array.from(
		{ length: INVENTORY_SLOTS },
		() => ({
			blockType: BlockType.Air,
			count: 0,
		}),
	);

	const container = scene.add.container(0, 0);
	container.setDepth(UI_DEPTH);
	container.setScrollFactor(0);

	return { slots, selectedIndex: 0, container };
};

export const addToInventory = (
	inventory: Inventory,
	blockType: BlockType,
): boolean => {
	// Find existing slot with same type
	const existing = inventory.slots.find(
		(slot) => slot.blockType === blockType && slot.count > 0,
	);
	if (existing) {
		existing.count++;
		return true;
	}

	// Find empty slot
	const empty = inventory.slots.find((slot) => slot.count === 0);
	if (empty) {
		empty.blockType = blockType;
		empty.count = 1;
		return true;
	}

	return false;
};

export const removeFromInventory = (inventory: Inventory): BlockType | null => {
	const slot = inventory.slots[inventory.selectedIndex];
	if (slot.count <= 0) return null;

	slot.count--;
	const type = slot.blockType;
	if (slot.count === 0) {
		slot.blockType = BlockType.Air;
	}
	return type;
};

export const getSelectedBlockType = (
	inventory: Inventory,
): BlockType | null => {
	const slot = inventory.slots[inventory.selectedIndex];
	if (slot.count <= 0) return null;
	return slot.blockType;
};

export const renderInventory = (
	scene: Phaser.Scene,
	inventory: Inventory,
): void => {
	inventory.container.removeAll(true);

	const totalWidth =
		INVENTORY_SLOTS * INVENTORY_SLOT_SIZE +
		(INVENTORY_SLOTS - 1) * INVENTORY_SLOT_GAP;
	const startX = (scene.cameras.main.width - totalWidth) / 2;
	const startY = scene.cameras.main.height - INVENTORY_BAR_HEIGHT - 10;

	// Selected block name above hotbar
	const selectedSlot = inventory.slots[inventory.selectedIndex];
	if (selectedSlot.count > 0) {
		const nameLabel = scene.add.text(
			scene.cameras.main.width / 2,
			startY - INVENTORY_NAME_OFFSET_Y,
			BLOCK_NAMES[selectedSlot.blockType],
			{ fontSize: INVENTORY_NAME_FONT_SIZE, color: "#ffffff", align: "center" },
		);
		nameLabel.setOrigin(0.5);
		inventory.container.add(nameLabel);
	}

	// Background with rounded feel
	const bg = scene.add.rectangle(
		scene.cameras.main.width / 2,
		startY + INVENTORY_BAR_HEIGHT / 2,
		totalWidth + 24,
		INVENTORY_BAR_HEIGHT + 8,
		0x111122,
		0.85,
	);
	inventory.container.add(bg);

	// Border
	const bgBorder = scene.add.graphics();
	bgBorder.lineStyle(1, 0xffffff, 0.15);
	bgBorder.strokeRoundedRect(
		scene.cameras.main.width / 2 - (totalWidth + 24) / 2,
		startY + INVENTORY_BAR_HEIGHT / 2 - (INVENTORY_BAR_HEIGHT + 8) / 2,
		totalWidth + 24,
		INVENTORY_BAR_HEIGHT + 8,
		8,
	);
	inventory.container.add(bgBorder);

	for (let i = 0; i < INVENTORY_SLOTS; i++) {
		const x = startX + i * (INVENTORY_SLOT_SIZE + INVENTORY_SLOT_GAP);
		const y = startY + (INVENTORY_BAR_HEIGHT - INVENTORY_SLOT_SIZE) / 2;

		const isSelected = i === inventory.selectedIndex;

		// Slot background — higher contrast
		const slotBg = scene.add.rectangle(
			x + INVENTORY_SLOT_SIZE / 2,
			y + INVENTORY_SLOT_SIZE / 2,
			INVENTORY_SLOT_SIZE,
			INVENTORY_SLOT_SIZE,
			isSelected ? 0x444466 : 0x222233,
		);
		inventory.container.add(slotBg);

		// Slot border — always visible, brighter when selected
		const border = scene.add.rectangle(
			x + INVENTORY_SLOT_SIZE / 2,
			y + INVENTORY_SLOT_SIZE / 2,
			INVENTORY_SLOT_SIZE,
			INVENTORY_SLOT_SIZE,
		);
		border.setStrokeStyle(
			isSelected ? 3 : 1,
			isSelected ? COLORS.selected : 0x555566,
		);
		inventory.container.add(border);

		// Selected: scale up slightly
		if (isSelected) {
			slotBg.setScale(1.05);
			border.setScale(1.05);
		}

		const slot = inventory.slots[i];
		if (slot.count > 0) {
			// Block texture preview (uses the actual in-game texture)
			const textureKey = `block_${slot.blockType}`;
			if (scene.textures.exists(textureKey)) {
				const preview = scene.add.sprite(
					x + INVENTORY_SLOT_SIZE / 2,
					y + INVENTORY_SLOT_SIZE / 2 - 6,
					textureKey,
				);
				const scale = INVENTORY_SWATCH_SIZE / TILE_SIZE;
				preview.setScale(scale);
				inventory.container.add(preview);
			}

			// Count — bottom right of slot, with shadow for readability
			const countShadow = scene.add.text(
				x + INVENTORY_SLOT_SIZE - 5,
				y + INVENTORY_SLOT_SIZE - 5,
				`${slot.count}`,
				{
					fontSize: INVENTORY_COUNT_SIZE,
					color: "#000000",
					fontStyle: "bold",
					align: "right",
				},
			);
			countShadow.setOrigin(1, 1);
			countShadow.setAlpha(0.5);
			inventory.container.add(countShadow);

			const count = scene.add.text(
				x + INVENTORY_SLOT_SIZE - 6,
				y + INVENTORY_SLOT_SIZE - 6,
				`${slot.count}`,
				{
					fontSize: INVENTORY_COUNT_SIZE,
					color: "#ffffff",
					fontStyle: "bold",
					align: "right",
				},
			);
			count.setOrigin(1, 1);
			inventory.container.add(count);
		}

		// Slot number — top left
		const numLabel = scene.add.text(x + 4, y + 2, `${i + 1}`, {
			fontSize: "11px",
			color: "#666677",
		});
		inventory.container.add(numLabel);
	}
};
