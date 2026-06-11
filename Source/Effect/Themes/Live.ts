/**
 * @module Effect/Themes/Live
 * @description
 * Live implementation of ThemesService via Tauri IPC. Reads/sets the active
 * color theme from Mountain's ConfigurationProvider (workbench.colorTheme).
 * Theme changes emit sky://theme/change for Sky to re-apply CSS variables.
 *
 * IPC channels (WindServiceHandlers.rs):
 *   themes:getActive  → ConfigurationProvider::GetConfigurationValue("workbench.colorTheme")
 *   themes:list       → ExtensionManagementService::GetThemeExtensions()
 *   themes:set        → ConfigurationProvider::UpdateConfigurationValue("workbench.colorTheme")
 */

import { Effect, Layer } from "effect";

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { ThemesService } from "./Interface/ThemesService.js";
import { ThemesServiceTag } from "./Tag/ThemesServiceTag.js";
import type { ThemesProblem } from "./Type/ThemesProblem.js";

const MakeThemesProblem = (error: unknown): ThemesProblem =>
	error instanceof Error
		? { _tag: "ThemesOperationFailed", error }
		: { _tag: "ThemesOperationFailed", error: new Error(String(error)) };

function makeThemesService(): ThemesService {
	const IPCService = TauriIPCLive;

	const Service: ThemesService = {
		GetActiveTheme: () =>
			IPCService.invoke(Channel.ThemesGetActive)([]).pipe(
				Effect.map((Result) => {
					const Theme = Result as {
						id?: string;

						label?: string;

						kind?: string;
					};

					return {
						id: Theme.id ?? "Default Dark Modern",
						label: Theme.label ?? "Default Dark Modern",
						kind: (Theme.kind ?? "dark") as
							| "light"
							| "dark"
							| "highContrast"
							| "highContrastLight",
					};
				}),

				Effect.mapError(MakeThemesProblem),
			),

		ListThemes: () =>
			IPCService.invoke(Channel.ThemesList)([]).pipe(
				Effect.map((Result) =>
					Array.isArray(Result)
						? (Result as readonly {
								id: string;

								label: string;

								kind:
									| "light"
									| "dark"
									| "highContrast"
									| "highContrastLight";
							}[])
						: [],
				),

				Effect.mapError(MakeThemesProblem),
			),

		SetTheme: (themeId) =>
			IPCService.invoke(Channel.ThemesSet)([themeId]).pipe(
				Effect.map(() => undefined as void),

				Effect.mapError(MakeThemesProblem),
			),
	};

	return Service;
}

export const LiveThemesServiceLayer = Layer.succeed(
	ThemesServiceTag,

	makeThemesService(),
);

export default LiveThemesServiceLayer;
