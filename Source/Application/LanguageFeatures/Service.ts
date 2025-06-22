/*
 * File: Wind/Source/Application/LanguageFeatures/Service.ts
 * Role: Defines the service interface and Context.Tag for the client-side LanguageFeaturesService.
 * Responsibilities:
 *   - Declare the contract for the service that bridges Monaco Editor's language APIs
 *     to the Mountain backend.
 */

import { Context, type Effect } from "effect";

/**
 * The Context.Tag for the LanguageFeaturesService. Its primary job is to
 * initialize the bridge between the Monaco editor's provider registries and the
 * Mountain backend.
 */
export class LanguageFeaturesService extends Context.Tag(
	"Wind/LanguageFeaturesService",
)<
	LanguageFeaturesService,
	{
		/**
		 * Initializes the service, registering all necessary language feature providers
		 * with the Monaco Editor. This method must be called once at application startup.
		 */
		readonly Initialize: () => Effect.Effect<void, never>;
	}
>() {}
