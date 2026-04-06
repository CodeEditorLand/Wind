class o extends Error {
	constructor(r) {
		super(`Configuration validation failed: ${r.join(", ")}`);
		this.issues = r;
	}
	_tag = "ConfigValidationError";
}
var i = o;
export { o as ConfigValidationError, i as default };
