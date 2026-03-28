import { beforeEach, describe, expect, it, vi } from "vitest";
import { type GameSettings, loadSettings, saveSettings } from "../settings";

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

describe("settings", () => {
	beforeEach(() => {
		vi.stubGlobal("localStorage", makeLocalStorage());
	});

	describe("loadSettings", () => {
		it("returns defaults when nothing stored", () => {
			const settings = loadSettings();
			expect(settings).toEqual({
				musicEnabled: true,
				sfxEnabled: true,
			});
		});

		it("handles corrupt JSON gracefully", () => {
			localStorage.setItem("drift-lands-settings", "not-json{{{");
			const settings = loadSettings();
			expect(settings).toEqual({
				musicEnabled: true,
				sfxEnabled: true,
			});
		});

		it("handles missing fields by using defaults", () => {
			localStorage.setItem("drift-lands-settings", JSON.stringify({}));
			const settings = loadSettings();
			expect(settings).toEqual({
				musicEnabled: true,
				sfxEnabled: true,
			});
		});

		it("handles wrong types by using defaults", () => {
			localStorage.setItem(
				"drift-lands-settings",
				JSON.stringify({
					musicEnabled: "yes",
					sfxEnabled: 42,
				}),
			);
			const settings = loadSettings();
			expect(settings).toEqual({
				musicEnabled: true,
				sfxEnabled: true,
			});
		});
	});

	describe("saveSettings + loadSettings round-trip", () => {
		it("round-trips with both enabled", () => {
			const original: GameSettings = {
				musicEnabled: true,
				sfxEnabled: true,
			};
			saveSettings(original);
			expect(loadSettings()).toEqual(original);
		});

		it("round-trips with both disabled", () => {
			const original: GameSettings = {
				musicEnabled: false,
				sfxEnabled: false,
			};
			saveSettings(original);
			expect(loadSettings()).toEqual(original);
		});

		it("round-trips with mixed settings", () => {
			const original: GameSettings = {
				musicEnabled: false,
				sfxEnabled: true,
			};
			saveSettings(original);
			expect(loadSettings()).toEqual(original);
		});
	});
});
