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
declare const IPCConfigurationService_base: Effect.Service.Class<
	IPCConfiguration,
	"Service/IPCConfiguration",
	{
		readonly sync: () => {
			MountainAddress: string;
		};
	}
>;
/**
 * The `Effect.Service` for the IPCConfiguration service.
 */
export declare class IPCConfigurationService extends IPCConfigurationService_base {}
export {};
