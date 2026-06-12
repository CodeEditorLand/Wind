import { Layer } from "effect";

import { StubNotificationService } from "./Implementation/NotificationStub.js";

import { NotificationServiceTag } from "./Tag/NotificationServiceTag.js";

export const MockNotificationServiceLayer = Layer.succeed(
	NotificationServiceTag,

	StubNotificationService,
);

export default MockNotificationServiceLayer;
