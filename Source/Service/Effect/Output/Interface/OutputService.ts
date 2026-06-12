/** Output channel service — manages VS Code Output view channels. */

/**
 * Output channel service interface.
 * Microsoft VSCode Reference: IOutputService from vs/workbench/services/output/common/output.ts
 */
export interface OutputService {
	readonly CreateChannel: (
		name: string,
	) => Effect.Effect<{ readonly name: string }, OutputProblem>;

	readonly Append: (
		channelName: string,

		text: string,
	) => Effect.Effect<void, OutputProblem>;

	readonly AppendLine: (
		channelName: string,

		line: string,
	) => Effect.Effect<void, OutputProblem>;

	readonly Clear: (channelName: string) => Effect.Effect<void, OutputProblem>;

	readonly Show: (channelName: string) => Effect.Effect<void, OutputProblem>;

	readonly Dispose: (
		channelName: string,
	) => Effect.Effect<void, OutputProblem>;
}
