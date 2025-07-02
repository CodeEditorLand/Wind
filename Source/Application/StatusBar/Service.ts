/**
 * @module Service (Application/StatusBar)
 * @description Defines the service for creating and managing items in the
 * VS Code status bar.
 */

import { Effect, Ref } from "effect";
import { generateUuid } from "@codeeditorland/output/vs/base/common/uuid.js";
import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import type { IStatusbarService } from "@codeeditorland/output/vs/workbench/services/statusbar/browser/statusbar.js";
import {
	Disposable,
	StatusBarAlignment,
	type Command,
	type MarkdownString,
} from "vscode";

import { CommandService } from "../Command/Service.js";
import { HostService } from "../Host/Service.js";
import { StatusBarItemImplementation } from "./StatusBarItem.js";

/**
 * The `Effect.Service` for the `IStatusbarService`.
 *
 * This service provides methods for creating and managing status bar items. It
 * acts as a factory, creating `StatusBarItemImplementation` instances that
trol the UI elements by proxying state changes to the `HostService`.
 */
export class StatusBarService extends Effect.Service<IStatusbarService>()(
	"statusbarService",
	{
		effect: Effect.gen(function* (Generator) {
			const Host = yield* Generator(HostService);
			const Command = yield* Generator(CommandService);
			const ActiveItems = yield* Generator(
				Ref.make(new Map<string, StatusBarItemImplementation>()),
			);

			const CreateStatusBarItem = (
				Extension: IExtensionDescription,
				Id?: string,
				Alignment?: StatusBarAlignment,
				Priority?: number,
			) =>
				Effect.sync(() => {
					const EntryId = generateUuid();
					const ItemId =
						Id ?? `${Extension.identifier.value}.${EntryId}`;
					const FinalAlignment = Alignment ?? StatusBarAlignment.Left;

					const OnDispose = () =>
						Effect.runSync(
							Ref.update(ActiveItems, (Map) => {
								Map.delete(EntryId);
								return Map;
							}),
						);

					const Entry = new StatusBarItemImplementation(
						EntryId,
						Extension,
						Host,
						Command,
						OnDispose,
						ItemId,
						FinalAlignment,
						Priority,
					);
					Effect.runSync(
						Ref.update(ActiveItems, (Map) =>
							Map.set(EntryId, Entry),
						),
					);
					return Entry;
				});

			const SetStatusBarMessage = (
				Text: string,
				HideOrPromise?: number | Promise<any>,
			) => {
				const HideId = `status.message.${generateUuid()}`;
				const ShowEffect = Host.SetStatusBarMessage(HideId, Text);
				const HideEffect = Host.DisposeStatusBarMessage(HideId);

				Effect.runFork(ShowEffect);

				if (typeof HideOrPromise === "number") {
					setTimeout(() => Effect.runFork(HideEffect), HideOrPromise);
				} else if (HideOrPromise) {
					Promise.resolve(HideOrPromise).finally(() =>
						Effect.runFork(HideEffect),
					);
				}

				return new Disposable(() => Effect.runFork(HideEffect));
			};

			// Note: The VS Code IStatusbarService interface is much larger.
			// This implementation provides the core functionality needed by extensions.
			const ServiceImplementation = {
				addEntry: (
					Properties: {
						name: any;
						text: string;
						tooltip: string | MarkdownString | undefined;
						command: string | Command | undefined;
					},
					Id: string | undefined,
					Alignment: StatusBarAlignment | undefined,
					Priority: number | undefined,
				) => {
					// This is the declarative way to add an entry, which we can map
					// to our factory method.
					const Item = Effect.runSync(
						CreateStatusBarItem(
							{ id: Id, name: Properties.name } as any, // DTO mapping needed
							Id,
							Alignment,
							Priority,
						),
					);
					Item.text = Properties.text;
					Item.tooltip = Properties.tooltip;
					Item.command = Properties.command;
					Item.show();
					return {
						update: (p: any) => Object.assign(Item, p),
						dispose: () => Item.dispose(),
					};
				},
				// Stubs for other methods
				getPart: () => ({}) as any,
				createAuxiliaryStatusbarPart: () => ({}) as any,
				createScoped: () => ({}) as any,
			};

			return ServiceImplementation as unknown as IStatusbarService;
		}),
	},
) {}
