import { Layer as n, Effect as t } from "effect";

import s from "../Tag/MountainSyncTag.js";

const e = () => ({
		start: () => t.void,
		stop: () => t.void,
		syncNow: () =>
			t.gen(function* () {
				return { success: !0, itemsSynced: 0, duration: 1 };
			}),
		getStatus: () => t.succeed("idle"),
		getStats: () =>
			t.succeed({
				lastSyncTime: Date.now(),
				syncCount: 0,
				successCount: 0,
				errorCount: 0,
				itemsSynced: 0,
			}),
		pause: () => t.void,
		resume: () => t.void,
	}),
	o = n.effect(s, t.succeed(e()));
var u = o;
export { u as default, e as makeMockMountainSync };
