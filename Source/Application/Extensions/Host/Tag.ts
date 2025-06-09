/*
 * File: Wind/Source/Application/Extensions/Host/Tag.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 08:56:51 UTC
 * Dependency: ./Error/HostProblem.js, effect, vs/platform/extensions/common/extensionHostStarter.js
 * Export: Interface, RunningHost
 */

// Source/Application/Extensions/Host/Tag.ts
import { Context, Effect, Scope, Stream } from "effect";
import type { IExtensionHostProcessOptions } from "vs/platform/extensions/common/extensionHostStarter.js";

import type { HostProblem } from "./Error/HostProblem.js";

// This interface represents a LIVE, running extension host process.
// Its lifecycle is tied to a Scope. When the scope is closed, the process is killed.
export interface RunningHost {
	readonly id: string;
	readonly pid: number;

	// Process communication channels are modeled as Streams.
	readonly stdout: Stream.Stream<string, HostProblem>;
	readonly stderr: Stream.Stream<string, HostProblem>;
	readonly messages: Stream.Stream<any, HostProblem>;
	readonly onExit: Effect.Effect<
		{ code: number; signal: string },
		HostProblem
	>;

	// Actions on the running host
	enableInspectPort(): Effect.Effect<boolean, HostProblem>;
}

export interface Interface {
	readonly _serviceBrand: undefined;

	// The core change: instead of separate `create` and `start` methods,
	// we have a single method that returns a "scoped" Effect.
	// The `Effect<RunningHost, HostProblem, Scope>` means:
	// "An effect that, when run, will provide a `RunningHost`.
	// This host is a resource that depends on a `Scope`, and will be
	// automatically terminated when that Scope is closed."
	start(
		options: IExtensionHostProcessOptions,
	): Effect.Effect<RunningHost, HostProblem, Scope.Scope>;
}

const ExtensionHostStarterTag = Context.Tag<Interface>(
	"vscode/ExtensionHostStarter",
);

export default ExtensionHostStarterTag;
