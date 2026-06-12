import type {
	WorkbenchThemeChangeEvent,
	WorkbenchThemeDescriptor,
	WorkbenchThemeService,
} from "../Interface/WorkbenchThemeService.js";

import { WorkbenchThemeError } from "../Type/WorkbenchThemeProblem.js";

import {
	type UpstreamWorkbenchColorTheme,
	type UpstreamWorkbenchTheme,
	type WorkbenchThemeBridgeShape,
	type WorkbenchThemeGlobals,
	WorkbenchThemeKindFromUpstream,
} from "./WorkbenchThemeBridgeShape.js";

const Unavailable = (): WorkbenchThemeError =>
	new WorkbenchThemeError({
		_tag: "WorkbenchThemeBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.WorkbenchTheme is null - the workbench has not yet exposed its IWorkbenchThemeService handle.",
	});

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

	const Active = (): WorkbenchThemeDescriptor => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return ToDescriptor(Bridge.getColorTheme());
	};

	const List = async (): Promise<readonly WorkbenchThemeDescriptor[]> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const Themes = await Bridge.getColorThemes();

		return Themes.map(ToDescriptor);
	};

	const Apply = async (ThemeId: string): Promise<void> => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			await Bridge.setColorTheme(ThemeId);
		} catch (Cause) {
			throw new WorkbenchThemeError({
				_tag: "WorkbenchThemeApplyFailed",
				error: ToError(Cause),
			});
		}
	};

	const Token = (Key: string): string | undefined => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		const Theme = Bridge.getColorTheme();

		const Color = Theme.getColor?.(Key);

		return Color ? Color.toString() : undefined;
	};

	let LastApplied: WorkbenchThemeDescriptor | undefined;

	const Changes = (
		Callback: (event: WorkbenchThemeChangeEvent) => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.onDidColorThemeChange(
			(Next: UpstreamWorkbenchColorTheme) => {
				const Current = ToDescriptor(Next);

				Callback({ previous: LastApplied, current: Current });

				LastApplied = Current;
			},
		);
	};

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
