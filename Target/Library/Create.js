var o = async (...[[e, [n, t]], s = null]) => {
	let r = a(e);
	try {
		r = (
			await import("@codeeditorland/common/Target/Function/Get.js")
		).default(JSON.parse(a(e)));
	} catch (c) {
		console.log(c);
	}
	return t(s ?? r), [n, t];
};
const { get: a } = await import("store");
export { o as default, a as get };
