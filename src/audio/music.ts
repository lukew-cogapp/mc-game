import {
	MUSIC_ATTACK_TIME,
	MUSIC_BASS_VOLUME,
	MUSIC_BPM,
	MUSIC_DECAY_TIME,
	MUSIC_LEAD_VOLUME,
	MUSIC_SUSTAIN_LEVEL,
	MUSIC_VOLUME,
} from "../config";

// -- Note frequency lookup (equal temperament, A4 = 440Hz) --

const NOTE_FREQUENCIES: Record<string, number> = {
	C2: 65.41,
	D2: 73.42,
	E2: 82.41,
	F2: 87.31,
	G2: 98.0,
	A2: 110.0,
	B2: 123.47,
	C3: 130.81,
	D3: 146.83,
	E3: 164.81,
	F3: 174.61,
	G3: 196.0,
	A3: 220.0,
	B3: 246.94,
	C4: 261.63,
	D4: 293.66,
	E4: 329.63,
	F4: 349.23,
	G4: 392.0,
	A4: 440.0,
	B4: 493.88,
	C5: 523.25,
	D5: 587.33,
	E5: 659.25,
	G5: 783.99,
	A5: 880.0,
};

const getFrequency = (note: string): number => NOTE_FREQUENCIES[note] ?? 0;

// -- Melody definition --

// Lead melody: 4 notes per bar, 8 bars total
const LEAD_MELODY: (string | null)[][] = [
	["C4", "E4", "G4", "E4"], // Bar 1
	["A4", "G4", "E4", "D4"], // Bar 2
	["C4", "D4", "E4", "G4"], // Bar 3
	["A4", "G4", null, "E4"], // Bar 4 (null = rest)
	["G4", "A4", "C5", "A4"], // Bar 5
	["G4", "E4", "D4", "C4"], // Bar 6
	["D4", "E4", "G4", "A4"], // Bar 7
	["G4", "E4", "D4", "C4"], // Bar 8
];

// Bass: one note per bar
const BASS_PATTERN: string[] = ["C2", "A2", "C2", "A2", "G2", "E2", "D2", "C2"];

// -- Types --

export type MusicPlayer = {
	context: AudioContext;
	masterGain: GainNode;
	playing: boolean;
	schedulerTimer: number | null;
	currentBeat: number;
	nextNoteTime: number;
};

// -- Scheduling helpers --

const scheduleNote = (
	context: AudioContext,
	destination: AudioNode,
	frequency: number,
	time: number,
	duration: number,
	volume: number,
): void => {
	const oscillator = context.createOscillator();
	const envelope = context.createGain();

	oscillator.type = "square";
	oscillator.frequency.setValueAtTime(frequency, time);

	// Attack-decay-sustain envelope
	envelope.gain.setValueAtTime(0, time);
	envelope.gain.linearRampToValueAtTime(volume, time + MUSIC_ATTACK_TIME);
	envelope.gain.linearRampToValueAtTime(
		volume * MUSIC_SUSTAIN_LEVEL,
		time + MUSIC_ATTACK_TIME + MUSIC_DECAY_TIME,
	);
	// Release at end of note
	envelope.gain.setValueAtTime(
		volume * MUSIC_SUSTAIN_LEVEL,
		time + duration - MUSIC_ATTACK_TIME,
	);
	envelope.gain.linearRampToValueAtTime(0, time + duration);

	oscillator.connect(envelope);
	envelope.connect(destination);

	oscillator.start(time);
	oscillator.stop(time + duration);
};

const BEATS_PER_BAR = 4;
const TOTAL_BEATS = LEAD_MELODY.length * BEATS_PER_BAR;

const scheduleBeats = (music: MusicPlayer): void => {
	const secondsPerBeat = 60 / MUSIC_BPM;
	// Look ahead 0.1 seconds to keep the schedule buffer full
	const lookAhead = 0.1;

	while (
		music.playing &&
		music.nextNoteTime < music.context.currentTime + lookAhead
	) {
		const beatIndex = music.currentBeat % TOTAL_BEATS;
		const barIndex = Math.floor(beatIndex / BEATS_PER_BAR);
		const noteInBar = beatIndex % BEATS_PER_BAR;

		// Lead melody
		const leadNote = LEAD_MELODY[barIndex][noteInBar];
		if (leadNote !== null && leadNote !== undefined) {
			const freq = getFrequency(leadNote);
			if (freq > 0) {
				scheduleNote(
					music.context,
					music.masterGain,
					freq,
					music.nextNoteTime,
					secondsPerBeat * 0.8,
					MUSIC_LEAD_VOLUME,
				);
			}
		}

		// Bass: one note per bar, play on first beat
		if (noteInBar === 0) {
			const bassNote = BASS_PATTERN[barIndex];
			const bassFreq = getFrequency(bassNote);
			if (bassFreq > 0) {
				scheduleNote(
					music.context,
					music.masterGain,
					bassFreq,
					music.nextNoteTime,
					secondsPerBeat * BEATS_PER_BAR * 0.9,
					MUSIC_BASS_VOLUME,
				);
			}
		}

		music.nextNoteTime += secondsPerBeat;
		music.currentBeat++;
	}
};

// -- Public interface --

export const createMusic = (): MusicPlayer => {
	const context = new AudioContext();
	const masterGain = context.createGain();
	masterGain.gain.setValueAtTime(MUSIC_VOLUME, context.currentTime);
	masterGain.connect(context.destination);

	return {
		context,
		masterGain,
		playing: false,
		schedulerTimer: null,
		currentBeat: 0,
		nextNoteTime: 0,
	};
};

export const startMusic = (music: MusicPlayer): void => {
	if (music.playing) return;

	// Resume context (browser autoplay policy)
	if (music.context.state === "suspended") {
		music.context.resume();
	}

	music.playing = true;
	music.currentBeat = 0;
	music.nextNoteTime = music.context.currentTime + 0.05;

	// Schedule loop: runs every 25ms to keep the buffer full
	const tick = (): void => {
		if (!music.playing) return;
		scheduleBeats(music);
		music.schedulerTimer = window.setTimeout(tick, 25) as unknown as number;
	};
	tick();
};

export const stopMusic = (music: MusicPlayer): void => {
	music.playing = false;
	if (music.schedulerTimer !== null) {
		clearTimeout(music.schedulerTimer);
		music.schedulerTimer = null;
	}
};

export const setMusicVolume = (music: MusicPlayer, volume: number): void => {
	music.masterGain.gain.setValueAtTime(volume, music.context.currentTime);
};
