/**
 * @description Unit test for the Clipboard Application Service.
 * This test uses the MockIntegrationLayer to run the service in complete isolation.
 */

import { URI } from "@codeeditorland/output/vs/base/common/uri.ts";
import { Effect, Layer, Runtime } from "effect";
// Using vitest as an example test runner
import { describe, expect, it } from "vitest";

import {
	ClipboardServiceTag,
	LiveClipboardService,
} from "../../Source/Application/Clipboard.ts";

import { MockIntegrationLayer } from "../../Source/Application/MockIntegrationLayer.ts";

// 1. Create the test-specific application layer by overriding the integration dependency.
const TestAppLayer = Layer.provide(LiveClipboardService, MockIntegrationLayer);

// 2. Build a runtime from our test layer.
const TestRuntime = Runtime.runSync(Layer.toRuntime(TestAppLayer));
const Run = <A, E>(effect: Effect.Effect<A, E>) =>
	Runtime.runPromise(TestRuntime, effect);

// 3. Write the tests.
describe("ClipboardService", () => {
	it("should read the mocked text from the clipboard", async () => {
		const result = await Run(
			Effect.gen(function* () {
				const service = yield* ClipboardServiceTag;
				return yield* service.readText();
			})
		);

		// Assert that we received the value from our mock, not from the real clipboard.
		expect(result).toBe("mock clipboard text");
	});

	it("should write text by running the mocked effect", async () => {
		await Run(
			Effect.gen(function* () {
				const service = yield* ClipboardServiceTag;
				return yield* service.writeText("hello world");
			})
		);

		// The write operation should complete successfully
		expect(true).toBe(true);
	});
});
