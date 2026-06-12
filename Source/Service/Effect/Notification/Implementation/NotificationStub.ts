import type { NotificationService } from "../Interface/NotificationService.js";

export const StubNotificationService: NotificationService = {
	Show: (_message, _severity, _actions) => Promise.resolve(undefined),

	ShowProgress: (_title, _cancellable) => Promise.resolve("stub-progress-0"),

	UpdateProgress: (_id, _increment, _message) => Promise.resolve(),

	EndProgress: (_id) => Promise.resolve(),
};

export default StubNotificationService;
