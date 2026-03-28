import { HIGH_SCORES_KEY, HIGH_SCORES_MAX } from "../config";

export interface HighScoreEntry {
	timeMs: number;
	date: string;
}

export const loadHighScores = (): HighScoreEntry[] => {
	try {
		const raw = localStorage.getItem(HIGH_SCORES_KEY);
		if (raw) {
			const parsed = JSON.parse(raw);
			if (Array.isArray(parsed)) {
				return parsed
					.filter(
						(e: unknown) =>
							typeof e === "object" &&
							e !== null &&
							typeof (e as HighScoreEntry).timeMs === "number" &&
							typeof (e as HighScoreEntry).date === "string",
					)
					.slice(0, HIGH_SCORES_MAX) as HighScoreEntry[];
			}
		}
	} catch {
		// Ignore
	}
	return [];
};

/**
 * Saves a new high score if it qualifies.
 * Returns the 1-based position (1-5) or null if the time didn't make the board.
 */
export const saveHighScore = (timeMs: number): number | null => {
	const scores = loadHighScores();
	const entry: HighScoreEntry = {
		timeMs,
		date: new Date().toISOString(),
	};

	// Find insertion position (sorted ascending by time — fastest first)
	let position = scores.findIndex((s) => timeMs < s.timeMs);
	if (position === -1) {
		position = scores.length;
	}

	// Only keep top N
	if (position >= HIGH_SCORES_MAX) {
		return null;
	}

	scores.splice(position, 0, entry);
	const trimmed = scores.slice(0, HIGH_SCORES_MAX);

	try {
		localStorage.setItem(HIGH_SCORES_KEY, JSON.stringify(trimmed));
	} catch {
		// Ignore
	}

	return position + 1; // 1-based
};

export const resetHighScores = (): void => {
	try {
		localStorage.removeItem(HIGH_SCORES_KEY);
	} catch {
		// Ignore
	}
};

export const formatTimeMs = (timeMs: number): string => {
	const minutes = Math.floor(timeMs / 60000);
	const seconds = Math.floor((timeMs % 60000) / 1000);
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
