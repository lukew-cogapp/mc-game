import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	formatTimeMs,
	loadHighScores,
	resetHighScores,
	saveHighScore,
} from "../high-scores";

const makeLocalStorage = () => {
	const store: Record<string, string> = {};
	return {
		store,
		getItem(key: string) {
			return store[key] ?? null;
		},
		setItem(key: string, value: string) {
			store[key] = value;
		},
		removeItem(key: string) {
			delete store[key];
		},
	};
};

describe("high-scores", () => {
	beforeEach(() => {
		vi.stubGlobal("localStorage", makeLocalStorage());
	});

	describe("loadHighScores", () => {
		it("returns empty array when nothing stored", () => {
			expect(loadHighScores()).toEqual([]);
		});

		it("returns empty array for invalid JSON", () => {
			localStorage.setItem("drift-lands-high-scores", "not-json");
			expect(loadHighScores()).toEqual([]);
		});

		it("returns empty array for non-array JSON", () => {
			localStorage.setItem(
				"drift-lands-high-scores",
				JSON.stringify({ foo: "bar" }),
			);
			expect(loadHighScores()).toEqual([]);
		});

		it("filters out malformed entries", () => {
			localStorage.setItem(
				"drift-lands-high-scores",
				JSON.stringify([
					{ timeMs: 1000, date: "2025-01-01" },
					{ timeMs: "bad", date: "2025-01-01" },
					{ timeMs: 2000 },
					null,
				]),
			);
			const scores = loadHighScores();
			expect(scores).toHaveLength(1);
			expect(scores[0].timeMs).toBe(1000);
		});
	});

	describe("saveHighScore", () => {
		it("stores and returns position 1 for first score", () => {
			const position = saveHighScore(5000);
			expect(position).toBe(1);

			const scores = loadHighScores();
			expect(scores).toHaveLength(1);
			expect(scores[0].timeMs).toBe(5000);
		});

		it("returns correct position for faster time", () => {
			saveHighScore(10000);
			saveHighScore(20000);
			const position = saveHighScore(5000);
			expect(position).toBe(1);

			const scores = loadHighScores();
			expect(scores[0].timeMs).toBe(5000);
			expect(scores[1].timeMs).toBe(10000);
			expect(scores[2].timeMs).toBe(20000);
		});

		it("only keeps top 5 scores", () => {
			saveHighScore(10000);
			saveHighScore(20000);
			saveHighScore(30000);
			saveHighScore(40000);
			saveHighScore(50000);
			saveHighScore(15000);

			const scores = loadHighScores();
			expect(scores).toHaveLength(5);
			expect(scores[scores.length - 1].timeMs).toBe(40000);
		});

		it("returns null for slow times when board is full", () => {
			saveHighScore(10000);
			saveHighScore(20000);
			saveHighScore(30000);
			saveHighScore(40000);
			saveHighScore(50000);

			const position = saveHighScore(60000);
			expect(position).toBeNull();
		});

		it("returns correct 1-based position", () => {
			saveHighScore(10000);
			saveHighScore(30000);
			saveHighScore(50000);

			const position = saveHighScore(20000);
			expect(position).toBe(2);
		});
	});

	describe("resetHighScores", () => {
		it("clears stored scores", () => {
			saveHighScore(10000);
			expect(loadHighScores()).toHaveLength(1);

			resetHighScores();
			expect(loadHighScores()).toEqual([]);
		});
	});

	describe("formatTimeMs", () => {
		it("formats 0 as 0:00", () => {
			expect(formatTimeMs(0)).toBe("0:00");
		});

		it("formats 65000 as 1:05", () => {
			expect(formatTimeMs(65000)).toBe("1:05");
		});

		it("formats 125000 as 2:05", () => {
			expect(formatTimeMs(125000)).toBe("2:05");
		});

		it("formats 30000 as 0:30", () => {
			expect(formatTimeMs(30000)).toBe("0:30");
		});

		it("formats 60000 as 1:00", () => {
			expect(formatTimeMs(60000)).toBe("1:00");
		});

		it("pads single-digit seconds", () => {
			expect(formatTimeMs(3000)).toBe("0:03");
		});
	});
});
