var i = (...[[t, [o, e]], n = null]) => {
	let r = a(t);
	try {
		r = p(JSON.parse(a(t)));
	} catch (c) {
		console.log(c);
	}
	return e(n ?? r), [o, e];
};
const { get: a } = await import("store"),
	{ default: p } = await import(
		"@codeeditorland/common/Target/Function/Get.js"
	);
export { p as Get, i as default, a as get };
