import { Effect as e, Ref as r } from "../../effect";
import { FromAPI as T } from "../../TypeConverter/Main/Range.js";
import { FromAPI as p } from "../../TypeConverter/Main/ViewColumn.js";
import { CreateEventStream as E } from "../../Utility/EventStream.js";
import { HostService as v } from "../Host/Service.js";
import { WorkSpaceService as y } from "../WorkSpace/Service.js";
import { WindowProblem as D } from "./Error.js";

class O extends e.Service()("Service/Window", {
	effect: e.gen(function* () {
		const d = yield* v,
			n = yield* y,
			a = yield* r.make({ focused: !0, active: !0 }),
			{ event: m, Fire: u } = yield* E();
		return (
			yield* e.forkDaemon(
				e.sync(() =>
					d.OnDidChangeWindowState((o) => {
						const t = { focused: o, active: o };
						e.runFork(r.set(a, t).pipe(e.andThen(u(t))));
					}),
				),
			),
			{
				get state() {
					return e.runSync(r.get(a));
				},
				onDidChangeWindowState: m,
				get activeTextEditor() {
					return n.activeTextEditor;
				},
				get visibleTextEditors() {
					return n.visibleTextEditors;
				},
				ShowTextDocument: (o, t, f) =>
					e.gen(function* () {
						const w = "uri" in o ? o.uri : o,
							i = typeof t == "object" ? t : void 0,
							l = {
								preserveFocus: f ?? i?.preserveFocus,
								selection: i?.selection
									? T(i.selection)
									: void 0,
							},
							S = typeof t == "number" ? p(t) : void 0,
							c = yield* d.ShowTextDocument(w, S, l),
							s = n.visibleTextEditors.find((x) => x.id === c);
						return (
							s ||
							(yield* new D({
								Cause: `Editor with ID ${c} not found after host confirmation.`,
								Context: "ShowTextDocumentFailed",
							}))
						);
					}),
			}
		);
	}),
}) {}
export { O as WindowService };
