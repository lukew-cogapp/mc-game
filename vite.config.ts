import { defineConfig } from "vite";

export default defineConfig({
	base: "./",
	build: {
		outDir: "dist",
		assetsInlineLimit: 0,
		chunkSizeWarningLimit: 1300,
	},
	server: {
		open: true,
	},
});
