/**
 * @module Bootstrap/Types/VSCode/Interface/VSCodeWorkbenchOptions
 * @description
 * Workbench construction options - aliased from VS Code's authoritative
 * IWorkbenchConstructionOptions in @codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/browser/web.api.js.
 *
 * The previous hand-written re-implementation missed 30+ fields from the real
 * 668-line web.api.d.ts. Sky passes these options directly to the workbench
 * create() function, so the shape must be exact.
 */

import type { IWorkbenchConstructionOptions } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/workbench/browser/web.api.js";

/**
 * Alias of IWorkbenchConstructionOptions for Wind consumers.
 * Use IWorkbenchConstructionOptions directly for new code.
 */
export type IVSCodeWorkbenchOptions = IWorkbenchConstructionOptions;
