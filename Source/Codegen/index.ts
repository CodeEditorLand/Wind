/**
 * @module Codegen
 * @description
 * Public surface of the Wind codegen pipeline. Reads VS Code's
 * `src/vs/**.ts` source tree, extracts every `createDecorator(...)`
 * call site, and emits typed Wind-side schemas grounded in upstream
 * verbatim. The Wind-authored bridge shapes (`<Service>BridgeShape.
 * ts`) `import type` from these generated schemas so any upstream
 * API drift surfaces as a TypeScript build error.
 *
 * Top-level entry: `RunCodegen({ SourceRoot, OutputRoot })`. The
 * `Codegen.ts` script is the runnable shell `prepublishOnly.sh`
 * invokes; library callers (e.g. tests, IDE tooling) prefer
 * `RunCodegen` directly so they can pass an in-memory `Log`
 * callback.
 * @category Public
 */

export { RunCodegen } from "./RunCodegen.js";
export type { RunCodegenOptions, RunCodegenSummary } from "./RunCodegen.js";

export { WalkSourceTree } from "./Walk/SourceTreeWalker.js";
export type {
	SourceFile,
	SourceTreeWalkerOptions,
} from "./Walk/SourceTreeWalker.js";

export { ExtractDecoratorMatches } from "./Extract/ExtractDecoratorMatch.js";
export type { DecoratorMatch } from "./Extract/ExtractDecoratorMatch.js";

export { ExtractInterfaceMembers } from "./Extract/ExtractInterfaceMembers.js";

export { IterateServiceDecorators } from "./Extract/IterateServiceDecorators.js";

export { EmitServiceSchema } from "./Emit/EmitServiceSchema.js";
export type {
	EmitServiceSchemaOptions,
	EmitServiceSchemaOutcome,
} from "./Emit/EmitServiceSchema.js";

export { EmitServiceCatalog } from "./Emit/EmitServiceCatalog.js";
export type {
	EmitServiceCatalogOptions,
	EmitServiceCatalogOutcome,
	ServiceCatalogEntryEmit,
} from "./Emit/EmitServiceCatalog.js";

export { EmitBridgeShape } from "./Emit/EmitBridgeShape.js";
export type {
	EmitBridgeShapeOptions,
	EmitBridgeShapeOutcome,
} from "./Emit/EmitBridgeShape.js";

export { EmitBridgeShapeBatch } from "./Emit/EmitBridgeShapeBatch.js";
export type {
	BridgeShapeManifestEntry,
	EmitBridgeShapeBatchOptions,
	EmitBridgeShapeBatchSummary,
} from "./Emit/EmitBridgeShapeBatch.js";

export { ResolveInterfaceCrossFile } from "./Resolve/ResolveInterfaceCrossFile.js";
export type {
	ResolveOptions,
	ResolveOutcome,
} from "./Resolve/ResolveInterfaceCrossFile.js";

export { WorkbenchBridgeShapeManifest } from "./Manifest/WorkbenchBridgeShapeManifest.js";

export type { CodegenProblem } from "./Type/CodegenProblem.js";
export type { ServiceDecoratorRecord } from "./Type/ServiceDecoratorRecord.js";
export type {
	InterfaceMemberKind,
	InterfaceMemberParameter,
	InterfaceMemberRecord,
} from "./Type/InterfaceMemberRecord.js";
