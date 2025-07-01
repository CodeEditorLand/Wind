import { WorkspaceEdit as m, TextEdit as p } from "../Platform/VSCode/Type.js";
import { FromAPI as E, ToAPI as f } from "./Main/TextEdit.js";
import { FromAPI as I, ToAPI as o } from "./Main/URI.js";

const y = (i, t) => {
		const e = { edits: [] };
		for (const [r, s] of i.entries()) {
			const c = I(r),
				n = t?.GetTextDocumentVersion(r);
			for (const d of s)
				if (d instanceof p) {
					const a = { _type: "text", resource: c, edit: E(d) };
					(n !== void 0 && (a.versionId = n), e.edits.push(a));
				}
		}
		return e;
	},
	k = (i) => {
		const t = new m();
		for (const e of i.edits)
			if (e._type === "text") {
				const r = o(e.resource),
					s = [f(e.edit)];
				t.set(r, s);
			} else
				e._type === "file" &&
					(e.oldResource && e.newResource
						? t.renameFile(
								o(e.oldResource),
								o(e.newResource),
								e.options,
							)
						: e.newResource
							? t.createFile(o(e.newResource), e.options)
							: e.oldResource &&
								t.deleteFile(o(e.oldResource), e.options));
		return t;
	};
export { y as FromAPI, k as ToAPI };
