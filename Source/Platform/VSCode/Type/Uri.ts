// Platform/VSCode/Type/Uri.ts
// Purpose: Defines and exports the VSCode URI type and class.

import { URI as VsCodeUriDefinition } from "vs/base/common/uri";

/**
 * @module Uri (File name provides context)
 * @description Represents a Uniform Resource Identifier (URI) as defined by VSCode.
 */
export type Type = VsCodeUriDefinition; // Type alias for instance type

/**
 * @description The VSCode URI class constructor and its static methods.
 */
const Constructor = VsCodeUriDefinition; // Value (the class itself)
export default Constructor;
