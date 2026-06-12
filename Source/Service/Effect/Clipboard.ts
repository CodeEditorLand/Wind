1|// Layers - import and re-export both layers
2|import { LiveClipboardServiceLayer as LiveLayer } from "./Clipboard/Live.js";

3|import { MockClipboardServiceLayer as MockLayer } from "./Clipboard/Mock.js";

4|
5|/**
6| * @module Application/Clipboard
7| * @description
8| * Clipboard service implementation for Wind project.
9| * Provides read/write operations for clipboard functionality.
10| *
11| * ARCHITECTURE OVERVIEW:
12| * This module provides a comprehensive clipboard service that abstracts the browser's
13| * Clipboard API and integrates with Tauri's native clipboard capabilities when available.
14| * The service follows Effect-TS patterns for type-safe, composable operations.
15| *
16| * RESPONSIBILITIES:
17| * - Read text from clipboard with permission handling
18| * - Write text to clipboard with error recovery
19| * - Graceful degradation when clipboard API is unavailable
20| * - Integration with Tauri's native clipboard for desktop applications
21| * - Comprehensive error handling and categorization
22| * - Performance monitoring for clipboard operations
23| * - Clipboard history tracking (optional feature)
24| *
25| * CONNECTIONS:
26| * - Tauri: Native clipboard integration via @tauri-apps/plugin-clipboard-manager
27| * - Sky: UI integration for clipboard operations
28| * - Cocoon: Extension host clipboard access
29| *
30| * Microsoft VSCode Source References:
31| * - vs/platform/clipboard/common/clipboardService.ts - IClipboardService interface
32| * - vs/platform/clipboard/common/clipboardService.ts - Clipboard operations
33| * - vs/platform/clipboard/browser/clipboardService.ts - Web clipboard implementation
34| *
35| * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
36| * @see {@link Effect/Clipboard/Live} Live implementation
37| * @see {@link Effect/Clipboard/Tag/ClipboardServiceTag} Service tag
38| * @category Service
39| * @example
40| * ```typescript
41| * import Clipboard from "./Service/Clipboard.js";
43| *
44| * const program = Effect.gen(function* () {
45| *   const clipboardService = yield* Clipboard.ClipboardServiceTag;
46| *   yield* clipboardService.writeText("Hello, World!");
47| *   const text = yield* clipboardService.readText();
48| *   return text;
49| * });
50| *
51| * Effect.runPromise(program.pipe(Effect.provide(Clipboard)));
52| * ```
53| */
54|
55|// ============================================================================
56|// Re-exports from atomic modules
57|// ============================================================================
58|
59|// Types
60|export type { ClipboardProblem } from "./Clipboard/Type/ClipboardProblem.js";

61|
62|// Interface
63|export type { ClipboardService } from "./Clipboard/Interface/ClipboardService.js";

64|
65|// Tag
66|export {

67|	ClipboardServiceTag,

68|	Clipboard,

69|} from "./Clipboard/Tag/ClipboardServiceTag.js";

70|
71|// Implementations
72|export { LiveBrowserClipboardService } from "./Clipboard/Implementation/BrowserClipboard.js";

73|
74|export { MockClipboardService } from "./Clipboard/Implementation/MockClipboard.js";

75|
76|export { LiveLayer, MockLayer };

77|
78|// Backward compatibility aliases - match old naming convention
79|export const LiveClipboardServiceLayer = LiveLayer;

80|
81|export const MockClipboardServiceLayer = MockLayer;

82|
83|// Short aliases
84|export const LiveClipboard = LiveLayer;

85|
86|export const MockClipboard = MockLayer;

87|
88|// Error helpers
89|export {

90|	CreateNotAvailableError,

91|	CreateReadError,

92|	CreateWriteError,

93|	CreatePermissionDeniedError,

94|	CreateFormatNotSupportedError,

95|	CreateSizeExceededError,

96|} from "./Clipboard/Implementation/ClipboardHelper.js";

97|
