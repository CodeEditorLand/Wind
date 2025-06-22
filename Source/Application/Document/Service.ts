/*
 * File: Wind/Source/Application/Document/Service.ts
 * Role: Defines the service interface and Context.Tag for the DocumentManagementService.
 * Responsibilities:
 *   - Declare the contract for the client-side DocumentManagementService, which
 *     is responsible for listening to backend events and driving the editor UI.
 */

import { Context, type Effect } from "effect";

/**
 * The Context.Tag for the DocumentManagementService. Its primary job is to
 * listen to backend events and orchestrate other services. We define a simple
 * `Initialize` method to kick off the event listeners.
 */
export class DocumentManagementService extends Context.Tag(
	"Wind/DocumentManagementService",
)<
	DocumentManagementService,
	{
		readonly Initialize: () => Effect.Effect<void, never>;
	}
>() {}
