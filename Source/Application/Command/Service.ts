/**
 * @module Service (Application/Command)
 * @description Defines the service for managing and executing commands,
 * implementing the core logic of `vscode.commands`.
 */

import { Effect, Ref } from "effect";
import type { IDisposable } from "vs/base/common/lifecycle.js";
import type { MainThreadCommandsShape } from "vs/workbench/api/common/extHost.protocol.js";
import type { TextEditor, TextEditorEdit } from "vscode";

import { IPCService } from "../IPC/Service.js";
import { LoggerService } from "../Logger/Service.js";
import { WindowService } from "../Window/Service.js";
import { CommandProblem } from "./Error.js";

/**
 * Represents the internal structure of a registered command.
 */
export interface InternalCommand {
	readonly Id: string;
	readonly Callback: (...Arguments: any[]) => any;
	readonly ThisArgument: any;
}

/**
 * The contract for the Command service, mirroring the public `vscode.commands` API.
 */
export interface Command {
	readonly registerCommand: (
		Global: boolean,
		Id: string,
		Callback: <T>(...Arguments: any[]) => T | Promise<T>,
		ThisArgument?: any,
	) => IDisposable;
	readonly registerTextEditorCommand: (
		Id: string,
		Callback: (
			TextEditor: TextEditor,
			Edit: TextEditorEdit,
			...Arguments: any[]
		) => void,
		ThisArgument?: any,
	) => IDisposable;
	readonly executeCommand: <T>(
		Id: string,
		...Arguments: any[]
	) => Promise<T | undefined>;
	readonly getCommands: (FilterInternal?: boolean) => Promise<string[]>;
}

/**
 * The `Effect.Service` for the Command service.
 */
export class CommandService extends Effect.Service<Command>()(
	"Service/Command",
	{
		effect: Effect.gen(function* () {
			const IPC = yield* IPCService;
			const Logger = yield* LoggerService;
			const Window = yield* WindowService;

			const Commands = yield* Ref.make(
				new Map<string, InternalCommand>(),
			);
			const MainThreadProxy = IPC.CreateProxy<MainThreadCommandsShape>(
				"$rpc:mainThreadCommands",
			);

			const ExecuteLocalCommand = (
				Command: InternalCommand,
				Arguments: any[],
			) =>
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
				([Id, ...Arguments]: [string, ...any[]]) =>
					Effect.runPromise(
						Ref.get(Commands).pipe(
							Effect.flatMap((Map) =>
								Effect.fromNullable(Map.get(Id)),
							),
							Effect.flatMap((Command) =>
								ExecuteLocalCommand(Command, Arguments),
							),
							Effect.catchAll((error) =>
								Logger.error(
									`Failed to execute local command '${Id}'`,
									error,
								).pipe(Effect.as(undefined)),
							),
						),
					),
			);

			const registerCommand = (
				Global: boolean,
				Id: string,
				Callback: <T>(...Arguments: any[]) => T | Promise<T>,
				ThisArgument?: any,
			): IDisposable => {
				const RegistrationEffect = Ref.update(Commands, (Map) =>
					Map.set(Id, { Id, Callback, ThisArgument }),
				).pipe(
					Effect.tap(() =>
						Logger.trace(`Command '${Id}' registered.`),
					),
				);
				Effect.runSync(RegistrationEffect);

				if (Global) {
					MainThreadProxy.$registerCommand(Id);
				}

				return {
					dispose: () => {
						const CleanupEffect = Ref.update(
							Commands,
							(Map) => (Map.delete(Id), Map),
						).pipe(
							Effect.tap(() => {
								if (Global) {
									MainThreadProxy.$unregisterCommand(Id);
								}
							}),
						);
						Effect.runFork(CleanupEffect);
					},
				};
			};

			const self: Command = {
				registerCommand,
				registerTextEditorCommand: (
					Id: string,
					Callback: (
						textEditor: TextEditor,
						edit: TextEditorEdit,
						...args: any[]
					) => void,
					ThisArg?: any,
				): IDisposable => {
					const AdaptedCallback = (...Arguments: any[]) => {
						const ActiveEditor = Window.activeTextEditor;
						if (!ActiveEditor) {
							Effect.runSync(
								Logger.warn(
									`Cannot execute text editor command '${Id}' because there is no active text editor.`,
								),
							);
							return Promise.resolve(undefined);
						}
						return ActiveEditor.edit((Builder) => {
							Callback.apply(ThisArg, [
								ActiveEditor,
								Builder,
								...Arguments,
							]);
						});
					};
					return self.registerCommand(true, Id, AdaptedCallback);
				},
				executeCommand: async <T>(
					Id: string,
					...Arguments: any[]
				): Promise<T | undefined> => {
					const AllCommands = await Effect.runPromise(
						Ref.get(Commands),
					);
					if (AllCommands.has(Id)) {
						return Effect.runPromise(
							ExecuteLocalCommand(
								AllCommands.get(Id)!,
								Arguments,
							),
						) as Promise<T | undefined>;
					}
					return MainThreadProxy.$executeCommand(
						Id,
						Arguments,
						true,
					) as Promise<T | undefined>;
				},
				getCommands: (FilterInternal = false): Promise<string[]> =>
					MainThreadProxy.$getCommands(FilterInternal),
			};

			return self;
		}),
	},
) {}
