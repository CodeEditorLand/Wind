/**
 * @module Effect/UserSettings/Tag/UserSettingsServiceTag
 * @description
 * Type alias for `UserSettingsService`. The Effect Context.Tag was
 * removed - services are plain objects in the LandWorkbench
 * registry.
 * @category Tag
 */

import type { UserSettingsService } from "../Interface/UserSettingsService.js";

export type UserSettingsServiceTag = UserSettingsService;

export type UserSettings = UserSettingsService;
