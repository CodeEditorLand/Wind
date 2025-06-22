/*
 * File: Wind/Source/Integration/Tauri/Definition.ts
 * Role: Provides the live implementation of the Tauri Integration service.
 * Responsibilities:
 *   - Wrap the raw functions from the `@tauri-apps/api` package in `Effect`s.
 *   - Abstract the underlying IPC mechanism (Tauri) from the rest of the application.
 *   - Provide a safe, typed, and composable interface for backend communication.
 */

import {
	emit as TauriEmit,
	listen as TauriListen,
	type Event as TauriEvent,
} from "@tauri-apps/api/event";
import { invoke as TauriInvoke } from "@tauri-apps/api/tauri";
import { Effect } from "effect";

import type { Interface as TauriIntegrationServiceInterface } from "./Service.js";

/**
 * An Effect that builds the live implementation of the TauriIntegrationService.
 * This service directly wraps the functions from the `@tauri-apps/api` package,

 * making them safe and composable within the Effect-TS ecosystem.
 */
const Definition = Effect.sync(
	(): TauriIntegrationServiceInterface => ({
		Invoke: <T>(Command: string, Arguments?: any) =>
			Effect.tryPromise({
				try: () => TauriInvoke<T>(Command, Arguments),

				catch: (Error: unknown) => Error as Error,
			}),

		Listen: <T>(
			EventName: string,

			Handler: (Event: TauriEvent<T>) => void,
		) =>
			Effect.tryPromise({
				try: () => TauriListen<T>(EventName, Handler),

				catch: (Error: unknown) => Error as Error,
			}),

		Emit: (EventName: string, Payload?: any) =>
			Effect.tryPromise({
				try: () => TauriEmit(EventName, Payload),

				catch: (Error: unknown) => Error as Error,
			}),
	}),
);

export default Definition;
