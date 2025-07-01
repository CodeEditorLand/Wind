import { FromAPI as t } from "./Main/ViewColumn.js";

const s = (n, e) => ({
		enableCommandUris: e.enableCommandUris,
		enableScripts: e.enableScripts,
		enableForms: e.enableForms,
		localResourceRoots: e.localResourceRoots ?? [n.extensionLocation],
		portMapping: e.portMapping,
	}),
	a = (n) => {
		const e = {};
		return (
			n.enableFindWidget !== void 0 &&
				(e.enableFindWidget = n.enableFindWidget),
			n.retainContextWhenHidden !== void 0 &&
				(e.retainContextWhenHidden = n.retainContextWhenHidden),
			e
		);
	},
	l = (n, e) => {
		const o = { preserveFocus: e },
			i = t(n);
		return (i !== void 0 && (o.viewColumn = i), o);
	};
export {
	s as ConvertContentOptionsToDTO,
	a as ConvertPanelOptionsToDTO,
	l as ConvertShowOptionsToDTO,
};
