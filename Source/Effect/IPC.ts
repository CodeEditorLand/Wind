// Layers - import from index
import {
	IPCElectronLive,
	default as IPCTauriLiveLayer,
	MockIPCLive,
} from "./IPC/index.js";

/**
 * @module Effect/IPC
 * @description
 * Atomic IPC service using Effect-TS.
 * Wraps Tauri IPC with typed effects and streams.
 *
 * @category Service
 */

// ============================================================================
// Re-exports from atomic modules
// ============================================================================

// Error types for backward compatibility
export class IPCInvokeError extends Error {

	readonly _tag = "IPCInvokeError";

	readonly _channel: string;

	readonly _cause: unknown;

	constructor(channel: string, cause: unknown) {
		super(`IPC invoke failed on channel '${channel}': ${String(cause)}`);

		this._channel = channel;

		this._cause = cause;

		Object.setPrototypeOf(this, IPCInvokeError.prototype);
	}

	override get name() {
		return "IPCInvokeError";
	}

	get channel() {
		return this._channel;
	}

	override get cause() {
		return this._cause;
	}
}

export class IPCSendError extends Error {

	readonly _tag = "IPCSendError";

	readonly _channel: string;

	readonly _cause: unknown;

	constructor(channel: string, cause: unknown) {
		super(`IPC send failed on channel '${channel}': ${String(cause)}`);

		this._channel = channel;

		this._cause = cause;

		Object.setPrototypeOf(this, IPCSendError.prototype);
	}

	override get name() {
		return "IPCSendError";
	}

	get channel() {
		return this._channel;
	}

	override get cause() {
		return this._cause;
	}
}

export class IPCSubscriptionError extends Error {

	readonly _tag = "IPCSubscriptionError";

	readonly _channel: string;

	readonly _cause: unknown;

	constructor(channel: string, cause: unknown) {
		super(
			`IPC subscription failed on channel '${channel}': ${String(cause)}`,
		);

		this._channel = channel;

		this._cause = cause;

		Object.setPrototypeOf(this, IPCSubscriptionError.prototype);
	}

	override get name() {
		return "IPCSubscriptionError";
	}

	get channel() {
		return this._channel;
	}

	override get cause() {
		return this._cause;
	}
}

// Service interface
export type { IPCService } from "./IPC/Interface/IPCService.js";

// Tag
export { IPCTag, IPC } from "./IPC/Tag/IPCTag.js";

// Implementations
export { TauriIPCLive } from "./IPC/Implementation/TauriIPC.js";

export { IPCTauriLiveLayer, IPCElectronLive, MockIPCLive };

// Backward compatibility - export as IPCTauriLive
export { IPCTauriLiveLayer as IPCTauriLive };

export { MockIPCLive as IPCMockLive };
