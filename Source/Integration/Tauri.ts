// Integration/Tauri.ts
// Purpose: Main aggregator for the Integration/Tauri module.

// Core VSCode Types & Context (re-exported for convenience)
// Exports UriConstructor, Uri type, Scheme, FileFilter etc.
export * from "../Platform/VSCode/Type.js";

// Exports HostServiceTag (as Host) & PerformHostAction interface
export * from "../Platform/VSCode/Provide.js";

// Tauri Specific Types (from Integration/Tauri/Type.ts aggregator)
export * from "./Tauri/Type.js";

// Errors (from Integration/Tauri/Error.ts aggregator)
export * from "./Tauri/Error.js";

// Wrapped Effect for Tauri & Host APIs (from Integration/Tauri/Wrapper.ts aggregator)
export * from "./Tauri/Wrapper.js";

// Pure Converters (from Integration/Tauri/Converter.ts aggregator)
export * from "./Tauri/Converter.js";

// Pure URI Object Factories (from Integration/Tauri/Definition.ts aggregator)
export * from "./Tauri/Definition.js";

// Composed Effect for Resolving Paths (from Integration/Tauri/Resolver.ts aggregator)
export * from "./Tauri/Resolver.js";
