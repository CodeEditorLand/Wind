import { Effect as t } from "effect";

import { Telemetry as l } from "../../Telemetry.js";

function c(r, i, f) {
	return t.gen(function* () {
		const e = yield* (yield* l).startSpan(r, f);
		return i.pipe(
			t.tap(() => e.end(!0)),
			t.catchAll((n) =>
				t.gen(function* () {
					return (yield* e.end(!1, String(n)), yield* t.fail(n));
				}),
			),
		);
	});
}
export { c as default };
