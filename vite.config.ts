const Mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);

export default (await import("vite")).defineConfig(async () => ({
	publicDir: "Public",
	plugins: [(await import("vite-plugin-solid")).default()],
	clearScreen: false,
	server: {
		port: 1420,
		strictPort: true,
		host: Mobile ? "0.0.0.0" : false,
		hmr: Mobile
			? {
					protocol: "ws",
					host: await (await import("internal-ip")).internalIpV4(),
					port: 1421,
				}
			: undefined,
		watch: {
			ignored: ["**/src-tauri/**"],
		},
	},
}));
