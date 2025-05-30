// Integration/Tauri.ts
// Purpose: Main aggregator for the Integration/Tauri module.

// Core VSCode Types & Context (re-exported for convenience)
export * from "../../Platform/VSCode/Types.js"; // Exports UriConstructor, Uri type, Scheme, FileFilter etc.
export * from "../../Platform/VSCode/Provide.js"; // Exports HostServiceTag (as Host) & PerformHostAction interface

// Tauri Specific Types (from Integration/Tauri/Types.ts aggregator)
export * from "./Tauri/Types.js";

// Errors (from Integration/Tauri/Errors.ts aggregator)
export * from "./Tauri/Errors.js";

// Wrapped Effects for Tauri & Host APIs (from Integration/Tauri/Wrappers.ts aggregator)
export * from "./Tauri/Wrappers.js";

// Pure Converters (from Integration/Tauri/Converters.ts aggregator)
export * from "./Tauri/Converters.js";

// Pure URI Object Factories (from Integration/Tauri/Definitions.ts aggregator)
export * from "./Tauri/Definitions.js";

// Composed Effects for Resolving Paths (from Integration/Tauri/Resolvers.ts aggregator)
export * from "./Tauri/Resolvers.js";
