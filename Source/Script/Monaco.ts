self.MonacoEnvironment = {
	createTrustedTypesPolicy: () => undefined,
	getWorker: async (_WorkerID, Label) => {
		switch (Label) {
			case "css":
				return new (
					await import(
						// @ts-expect-error
						"monaco-editor/esm/vs/language/css/css.worker.js?worker"
					)
				).default();

			case "html":
				return new (
					await import(
						// @ts-expect-error
						"monaco-editor/esm/vs/language/html/html.worker.js?worker"
					)
				).default();

			case "typescript":
				return new (
					await import(
						// @ts-expect-error
						"monaco-editor/esm/vs/language/typescript/ts.worker.js?worker"
					)
				).default();

			default:
				return new (
					await import(
						// @ts-expect-error
						"monaco-editor/esm/vs/editor/editor.worker.js?worker"
					)
				).default();
		}
	},
};

export default (
	await import("monaco-editor")
).languages.typescript.typescriptDefaults.setEagerModelSync(true);
