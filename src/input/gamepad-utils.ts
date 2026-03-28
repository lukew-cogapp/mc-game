export const isAnyGamepadButtonDown = (): boolean => {
	const pads = navigator.getGamepads?.();
	if (!pads) return false;
	for (const pad of pads) {
		if (!pad?.connected) continue;
		for (const btn of pad.buttons) {
			if (btn.pressed) return true;
		}
	}
	return false;
};
