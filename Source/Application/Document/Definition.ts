/*
 * File: Wind/Source/Application/Document/Definition.ts
 * Role: Provides the live implementation of the DocumentManagementService.
 * Responsibilities:
 *   - Listens for document lifecycle events from the Mountain backend (open, save, rename).
 *   - Uses core VS Code services (`IEditorService`, `ITextFileService`) to manipulate
 *     the workbench UI in response to these events.
 */

import { listen } from "@tauri-apps/api/event";
import { Effect } from "effect";
import { URI } from "vs/base/common/uri.js";
import { ILogService } from "vs/platform/log/common/log.js";
import { IEditorGroupsService } from "vs/workbench/services/editor/common/editorGroupsService.js";
import { IEditorService } from "vs/workbench/services/editor/common/editorService.js";
import { ITextFileService } from "vs/workbench/services/textfile/common/textfiles.js";

import type { Interface as DocumentManagementService } from "./Service.js";

// The structure of the event payload from Mountain's DocumentProvider
interface DocumentOpenPayload {
	URI: string;

	LanguageIdentifier: string;

	VersionIdentifier: number;

	Lines: string[];

	EOL: string;

	IsDirty: boolean;

	Encoding: string;
}

interface DocumentRenamePayload {
	oldUri: string;

	newUri: string;
}

/**
 * An Effect that builds the live implementation of the DocumentManagementService.
 */
const Definition = Effect.gen(function* (_) {
	const EditorService = yield* _(IEditorService);

	const TextFileService = yield* _(ITextFileService);

	const EditorGroupsService = yield* _(IEditorGroupsService);

	const LogService = yield* _(ILogService);

	const initialize = (): Effect.Effect<void, never> =>
		Effect.gen(function* (_) {
			LogService.info(
				"[DocumentManagementService] Initializing and listening for document events from Mountain.",
			);

			// --- Listener for Opening Documents ---
			yield* _(
				Effect.tryPromise({
					try: () =>
						listen<DocumentOpenPayload>(
							"sky://documents/open",

							(event) => {
								const Payload = event.payload;

								LogService.info(
									`[DocumentManagementService] Received open event for URI: ${Payload.URI}`,
								);

								const Resource = URI.parse(Payload.URI);

								// VS Code's services work best when the text file model is created
								// or retrieved *before* opening the editor. The ITextFileService
								// handles creating the model from the content we received.
								TextFileService.files.createOrGet(
									Resource,

									// encoding
									undefined,

									Payload.LanguageIdentifier,

									Payload.Lines.join(Payload.EOL),
								);

								// Now, use the IEditorService to open the editor for the resource.
								// The service will find the existing model we just created.
								EditorService.openEditor({
									resource: Resource,

									options: {
										// Keep the editor tab open
										pinned: true,
									},
								});
							},
						),

					catch: (err) =>
						new Error(`Setup failed for 'open' listener: ${err}`),
				}),

				Effect.catchAll((err) =>
					Effect.sync(() => LogService.error(err.message)),
				),
			);

			// --- Listener for Saving Documents ---
			yield* _(
				Effect.tryPromise({
					try: () =>
						listen<{ uri: string }>(
							"sky://documents/saved",

							(event) => {
								const Resource = URI.parse(event.payload.uri);

								LogService.info(
									`[DocumentManagementService] Received saved event for URI: ${Resource.toString()}`,
								);

								// Reverting the model to its saved state effectively removes the dirty indicator.
								TextFileService.revert(Resource);
							},
						),

					catch: (err) =>
						new Error(`Setup failed for 'saved' listener: ${err}`),
				}),

				Effect.catchAll((err) =>
					Effect.sync(() => LogService.error(err.message)),
				),
			);

			// --- Listener for Renaming (Save As) Documents ---
			yield* _(
				Effect.tryPromise({
					try: () =>
						listen<DocumentRenamePayload>(
							"sky://documents/renamed",

							async (event) => {
								const OldResource = URI.parse(
									event.payload.oldUri,
								);

								const NewResource = URI.parse(
									event.payload.newUri,
								);

								LogService.info(
									`[DocumentManagementService] Received renamed event: ${OldResource.toString()} -> ${NewResource.toString()}`,
								);

								// The workbench manages editors via `IEditorInput` objects. We need to
								// find the input corresponding to the old URI and replace it with a new one.
								for (const group of EditorGroupsService.groups) {
									const EditorInput = group.editors.find(
										(e) =>
											e.resource?.toString() ===
											OldResource.toString(),
									);

									if (EditorInput) {
										const NewEditorInput =
											await TextFileService.create(
												NewResource,

												undefined,

												undefined,
											);

										group.replaceEditors([
											{
												editor: EditorInput,

												replacement: NewEditorInput,

												options: { pinned: true },
											},
										]);

										// Assume it's only open in one group
										break;
									}
								}
							},
						),

					catch: (err) =>
						new Error(
							`Setup failed for 'renamed' listener: ${err}`,
						),
				}),

				Effect.catchAll((err) =>
					Effect.sync(() => LogService.error(err.message)),
				),
			);
		});

	// The service implementation.
	const Service: DocumentManagementService = {
		initialize,
	};

	return Service;
});

export default Definition;
