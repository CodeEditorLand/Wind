1|/**
2| * @module Effect/Clipboard/Tag/ClipboardServiceTag
3| * @description
4| * Service tag for dependency injection of the Clipboard service.
5| * @see {@link Effect/Clipboard/Interface/ClipboardService} Service interface
6| * @see {@link Effect/Clipboard/Implementation/ClipboardImplementation} Implementation
7| * @category Tag
8| */
9|
11|
12|import type { ClipboardService } from "../Interface/ClipboardService.js";
13|
14|// ============================================================================
15|// Service Tag
16|// ============================================================================
17|
18|/**
19| * Clipboard service tag for dependency injection
20| */
21|export class ClipboardServiceTag extends Context.Tag(
22|	"Application/ClipboardService",
23|)<ClipboardServiceTag, ClipboardService>() {}
24|
25|/**
26| * Alias for the Clipboard service tag
27| */
28|export const Clipboard = ClipboardServiceTag;
29|
30|export default ClipboardServiceTag;
31|
