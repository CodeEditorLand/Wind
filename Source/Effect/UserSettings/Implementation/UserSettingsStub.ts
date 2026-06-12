/**
 * @module Effect/UserSettings/Implementation/UserSettingsStub
 * @description
 * In-memory stub backing for tests / headless contexts where the
 * workbench bridge isn't reachable. Reads go straight to the
 * `__CEL_OVERRIDE_CONFIG__`-shaped internal map; writes update the
 * map and notify `Changes` subscribers.
 *
 * The Live implementation in `UserSettingsLive.ts` is the one used
 * at runtime; this stub is for unit tests and for the early-boot
 * window before `__CEL_SERVICES__.Configuration` is populated.
 * @category Implementation
 */

import type {
	UserSettingsChangeEvent,
	UserSettingsService,
	UserSettingsTarget,
} from "../Interface/UserSettingsService.js";

import { UserSettingsError } from "../Type/UserSettingsProblem.js";

export const MakeUserSettingsStub = (): UserSettingsService => {
	const State = new Map<string, unknown>();

	const Subscribers = new Set<(event: UserSettingsChangeEvent) => void>();

	const Service: UserSettingsService = {
		Read: <T = unknown>(Section: string): T => {
			const Value = State.get(Section);

			if (Value === undefined) {
				throw new UserSettingsError({
					_tag: "UserSettingsReadFailed",
					section: Section,
					error: new Error(
						`Stub has no value for section "${Section}"`,
					),
				});
			}

			return Value as T;
		},

		ReadOptional: <T = unknown>(Section: string): T | undefined =>
			State.get(Section) as T | undefined,

		Write: async (
			Section: string,

			Value: unknown,

			Target: UserSettingsTarget,
		): Promise<void> => {
			State.set(Section, Value);

			const Event: UserSettingsChangeEvent = {
				affectedKeys: new Set([Section]),

				source: Target,
			};

			for (const Subscriber of Subscribers) Subscriber(Event);
		},

		HasUserValue: (Section: string): boolean => State.has(Section),

		Changes: (
			Callback: (event: UserSettingsChangeEvent) => void,
		): { readonly dispose: () => void } => {
			Subscribers.add(Callback);

			return {
				dispose: () => {
					Subscribers.delete(Callback);
				},
			};
		},
	};

	return Service;
};

export default MakeUserSettingsStub;
