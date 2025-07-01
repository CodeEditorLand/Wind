/**
 * @module Error (Application/Notification)
 * @description Defines domain-specific, tagged errors for notification service operations.
 */
declare const NotificationProblem_base: new <A extends Record<string, any> = {}>(args: import("effect/Types").Equals<A, {}> extends true ? void : { readonly [P in keyof A as P extends "_tag" ? never : P]: A[P]; }) => import("effect/Cause").YieldableError & {
    readonly _tag: "NotificationProblem";
} & Readonly<A>;
/**
 * Represents a failure that occurs within the `NotificationService`, for example,
 * when a request to the host to show a notification fails.
 */
export declare class NotificationProblem extends NotificationProblem_base<{
    readonly Cause: unknown;
    readonly Context: string;
}> {
}
export {};
