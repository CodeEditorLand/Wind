import { Emitter as d } from "vs/base/common/event.js";
import { ILogService as T } from "vs/platform/log/common/log.js";
import { IViewsService as l } from "vs/workbench/common/views.js";

import { Effect as r } from "../../effect";

import "../../Integration/Tauri/Service.js";

class p {
	constructor(e, i, t) {
		this.ViewId = e;
		this.Integration = i;
		this.LoggerService = t;
	}
	OnDidChangeTreeDataEmitter = new d();
	onDidChangeTreeData = this.OnDidChangeTreeDataEmitter.event;
	getTreeItem(e) {
		return e;
	}
	getChildren(e) {
		this.LoggerService.trace(
			`[NativeTreeViewDataProvider] Getting children for view '${this.ViewID}'`,
			e,
		);
		const i = this.Integration.Invoke("GetTreeViewChildren", {
			ViewID: this.ViewId,
			ElementHandle: e?.handle,
		}).pipe(
			r.catchAll(
				(t) => (
					this.LoggerService.error(
						`[NativeTreeViewDataProvider] Failed to get children for ${this.ViewId}:`,
						t,
					),
					r.succeed([])
				),
			),
		);
		return r.runPromise(i);
	}
}
class w extends r.Service()("viewsService", {
	effect: r.gen(function* (e) {
		const i = yield* e(l),
			t = yield* e(T);
		return {
			registerTreeDataProvider: (n, a) => (
				t.info(
					`[TreeViewService] Registering tree data provider for view: ${n}`,
				),
				i.registerTreeDataProvider(n, a)
			),
		};
	}),
}) {}
export { p as NativeTreeViewDataProvider, w as TreeViewService };
