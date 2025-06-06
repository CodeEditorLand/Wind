// Source/Application/Workspaces/Trust/RequestTag.ts
import { Context, Effect, Sink } from "effect";
import { URI } from "vs/base/common/uri.js";
import { type WorkspaceTrustUriResponse } from "vs/platform/workspace/common/workspaceTrust.js";

import type { TrustProblem } from "./Error/TrustProblem.js";

// Interface for request options, mirroring VS Code's type.
export interface WorkspaceTrustRequestOptions {
	readonly message?: string;
	readonly buttons?: {
		label: string;
		type:
			| "ContinueWithTrust"
			| "ContinueWithoutTrust"
			| "Cancel"
			| "Manage";
	}[];
}

export interface Interface {
	readonly _serviceBrand: undefined;

	// Instead of event emitters, we expose "Sinks". Sinks are consumers of data.
	// Other parts of the app can push requests into these sinks.
	readonly OpenFilesTrustRequestSink: Sink.Sink<
		void,
		never,
		never,
		never,
		void
	>;
	readonly WorkspaceTrustRequestSink: Sink.Sink<
		void,
		WorkspaceTrustRequestOptions,
		never,
		never,
		void
	>;

	// Completing a request is now an Effect.
	completeOpenFilesTrustRequest(
		result: WorkspaceTrustUriResponse,
		saveResponse?: boolean,
	): Effect.Effect<void, TrustProblem>;

	completeWorkspaceTrustRequest(
		trusted?: boolean,
	): Effect.Effect<void, TrustProblem>;

	// Requesting trust returns an Effect that describes the user's response.
	requestOpenFilesTrust(
		uris: URI[],
	): Effect.Effect<WorkspaceTrustUriResponse, TrustProblem>;
}

const WorkspaceTrustRequestServiceTag = Context.Tag<Interface>(
	"vscode/WorkspaceTrustRequestService",
);

export default WorkspaceTrustRequestServiceTag;
