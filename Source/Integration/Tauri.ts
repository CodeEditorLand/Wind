// Integration/Tauri.ts
// Purpose: Main aggregator for the Integration/Tauri module.

// Core VSCode Types (re-exported for convenience)
export {
	Uri,
	type UriType,
	Scheme as VsCodeScheme,
	type FileFilter as VsCodeFileFilter,
} from "../Platform/VSCode/Types.js";
export type {
	WindowOption,
	FolderOpenSpecification,
	FileOpenSpecification,
	WorkspaceOpenSpecification,
} from "../Platform/VSCode/Types.js";

// Tauri Specific Types (from Integration/Tauri/Types.ts aggregator)
export * from "./Tauri/Types.js";

// Errors (from Integration/Tauri/Errors.ts aggregator)
export * from "./Tauri/Errors.js";

// Context Tags (from Platform/VSCode/Provide.ts aggregator for VSCode services)
export {
	HostService as ProvideHost,
	type PerformHostAction,
} from "../Platform/VSCode/Provide.js";

// Wrapped Effects for Tauri & Host APIs (from Integration/Tauri/Wrappers.ts aggregator)
export * from "./Tauri/Wrappers.js";

// Pure Converters (from Integration/Tauri/Converters.ts aggregator)
export * from "./Tauri/Converters.js";

// Pure URI Object Factories (from Integration/Tauri/Definitions.ts aggregator)
export * from "./Tauri/Definitions.js";

// Composed Effects for Resolving Paths (from Integration/Tauri/Resolvers.ts aggregator)
export * from "./Tauri/Resolvers.js";
