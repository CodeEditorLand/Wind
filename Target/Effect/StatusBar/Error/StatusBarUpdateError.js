class t extends Error {
	_tag = "StatusBarUpdateError";
	cause;
	itemId;
	constructor(r, e) {
		(super(`Failed to update status bar item '${r}': ${String(e)}`),
			(this.itemId = r),
			(this.cause = e),
			Object.setPrototypeOf(this, t.prototype));
	}
	get name() {
		return "StatusBarUpdateError";
	}
}
export { t as default };
