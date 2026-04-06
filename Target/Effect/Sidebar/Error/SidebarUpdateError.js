class r extends Error {
	_tag = "SidebarUpdateError";
	cause;
	constructor(t, e) {
		(super(`Failed to update sidebar panel '${t}': ${String(e)}`),
			(this.cause = e),
			Object.setPrototypeOf(this, r.prototype));
	}
	get name() {
		return "SidebarUpdateError";
	}
}
export { r as default };
