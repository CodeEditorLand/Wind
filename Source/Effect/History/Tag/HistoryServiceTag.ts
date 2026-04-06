import { Context } from "effect";

import type { HistoryService } from "../Interface/HistoryService.js";

export class HistoryServiceTag extends Context.Tag(
	"Application/HistoryService",
)<HistoryServiceTag, HistoryService>() {}

export const History = HistoryServiceTag;

export default HistoryServiceTag;
