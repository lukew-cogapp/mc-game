const SETTINGS_KEY = "drift-lands-settings";

export interface GameSettings {
	musicEnabled: boolean;
	sfxEnabled: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
	musicEnabled: true,
	sfxEnabled: true,
};

export const loadSettings = (): GameSettings => {
	try {
		const raw = localStorage.getItem(SETTINGS_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			return {
				musicEnabled:
					typeof parsed.musicEnabled === "boolean"
						? parsed.musicEnabled
						: DEFAULT_SETTINGS.musicEnabled,
				sfxEnabled:
					typeof parsed.sfxEnabled === "boolean"
						? parsed.sfxEnabled
						: DEFAULT_SETTINGS.sfxEnabled,
			};
		}
	} catch {
		// Ignore
	}
	return { ...DEFAULT_SETTINGS };
};

export const saveSettings = (settings: GameSettings): void => {
	try {
		localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
	} catch {
		// Ignore
	}
};
