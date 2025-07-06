/**
 * @module Define
 * @description
 * Defines the service for interacting with VS Code's Quick Pick and Input Box
 * UI elements, conforming to the `IQuickInputService` contract. This implementation
 * proxies all UI requests to the native host.
 */

import { CancellationToken } from "@codeeditorland/output/vs/base/common/cancellation.js";
import type {
	IInputBox,
	IQuickInputService,
	IQuickPick,
	IQuickPickItem,
	IInputOptions as VSCodeInputOptions,
	IPickOptions as VSCodePickOptions,
} from "@codeeditorland/output/vs/platform/quickinput/common/quickInput.js";
import { Effect, Option } from "effect";

import { CreateEmitter } from "../../Platform/Vscode/Type.js";
import { HostService } from "../Host/Define.js";
import { InputToDTO, ToDTO } from "./Convert.js";
import { QuickInputProblem } from "./Problem.js";

/**
 * The `Effect.Service` for the `IQuickInputService`.
 *
 * This implementation proxies UI requests to the native `Mountain` host via
 * the `HostService`. It handles the logic for showing Quick Picks and Input Boxes,
 * translating the results back from the host. Controller-based (stateful)
 * Quick Input instances are not supported in this architecture and will throw
 * an error, as the UI is managed by the native host.
 *
 * It is registered with the identifier "quickInputService" for compatibility.
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

					const DTOs = ToDTO(ResolvedItems, Options);
					const ResultHandles = yield* Generator(
						(Host as any).ShowQuickPick(DTOs).pipe(
							// Assuming HostService will have ShowQuickPick
							Effect.mapError(
								(Cause: any) =>
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

					const Handles = ResultHandles.value as number | number[];
					if (Options.canPickMany) {
						const SelectedIndices = new Set(Handles as number[]);
						return ResolvedItems.filter((_, Index) =>
							SelectedIndices.has(Index),
						) as T[];
					}

					return ResolvedItems[Handles as number] as T;
				});

			const ShowInputBox = (
				Options: VSCodeInputOptions = {},
				Token: CancellationToken = CancellationToken.None,
			): Effect.Effect<string | undefined, QuickInputProblem> =>
				Effect.gen(function* (Generator) {
					if (Token.isCancellationRequested) {
						return yield* Generator(Effect.interrupt);
					}
					const OptionsDTO = InputToDTO(Options);
					return yield* Generator(
						(Host as any).ShowInputBox(OptionsDTO).pipe(
							// Assuming HostService will have ShowInputBox
							Effect.map(Option.getOrUndefined),
							Effect.mapError(
								(Cause: any) =>
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
					Picks: Promise<readonly T[]> | readonly T[],
					Options?: VSCodePickOptions<T>,
					Token?: CancellationToken,
				): Promise<(T | T[]) | undefined> =>
					Effect.runPromise(ShowQuickPick(Picks, Options, Token)),
				input: (
					Options?: VSCodeInputOptions,
					Token?: CancellationToken,
				): Promise<string | undefined> =>
					Effect.runPromise(ShowInputBox(Options, Token)),

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

				// --- Stub implementations for other IQuickInputService properties ---
				quickAccess: {} as any,
				onShow: CreateEmitter<void>().event,
				onHide: CreateEmitter<void>().event,
				focus: () => {},
				toggle: () => {},
				navigate: () => {},
				accept: () => Promise.resolve(),
				back: () => Promise.resolve(),
				cancel: () => Promise.resolve(),
				currentQuickInput: undefined,
				backButton: {} as any,
				setAlignment: () => {},
				toggleHover: () => {},
			};

			return ServiceImplementation;
		}),
	},
) {}
