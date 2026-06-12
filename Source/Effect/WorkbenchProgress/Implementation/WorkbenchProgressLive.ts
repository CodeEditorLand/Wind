import type {
	WorkbenchProgressReporter,
	WorkbenchProgressService,
	WorkbenchProgressTaskOptions,
} from "../Interface/WorkbenchProgressService.js";

import { WorkbenchProgressError } from "../Type/WorkbenchProgressProblem.js";

import {
	type UpstreamProgressReporter,
	type WorkbenchProgressBridgeShape,
	type WorkbenchProgressGlobals,
	WorkbenchProgressLocationCode,
} from "./WorkbenchProgressBridgeShape.js";

const Unavailable = (): WorkbenchProgressError =>
	new WorkbenchProgressError({
		_tag: "WorkbenchProgressBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.Progress is null.",
	});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

const ToReporter = (
	upstream: UpstreamProgressReporter,
): WorkbenchProgressReporter => ({
	Report: (Fraction, Message) =>
		upstream.report({
			increment: Math.round(Fraction * 100),
			...(Message !== undefined ? { message: Message } : {}),
		}),
});

function makeWorkbenchProgressService(): WorkbenchProgressService {
	const getBridge = (): WorkbenchProgressBridgeShape | null =>
		(globalThis as unknown as WorkbenchProgressGlobals).__CEL_SERVICES__
			?.Progress ?? null;

	const Run = async <A>(
		Options: WorkbenchProgressTaskOptions,

		Body: (reporter: WorkbenchProgressReporter) => Promise<A>,
	): Promise<A> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			return await Bridge.withProgress(
				{
					title: Options.title,
					location: WorkbenchProgressLocationCode(Options.location),
					...(Options.cancellable !== undefined
						? { cancellable: Options.cancellable }
						: {}),
					...(Options.source !== undefined
						? { source: Options.source }
						: {}),
				},

				(Reporter) => Body(ToReporter(Reporter)),
			);
		} catch (Cause) {
			throw new WorkbenchProgressError({
				_tag: "WorkbenchProgressTaskFailed",
				title: Options.title,
				error: ToError(Cause),
			});
		}
	};

	const Service: WorkbenchProgressService = { Run };

	return Service;
}

export const WorkbenchProgressLive = makeWorkbenchProgressService();

export default WorkbenchProgressLive;
