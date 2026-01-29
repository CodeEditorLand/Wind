/**
 * @module Application/MockIntegrationLayer
 * @description
 * Mock integration layer for testing clipboard service.
 */

import * as Layer from "effect/Layer";
import { MockClipboardServiceLayer } from "./Clipboard.js";

/**
 * Mock integration layer for testing
 */
export const MockIntegrationLayer = MockClipboardServiceLayer;
