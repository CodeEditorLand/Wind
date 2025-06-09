/*
 * File: Wind/Source/Application/Host/Orchestrate/OpenWindow.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:37 UTC
 * Dependency: ../../../Integration/Tauri.js, ../Factory/CreateWindowUrl.js, ../Type.js, @tauri-apps/api/window, effect
 */

import { WebviewWindow } from "@tauri-apps/api/window";
import { Effect, pipe } from "effect";

import { RequestHostWindowOpen } from "../../../Integration/Tauri.js";
import type {
	FileOpenSpecification,
	FolderOpenSpecification,
	WindowOpenOption,
	WorkspaceOpenSpecification,
} from "../../../Platform/VSCode/Type.js";
import CreateWindowUrl from "../Factory/CreateWindowUrl.js";
import type { HostProblem } from "../Type.js";

const Orchestrate = (
	TargetList: ReadonlyArray<
		| FolderOpenSpecification
		| FileOpenSpecification
		| WorkspaceOpenSpecification
	>,
	MaybeWindowOption?: WindowOpenOption,
): Effect.Effect<void, HostProblem> => {
	return pipe(
		Effect.succeed(CreateWindowUrl(TargetList)),
		Effect.flatMap((Url) =>
			Effect.tryPromise({
				try: () => {
					// The label must be unique, so we generate one.
					const UniqueLabel = `window_${Date.now()}`;
					const NewWebview = new WebviewWindow(UniqueLabel, {
						url: Url,
						title: "Land", // Default title, VSCode will likely set its own.
						width: 1024,
						height: 768,
					});
					return NewWebview.once("tauri://created", () => {
						// Optional: perform actions after window is created
					});
				},
				catch: (cause) =>
					new HostProblem({
						cause,
						operation: "createWebviewWindow",
					}),
			}),
		),
		Effect.asVoid,
	);
};

export default Orchestrate;
