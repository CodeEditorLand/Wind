/*
 * File: Wind/Source/UI/Component/FileExplorer/FileExplorerComponent.ts
 * Responsibility: Implements the reactive file explorer UI component in the Sky frontend using Signia signals and the FileService to fetch and display directory contents from the Mountain backend via the Echo API.
 * Modified: 2025-06-09 15:50:34 UTC
 * Dependency: ../../../Application/File/mod.js, ../../../Platform/VSCode/Type.js, @signia/core, effect
 * Export: FileExplorerComponent
 */

/**
 * @module FileExplorerComponent
 * @description A reactive UI component for displaying the contents of a directory,
 * built using the Signia signals library and our Effect-based services.
 */

import { computed, effect, signal, type TlVn } from "@signia/core";
import { Effect, Stream } from "effect";

import { FileService, type FileEntry } from "../../../Application/File/mod.js";
import type { Uri } from "../../../Platform/VSCode/Type.js";

// A type alias for the disposer function returned by a Signia effect.
type Unsubscriber = () => void;

export class FileExplorerComponent {
	// --- State Signals ---
	// These signals hold the reactive state of our component.
	public readonly Entries = signal<readonly FileEntry[]>(
		"FileExplorer.Entries",
		[],
	);
	public readonly IsLoading = signal<boolean>("FileExplorer.IsLoading", true);
	public readonly Error = signal<string | null>("FileExplorer.Error", null);

	private lastVn: TlVn | undefined = undefined;

	// --- Computed HTML Signal ---
	// This signal automatically re-calculates its value (the HTML string)
	// whenever any of its dependencies (`IsLoading`, `Error`, `Entries`) change.
	public readonly RenderedHtml = computed<string>(
		"FileExplorer.RenderedHtml",
		() => {
			if (this.IsLoading.value) {
				return `<div>Loading...</div>`;
			}
			if (this.Error.value) {
				return `<div class="error-panel">Error: ${this.Error.value}</div>`;
			}
			const listItems = this.Entries.value
				.map(
					(entry) =>
						`<li>
             <span class="icon">${entry.IsDirectory ? "📁" : "📄"}</span>
             <span class="name">${entry.Name}</span>
           </li>`,
				)
				.join("");
			return `<div class="file-explorer"><ul>${listItems}</ul></div>`;
		},
	);

	constructor(
		private readonly DirectoryUri: Uri,
		private readonly FileServiceInstance: FileService.Interface,
	) {}

	/**
	 * Mounts the component to a DOM element and starts its reactive lifecycle.
	 * @param DomElement - The HTML element to render the component into.
	 * @returns An `Unsubscriber` function to tear down the component.
	 */
	public Mount(DomElement: HTMLElement): Unsubscriber {
		// Start the Effect workflow to fetch data and populate the signals.
		this.runStreamEffect();

		// The `effect` from Signia subscribes to `RenderedHtml`. It will re-run
		// its callback whenever the HTML changes, updating the real DOM.
		const unsubscriber = effect("RenderFileExplorer", () => {
			// Signia can optionally perform DOM diffing if you provide the previous virtual node.
			// For simplicity, we use innerHTML here.
			DomElement.innerHTML = this.RenderedHtml.value;
			this.lastVn = this.RenderedHtml.value; // Storing the "value" as a proxy for the virtual node.
		});

		return unsubscriber;
	}

	private runStreamEffect(): void {
		// 1. Get the stream of file entries from our application service.
		const fileStream = this.FileServiceInstance.list(this.DirectoryUri);

		// 2. Define the Effect workflow to consume the stream.
		const streamEffect = Stream.forEach(fileStream, (entry) =>
			Effect.sync(() => {
				// 3. Append the new entry and update the signal to trigger re-rendering.
				this.Entries.set([...this.Entries.value, entry]);
			}),
		).pipe(
			// 4. When the stream is done, set the loading state to false.
			Effect.andThen(() => this.IsLoading.set(false)),
			// 5. If any error occurs in the stream, set the error state.
			Effect.catchAll((e) =>
				Effect.sync(() => this.Error.set(e.message)),
			),
		);

		// 6. Fork the effect to run it in the background.
		Effect.runFork(streamEffect);
	}
}
