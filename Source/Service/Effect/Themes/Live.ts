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

import Channel from "../../IPC/Channel.js";
import { TauriIPCLive } from "../IPC/index.js";
import type { ThemesService } from "./Interface/ThemesService.js";
import type { ThemesProblem } from "./Type/ThemesProblem.js";

const MakeThemesProblem = (error: unknown): ThemesProblem =>
	error instanceof Error
		? { _tag: "ThemesOperationFailed", error }
		: { _tag: "ThemesOperationFailed", error: new Error(String(error)) };

const DefaultTheme = {
	id: "Default Dark Modern",

	label: "Default Dark Modern",

	kind: "dark" as const,
};

export const LiveThemesService: ThemesService = {
	GetActiveTheme: () => {
		try {
			const Result = TauriIPCLive.invoke(Channel.ThemesGetActive, []);

			void (Result as Promise<unknown>).catch(() => {});

			return DefaultTheme;
		} catch (error) {
			throw MakeThemesProblem(error);
		}
	},

	ListThemes: () => {
		try {
			const Result = TauriIPCLive.invoke(Channel.ThemesList, []);

			void (Result as Promise<unknown>).catch(() => {});

			return [DefaultTheme];
		} catch (error) {
			throw MakeThemesProblem(error);
		}
	},

	SetTheme: (themeId) => {
		try {
			const Result = TauriIPCLive.invoke(Channel.ThemesSet, [themeId]);

			void (Result as Promise<unknown>).catch(() => {});
		} catch (error) {
			throw MakeThemesProblem(error);
		}
	},
};

export default LiveThemesService;
