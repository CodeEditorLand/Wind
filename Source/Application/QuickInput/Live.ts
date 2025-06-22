/*
 * File: Wind/Source/Application/QuickInput/Live.ts
 * Role: Provides the "live" implementation of the `IQuickInputService` as a Layer.
 * Responsibilities:
 *   - Create an Effect-TS `Layer` that maps the `IQuickInputService` tag to its
 *     live `Definition`.
 *   - Declare the context requirements (other services) needed by the definition.
 */

import { Layer } from "effect";
import { IInstantiationService } from "vs/platform/instantiation/common/instantiation.js";
import { INotificationService } from "vs/platform/notification/common/notification.js";

import { HostService } from "../Host/mod.js";
import { Definition } from "./Definition.js";
import { Tag } from "./Service.js";

/**
 * The live implementation Layer for the QuickInput service.
 * It has context requirements for the services needed by its definition.
 */
const Live: Layer.Layer<
	import("./Service.js").Interface,
	never,
	IInstantiationService | HostService.Interface | INotificationService
> = Layer.effect(Tag, Definition);

export default Live;
