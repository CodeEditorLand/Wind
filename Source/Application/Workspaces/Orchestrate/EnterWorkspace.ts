/*
 * File: Wind/Source/Application/Workspaces/Orchestrate/EnterWorkspace.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:24 UTC
 * Dependency: ../../../Integration/Host.js, ./GetWorkspaceIdentifier.js, effect, vs/base/common/uri.js, vs/platform/workspaces/common/workspaces.js
 */

import { Effect } from "effect";
import type { Uri } from "vs/base/common/uri.js";
import type { IEnterWorkspaceResult } from "vs/platform/workspaces/common/workspaces.js";

import { OpenWindow } from "../../../Integration/Host.js";
import GetWorkspaceIdentifier from "./GetWorkspaceIdentifier.js";

const EnterWorkspace = (
	WorkspaceUri: Uri,
): Effect.Effect<IEnterWorkspaceResult, any> =>
	Effect.gen(function* (_) {
		const WorkspaceId = yield* _(GetWorkspaceIdentifier(WorkspaceUri));
		yield* _(OpenWindow([{ workspaceUri: WorkspaceId.configPath }]));
		return { workspace: WorkspaceId };
	});

export default EnterWorkspace;
