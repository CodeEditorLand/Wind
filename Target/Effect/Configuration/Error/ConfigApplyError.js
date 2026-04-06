class n extends Error {
	constructor(r, o) {
		super(`Failed to apply configuration for '${r}': ${String(o)}`);
		this.key = r;
		this.cause = o;
	}
	_tag = "ConfigApplyError";
}
var a = n;
export { n as ConfigApplyError, a as default };
