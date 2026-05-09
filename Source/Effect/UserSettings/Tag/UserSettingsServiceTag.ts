/**
 * @module Effect/UserSettings/Tag/UserSettingsServiceTag
 * @description
 * Effect Context.Tag binding for `UserSettingsService`. Use this
 * tag in `Effect.Layer` composition + `Effect.gen` consumers.
 * @category Tag
 */

import { Context } from "effect";

import type { UserSettingsService } from "../Interface/UserSettingsService.js";

export class UserSettingsServiceTag extends Context.Tag(
	"Application/UserSettingsService",
)<UserSettingsServiceTag, UserSettingsService>() {}

export const UserSettings = UserSettingsServiceTag;

export default UserSettingsServiceTag;
