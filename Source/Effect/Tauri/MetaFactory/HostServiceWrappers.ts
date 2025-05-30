import { makeEffectFromServiceMethod } from "../../../Effect.js"; // Path to MetaFactory
import { HostServiceTag } from "../CoreContext.js"; // Uses HostServiceTag

export const effectOpenInHostService = makeEffectFromServiceMethod(
	HostServiceTag,
	"openWindow",
	(cause: unknown) =>
		// new OpenWindowError({ cause, operation: "hostServiceOpenWindow" }),
	{ operation: "hostServiceOpenWindow" },
);
