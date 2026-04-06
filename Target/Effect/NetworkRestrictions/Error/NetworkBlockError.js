const o = (r, e) => ({
	_tag: "NetworkBlockError",
	url: r,
	reason: e,
	message: `Network request blocked: ${e}`,
	name: "NetworkBlockError",
	cause: r,
});
var t = o;
export { t as default };
