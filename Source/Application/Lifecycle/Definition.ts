/*
 * File: Wind/Source/Application/Lifecycle/Definition.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:34 UTC
 * Dependency: ../../Integration/Host/Error.js, ../../Integration/Host/Wrap/Lifecycle.js, ./Error.js, @tauri-apps/api/window, effect, vs/workbench/services/lifecycle/common/lifecycleService.js
 */

import { appWindow, type Event as TauriEvent } from "@tauri-apps/api/window";
import { Cause, Effect, Exit, Fiber, Option, Unify } from "effect";
import {
	ILifecycleService,
	WillShutdownJoinerOrder,
	type IWillShutdownEventJoiner,
	type ShutdownReason,
} from "vs/workbench/services/lifecycle/common/lifecycle.js";
import { AbstractLifecycleService } from "vs/workbench/services/lifecycle/common/lifecycleService.js";

import { HostProblem } from "../../Integration/Host/Error.js";
import { ExitApplication } from "../../Integration/Host/Wrap/Lifecycle.js";
import { LifecycleProblem } from "./Error.js";

type VetoResult = boolean | Promise<boolean>;
type JoinResult = void | Promise<void>;

const HandleVetos = (
	VetoList: readonly VetoResult[],
): Effect.Effect<boolean, LifecycleProblem> =>
	Effect.gen(function* (_) {
		const PromiseList = VetoList.map((Veto) =>
			Effect.tryPromise({
				try: () => Promise.resolve(Veto),
				catch: (cause) =>
					new LifecycleProblem({
						cause,
						context: "VetoPromiseRejected",
					}),
			}),
		);

		const ResultList = yield* _(
			Effect.all(PromiseList, { concurrency: "inherit" }),
		);
		return ResultList.some((Veto) => Veto === true);
	});

class TauriLifecycleService extends AbstractLifecycleService {
	private ShutdownReason: ShutdownReason = 1; // Closing

	constructor() {
		super(console as any, { get: () => undefined } as any); // Dependencies are for logging/storage which we don't use
		this.RegisterListeners();
	}

	private RegisterListeners(): void {
		appWindow.onCloseRequested(async (event) => {
			// This is our chance to veto the shutdown
			event.preventDefault();

			const ShutdownEffect = Effect.gen(function* (_) {
				const Veto = yield* _(
					this.handleBeforeShutdown(this.ShutdownReason),
				);

				if (Veto) {
					this._onShutdownVeto.fire();
					yield* _(
						Effect.logInfo(
							"Lifecycle: Shutdown vetoed by a participant.",
						),
					);
					return;
				}

				yield* _(this.handleWillShutdown(this.ShutdownReason));
				this._onDidShutdown.fire();
				yield* _(ExitApplication);
			}).pipe(
				Effect.provideService(ILifecycleService, this),
				Effect.catchAll((error) =>
					Effect.logError(
						"Lifecycle: Unhandled error during shutdown.",
						error,
					),
				),
			);

			Effect.runFork(ShutdownEffect);
		});
	}

	protected override async handleBeforeShutdown(
		reason: ShutdownReason,
	): Promise<boolean> {
		const VetoList: VetoResult[] = [];
		let FinalVeto: (() => VetoResult) | undefined = undefined;

		this._onBeforeShutdown.fire({
			reason,
			veto: (value) => VetoList.push(value),
			finalVeto: (value) => {
				FinalVeto = value;
			},
		});

		const HasVeto = await Effect.runPromise(HandleVetos(VetoList));
		if (HasVeto) {
			return true;
		}

		if (FinalVeto) {
			const FinalVetoResult = await Effect.runPromise(
				HandleVetos([FinalVeto()]),
			);
			if (FinalVetoResult) {
				return true;
			}
		}

		return false;
	}

	protected override async handleWillShutdown(
		reason: ShutdownReason,
	): Promise<void> {
		this._willShutdown = true;
		const DefaultJoinerList: Promise<void>[] = [];
		const LastJoinerList: (() => Promise<void>)[] = [];

		this._onWillShutdown.fire({
			reason,
			join: (promise, joiner) => {
				const promiseFn =
					typeof promise === "function" ? promise : () => promise;
				if (joiner.order === WillShutdownJoinerOrder.Last) {
					LastJoinerList.push(promiseFn);
				} else {
					DefaultJoinerList.push(promiseFn());
				}
			},
			// These are not used in our simple model yet
			token: {
				isCancellationRequested: false,
				onCancellationRequested: Event.None,
			},
			joiners: () => [],
			force: () => {},
		});

		await Promise.allSettled(DefaultJoinerList);
		await Promise.allSettled(LastJoinerList.map((fn) => fn()));
	}

	shutdown(): Promise<void> {
		// In Tauri, we don't send a message to quit, we just close the main window.
		// The `onCloseRequested` listener will handle the graceful shutdown.
		return appWindow.close();
	}
}

const Definition = Effect.sync(() => new TauriLifecycleService());
export default Definition;
