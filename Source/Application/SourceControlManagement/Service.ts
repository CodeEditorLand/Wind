/*
 * File: Wind/Source/Application/Scm/Service.ts
 * Role: Defines the service interface and Context.Tag for the SourceControlManagement service.
 * Responsibilities:
 *   - Provide a `Context.Tag` that can be used to request the `ISCMService`
 *     from the dependency injection container.
 */

import { Context } from "effect";
import type { ISCMService } from "vs/workbench/contrib/scm/common/scm.js";

/**
 * The service interface for the SCM service.
 * This is an alias for VS Code's `ISCMService` for API compatibility.
 */
export type Interface = ISCMService;

/**
 * The Context.Tag for the SCM service, using the canonical
 * VS Code identifier for service lookups.
 */
export const Tag = Context.Tag<Interface>(
	"scmService",
) as Context.Tag<ISCMService>;
