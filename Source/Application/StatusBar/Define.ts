/**
 * @module Define
 * @description
 * Defines the service for creating and managing items in the VS Code status bar,
 * conforming to the `IStatusbarService` interface.
 */

import { generateUuid } from "@codeeditorland/output/vs/base/common/uuid.js";
import type { IExtensionDescription } from "@codeeditorland/output/vs/platform/extensions/common/extensions.js";
import {
	StatusbarAlignment,
	type IStatusbarEntry,
	type IStatusbarEntryAccessor,
	type IStatusbarService,
} from "@codeeditorland/output/vs/workbench/services/statusbar/browser/statusbar.js";
import { Effect, Ref } from "effect";
import { Disposable, type Command, type IMarkdownString } from "vscode";

import { Emitter } from "../../Platform/Vscode/Type.js";
import { CommandService } from "../Command/Define.js";
import { HostService } from "../Host/Define.js";
import { StatusBarItemImplementation } from "./Item.js";

/**
 * The `Effect.Service` for the `IStatusbarService`.
 *
 * This service provides methods for creating and managing status bar items. It
 * acts as a factory, creating `StatusBarItemImplementation` instances that
 * control the UI elements by proxying state changes to the `HostService`.
 *
 * It is registered with the identifier "statusbarService" for compatibility.
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
				ID?: string,
				Alignment?: StatusbarAlignment,
				Priority?: number,
			) =>
				Effect.sync(() => {
					const EntryID = generateUuid();
					const ItemID = ID ?? `${Extension.id}.${EntryID}`;
					const FinalAlignment = Alignment ?? StatusbarAlignment.LEFT;

					const OnDispose = () =>
						Effect.runSync(
							Ref.update(ActiveItems, (Map) => {
								Map.delete(EntryID);
								return Map;
							}),
						);

					const Entry = new StatusBarItemImplementation(
						EntryID,
						Extension,
						Host,
						Command,
						OnDispose,
						ItemID,
						FinalAlignment,
						Priority,
					);
					Effect.runSync(
						Ref.update(ActiveItems, (Map) =>
							Map.set(EntryID, Entry),
						),
					);
					return Entry;
				});

			// Note: The VS Code IStatusbarService interface is much larger.
			// This implementation provides the core `addEntry` functionality.
			const ServiceImplementation: IStatusbarService = {
				addEntry: (
					Properties: IStatusbarEntry,
					ID: string,
					Name: string,
					Alignment?: StatusbarAlignment,
					Priority?: number,
				): IStatusbarEntryAccessor => {
					// This is the declarative way to add an entry, which we can map
					// to our factory method.
					const Item = Effect.runSync(
						CreateStatusBarItem(
							{ id: ID, name: Name } as any, // DTO mapping needed
							ID,
							Alignment,
							Priority,
						),
					);

					Item.text = Properties.text;
					Item.tooltip = Properties.tooltip;
					Item.command = Properties.command;
					Item.show();

					return {
						update: (p: IStatusbarEntry) => Object.assign(Item, p),
						dispose: () => Item.dispose(),
					};
				},
				// --- Stub implementations for other IStatusbarService methods ---
				getPart: () => ({}) as any,
				createAuxiliaryStatusbarPart: () => ({}) as any,
				createScoped: () => ({}) as any,
				onDidChangeEntryVisibility: new Emitter().event,
			};

			return ServiceImplementation;
		}),
	},
) {}
