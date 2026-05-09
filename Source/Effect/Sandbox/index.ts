/**
 * @module Effect/Sandbox
 * @description
 * Main re-export module for Sandbox service.
 * Provides all exports for backward compatibility with existing imports.
 *
 * @see {@link Effect/Sandbox/Interface/SandboxService} Service interface
 * @see {@link Effect/Sandbox/Layer/SandboxLive} Live layer
 * @see {@link Effect/Sandbox/Layer/SandboxMock} Mock layer
 * @category Re-export
 */

// Service interface
export type { SandboxService } from "./Interface/SandboxService.js";

// Tag
export { Sandbox, default as SandboxTag } from "./Tag/SandboxTag.js";

// Layers
export { default as SandboxLive } from "./Layer/SandboxLive.js";

export { default as SandboxMockLive } from "./Layer/SandboxMock.js";
