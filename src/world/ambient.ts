import {
	AMBIENT_PARTICLE_ALPHA_MAX,
	AMBIENT_PARTICLE_ALPHA_MIN,
	AMBIENT_PARTICLE_ALT_COLOR,
	AMBIENT_PARTICLE_COLOR_CHANCE,
	AMBIENT_PARTICLE_COUNT,
	AMBIENT_PARTICLE_DEPTH,
	AMBIENT_PARTICLE_RADIUS_MAX,
	AMBIENT_PARTICLE_RADIUS_MIN,
	AMBIENT_PARTICLE_SPEED_MAX,
	AMBIENT_PARTICLE_SPEED_MIN,
	CLOUD_ALPHA,
	CLOUD_ALPHA_JITTER,
	CLOUD_CIRCLE_COUNT_BASE,
	CLOUD_CIRCLE_COUNT_RANGE,
	CLOUD_CIRCLE_JITTER_X,
	CLOUD_CIRCLE_JITTER_Y,
	CLOUD_CIRCLE_SPACING,
	CLOUD_COUNT,
	CLOUD_DEPTH,
	CLOUD_ELLIPSE_HEIGHT_BASE,
	CLOUD_ELLIPSE_HEIGHT_RANGE,
	CLOUD_ELLIPSE_WIDTH_BASE,
	CLOUD_ELLIPSE_WIDTH_RANGE,
	CLOUD_SPEED,
	CLOUD_WRAP_MARGIN,
	COLORS,
	LEAF_PARTICLE_DRIFT_SPEED,
	LEAF_PARTICLE_HEIGHT,
	LEAF_PARTICLE_INTERVAL,
	LEAF_PARTICLE_LIFETIME,
	LEAF_PARTICLE_MAX,
	LEAF_PARTICLE_WIDTH,
	LEAF_PARTICLE_WOBBLE_AMPLITUDE,
	LEAF_PARTICLE_WOBBLE_SPEED,
	TILE_SIZE,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";
import { BlockType } from "../types";

export interface AmbientParticle {
	circle: Phaser.GameObjects.Arc;
	speed: number;
}

export interface LeafParticle {
	gfx: Phaser.GameObjects.Rectangle;
	startX: number;
	age: number;
}

export const createClouds = (
	scene: Phaser.Scene,
): Phaser.GameObjects.Container[] => {
	const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
	const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;
	const clouds: Phaser.GameObjects.Container[] = [];

	for (let i = 0; i < CLOUD_COUNT; i++) {
		const cloudX = Math.random() * worldW;
		const cloudY = Math.random() * worldH * 0.5; // upper half of world
		const children: Phaser.GameObjects.Ellipse[] = [];

		// Each cloud is 2-3 overlapping white ellipses
		const circleCount =
			CLOUD_CIRCLE_COUNT_BASE +
			Math.floor(Math.random() * CLOUD_CIRCLE_COUNT_RANGE);
		for (let c = 0; c < circleCount; c++) {
			const ellipse = scene.add.ellipse(
				(c - 1) * CLOUD_CIRCLE_SPACING + Math.random() * CLOUD_CIRCLE_JITTER_X,
				Math.random() * CLOUD_CIRCLE_JITTER_Y - CLOUD_CIRCLE_JITTER_Y / 2,
				CLOUD_ELLIPSE_WIDTH_BASE + Math.random() * CLOUD_ELLIPSE_WIDTH_RANGE,
				CLOUD_ELLIPSE_HEIGHT_BASE + Math.random() * CLOUD_ELLIPSE_HEIGHT_RANGE,
				COLORS.white,
				CLOUD_ALPHA + Math.random() * CLOUD_ALPHA_JITTER,
			);
			children.push(ellipse);
		}

		const container = scene.add.container(cloudX, cloudY, children);
		container.setDepth(CLOUD_DEPTH);
		clouds.push(container);
	}

	return clouds;
};

export const updateClouds = (clouds: Phaser.GameObjects.Container[]): void => {
	const worldW = WORLD_WIDTH_TILES * TILE_SIZE;

	for (const cloud of clouds) {
		cloud.x += CLOUD_SPEED;
		if (cloud.x > worldW + CLOUD_WRAP_MARGIN) {
			cloud.x = -CLOUD_WRAP_MARGIN;
		}
	}
};

export const createAmbientParticles = (
	scene: Phaser.Scene,
): AmbientParticle[] => {
	const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
	const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;
	const particles: AmbientParticle[] = [];

	for (let i = 0; i < AMBIENT_PARTICLE_COUNT; i++) {
		const radius =
			AMBIENT_PARTICLE_RADIUS_MIN +
			Math.random() *
				(AMBIENT_PARTICLE_RADIUS_MAX - AMBIENT_PARTICLE_RADIUS_MIN);
		const alpha =
			AMBIENT_PARTICLE_ALPHA_MIN +
			Math.random() * (AMBIENT_PARTICLE_ALPHA_MAX - AMBIENT_PARTICLE_ALPHA_MIN);
		const speed =
			AMBIENT_PARTICLE_SPEED_MIN +
			Math.random() * (AMBIENT_PARTICLE_SPEED_MAX - AMBIENT_PARTICLE_SPEED_MIN);

		// Randomly pick white or light blue
		const color =
			Math.random() < AMBIENT_PARTICLE_COLOR_CHANCE
				? 0xffffff
				: AMBIENT_PARTICLE_ALT_COLOR;

		const x = Math.random() * worldW;
		const y = Math.random() * worldH;

		const circle = scene.add.circle(x, y, radius, color, alpha);
		circle.setDepth(AMBIENT_PARTICLE_DEPTH);

		particles.push({ circle, speed });
	}

	return particles;
};

export const updateAmbientParticles = (
	particles: AmbientParticle[],
	delta: number,
): void => {
	const worldH = WORLD_HEIGHT_TILES * TILE_SIZE;
	const worldW = WORLD_WIDTH_TILES * TILE_SIZE;
	const dt = delta / 1000;

	for (const particle of particles) {
		particle.circle.y -= particle.speed * dt;

		// Reset to bottom when reaching top
		if (particle.circle.y < 0) {
			particle.circle.y = worldH;
			particle.circle.x = Math.random() * worldW;
		}
	}
};

export const spawnLeafParticle = (
	scene: Phaser.Scene,
	grid: BlockType[][],
	leafParticles: LeafParticle[],
): void => {
	const cam = scene.cameras.main;
	const viewLeft = Math.floor(cam.scrollX / TILE_SIZE);
	const viewRight = Math.ceil((cam.scrollX + cam.width) / TILE_SIZE);
	const viewTop = Math.floor(cam.scrollY / TILE_SIZE);
	const viewBottom = Math.ceil((cam.scrollY + cam.height) / TILE_SIZE);

	// Find leaf blocks visible on screen
	const leafPositions: { gx: number; gy: number }[] = [];

	for (
		let gy = Math.max(0, viewTop);
		gy < Math.min(grid.length, viewBottom);
		gy++
	) {
		for (
			let gx = Math.max(0, viewLeft);
			gx < Math.min(grid[0].length, viewRight);
			gx++
		) {
			if (grid[gy][gx] === BlockType.Leaf) {
				leafPositions.push({ gx, gy });
			}
		}
	}

	if (leafPositions.length === 0) return;

	// Pick a random leaf block
	const chosen =
		leafPositions[Math.floor(Math.random() * leafPositions.length)];
	const worldX = chosen.gx * TILE_SIZE + Math.random() * TILE_SIZE;
	const worldY = chosen.gy * TILE_SIZE + TILE_SIZE;

	const leafRect = scene.add.rectangle(
		worldX,
		worldY,
		LEAF_PARTICLE_WIDTH,
		LEAF_PARTICLE_HEIGHT,
		COLORS.leaf,
	);
	leafRect.setDepth(5);

	leafParticles.push({
		gfx: leafRect,
		startX: worldX,
		age: 0,
	});
};

export const updateLeafParticles = (
	scene: Phaser.Scene,
	grid: BlockType[][],
	leafParticles: LeafParticle[],
	leafSpawnTimer: number,
	delta: number,
): number => {
	// Update existing particles
	for (let i = leafParticles.length - 1; i >= 0; i--) {
		const leaf = leafParticles[i];
		leaf.age += delta;

		if (leaf.age >= LEAF_PARTICLE_LIFETIME) {
			leaf.gfx.destroy();
			leafParticles.splice(i, 1);
			continue;
		}

		// Drift down slowly
		const dt = delta / 1000;
		leaf.gfx.y += LEAF_PARTICLE_DRIFT_SPEED * dt;

		// Sine-wave horizontal wobble
		leaf.gfx.x =
			leaf.startX +
			Math.sin((leaf.age / 1000) * LEAF_PARTICLE_WOBBLE_SPEED) *
				LEAF_PARTICLE_WOBBLE_AMPLITUDE;

		// Fade out over lifetime
		const progress = leaf.age / LEAF_PARTICLE_LIFETIME;
		leaf.gfx.setAlpha(1 - progress);
	}

	// Spawn new leaves
	let timer = leafSpawnTimer + delta;
	if (
		timer >= LEAF_PARTICLE_INTERVAL &&
		leafParticles.length < LEAF_PARTICLE_MAX
	) {
		timer = 0;
		spawnLeafParticle(scene, grid, leafParticles);
	}

	return timer;
};
