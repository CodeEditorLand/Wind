// Integration/Tauri.ts
// Purpose: Main aggregator for the Integration/Tauri module.

// Core VSCode Types & Context (re-exported for convenience)
// Exports UriConstructor, Uri type, Scheme, FileFilter etc.
export * from "../Platform/VSCode/Type.js";

// Exports HostServiceTag (as Host) & PerformHostAction interface
export * from "../Platform/VSCode/Provide.js";

// Tauri Specific Types (from Integration/Tauri/Types.ts aggregator)
export * from "./Tauri/Type.js";

// Errors (from Integration/Tauri/Errors.ts aggregator)
export * from "./Tauri/Error.js";

// Wrapped Effects for Tauri & Host APIs (from Integration/Tauri/Wrappers.ts aggregator)
export * from "./Tauri/Wrapper.js";

// Pure Converters (from Integration/Tauri/Converters.ts aggregator)
export * from "./Tauri/Converter.js";

// Pure URI Object Factories (from Integration/Tauri/Definitions.ts aggregator)
export * from "./Tauri/Definition.js";

// Composed Effects for Resolving Paths (from Integration/Tauri/Resolvers.ts aggregator)
export * from "./Tauri/Resolver.js";
