import { Effect, Stream } from "effect";

import type {
	WorkbenchThemeChangeEvent,
	WorkbenchThemeDescriptor,
	WorkbenchThemeService,
} from "../Interface/WorkbenchThemeService.js";
import type { WorkbenchThemeProblem } from "../Type/WorkbenchThemeProblem.js";
import {
	type UpstreamWorkbenchColorTheme,
	type UpstreamWorkbenchTheme,
	type WorkbenchThemeBridgeShape,
	type WorkbenchThemeGlobals,
	WorkbenchThemeKindFromUpstream,
} from "./WorkbenchThemeBridgeShape.js";

const Unavailable: WorkbenchThemeProblem = {
	_tag: "WorkbenchThemeBridgeUnavailable",

	reason: "globalThis.__CEL_SERVICES__.WorkbenchTheme is null - the workbench has not yet exposed its IWorkbenchThemeService handle.",
};

const ToDescriptor = (
	upstream: UpstreamWorkbenchTheme,
): WorkbenchThemeDescriptor => ({
	id: upstream.id,
	label: upstream.label,
	kind: WorkbenchThemeKindFromUpstream(upstream.type),
});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

function makeWorkbenchThemeService(): WorkbenchThemeService {
	const getBridge = (): WorkbenchThemeBridgeShape | null =>
		(globalThis as unknown as WorkbenchThemeGlobals).__CEL_SERVICES__
			?.WorkbenchTheme ??
		(globalThis as unknown as WorkbenchThemeGlobals).__CEL_SERVICES__
			?.Theme ??
		null;

	const Active = Effect.gen(function* () {
		const Bridge = getBridge();

		if (!Bridge) return yield* Effect.fail(Unavailable);

		return ToDescriptor(Bridge.getColorTheme());
	});

	const List = Effect.gen(function* () {
		const Bridge = getBridge();

		if (!Bridge) return yield* Effect.fail(Unavailable);

		const Themes = yield* Effect.promise(() => Bridge.getColorThemes());

		return Themes.map(ToDescriptor);
	});

	const Apply = (
		ThemeId: string,
	): Effect.Effect<void, WorkbenchThemeProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			yield* Effect.tryPromise({
				try: () => Bridge.setColorTheme(ThemeId),
				catch: (Cause) =>
					({
						_tag: "WorkbenchThemeApplyFailed",
						error: ToError(Cause),
					}) satisfies WorkbenchThemeProblem,
			});
		});

	const Token = (
		Key: string,
	): Effect.Effect<string | undefined, WorkbenchThemeProblem> =>
		Effect.gen(function* () {
			const Bridge = getBridge();

			if (!Bridge) return yield* Effect.fail(Unavailable);

			const Theme = Bridge.getColorTheme();

			const Color = Theme.getColor?.(Key);

			return Color ? Color.toString() : undefined;
		});

	let LastApplied: WorkbenchThemeDescriptor | undefined;

	const Changes = Stream.async<
		WorkbenchThemeChangeEvent,
		WorkbenchThemeProblem
	>((Emit) => {
		const Bridge = getBridge();

		if (!Bridge) {
			Emit.fail(Unavailable);

			return Effect.void;
		}

		const Subscription = Bridge.onDidColorThemeChange(
			(Next: UpstreamWorkbenchColorTheme) => {
				const Current = ToDescriptor(Next);

				Emit.single({ previous: LastApplied, current: Current });

				LastApplied = Current;
			},
		);

		return Effect.sync(() => Subscription.dispose());
	});

	const Service: WorkbenchThemeService = {
		Active,

		List,

		Apply,

		Token,

		Changes,
	};

	return Service;
}

export const WorkbenchThemeLive = makeWorkbenchThemeService();

export default WorkbenchThemeLive;
