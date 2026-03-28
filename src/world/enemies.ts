import {
	ENEMY_BOB_AMPLITUDE,
	ENEMY_BOB_SPEED,
	ENEMY_BODY_COLOR,
	ENEMY_BODY_HEIGHT,
	ENEMY_BODY_WIDTH,
	ENEMY_BROW_OFFSET_Y,
	ENEMY_BROW_WIDTH,
	ENEMY_CHASE_RANGE_TILES,
	ENEMY_CHASE_SPEED,
	ENEMY_COUNT,
	ENEMY_DEPTH,
	ENEMY_EYE_COLOR,
	ENEMY_EYE_HEIGHT,
	ENEMY_EYE_OFFSET_X,
	ENEMY_EYE_OFFSET_Y,
	ENEMY_EYE_WIDTH,
	ENEMY_FALL_CHECK_OFFSET,
	ENEMY_GRAVITY,
	ENEMY_PATROL_REVERSE_MS,
	ENEMY_PATROL_SPEED,
	ENEMY_PUPIL_COLOR,
	ENEMY_PUPIL_RADIUS,
	ENEMY_SPAWN_MAX_UPWARD_SEARCH,
	STARTER_ZONE_RATIO,
	TILE_SIZE,
	WORLD_HEIGHT_TILES,
	WORLD_WIDTH_TILES,
} from "../config";
import { type BlockType, type Island, NON_SOLID_BLOCKS } from "../types";

export const pickEnemySpawnPositions = (
	islands: Island[],
	grid: BlockType[][],
): { x: number; y: number }[] => {
	// Exclude the home island (index 0). Pick resource/transit islands in mid-to-high zone.
	const candidates = islands.slice(1);
	if (candidates.length === 0) return [];

	// Determine the vertical range for mid-to-high climb zone
	const starterBottomY =
		WORLD_HEIGHT_TILES - Math.floor(WORLD_HEIGHT_TILES * STARTER_ZONE_RATIO);

	const eligible = candidates.filter(
		(isl) =>
			isl.y < starterBottomY &&
			(isl.role === "resource" || isl.role === "transit") &&
			isl.width >= 4,
	);

	// Shuffle
	const shuffled = [...eligible].sort(() => Math.random() - 0.5);
	const count = Math.min(ENEMY_COUNT, shuffled.length);
	const positions: { x: number; y: number }[] = [];

	for (let i = 0; i < count; i++) {
		const island = shuffled[i];
		// Place enemy on the surface, roughly centered
		const tileX = island.x + Math.floor(island.width / 2);
		let tileY = island.y - 1; // one tile above the surface

		// Validate spawn tile is Air; if not, search upward
		let found = false;
		for (let offset = 0; offset <= ENEMY_SPAWN_MAX_UPWARD_SEARCH; offset++) {
			const checkY = tileY - offset;
			if (
				checkY >= 0 &&
				checkY < grid.length &&
				tileX >= 0 &&
				tileX < grid[0].length &&
				NON_SOLID_BLOCKS.has(grid[checkY][tileX])
			) {
				tileY = checkY;
				found = true;
				break;
			}
		}
		if (!found) continue;

		positions.push({
			x: tileX * TILE_SIZE + TILE_SIZE / 2,
			y: tileY * TILE_SIZE + TILE_SIZE / 2,
		});
	}

	return positions;
};

export class Enemy extends Phaser.GameObjects.Container {
	velocityX = 0;
	velocityY = 0;
	alive = true;
	patrolDir = 1;
	patrolTimer = 0;

	// Properties set by scene each frame
	grid: BlockType[][] | null = null;
	lavaY = Number.MAX_SAFE_INTEGER;
	playerX = 0;
	playerY = 0;

	constructor(scene: Phaser.Scene, x: number, y: number) {
		super(scene, x, y);
		scene.add.existing(this);
		this.addToUpdateList();

		// Random initial patrol direction
		this.patrolDir = Math.random() < 0.5 ? -1 : 1;

		// Body (red rectangle)
		const body = scene.add.rectangle(
			0,
			0,
			ENEMY_BODY_WIDTH,
			ENEMY_BODY_HEIGHT,
			ENEMY_BODY_COLOR,
		);

		// Angry eyes: white rectangles with black pupils and angled brows
		const eyeY = -ENEMY_BODY_HEIGHT / 2 + ENEMY_EYE_OFFSET_Y;

		const leftEye = scene.add.rectangle(
			-ENEMY_EYE_OFFSET_X,
			eyeY,
			ENEMY_EYE_WIDTH,
			ENEMY_EYE_HEIGHT,
			ENEMY_EYE_COLOR,
		);
		const rightEye = scene.add.rectangle(
			ENEMY_EYE_OFFSET_X,
			eyeY,
			ENEMY_EYE_WIDTH,
			ENEMY_EYE_HEIGHT,
			ENEMY_EYE_COLOR,
		);

		const leftPupil = scene.add.circle(
			-ENEMY_EYE_OFFSET_X,
			eyeY,
			ENEMY_PUPIL_RADIUS,
			ENEMY_PUPIL_COLOR,
		);
		const rightPupil = scene.add.circle(
			ENEMY_EYE_OFFSET_X,
			eyeY,
			ENEMY_PUPIL_RADIUS,
			ENEMY_PUPIL_COLOR,
		);

		// Angry brows (drawn as small tilted lines via graphics)
		const brows = scene.add.graphics();
		brows.lineStyle(2, ENEMY_PUPIL_COLOR, 1);
		// Left brow: angled inward-down
		brows.lineBetween(
			-ENEMY_EYE_OFFSET_X - ENEMY_BROW_WIDTH / 2,
			eyeY - ENEMY_EYE_HEIGHT / 2 - ENEMY_BROW_OFFSET_Y - 1,
			-ENEMY_EYE_OFFSET_X + ENEMY_BROW_WIDTH / 2,
			eyeY - ENEMY_EYE_HEIGHT / 2 - ENEMY_BROW_OFFSET_Y + 1,
		);
		// Right brow: angled inward-down (mirrored)
		brows.lineBetween(
			ENEMY_EYE_OFFSET_X - ENEMY_BROW_WIDTH / 2,
			eyeY - ENEMY_EYE_HEIGHT / 2 - ENEMY_BROW_OFFSET_Y + 1,
			ENEMY_EYE_OFFSET_X + ENEMY_BROW_WIDTH / 2,
			eyeY - ENEMY_EYE_HEIGHT / 2 - ENEMY_BROW_OFFSET_Y - 1,
		);

		this.add([body, leftEye, rightEye, leftPupil, rightPupil, brows]);
		this.setDepth(ENEMY_DEPTH);
	}

	preUpdate = (_time: number, delta: number): void => {
		if (!this.alive) return;

		const grid = this.grid;
		if (!grid) return;

		const dt = delta / 1000;
		const halfW = ENEMY_BODY_WIDTH / 2;
		const halfH = ENEMY_BODY_HEIGHT / 2;

		// -- Lava death --
		if (this.y + halfH > this.lavaY) {
			this.alive = false;
			this.emit("death");
			this.destroy();
			return;
		}

		// -- Gravity --
		this.velocityY += ENEMY_GRAVITY * dt;

		// Ground check
		const feetY = this.y + halfH + ENEMY_FALL_CHECK_OFFSET;
		const gridX = Math.floor(this.x / TILE_SIZE);
		const gridY = Math.floor(feetY / TILE_SIZE);

		const solidBelow =
			gridY >= 0 &&
			gridY < grid.length &&
			gridX >= 0 &&
			gridX < grid[0].length &&
			!NON_SOLID_BLOCKS.has(grid[gridY][gridX]);

		if (solidBelow && this.velocityY >= 0) {
			this.y = gridY * TILE_SIZE - halfH;
			this.velocityY = 0;
		} else {
			this.y += this.velocityY * dt;
		}

		// -- Chase detection --
		const dx = this.playerX - this.x;
		const dy = this.playerY - this.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		const chaseRange = ENEMY_CHASE_RANGE_TILES * TILE_SIZE;
		const chasing = dist <= chaseRange;

		// -- Patrol / Chase movement --
		if (chasing) {
			// Move toward player horizontally
			const dir = dx > 0 ? 1 : -1;
			this.velocityX = dir * ENEMY_CHASE_SPEED;
			this.patrolDir = dir;
		} else {
			// Patrol: walk in current direction
			this.velocityX = this.patrolDir * ENEMY_PATROL_SPEED;

			// Reverse direction on timer
			this.patrolTimer += delta;
			if (this.patrolTimer >= ENEMY_PATROL_REVERSE_MS) {
				this.patrolTimer = 0;
				this.patrolDir *= -1;
			}
		}

		// -- Horizontal collision / edge detection --
		const nextX = this.x + this.velocityX * dt;

		// Check wall collision
		const checkWallY = this.y; // middle of body
		const wallGx = Math.floor(
			(this.velocityX > 0 ? nextX + halfW : nextX - halfW) / TILE_SIZE,
		);
		const wallGy = Math.floor(checkWallY / TILE_SIZE);
		const hitsWall =
			wallGx >= 0 &&
			wallGx < (grid[0]?.length ?? 0) &&
			wallGy >= 0 &&
			wallGy < grid.length &&
			!NON_SOLID_BLOCKS.has(grid[wallGy][wallGx]);

		// Check edge: is there ground ahead at foot level?
		const aheadGx = Math.floor(
			(this.velocityX > 0 ? nextX + halfW : nextX - halfW) / TILE_SIZE,
		);
		const belowAheadGy = Math.floor((this.y + halfH + 2) / TILE_SIZE);
		const groundAhead =
			aheadGx >= 0 &&
			aheadGx < (grid[0]?.length ?? 0) &&
			belowAheadGy >= 0 &&
			belowAheadGy < grid.length &&
			!NON_SOLID_BLOCKS.has(grid[belowAheadGy][aheadGx]);

		// World boundary check
		const hitsWorldEdge =
			nextX - halfW < 0 || nextX + halfW > WORLD_WIDTH_TILES * TILE_SIZE;

		if (hitsWall || (!groundAhead && solidBelow) || hitsWorldEdge) {
			// Reverse direction
			this.patrolDir *= -1;
			this.velocityX = 0;
			this.patrolTimer = 0;
		} else {
			this.x = nextX;
		}

		// -- Visual: flip based on direction --
		this.scaleX = this.velocityX >= 0 ? 1 : -1;

		// -- Visual: slight bob while on ground --
		if (solidBelow) {
			const bobOffset =
				Math.sin(Date.now() * ENEMY_BOB_SPEED) * ENEMY_BOB_AMPLITUDE;
			this.y += bobOffset;
		}
	};
}
