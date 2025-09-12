import { generateUuid as W } from "vs/base/common/uuid.js";
import { Disposable as f } from "vscode";

import { Effect as e, Ref as s } from "../../effect";
import {
	ConvertContentOptionsToDTO as d,
	ConvertShowOptionsToDTO as g,
	ConvertPanelOptionsToDTO as u,
} from "../../TypeConverter/WebView.js";
import { HostService as C } from "../Host/Service.js";
import { IPCService as S } from "../IPC/Service.js";
import { WebViewPanelProblem as c } from "./Error.js";
import { WebViewPanelImplementation as V } from "./WebViewPanelImplementation.js";

class T extends e.Service()("Service/WebViewPanel", {
	effect: e.gen(function* () {
		const o = yield* S,
			b = yield* C,
			l = yield* s.make(new Map());
		return (
			o.RegisterInvokeHandler("$onDidDisposeWebview", ([n]) =>
				e.runPromise(s.get(l).pipe(e.map((i) => i.get(n)?.dispose()))),
			),
			o.RegisterInvokeHandler("$onDidReceiveMessage", ([n, i]) =>
				e.runPromise(
					s
						.get(l)
						.pipe(e.map((t) => t.get(n)?.fireDidReceiveMessage(i))),
				),
			),
			o.RegisterInvokeHandler(
				"$onDidChangeWebviewPanelViewState",
				([n, i]) =>
					e.runPromise(
						s
							.get(l)
							.pipe(e.map((t) => t.get(n)?.updateViewState(i))),
					),
			),
			{
				CreateWebviewPanel: (n, i, t, r, w = {}) =>
					e
						.gen(function* () {
							const a = W(),
								m = typeof r == "object" ? r.viewColumn : r,
								P =
									typeof r == "object"
										? !!r.preserveFocus
										: !1;
							yield* o.SendRequest("$createWebviewPanel", [
								a,
								i,
								t,
								g(m, P),
								u(w),
								d(n, w),
							]);
							const v = new V(
								a,
								b,
								n,
								() =>
									e.runSync(
										s.update(l, (p) => (p.delete(a), p)),
									),
								i,
								t,
								w,
								m,
							);
							return (yield* s.update(l, (p) => p.set(a, v)), v);
						})
						.pipe(
							e.mapError(
								(a) =>
									new c({
										Cause: a,
										Context: "CreateWebviewPanelFailed",
									}),
							),
						),
				RegisterWebviewPanelSerializer: (n, i, t) =>
					e
						.sync(
							() => (
								o.SendNotification(
									"$registerWebviewPanelSerializer",
									[i, {}],
								),
								new f(() => {
									o.SendNotification(
										"$unregisterWebviewPanelSerializer",
										[i],
									);
								})
							),
						)
						.pipe(
							e.mapError(
								(r) =>
									new c({
										Cause: r,
										Context: "RegisterSerializerFailed",
									}),
							),
						),
			}
		);
	}),
}) {}
export { T as WebViewPanelService };
