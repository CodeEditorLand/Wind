/**
 * @module Define
 * @description
 * Defines the service for managing and executing commands, implementing the
 * core logic of `vscode.commands`. It handles registration, execution, and
 * proxying of commands to the main host process.
 */

import type { IDisposable } from "@codeeditorland/output/vs/base/common/lifecycle.js";
import type { MainThreadCommandsShape } from "@codeeditorland/output/vs/workbench/api/common/extHost.protocol.js";
import { Effect, Ref } from "effect";
import type { TextEditor, TextEditorEdit } from "vscode";

import { IPCService } from "../IPC/Define.js";
import { LoggerService } from "../Logger/Define.js";
import { WindowService } from "../Window/Define.js";
import { CommandProblem } from "./Problem.js";

/**
 * Represents the internal structure of a registered command handler.
 */
export interface InternalCommand {
	readonly ID: string;
	readonly Callback: (...Arguments: any[]) => any;
	readonly ThisArgument: any;
}

/**
 * The contract for the Command service, mirroring the public `vscode.commands` API.
 */
export interface Interface {
	readonly registerCommand: (
		IsGlobal: boolean,
		ID: string,
		Callback: <T>(...Arguments: any[]) => T | Promise<T>,
		ThisArgument?: any,
	) => IDisposable;
	readonly registerTextEditorCommand: (
		ID: string,
		Callback: (
			TextEditor: TextEditor,
			Edit: TextEditorEdit,
			...Arguments: any[]
		) => void,
		ThisArgument?: any,
	) => IDisposable;
	readonly executeCommand: <T>(
		ID: string,
		...Arguments: any[]
	) => Promise<T | undefined>;
	readonly getCommands: (FilterInternal?: boolean) => Promise<string[]>;
}

/**
 * The `Effect.Service` for managing commands.
 */
export class CommandService extends Effect.Service<Interface>()(
	"Service/Command",
	{
		effect: Effect.gen(function* (Generator) {
			const IPC = yield* Generator(IPCService);
			const Logger = yield* Generator(LoggerService);
			const Window = yield* Generator(WindowService);

			const Commands = yield* Generator(
				Ref.make(new Map<string, InternalCommand>()),
			);
			const MainThreadProxy = IPC.CreateProxy<MainThreadCommandsShape>(
				"$rpc:mainThreadCommands",
			);

			const ExecuteLocal = (Command: InternalCommand, Arguments: any[]) =>
				Effect.tryPromise({
					try: () =>
						Promise.resolve(
							Command.Callback.apply(
								Command.ThisArgument,
								Arguments,
							),
						),
					catch: (Cause) =>
						new CommandProblem({
							Cause,
							Context: "LocalCommandExecutionFailed",
						}),
				});

			IPC.RegisterInvokeHandler(
				"$executeContributedCommand",
				([ID, ...Arguments]: [string, ...any[]]) => {
					const HandlerEffect = Ref.get(Commands).pipe(
						Effect.flatMap((Map) =>
							Effect.fromNullable(Map.get(ID)),
						),
						Effect.flatMap((Command) =>
							ExecuteLocal(Command, Arguments),
						),
						Effect.catchAll((error) =>
							Effect.sync(() =>
								Logger.error(
									`Failed to execute local command '${ID}'`,
									error,
								),
							).pipe(Effect.as(undefined)),
						),
					);
					return Effect.runPromise(HandlerEffect);
				},
			);

			const self: Interface = {
				registerCommand: (
					IsGlobal: boolean,
					ID: string,
					Callback: <T>(...Arguments: any[]) => T | Promise<T>,
					ThisArgument?: any,
				): IDisposable => {
					const RegistrationEffect = Ref.update(Commands, (Map) =>
						Map.set(ID, { ID, Callback, ThisArgument }),
					).pipe(
						Effect.tap(() =>
							Logger.trace(`Command '${ID}' registered.`),
						),
					);
					Effect.runSync(RegistrationEffect);

					if (IsGlobal) {
						MainThreadProxy.$registerCommand(ID);
					}

					return {
						dispose: () => {
							const CleanupEffect = Ref.update(
								Commands,
								(Map) => {
									Map.delete(ID);
									return Map;
								},
							).pipe(
								Effect.tap(() => {
									if (IsGlobal) {
										MainThreadProxy.$unregisterCommand(ID);
									}
								}),
							);
							Effect.runFork(CleanupEffect);
						},
					};
				},
				registerTextEditorCommand: (
					ID: string,
					Callback: (
						textEditor: TextEditor,
						edit: TextEditorEdit,
						...args: any[]
					) => void,
					ThisArg?: any,
				): IDisposable => {
					const AdaptedCallback = (
						...Arguments: any[]
					): Promise<boolean | undefined> => {
						const ActiveEditor = Window.activeTextEditor;
						if (!ActiveEditor) {
							Logger.warn(
								`Cannot execute text editor command '${ID}' because there is no active text editor.`,
							);
							return Promise.resolve(undefined);
						}
						// `edit` returns a `Thenable<boolean>`, which we convert to a full Promise.
						return Promise.resolve(
							ActiveEditor.edit((Builder) => {
								Callback.apply(ThisArg, [
									ActiveEditor,
									Builder,
									...Arguments,
								]);
							}),
						);
					};
					return self.registerCommand(
						true,
						ID,
						AdaptedCallback as <T>(
							...args: any[]
						) => T | Promise<T>,
					);
				},
				executeCommand: async <T>(
					ID: string,
					...Arguments: any[]
				): Promise<T | undefined> => {
					const AllCommands = await Effect.runPromise(
						Ref.get(Commands),
					);
					if (AllCommands.has(ID)) {
						return Effect.runPromise(
							ExecuteLocal(AllCommands.get(ID)!, Arguments),
						) as Promise<T | undefined>;
					}
					return MainThreadProxy.$executeCommand(
						ID,
						Arguments,
						true, // retry once
					) as Promise<T | undefined>;
				},
				getCommands: (FilterInternal = false): Promise<string[]> =>
					MainThreadProxy.$getCommands().then((Commands) =>
						FilterInternal
							? Commands.filter((c) => !c.startsWith("_"))
							: Commands,
					),
			};

			return self;
		}),
	},
) {}
