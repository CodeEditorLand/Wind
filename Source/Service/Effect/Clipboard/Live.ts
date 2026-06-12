1|/**
2| * @module Effect/Clipboard/Live
3| * @description
4| * Live layer for the Clipboard service using the browser's Clipboard API.
5| * @see {@link Effect/Clipboard/Implementation/BrowserClipboard} Implementation
6| * @category Layer
7| */
8|
10|
11|import { LiveBrowserClipboardService } from "./Implementation/BrowserClipboard.js";

12|import { ClipboardServiceTag } from "./Tag/ClipboardServiceTag.js";

13|
14|// ============================================================================
15|// Live Layer
16|// ============================================================================
17|
18|/**
19| * Live clipboard service layer
20| * Uses the browser's Clipboard API
21| */
22|export const LiveClipboardServiceLayer = Layer.succeed(
23|	ClipboardServiceTag,

24|
25|	LiveBrowserClipboardService,

26|);

27|
28|export default LiveClipboardServiceLayer;

29|
