class r extends Error {
	_tag = "SandboxNotReadyError";
	constructor() {
		super("window.vscode is not initialized. Preload script not executed.");
	}
}
export { r as SandboxNotReadyError };
