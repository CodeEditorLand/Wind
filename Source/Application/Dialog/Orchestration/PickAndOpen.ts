/*
 * File: Wind/Source/Application/Dialog/Orchestration/PickAndOpen.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:44 UTC
 * Dependency: ../../../Application/Host.js, ../Factory.js, ../Type.js, effect, vs/platform/dialogs/common/dialogs
 */

import { Effect, Option, pipe } from "effect";
import type { IPickAndOpenOptions as VsCodePickOptions } from "vs/platform/dialogs/common/dialogs";

import { type Host as HostServiceRequirement } from "../../../Application/Host.js";
import {
	ConvertOpenResultToSingleUri,
	DefineFileOpen,
	DefineFolderOpen,
	DefineWorkspaceOpen,
	RequestHostWindowOpen,
	RequestOpenDialog,
	ResolveFinalDefaultPath,
	type Uri,
} from "../../../Integration/Tauri.js";
import { CreatePickOpenOption, CreateWindowOption } from "../Factory.js";
import type { PickProblem } from "../Type.js";

type ItemType = "file" | "folder" | "workspace" | "fileOrFolder";

const GetDialogConfig = (
	ItemType: ItemType,
): {
	titleKey: string;
	defaultTitle: string;
	tauriDirectory: boolean;
	defaultWorkspaceFilter?: boolean;
} => {
	switch (ItemType) {
		case "file":
			return {
				titleKey: "openFileDefaultTitle",
				defaultTitle: "Open File",
				tauriDirectory: false,
			};
		case "folder":
			return {
				titleKey: "openFolderDefaultTitle",
				defaultTitle: "Open Folder",
				tauriDirectory: true,
			};
		case "workspace":
			return {
				titleKey: "openWorkspaceDefaultTitle",
				defaultTitle: "Open Workspace",
				tauriDirectory: false,
				defaultWorkspaceFilter: true,
			};
		case "fileOrFolder":
			return {
				titleKey: "openFileOrFolderDefaultTitle",
				defaultTitle: "Open File or Folder",
				tauriDirectory: true, // Allow selecting folders, files will also be visible
			};
	}
};

const Orchestrate = (
	Options: VsCodePickOptions,
	ItemType: ItemType,
): Effect.Effect<void, PickProblem, HostServiceRequirement> => {
	const DialogConfig = GetDialogConfig(ItemType);

	return pipe(
		ResolveFinalDefaultPath(Options.defaultUri),
		Effect.map((DefaultPath) =>
			CreatePickOpenOption(Options, DialogConfig, DefaultPath),
		),
		Effect.flatMap((TauriOptions) => RequestOpenDialog(TauriOptions)),
		Effect.map(ConvertOpenResultToSingleUri),
		Effect.flatMap((MaybeUri: Option.Option<Uri>) =>
			Option.match(MaybeUri, {
				onNone: () => Effect.void,
				onSome: (SelectedUri: Uri) => {
					// TODO: Need access to FileService to check if the URI is a directory.
					// For now, we assume folder if the dialog allowed it.
					const TargetToOpen =
						ItemType === "folder" ||
						(ItemType === "fileOrFolder" &&
							SelectedUri.path.endsWith("/")) // Heuristic
							? DefineFolderOpen(SelectedUri)
							: ItemType === "workspace"
								? DefineWorkspaceOpen(SelectedUri)
								: DefineFileOpen(SelectedUri);

					return RequestHostWindowOpen(
						[TargetToOpen],
						CreateWindowOption(Options),
					);
				},
			}),
		),
	);
};

export default Orchestrate;
