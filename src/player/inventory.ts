import {
	COLORS,
	INVENTORY_BAR_HEIGHT,
	INVENTORY_COUNT_COLOR,
	INVENTORY_COUNT_SHADOW_COLOR,
	INVENTORY_COUNT_SIZE,
	INVENTORY_NAME_COLOR,
	INVENTORY_NAME_FONT_SIZE,
	INVENTORY_NAME_OFFSET_Y,
	INVENTORY_SLOT_GAP,
	INVENTORY_SLOT_NUM_COLOR,
	INVENTORY_SLOT_SIZE,
	INVENTORY_SLOTS,
	INVENTORY_SWATCH_SIZE,
	TEXT_RESOLUTION,
	TILE_SIZE,
	UI_DEPTH,
} from "../config";
import { BlockType, type InventorySlot } from "../types";

export const BLOCK_NAMES: Record<BlockType, string> = {
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
	[BlockType.Ice]: "Ice",
	[BlockType.Thorns]: "Thorns",
	[BlockType.CrumblingBlock]: "Crumbling Block",
	[BlockType.WindBlock]: "Wind Block",
};

export class InventoryBar extends Phaser.GameObjects.Container {
	private slots: InventorySlot[];
	selectedIndex = 0;

	constructor(scene: Phaser.Scene) {
		super(scene, 0, 0);
		scene.add.existing(this);
		this.setDepth(UI_DEPTH);
		this.setScrollFactor(0);

		this.slots = Array.from({ length: INVENTORY_SLOTS }, () => ({
			blockType: BlockType.Air,
			count: 0,
		}));
	}

	addBlock = (blockType: BlockType): boolean => {
		// Find existing slot with same type
		const existing = this.slots.find(
			(slot) => slot.blockType === blockType && slot.count > 0,
		);
		if (existing) {
			existing.count++;
			return true;
		}

		// Find empty slot
		const empty = this.slots.find((slot) => slot.count === 0);
		if (empty) {
			empty.blockType = blockType;
			empty.count = 1;
			return true;
		}

		return false;
	};

	removeSelected = (): BlockType | null => {
		const slot = this.slots[this.selectedIndex];
		if (slot.count <= 0) return null;

		slot.count--;
		const type = slot.blockType;
		if (slot.count === 0) {
			slot.blockType = BlockType.Air;
		}
		return type;
	};

	getSelectedType = (): BlockType | null => {
		const slot = this.slots[this.selectedIndex];
		if (slot.count <= 0) return null;
		return slot.blockType;
	};

	render = (): void => {
		this.removeAll(true);

		const totalWidth =
			INVENTORY_SLOTS * INVENTORY_SLOT_SIZE +
			(INVENTORY_SLOTS - 1) * INVENTORY_SLOT_GAP;
		const startX = (this.scene.cameras.main.width - totalWidth) / 2;
		const startY = this.scene.cameras.main.height - INVENTORY_BAR_HEIGHT - 10;

		// Selected block name above hotbar
		const selectedSlot = this.slots[this.selectedIndex];
		if (selectedSlot.count > 0) {
			const nameLabel = this.scene.add.text(
				this.scene.cameras.main.width / 2,
				startY - INVENTORY_NAME_OFFSET_Y,
				BLOCK_NAMES[selectedSlot.blockType],
				{
					fontSize: INVENTORY_NAME_FONT_SIZE,
					color: INVENTORY_NAME_COLOR,
					align: "center",
				},
			);
			nameLabel.setResolution(TEXT_RESOLUTION);
			nameLabel.setOrigin(0.5);
			this.add(nameLabel);
		}

		// Background with rounded feel
		const bg = this.scene.add.rectangle(
			this.scene.cameras.main.width / 2,
			startY + INVENTORY_BAR_HEIGHT / 2,
			totalWidth + 24,
			INVENTORY_BAR_HEIGHT + 8,
			0x1a1a33,
			0.85,
		);
		this.add(bg);

		// Border
		const bgBorder = this.scene.add.graphics();
		bgBorder.lineStyle(1, 0xffffff, 0.15);
		bgBorder.strokeRoundedRect(
			this.scene.cameras.main.width / 2 - (totalWidth + 24) / 2,
			startY + INVENTORY_BAR_HEIGHT / 2 - (INVENTORY_BAR_HEIGHT + 8) / 2,
			totalWidth + 24,
			INVENTORY_BAR_HEIGHT + 8,
			8,
		);
		this.add(bgBorder);

		for (let i = 0; i < INVENTORY_SLOTS; i++) {
			const x = startX + i * (INVENTORY_SLOT_SIZE + INVENTORY_SLOT_GAP);
			const y = startY + (INVENTORY_BAR_HEIGHT - INVENTORY_SLOT_SIZE) / 2;

			const isSelected = i === this.selectedIndex;

			// Slot background — higher contrast
			const slotBg = this.scene.add.rectangle(
				x + INVENTORY_SLOT_SIZE / 2,
				y + INVENTORY_SLOT_SIZE / 2,
				INVENTORY_SLOT_SIZE,
				INVENTORY_SLOT_SIZE,
				isSelected ? 0x555577 : 0x333344,
			);
			this.add(slotBg);

			// Slot border — always visible, brighter when selected
			const border = this.scene.add.rectangle(
				x + INVENTORY_SLOT_SIZE / 2,
				y + INVENTORY_SLOT_SIZE / 2,
				INVENTORY_SLOT_SIZE,
				INVENTORY_SLOT_SIZE,
			);
			border.setStrokeStyle(
				isSelected ? 3 : 1,
				isSelected ? COLORS.selected : 0x555566,
			);
			this.add(border);

			// Selected: scale up slightly
			if (isSelected) {
				slotBg.setScale(1.05);
				border.setScale(1.05);
			}

			const slot = this.slots[i];
			if (slot.count > 0) {
				// Block texture preview (uses the actual in-game texture)
				const textureKey = `block_${slot.blockType}`;
				if (this.scene.textures.exists(textureKey)) {
					const preview = this.scene.add.sprite(
						x + INVENTORY_SLOT_SIZE / 2,
						y + INVENTORY_SLOT_SIZE / 2 - 6,
						textureKey,
					);
					const scale = INVENTORY_SWATCH_SIZE / TILE_SIZE;
					preview.setScale(scale);
					this.add(preview);
				}

				// Count — bottom right of slot, with shadow for readability
				const countShadow = this.scene.add.text(
					x + INVENTORY_SLOT_SIZE - 5,
					y + INVENTORY_SLOT_SIZE - 5,
					`${slot.count}`,
					{
						fontSize: INVENTORY_COUNT_SIZE,
						color: INVENTORY_COUNT_SHADOW_COLOR,
						fontStyle: "bold",
						align: "right",
					},
				);
				countShadow.setResolution(TEXT_RESOLUTION);
				countShadow.setOrigin(1, 1);
				countShadow.setAlpha(0.5);
				this.add(countShadow);

				const count = this.scene.add.text(
					x + INVENTORY_SLOT_SIZE - 6,
					y + INVENTORY_SLOT_SIZE - 6,
					`${slot.count}`,
					{
						fontSize: INVENTORY_COUNT_SIZE,
						color: INVENTORY_COUNT_COLOR,
						fontStyle: "bold",
						align: "right",
					},
				);
				count.setResolution(TEXT_RESOLUTION);
				count.setOrigin(1, 1);
				this.add(count);
			}

			// Slot number — top left
			const numLabel = this.scene.add.text(x + 4, y + 2, `${i + 1}`, {
				fontSize: "14px",
				color: INVENTORY_SLOT_NUM_COLOR,
			});
			numLabel.setResolution(TEXT_RESOLUTION);
			this.add(numLabel);
		}
	};

	destroy(fromScene?: boolean): void {
		this.removeAll(true);
		super.destroy(fromScene);
	}
}
