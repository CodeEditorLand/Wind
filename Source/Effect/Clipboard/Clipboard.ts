1|/**
2| * @module Effect/Clipboard
3| * @description
4| * Clipboard service implementation for Wind project.
5| * Provides read/write operations for clipboard functionality with typed effects.
6| *
7| * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
8| * @see {@link Effect/Clipboard/Implementation/BrowserClipboard} Live implementation
9| * @see {@link Effect/Clipboard/Tag/ClipboardServiceTag} Service tag
10| * @category Service
11| * @example
12| * ```typescript
13| * import LiveClipboard from "./Effect/Clipboard/Live.js";
14| * import { Clipboard } from "./Effect/Clipboard/Clipboard.ts";
16| *
17| * const program = Effect.gen(function* () {
18| *   const clipboard = yield* Clipboard;
19| *   yield* clipboard.writeText("Hello, World!");
20| *   const text = yield* clipboard.readText();
21| *   return text;
22| * });
23| *
24| * Effect.runPromise(program.pipe(Effect.provide(LiveClipboard)));
25| * ```
26| */
27|
28|// ============================================================================
29|// Re-exports from atomic modules
30|// ============================================================================
31|
32|// Types
33|export type { ClipboardProblem } from "./Type/ClipboardProblem.js";
34|
35|// Interface
36|export type { ClipboardService } from "./Interface/ClipboardService.js";
37|
38|// Tag
39|export { ClipboardServiceTag, Clipboard } from "./Tag/ClipboardServiceTag.js";
40|
41|// Implementations
42|export { LiveBrowserClipboardService } from "./Implementation/BrowserClipboard.js";
43|
44|export { MockClipboardService } from "./Implementation/MockClipboard.js";
45|
46|// Helpers
47|export {
48|	CreateNotAvailableError,
49|	CreateReadError,
50|	CreateWriteError,
51|	CreatePermissionDeniedError,
52|	CreateFormatNotSupportedError,
53|	CreateSizeExceededError,
54|} from "./Implementation/ClipboardHelper.js";
55|
56|// Layers
57|export { default as LiveClipboardServiceLayer } from "./Live.js";
58|
59|export { default as MockClipboardServiceLayer } from "./Mock.js";
60|
