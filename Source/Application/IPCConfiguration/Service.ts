/**
 * @module Service (Application/IPCConfiguration)
 * @description Stub service definition for IPC Configuration.
 * This file is a stub created to resolve dependencies.
 */

import { Effect } from "effect";

/**
 * The contract for the IPCConfiguration service.
 */
export interface IPCConfiguration {
	readonly MountainAddress: string;
}

/**
 * The `Effect.Service` for the IPCConfiguration service.
 */
export class IPCConfigurationService extends Effect.Service<IPCConfiguration>()(
	"Service/IPCConfiguration",
	{
		sync: () => ({
			MountainAddress: "localhost:50051",
		}),
	},
) {}
