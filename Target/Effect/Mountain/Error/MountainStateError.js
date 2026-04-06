class e extends Error {
	_tag = "MountainStateError";
	expected;
	actual;
	constructor(t, r) {
		(super(`Mountain state error: expected ${t}, got ${r}`),
			(this.expected = t),
			(this.actual = r));
	}
}
var o = e;
export { e as MountainStateError, o as default };
