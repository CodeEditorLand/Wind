// Platform/VSCode/Type/Uri.ts
// Purpose: Defines and exports the VSCode URI type and class.

import { URI as VsCodeUriDefinition } from "vs/base/common/uri";

/**
 * @module Uri
 * @description Represents a Uniform Resource Identifier (URI) as defined by VSCode.
 */
export type Uri = VsCodeUriDefinition;
/**
 * @description The VSCode URI class, providing static methods like URI.file().
 */
const UriConstructor = VsCodeUriDefinition;
export default UriConstructor;
