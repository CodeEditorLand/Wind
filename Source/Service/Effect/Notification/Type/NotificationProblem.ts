export type NotificationProblem =
	| { readonly _tag: "NotificationNotAvailable"; readonly reason: string }
	| { readonly _tag: "NotificationOperationFailed"; readonly error: Error }
	| { readonly _tag: "NotificationDismissed" };
