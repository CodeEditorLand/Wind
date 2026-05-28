import { Effect, Layer, Stream } from "effect";

import type {
	WorkbenchThemeChangeEvent,
	WorkbenchThemeDescriptor,
	WorkbenchThemeService,
} from "../Interface/WorkbenchThemeService.js";
import { WorkbenchThemeServiceTag } from "../Tag/WorkbenchThemeServiceTag.js";
import type { WorkbenchThemeProblem } from "../Type/WorkbenchThemeProblem.js";
import {
	WorkbenchThemeKindFromUpstream,
	type UpstreamWorkbenchColorTheme,
	type UpstreamWorkbenchTheme,
	type WorkbenchThemeBridgeShape,
	type WorkbenchThemeGlobals,
} from "./WorkbenchThemeBridgeShape.js";

const ResolveBridge = Effect.sync((): WorkbenchThemeBridgeShape | null => {
	const Globals = globalThis as unknown as WorkbenchThemeGlobals;

	return (
		Globals.__CEL_SERVICES__?.WorkbenchTheme ??
		Globals.__CEL_SERVICES__?.Theme ??
		null
	);
});

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

export const WorkbenchThemeLive = Layer.effect(
	WorkbenchThemeServiceTag,

	Effect.gen(function* () {
		const Bridge = yield* ResolveBridge;

		const Active = Effect.gen(function* () {
			if (!Bridge) return yield* Effect.fail(Unavailable);

			return ToDescriptor(Bridge.getColorTheme());
		});

		const List = Effect.gen(function* () {
			if (!Bridge) return yield* Effect.fail(Unavailable);

			const Themes = yield* Effect.promise(() => Bridge.getColorThemes());

			return Themes.map(ToDescriptor);
		});

		const Apply = (
			ThemeId: string,
		): Effect.Effect<void, WorkbenchThemeProblem> =>
			Effect.gen(function* () {
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
	}),
);

export default WorkbenchThemeLive;
