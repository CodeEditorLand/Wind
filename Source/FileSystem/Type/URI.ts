/**
 * @module FileSystem/Type/URI
 * @description
 * Re-exports the real VS Code URI class from @codeeditorland/output.
 * The hand-written implementation has been removed: fsPath was a method
 * (wrong shape), and methods like with(), toJSON(), revive() were missing.
 */

export { URI } from "@codeeditorland/output/vs/base/common/uri.js";
