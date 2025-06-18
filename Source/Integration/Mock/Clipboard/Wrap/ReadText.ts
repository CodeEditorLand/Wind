/*
 * File: Wind/Source/Integration/Mock/Clipboard/Wrap/ReadText.ts
 * Responsibility: Implements a Tauri command in the Mountain backend to read text files with optional size limits using the River filesystem library, providing file content to the Sky frontend while enforcing safety constraints.
 * Modified: 2025-06-09 15:50:37 UTC
 * Dependency: effect
 * Export: MockReadText
 */

/**
 * @module MockReadText (Clipboard Wrapper)
 * @description A mock Effect for reading text from the clipboard.
 */

import { Effect } from "effect";

/**
 * A mock implementation of the `ReadText` integration effect.
 * Instead of calling a Tauri API, it immediately returns a successful Effect
 * with a hardcoded string.
 */
export const MockReadText = () => Effect.succeed("mock clipboard text");
