/*
 * File: Wind/Source/Platform/VSCode/Type/Uri.ts
 * Responsibility:
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: vs/base/common/uri.js
 * Export: Uri
 */

/**
 * @module Uri (Platform/VSCode/Type)
 * @description Re-exports the canonical `URI` class from VS Code's base library.
 *
 * This file serves as the single source of truth for the URI type throughout the
 * entire Wind application. By ensuring that all modules import `Uri` from this
 * file, we guarantee that there is only one definition of the `URI` class in the
 * runtime. This is critical for:
 *
 * 1.  **Type-checking:** Ensuring that `instanceof Uri` checks work correctly everywhere.
 * 2.  **API Consistency:** Guaranteeing that all URI objects have the same methods
 *     (`.fsPath`, `.with()`, `.toString()`, etc.).
 * 3.  **Centralized Dependency:** Isolating the direct dependency on `vs/base/common/uri.js`
 *     to a single location in our platform layer.
 */

import { URI } from "vs/base/common/uri.js";

/**
 * The canonical `URI` class used throughout the application.
 */
export const Uri = URI;

/**
 * The TypeScript type for the canonical `URI` class.
 */
export type Uri = URI;
