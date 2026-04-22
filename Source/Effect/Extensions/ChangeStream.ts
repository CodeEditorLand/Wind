/**
 * @module Effect/Extensions/ChangeStream
 * @description
 * Merged event stream for extension lifecycle changes.
 *
 * Mountain emits two disjoint Tauri events after the K2/K3 install /
 * uninstall handlers complete:
 *
 *   - `sky://extensions/installed`   → `{ identifier, version, location }`
 *   - `sky://extensions/uninstalled` → `{ identifier, location }`
 *
 * Consumers (sidebar view, notification toast, error-tracking hook) almost
 * always want the union of both - a single stream tagged with the change
 * kind - rather than subscribing to each raw event. `ExtensionChangeStream`
 * is that union, typed via the Wind `SkyEvent` registry so wire-string
 * changes caught at compile time.
 *
 * Atom K-followup: this is the Sky sidebar's subscription point. The
 * workbench's `ExtensionEnablementService` refreshes via
 * `onDidChangeExtensions`; wire that observer to
 * `Stream.runForEach(ExtensionChangeStream, …)` so the sidebar re-renders
 * live without a workbench reload.
 */

import { Effect, Stream } from "effect";

import SkyEvent from "../../IPC/SkyEvent.js";
import { IPC } from "../IPC.js";
import type { IPCSubscriptionError } from "../IPC/Type/IPCError.js";

export type ExtensionChange =
	| {
			readonly Kind: "Installed";
			readonly Identifier: string;
			readonly Version: string;
			readonly Location: string;
	  }
	| {
			readonly Kind: "Uninstalled";
			readonly Identifier: string;
			readonly Location: string | undefined;
	  };

const ReadString = (
	Record: Readonly<Record<string, unknown>>,
	Field: string,
): string => {
	const Value = Record[Field];
	return typeof Value === "string" ? Value : "";
};

const ReadOptionalString = (
	Record: Readonly<Record<string, unknown>>,
	Field: string,
): string | undefined => {
	const Value = Record[Field];
	return typeof Value === "string" ? Value : undefined;
};

const FirstArgAsPayload = (
	Frame: { readonly args: ReadonlyArray<unknown> },
): Readonly<Record<string, unknown>> | null => {
	const First = Frame.args[0];
	return First !== null && typeof First === "object"
		? (First as Readonly<Record<string, unknown>>)
		: null;
};

/**
 * Install + uninstall events merged into a single Effect-TS stream of
 * typed `ExtensionChange` items. Any payload shape mismatch produces an
 * empty string / undefined rather than dropping the event - the
 * receiver's refresh logic can re-fetch `extensions:getAll` to recover
 * authoritative state.
 */
export default Effect.gen(function* () {
	const IPCService = yield* IPC;

	const Installed = IPCService.events(SkyEvent.ExtensionsInstalled).pipe(
		Stream.map((Frame): ExtensionChange | null => {
			const Payload = FirstArgAsPayload(Frame);

			if (Payload === null) {
				return null;
			}

			return {
				Kind: "Installed",
				Identifier: ReadString(Payload, "identifier"),
				Version: ReadString(Payload, "version"),
				Location: ReadString(Payload, "location"),
			};
		}),
		Stream.filter(
			(Event): Event is ExtensionChange => Event !== null,
		),
	);

	const Uninstalled = IPCService.events(SkyEvent.ExtensionsUninstalled).pipe(
		Stream.map((Frame): ExtensionChange | null => {
			const Payload = FirstArgAsPayload(Frame);

			if (Payload === null) {
				return null;
			}

			return {
				Kind: "Uninstalled",
				Identifier: ReadString(Payload, "identifier"),
				Location: ReadOptionalString(Payload, "location"),
			};
		}),
		Stream.filter(
			(Event): Event is ExtensionChange => Event !== null,
		),
	);

	return Stream.merge(Installed, Uninstalled) satisfies Stream.Stream<
		ExtensionChange,
		IPCSubscriptionError
	>;
});
