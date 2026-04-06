import { Effect } from "effect";

import type { NotificationService } from "../Interface/NotificationService.js";

export const StubNotificationService: NotificationService = {
	Show: (_message, _severity, _actions) => Effect.succeed(undefined),
	ShowProgress: (_title, _cancellable) => Effect.succeed("stub-progress-0"),
	UpdateProgress: (_id, _increment, _message) => Effect.void,
	EndProgress: (_id) => Effect.void,
};

export default StubNotificationService;
