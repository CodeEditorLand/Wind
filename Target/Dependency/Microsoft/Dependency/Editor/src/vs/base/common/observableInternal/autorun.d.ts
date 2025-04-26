import { IObservable, IObservableWithChange, IObserver, IReader } from './base.js';
import { DebugNameData, IDebugNameData } from './debugName.js';
import { DisposableStore, IDisposable } from './commonFacade/deps.js';
import { IChangeTracker } from './changeTracker.js';
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 */
export declare function autorun(fn: (reader: IReader) => void): IDisposable;
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 */
export declare function autorunOpts(options: IDebugNameData & {}, fn: (reader: IReader) => void): IDisposable;
/**
 * Runs immediately and whenever a transaction ends and an observed observable changed.
 * {@link fn} should start with a JS Doc using `@description` to name the autorun.
 *
 * Use `changeTracker.createChangeSummary` to create a "change summary" that can collect the changes.
 * Use `changeTracker.handleChange` to add a reported change to the change summary.
 * The run function is given the last change summary.
 * The change summary is discarded after the run function was called.
 *
 * @see autorun
 */
export declare function autorunHandleChanges<TChangeSummary>(options: IDebugNameData & {
    changeTracker: IChangeTracker<TChangeSummary>;
}, fn: (reader: IReader, changeSummary: TChangeSummary) => void): IDisposable;
/**
 * @see autorunHandleChanges (but with a disposable store that is cleared before the next run or on dispose)
 */
export declare function autorunWithStoreHandleChanges<TChangeSummary>(options: IDebugNameData & {
    changeTracker: IChangeTracker<TChangeSummary>;
}, fn: (reader: IReader, changeSummary: TChangeSummary, store: DisposableStore) => void): IDisposable;
/**
 * @see autorun (but with a disposable store that is cleared before the next run or on dispose)
 */
export declare function autorunWithStore(fn: (reader: IReader, store: DisposableStore) => void): IDisposable;
export declare function autorunDelta<T>(observable: IObservable<T>, handler: (args: {
    lastValue: T | undefined;
    newValue: T;
}) => void): IDisposable;
export declare function autorunIterableDelta<T>(getValue: (reader: IReader) => Iterable<T>, handler: (args: {
    addedValues: T[];
    removedValues: T[];
}) => void, getUniqueIdentifier?: (value: T) => unknown): IDisposable;
export declare const enum AutorunState {
    /**
     * A dependency could have changed.
     * We need to explicitly ask them if at least one dependency changed.
     */
    dependenciesMightHaveChanged = 1,
    /**
     * A dependency changed and we need to recompute.
     */
    stale = 2,
    upToDate = 3
}
export declare class AutorunObserver<TChangeSummary = any> implements IObserver, IReader, IDisposable {
    readonly _debugNameData: DebugNameData;
    readonly _runFn: (reader: IReader, changeSummary: TChangeSummary) => void;
    private readonly _changeTracker;
    private _state;
    private _updateCount;
    private _disposed;
    private _dependencies;
    private _dependenciesToBeRemoved;
    private _changeSummary;
    private _isRunning;
    get debugName(): string;
    constructor(_debugNameData: DebugNameData, _runFn: (reader: IReader, changeSummary: TChangeSummary) => void, _changeTracker: IChangeTracker<TChangeSummary> | undefined);
    dispose(): void;
    private _run;
    toString(): string;
    beginUpdate(_observable: IObservable<any>): void;
    endUpdate(_observable: IObservable<any>): void;
    handlePossibleChange(observable: IObservable<any>): void;
    handleChange<T, TChange>(observable: IObservableWithChange<T, TChange>, change: TChange): void;
    private _isDependency;
    readObservable<T>(observable: IObservable<T>): T;
    debugGetState(): {
        isRunning: boolean;
        updateCount: number;
        dependencies: Set<IObservable<any>>;
        state: AutorunState;
    };
    debugRerun(): void;
}
export declare namespace autorun {
    const Observer: typeof AutorunObserver;
}
