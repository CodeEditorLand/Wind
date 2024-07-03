self.MonacoEnvironment = {
	createTrustedTypesPolicy: () => {},
	getWorker: async (t, e) => {
		switch (e) {
			case "css":
				return new (
					await import(
						"monaco-editor/esm/vs/language/css/css.worker.js?worker"
					)
				).default();
			case "html":
				return new (
					await import(
						"monaco-editor/esm/vs/language/html/html.worker.js?worker"
					)
				).default();
			case "typescript":
				return new (
					await import(
						"monaco-editor/esm/vs/language/typescript/ts.worker.js?worker"
					)
				).default();
			default:
				return new (
					await import(
						"monaco-editor/esm/vs/editor/editor.worker.js?worker"
					)
				).default();
		}
	},
};
var a = (
	await import("monaco-editor")
).languages.typescript.typescriptDefaults.setEagerModelSync(!0);
export { a as default };
