/**
 * Draws a simple pixel face on a Graphics object.
 * All coordinates are relative to (0, 0) as the center of the head.
 * Use `scale` to make it bigger for previews.
 */
export const drawFace = (
	gfx: Phaser.GameObjects.Graphics,
	faceType: string,
	scale: number = 1,
): void => {
	const s = scale;
	const ey = -1 * s; // eye y
	const my = 3 * s; // mouth y

	gfx.clear();
	gfx.lineStyle(1 * s, 0x000000, 0.9);

	switch (faceType) {
		case "happy":
			gfx.fillStyle(0x000000);
			gfx.fillCircle(-2 * s, ey, 1 * s);
			gfx.fillCircle(2 * s, ey, 1 * s);
			gfx.beginPath();
			gfx.arc(0, my - 1 * s, 3 * s, 0.2, Math.PI - 0.2);
			gfx.strokePath();
			break;
		case "cool":
			gfx.fillStyle(0x000000);
			gfx.fillRect(-4 * s, ey - 1 * s, 3 * s, 2 * s);
			gfx.fillRect(1 * s, ey - 1 * s, 3 * s, 2 * s);
			gfx.lineBetween(-1 * s, ey, 1 * s, ey);
			gfx.beginPath();
			gfx.arc(1 * s, my, 2 * s, 0.3, Math.PI - 0.5);
			gfx.strokePath();
			break;
		case "angry":
			gfx.fillStyle(0x000000);
			gfx.fillCircle(-2 * s, ey, 1 * s);
			gfx.fillCircle(2 * s, ey, 1 * s);
			gfx.lineBetween(-4 * s, ey - 3 * s, -1 * s, ey - 2 * s);
			gfx.lineBetween(4 * s, ey - 3 * s, 1 * s, ey - 2 * s);
			gfx.beginPath();
			gfx.arc(0, my + 2 * s, 3 * s, Math.PI + 0.2, -0.2);
			gfx.strokePath();
			break;
		case "surprised":
			gfx.fillStyle(0x000000);
			gfx.fillCircle(-2 * s, ey, 1.5 * s);
			gfx.fillCircle(2 * s, ey, 1.5 * s);
			gfx.strokeCircle(0, my + 1 * s, 2 * s);
			break;
		case "sleepy":
			gfx.lineBetween(-3 * s, ey, -1 * s, ey);
			gfx.lineBetween(1 * s, ey, 3 * s, ey);
			gfx.lineBetween(-2 * s, my, 2 * s, my);
			break;
		case "silly":
			gfx.fillStyle(0x000000);
			gfx.fillCircle(2 * s, ey, 1 * s);
			gfx.lineBetween(-3 * s, ey, -1 * s, ey);
			gfx.beginPath();
			gfx.arc(0, my, 2 * s, 0.2, Math.PI - 0.2);
			gfx.strokePath();
			gfx.fillStyle(0xff6666);
			gfx.fillCircle(0, my + 2 * s, 1.5 * s);
			break;
		case "cyclops":
			gfx.fillStyle(0xffffff);
			gfx.fillCircle(0, ey, 3 * s);
			gfx.fillStyle(0x000000);
			gfx.fillCircle(0, ey, 1.5 * s);
			gfx.lineStyle(1 * s, 0x000000, 0.9);
			gfx.lineBetween(-2 * s, my, 2 * s, my);
			break;
	}
};
