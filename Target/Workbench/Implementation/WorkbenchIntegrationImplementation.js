import {
	Stream as B,
	Queue as F,
	Context as j,
	Effect as n,
	Ref as o,
	Layer as U,
} from "effect";

import { FileSystemProviderTag as H } from "../../FileSystem/Implementation/FileSystemProviderImplementation.js";
import { FileSystemProviderLive as J } from "../../FileSystem/index.js";
import { URI as c } from "../../FileSystem/Type/URI.js";
import {
	WorkbenchState as g,
	WorkbenchIntegrationErrorCode as m,
	WorkbenchIntegrationError as y,
} from "../Type/WorkbenchIntegrationType.js";

const K = 100,
	X = 3e4,
	ne = 1e4,
	k = (i, d, p) =>
		n.gen(function* () {
			const f = { state: d, lastUpdated: Date.now() };
			return (
				yield* o.set(i.stateRef, f),
				yield* F.offer(i.stateQueue, f),
				f
			);
		}),
	R = (i, d, p) =>
		o.update(i.messagesRef, (f) => [
			...f,
			{ type: d, message: p, timestamp: Date.now() },
		]),
	a = (i, d) =>
		n.gen(function* () {
			(yield* o.get(i.debugModeRef)) &&
				console.log(`[WorkbenchIntegration] ${d}`);
		}),
	G = (i, d) =>
		i instanceof y
			? i
			: i instanceof Error
				? new y(i.message, d)
				: new y(String(i), m.Unknown),
	D = () => typeof window < "u" && typeof window.vscode < "u",
	h = () => typeof window < "u" && typeof window.monaco < "u",
	S = () => {
		if (!(typeof window > "u")) return window.vscode;
	},
	M = (i, d, p = K) =>
		n.gen(function* () {
			const f = Date.now();
			for (; Date.now() - f < d; ) {
				if (i()) return;
				yield* n.sleep(p);
			}
			return yield* n.fail(
				new y(
					`Timeout after ${d}ms waiting for condition to be met`,
					m.InitTimeout,
				),
			);
		});
class x extends j.Tag("WorkbenchIntegration")() {}
const q = n.gen(function* () {
	const i = yield* o.make({
			state: g.NotInitialized,
			lastUpdated: Date.now(),
		}),
		d = yield* F.unbounded(),
		p = yield* o.make(void 0),
		f = yield* o.make(void 0),
		V = yield* o.make(!1),
		N = yield* o.make([]),
		w = yield* o.make(!1),
		e = {
			stateRef: i,
			stateQueue: d,
			registrationResultRef: p,
			workspaceContextRef: f,
			debugModeRef: V,
			messagesRef: N,
			defaultProvidersUnregisteredRef: w,
		},
		O = n.sync(() => {
			const r = S(),
				l = h();
			return r !== void 0 && r.workspace !== void 0 && l;
		}),
		P = (r) =>
			n.gen(function* () {
				(yield* k(e, g.WaitingForReady),
					yield* a(
						e,
						`Waiting for workbench to be ready (timeout: ${r}ms)...`,
					));
				const l = yield* n.either(
					M(D, r).pipe(
						n.mapError(
							(u) =>
								new y(
									`VSCode API not available after ${r}ms`,
									m.InitTimeout,
								),
						),
					),
				);
				if (l._tag === "Left")
					return (
						yield* a(e, "VSCode API check failed"),
						yield* n.fail(l.left)
					);
				const t = yield* n.either(
					M(h, r).pipe(
						n.mapError(
							(u) =>
								new y(
									`Monaco editor not available after ${r}ms`,
									m.InitTimeout,
								),
						),
					),
				);
				if (t._tag === "Left")
					return (
						yield* a(e, "Monaco editor check failed"),
						yield* n.fail(t.left)
					);
				(yield* a(e, "Workbench is ready"),
					yield* k(e, g.ReadyForProviderRegistration));
			}),
		C = n.gen(function* () {
			(yield* a(e, "Unregistering default VSCode providers..."),
				yield* R(
					e,
					"info",
					"Default providers will be overridden by Mountain provider",
				),
				yield* o.set(w, !0),
				yield* k(e, g.DefaultProvidersUnregistered),
				yield* a(e, "Default providers unregistered (overridden)"));
		}),
		_ = (r) =>
			n.gen(function* () {
				yield* a(
					e,
					`Registering Mountain provider for scheme: ${r}...`,
				);
				const l = yield* H,
					t = yield* n.mapError(
						l.getProvider,
						(s) =>
							new y(
								"Failed to get file system provider",
								m.FileSystemProviderUnavailable,
							),
					),
					u = {
						readFile: (s) => t.readFile(c.parse(s)),
						writeFile: (s, v, W) =>
							t.writeFile(
								c.parse(s),
								v,
								W
									? {
											create: W.create ?? !0,
											overwrite: W.overwrite ?? !1,
										}
									: void 0,
							),
						delete: (s) => t.delete(c.parse(s)),
						copy: (s, v) => t.copy(c.parse(s), c.parse(v)),
						move: (s, v) => t.move(c.parse(s), c.parse(v)),
						readdir: (s) => t.readdir(c.parse(s)),
						mkdir: (s, v) =>
							t.mkdir(c.parse(s), {
								recursive: v?.recursive ?? !1,
							}),
						rmdir: (s) => t.rmdir(c.parse(s)),
						stat: (s) => t.stat(c.parse(s)),
					};
				if (!S())
					return yield* n.fail(
						new y(
							"VSCode API not available for provider registration",
							m.ServiceUnavailable,
						),
					);
				const I = window;
				((I.__MOUNTAIN_FS_PROVIDER__ = u),
					(I.__MOUNTAIN_FS_SCHEME__ = r));
				const T = {
					success: !0,
					providerName: "MountainFileSystemProvider",
					scheme: r,
					details: {
						method: "API override (Option A)",
						timestamp: Date.now(),
					},
				};
				return (
					yield* o.set(e.registrationResultRef, T),
					yield* k(e, g.MountainProviderRegistered),
					yield* R(
						e,
						"info",
						`Mountain provider registered for scheme: ${r}`,
					),
					yield* a(
						e,
						`Mountain provider registered successfully for scheme: ${r}`,
					),
					T
				);
			}),
		A = (r) =>
			n.gen(function* () {
				if ((yield* a(e, `Configuring workspace: ${r.name}...`), !S()))
					return yield* n.fail(
						new y(
							"VSCode API not available for workspace configuration",
							m.ServiceUnavailable,
						),
					);
				const t = window;
				((t.__WORKSPACE_CONTEXT__ = r),
					yield* o.set(e.workspaceContextRef, r),
					yield* k(e, g.WorkspaceConfigured),
					yield* R(e, "info", `Workspace configured: ${r.name}`),
					yield* a(e, "Workspace configured successfully"));
			}),
		L = (r) =>
			n.gen(function* () {
				(yield* k(e, g.NotInitialized),
					yield* o.set(e.debugModeRef, r.debugMode ?? !1),
					yield* a(e, "Initializing workbench integration..."),
					yield* a(e, `  - Workspace root: ${r.workspaceRootUri}`),
					yield* a(e, `  - File scheme: ${r.fileScheme ?? "file"}`),
					yield* a(
						e,
						`  - Override default providers: ${r.overrideDefaultProviders ?? !1}`,
					));
				const l = r.initTimeout ?? X;
				(yield* n.tap(P(l), () =>
					a(e, "Workbench is ready for integration"),
				),
					(r.overrideDefaultProviders ?? !1) && (yield* C));
				const t = r.fileScheme ?? "file",
					u = yield* _(t);
				if (!u.success)
					return yield* n.fail(
						G(u.error, m.ProviderRegistrationFailed),
					);
				const b = {
					rootUri: r.workspaceRootUri,
					name: "CodeEditorLand Workspace",
					isDefault: !0,
					folders: [{ uri: r.workspaceRootUri, name: "workspace" }],
				};
				(yield* A(b),
					yield* k(e, g.IntegrationComplete),
					yield* R(e, "info", "Workbench integration complete"),
					yield* a(
						e,
						"Workbench integration initialized successfully",
					));
			}),
		E = o.get(e.stateRef),
		$ = n.sync(() => B.fromQueue(e.stateQueue)),
		z = n.gen(function* () {
			const r = yield* E,
				l = yield* o.get(e.messagesRef),
				t = yield* o.get(e.registrationResultRef),
				u = yield* o.get(e.workspaceContextRef),
				b = yield* o.get(e.defaultProvidersUnregisteredRef);
			return {
				state: r,
				vscodeAvailable: D(),
				monacoAvailable: h(),
				serviceCollectionAccessible: !1,
				defaultProvidersFound: b
					? ["IndexedDB (overridden)"]
					: ["IndexedDB"],
				...(t !== void 0 && { registrationResult: t }),
				...(u !== void 0 && { workspaceContext: u }),
				messages: l,
			};
		}),
		Q = n.gen(function* () {
			(yield* a(e, "Resetting workbench integration state..."),
				yield* o.set(i, {
					state: g.NotInitialized,
					lastUpdated: Date.now(),
				}),
				yield* o.set(e.registrationResultRef, void 0),
				yield* o.set(e.workspaceContextRef, void 0),
				yield* o.set(e.messagesRef, []),
				yield* o.set(w, !1));
			const r = window;
			(delete r.__MOUNTAIN_FS_PROVIDER__,
				delete r.__MOUNTAIN_FS_SCHEME__,
				delete r.__WORKSPACE_CONTEXT__,
				yield* a(e, "Workbench integration reset complete"));
		});
	return {
		initialize: L,
		getState: E,
		stateChanges: $,
		registerProvider: _,
		unregisterDefaultProviders: C,
		configureWorkspace: A,
		getDiagnostics: z,
		isWorkbenchReady: O,
		waitForWorkbench: P,
		reset: Q,
	};
});
const te = U.effect(x, q).pipe(U.provide(J));
var ie = x;
export {
	te as WorkbenchIntegrationLiveLayer,
	x as WorkbenchIntegrationTag,
	ie as default,
};
