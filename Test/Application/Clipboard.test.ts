/**
 * @description Unit test for the Clipboard Application Service.
 * This test uses the MockIntegrationLayer to run the service in complete isolation.
 */

import { Effect, Layer, Runtime } from "effect";
// Using vitest as an example test runner
import { describe, expect, it } from "vitest";

import { URI } from "@codeeditorland/output/Target/Microsoft/VSCode/vs/base/common/uri.js";

import {
	ClipboardServiceTag,
	LiveClipboardService,
} from "../../Source/Application/Clipboard.js";

// 1. Create the test-specific application layer by overriding the integration dependency.
const TestAppLayer = Layer.provide(LiveClipboardService, MockIntegrationLayer);

// 2. Build a runtime from our test layer.
const TestRuntime = Runtime.runSync(Layer.toRuntime(TestAppLayer));
const Run = <A, E>(effect: Effect.Effect<A, E>) =>
	Runtime.runPromise(TestRuntime, effect);

// 3. Write the tests.
describe("ClipboardService", () => {
	it("should read the mocked text from the clipboard", async () => {
		// Get the service from our test runtime's context.
		const ClipboardService = TestRuntime.context.get(ClipboardServiceTag);

		const result = await ClipboardService.readText();

		// Assert that we received the value from our mock, not from the real clipboard.
		expect(result).toBe("mock clipboard text");
	});

	it("should write text by running the mocked effect", async () => {
		const ClipboardService = TestRuntime.context.get(ClipboardServiceTag);

		// This will execute the MockWriteText effect, which logs to the console.
		// In a real test, you could spy on the console or check a mock sink.
		await expect(
			ClipboardService.writeText("hello world"),
		).resolves.toBeUndefined();
	});
});
