const o = (r, e) => ({
	_tag: "IPCBlockError",
	channel: r,
	reason: e,
	message: `IPC channel blocked: ${e}`,
	name: "IPCBlockError",
	cause: r,
});
var n = o;
export { n as default };
