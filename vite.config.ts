const Mobile = !!/android|ios/.exec(process.env.TAURI_ENV_PLATFORM);

export default (await import("vite")).defineConfig({
	publicDir: "Public",
	plugins: [(await import("vite-plugin-solid")).default()],
	clearScreen: false,
	server: {
		port: 9999,
		strictPort: true,
		host: Mobile ? "0.0.0.0" : false,
		hmr: {
			protocol: "ws",
			host:
				(await (await import("internal-ip")).internalIpV4()) ??
				"0.0.0.0",
			port: 9998,
		},
		watch: {
			ignored: ["**/src-tauri/**"],
		},
	},
});
