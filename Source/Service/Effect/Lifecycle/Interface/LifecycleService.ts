import type { LifecycleProblem } from "../Type/LifecycleProblem.js";

/**
 * Application lifecycle phases.
 *
 * Microsoft VSCode Reference: LifecyclePhase from
 * vs/workbench/services/lifecycle/common/lifecycle.ts
 */
export const LifecyclePhase = {
	/** Extension host not yet started. */
	Starting: 1,

	/** Extension host started; initial UI state restored. */
	Ready: 2,

	/** Editor state restored (workspace opened). */
	Restored: 3,

	/** Maximum phase - all deferred work complete. */
	Eventually: 4,
} as const;

export type LifecyclePhaseValue =
	(typeof LifecyclePhase)[keyof typeof LifecyclePhase];

/**
 * Lifecycle service interface.
 * Tracks the editor startup/shutdown phases and lets components synchronise
 * work with the application lifecycle (e.g. "run after editor is fully ready").
 *
 * Microsoft VSCode Reference: ILifecycleService from
 * vs/workbench/services/lifecycle/common/lifecycle.ts
 */
export interface LifecycleService {
	/** Get the current lifecycle phase (1-4). */
	readonly GetPhase: () => Promise<LifecyclePhaseValue>;

	/**
	 * Resolve when the application reaches at least the given phase.
	 * Resolves immediately if the phase has already been reached.
	 */
	readonly WhenPhase: (phase: LifecyclePhaseValue) => Promise<void>;

	/** Initiate a graceful application shutdown. */
	readonly RequestShutdown: () => Promise<void>;

	/**
	 * Advance the application phase to at least the given value. No-op if the
	 * application is already at or beyond the target phase - Mountain rejects
	 * backwards/same-phase advances. Used by Sky when the workbench becomes
	 * truly interactive (Restored) and when late-binding work should
	 * unblock (Eventually).
	 */
	readonly AdvancePhase: (phase: LifecyclePhaseValue) => Promise<void>;
}
