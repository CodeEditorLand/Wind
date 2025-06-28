/**
 * @module Service (Application/QuickInput)
 * @description Defines the service for interacting with VS Code's Quick Pick
 * and Input Box UI elements, conforming to the `IQuickInputService` contract.
 */

import { Effect, Option } from "effect";
import { CancellationToken } from "vs/base/common/cancellation.js";
import type {
	IInputBox,
	IQuickInputService,
	IQuickPick,
	IQuickPickItem,
	IInputOptions as VSCodeInputOptions,
	IPickOptions as VSCodePickOptions,
} from "vs/platform/quickinput/common/quickInput.js";
import { HostService } from "Source/Application/Host/Service.js";
import { QuickInputProblem } from "./Error.js";
import {
	ToDTO as QuickPickOptionsToDTO,
	ToDTO as InputBoxOptionsToDTO,
} from "Source/TypeConverter/QuickInput.js";

/**
 * The `Effect.Service` for the `IQuickInputService`.
 *
 * This implementation proxies UI requests to the native `Mountain` host via
 * the `HostService`. It handles the logic for showing Quick Picks and Input Boxes,
 * translating the results back from the host. Controller-based (stateful)
 * Quick Input instances are not supported in this architecture and will throw
 * an error, as the UI is managed by the native host.
 */
export class QuickInputService extends Effect.Service<IQuickInputService>()(
	"quickInputService",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);

			const ShowQuickPick = <T extends IQuickPickItem>(
				Items: readonly T[] | Promise<readonly T[]>,
				Options: VSCodePickOptions<T> = {},
				Token: CancellationToken = CancellationToken.None,
			): Effect.Effect<T | T[] | undefined, QuickInputProblem> =>
				Effect.gen(function* (Generator) {
					if (Token.isCancellationRequested) {
						return yield* Generator(Effect.interrupt);
					}
					const ResolvedItems = yield* Generator(
						Effect.tryPromise({
							try: () => Promise.resolve(Items),
							catch: (Cause) =>
								new QuickInputProblem({
									Cause: Cause as Error,
									Context: "FailedToResolveQuickPickItems",
								}),
						}),
					);
					const DTOs = QuickPickOptionsToDTO(ResolvedItems, Options);
					const ResultHandles = yield* Generator(
						Host.ShowQuickPick(DTOs).pipe(
							Effect.mapError(
								(Cause) =>
									new QuickInputProblem({
										Cause,
										Context: "ShowQuickPickFailed",
									}),
							),
						),
					);

					if (Option.isNone(ResultHandles)) {
						return undefined;
					}

					if (Options.canPickMany) {
						const SelectedIndices = new Set(ResultHandles.value);
						return ResolvedItems.filter((_, Index) =>
							SelectedIndices.has(Index),
						) as T[];
					}

					const SingleHandle = ResultHandles.value as number;
					return ResolvedItems[SingleHandle] as T;
				});

			const ShowInputBox = (
				Options: VSCodeInputOptions = {},
				Token: CancellationToken = CancellationToken.None,
			): Effect.Effect<string | undefined, QuickInputProblem> =>
				Effect.gen(function* (Generator) {
					if (Token.isCancellationRequested) {
						return yield* Generator(Effect.interrupt);
					}
					const OptionsDTO = InputBoxOptionsToDTO(Options);
					return yield* Generator(
						Host.ShowInputBox(OptionsDTO).pipe(
							Effect.map(Option.getOrUndefined),
							Effect.mapError(
								(Cause) =>
									new QuickInputProblem({
										Cause,
										Context: "ShowInputBoxFailed",
									}),
							),
						),
					);
				});

			const ServiceImplementation: IQuickInputService = {
				_serviceBrand: undefined,
				pick: <T extends IQuickPickItem>(
					Picks: Promise<T[]> | T[],
					Options?: VSCodePickOptions<T>,
					Token?: CancellationToken,
				) => Effect.runPromise(ShowQuickPick(Picks, Options, Token)),
				input: (
					Options?: VSCodeInputOptions,
					Token?: CancellationToken,
				) => Effect.runPromise(ShowInputBox(Options, Token)),
				createQuickPick: <
					T extends IQuickPickItem,
				>(): IQuickPick<T> => {
					throw new Error(
						"Stateful QuickPick controllers are not supported in this architecture.",
					);
				},
				createInputBox: (): IInputBox => {
					throw new Error(
						"Stateful InputBox controllers are not supported in this architecture.",
					);
				},
				// Stubs for remaining properties and methods
				quickAccess: {} as any,
				onDidAccept: new AbortController().signal as any,
				onDidTriggerButton: new AbortController().signal as any,
				onDidTriggerItemButton: new AbortController().signal as any,
				onWillAccept: new Emitter().event,
				onDidChangeValue: new Emitter().event,
				navigate: () => {},
				focus: () => {},
				toggle: () => {},
				layout: () => {},
				show: () => {},
				hide: () => {},
			};

			return ServiceImplementation;
		}),
	},
) {}
