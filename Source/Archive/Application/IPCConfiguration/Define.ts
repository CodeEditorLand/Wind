/**
 * @module Define
 * @description
 * This module defines the service for providing the configuration required for
 * Inter-Process Communication (IPC). It decouples the IPC implementation from
 * its static configuration, such as network addresses.
 */

import { Effect } from "effect";

/**
 * The contract for the IPCConfiguration service. It specifies all the static
 * configuration values needed to establish an IPC connection.
 */
export interface Interface {
	/**
	 * The network address of the `Mountain` (gRPC) backend server.
	 * e.g., "localhost:50051"
	 */
	readonly MountainAddress: string;
}

/**
 * The `Effect.Service` for the IPCConfiguration service.
 *
 * This service provides a static, synchronous implementation that returns a
 * default address for the `Mountain` backend.
 */
export class IPCConfigurationService extends Effect.Service<Interface>()(
	"Service/IPCConfiguration",
	{
		sync: () => ({
			MountainAddress: "localhost:50051",
		}),
	},
) {}
