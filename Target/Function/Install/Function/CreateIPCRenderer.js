import { ValidateIPCChannel as t } from "./ValidateIPCChannel.js";

function i() {
	const r = {
		send: (e) => {
			t(e);
		},
		invoke: async (e) => {
			if (!t(e)) throw new Error(`Invalid IPC channel: ${e}`);
			return {};
		},
		on: (e, n) => r,
		once: (e, n) => r,
		removeListener: (e, n) => r,
	};
	return r;
}
export { i as CreateIPCRenderer };
