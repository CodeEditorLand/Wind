import { Effect, Runtime } from "effect";
import type {
	IWorkspacesService,
	IEnterWorkspaceResult,
	IWorkspaceFolderCreationData,
	IRecentlyOpened,
	IRecent,
} from "vs/platform/workspaces/common/workspaces.js";
import type { IWorkspaceIdentifier } from "vs/platform/workspace/common/workspace.js";
import type { Uri } from "vs/base/common/uri.js";
import { Event } from "vs/base/common/event.js";
import * as Orchestrate from "./Orchestrate.js";
import { WorkspacesProblem } from "./Error.js";

const ServiceRuntime = Runtime.defaultRuntime;

const RunEffect = <A, E>(eff: Effect.Effect<A, E, any>): Promise<A> => {
	// A real implementation needs to provide all required services via Layers.
	// For now, we assume a runtime that can handle these effects.
	return Runtime.runPromise(ServiceRuntime, eff as any);
};

class TauriWorkspacesService implements IWorkspacesService {
	readonly _serviceBrand: undefined;

	// The event emitter needs to be a concrete implementation.
	private readonly _onDidChangeRecentlyOpened = new Emitter<void>();
	readonly onDidChangeRecentlyOpened: Event<void> =
		this._onDidChangeRecentlyOpened.event;

	enterWorkspace(
		workspaceUri: Uri,
	): Promise<IEnterWorkspaceResult | undefined> {
		return RunEffect(Orchestrate.EnterWorkspace(workspaceUri));
	}

	createUntitledWorkspace(
		folders?: IWorkspaceFolderCreationData[],
		remoteAuthority?: string,
	): Promise<IWorkspaceIdentifier> {
		return RunEffect(
			Orchestrate.CreateUntitledWorkspace(folders ?? [], remoteAuthority),
		);
	}

	deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void> {
		return RunEffect(Orchestrate.DeleteUntitledWorkspace(workspace));
	}

	getWorkspaceIdentifier(workspaceUri: Uri): Promise<IWorkspaceIdentifier> {
		return RunEffect(Orchestrate.GetWorkspaceIdentifier(workspaceUri));
	}

	addRecentlyOpened(recents: IRecent[]): Promise<void> {
		return RunEffect(Orchestrate.AddRecentlyOpened(recents)).then(() =>
			this._onDidChangeRecentlyOpened.fire(),
		);
	}

	removeRecentlyOpened(workspaces: Uri[]): Promise<void> {
		return RunEffect(Orchestrate.RemoveRecentlyOpened(workspaces)).then(
			() => this._onDidChangeRecentlyOpened.fire(),
		);
	}

	clearRecentlyOpened(): Promise<void> {
		return RunEffect(Orchestrate.ClearRecentlyOpened()).then(() =>
			this._onDidChangeRecentlyOpened.fire(),
		);
	}

	getRecentlyOpened(): Promise<IRecentlyOpened> {
		return RunEffect(Orchestrate.GetRecentlyOpened);
	}

	getDirtyWorkspaces(): Promise<any[]> {
		// This is related to backups, which is a separate service.
		// Returning an empty array is a safe default.
		return Promise.resolve([]);
	}
}

const Definition = new TauriWorkspacesService();
export default Definition;

import { Effect, Layer, Ref, Runtime } from "effect";
import {
	IWorkspacesService,
	IEnterWorkspaceResult,
	IWorkspaceFolderCreationData,
	IRecentlyOpened,
	IRecent,
} from "vs/platform/workspaces/common/workspaces.js";
import { IWorkspaceIdentifier } from "vs/platform/workspace/common/workspace.js";
import { Uri } from "vs/base/common/uri.js";
import { Emitter, Event } from "vs/base/common/event.js";
import * as Orchestrate from "./Orchestrate.js";
import { StorageServiceTag } from "../Storage.js";
import { HostServiceTag } from "../Host.js";
import { FileServiceTag } from "../File.js";

const DependenciesLayer = Layer.mergeAll(
	Layer.succeed(StorageServiceTag, {} as any), // Provide mock/real services
	Layer.succeed(HostServiceTag, {} as any),
	Layer.succeed(FileServiceTag, {} as any),
);

const ServiceRuntime = Runtime.defaultRuntime;

const RunEffect = <A, E>(eff: Effect.Effect<A, E, any>): Promise<A> => {
	const runnable = Effect.provide(eff, DependenciesLayer);
	return Runtime.runPromise(ServiceRuntime, runnable as any);
};

class TauriWorkspacesService implements IWorkspacesService {
	readonly _serviceBrand: undefined;

	private readonly _onDidChangeRecentlyOpened = new Emitter<void>();
	readonly onDidChangeRecentlyOpened: Event<void> =
		this._onDidChangeRecentlyOpened.event;

	enterWorkspace(
		workspaceUri: Uri,
	): Promise<IEnterWorkspaceResult | undefined> {
		return RunEffect(Orchestrate.EnterWorkspace(workspaceUri));
	}

	createUntitledWorkspace(
		folders?: IWorkspaceFolderCreationData[],
		remoteAuthority?: string,
	): Promise<IWorkspaceIdentifier> {
		return RunEffect(
			Orchestrate.CreateUntitledWorkspace(folders ?? [], remoteAuthority),
		);
	}

	deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void> {
		return RunEffect(Orchestrate.DeleteUntitledWorkspace(workspace));
	}

	getWorkspaceIdentifier(workspaceUri: Uri): Promise<IWorkspaceIdentifier> {
		return RunEffect(Orchestrate.GetWorkspaceIdentifier(workspaceUri));
	}

	addRecentlyOpened(recents: IRecent[]): Promise<void> {
		return RunEffect(Orchestrate.AddRecentlyOpened(recents)).then(() =>
			this._onDidChangeRecentlyOpened.fire(),
		);
	}

	removeRecentlyOpened(workspaces: Uri[]): Promise<void> {
		return RunEffect(Orchestrate.RemoveRecentlyOpened(workspaces)).then(
			() => this._onDidChangeRecentlyOpened.fire(),
		);
	}

	clearRecentlyOpened(): Promise<void> {
		return RunEffect(Orchestrate.ClearRecentlyOpened()).then(() =>
			this._onDidChangeRecentlyOpened.fire(),
		);
	}

	getRecentlyOpened(): Promise<IRecentlyOpened> {
		return RunEffect(Orchestrate.GetRecentlyOpened);
	}

	getDirtyWorkspaces(): Promise<any[]> {
		return Promise.resolve([]);
	}
}

const Definition = new TauriWorkspacesService();
export default Definition;
