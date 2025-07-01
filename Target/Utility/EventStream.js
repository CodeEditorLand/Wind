import { Emitter as c } from "vs/base/common/event.js";

import { Effect as e, PubSub as o } from "../effect";

const a = () =>
	e
		.gen(function* (f) {
			const t = new c(),
				n = yield* f(o.unbounded()),
				d = (r) =>
					o
						.publish(n, r)
						.pipe(e.andThen(e.sync(() => t.fire(r))), e.asVoid),
				i = () =>
					e
						.all([o.shutdown(n), e.sync(() => t.dispose())])
						.pipe(e.asVoid);
			return (
				yield* f(e.addFinalizer(() => i())),
				{ Fire: d, PubSub: n, Event: t.event, Shutdown: i }
			);
		})
		.pipe(e.scoped);
export { a as CreateEventStream };
