import { BaseObservable, IObservable, IObservableWithChange, IObserver, IReader, ISettableObservable, ITransaction } from './base.js';
import { DebugNameData, DebugOwner, IDebugNameData } from './debugName.js';
import { DisposableStore, EqualityComparer, IDisposable } from './commonFacade/deps.js';
import { IChangeTracker } from './changeTracker.js';
export interface IDerivedReader<TChange = void> extends IReader {
    /**
     * Call this to report a change delta or to force report a change, even if the new value is the same as the old value.
    */
    reportChange(change: TChange): void;
}
/**
 * Creates an observable that is derived from other observables.
 * The value is only recomputed when absolutely needed.
 *
 * {@link computeFn} should start with a JS Doc using `@description` to name the derived.
 */
export declare function derived<T, TChange = void>(computeFn: (reader: IDerivedReader<TChange>) => T): IObservable<T>;
export declare function derived<T, TChange = void>(owner: DebugOwner, computeFn: (reader: IDerivedReader<TChange>) => T): IObservable<T>;
export declare function derivedWithSetter<T>(owner: DebugOwner | undefined, computeFn: (reader: IReader) => T, setter: (value: T, transaction: ITransaction | undefined) => void): ISettableObservable<T>;
export declare function derivedOpts<T>(options: IDebugNameData & {
    equalsFn?: EqualityComparer<T>;
    onLastObserverRemoved?: (() => void);
}, computeFn: (reader: IReader) => T): IObservable<T>;
/**
 * Represents an observable that is derived from other observables.
 * The value is only recomputed when absolutely needed.
 *
 * {@link computeFn} should start with a JS Doc using `@description` to name the derived.
 *
 * Use `createEmptyChangeSummary` to create a "change summary" that can collect the changes.
 * Use `handleChange` to add a reported change to the change summary.
 * The compute function is given the last change summary.
 * The change summary is discarded after the compute function was called.
 *
 * @see derived
 */
export declare function derivedHandleChanges<T, TChangeSummary>(options: IDebugNameData & {
    changeTracker: IChangeTracker<TChangeSummary>;
    equalityComparer?: EqualityComparer<T>;
}, computeFn: (reader: IReader, changeSummary: TChangeSummary) => T): IObservable<T>;
export declare function derivedWithStore<T>(computeFn: (reader: IReader, store: DisposableStore) => T): IObservable<T>;
export declare function derivedWithStore<T>(owner: DebugOwner, computeFn: (reader: IReader, store: DisposableStore) => T): IObservable<T>;
export declare function derivedDisposable<T extends IDisposable | undefined>(computeFn: (reader: IReader) => T): IObservable<T>;
export declare function derivedDisposable<T extends IDisposable | undefined>(owner: DebugOwner, computeFn: (reader: IReader) => T): IObservable<T>;
export declare const enum DerivedState {
    /** Initial state, no previous value, recomputation needed */
    initial = 0,
    /**
     * A dependency could have changed.
     * We need to explicitly ask them if at least one dependency changed.
     */
    dependenciesMightHaveChanged = 1,
    /**
     * A dependency changed and we need to recompute.
     * After recomputation, we need to check the previous value to see if we changed as well.
     */
    stale = 2,
    /**
     * No change reported, our cached value is up to date.
     */
    upToDate = 3
}
export declare class Derived<T, TChangeSummary = any, TChange = void> extends BaseObservable<T, TChange> implements IDerivedReader<TChange>, IObserver {
    readonly _debugNameData: DebugNameData;
    readonly _computeFn: (reader: IDerivedReader<TChange>, changeSummary: TChangeSummary) => T;
    private readonly _changeTracker;
    private readonly _handleLastObserverRemoved;
    private readonly _equalityComparator;
    private _state;
    private _value;
    private _updateCount;
    private _dependencies;
    private _dependenciesToBeRemoved;
    private _changeSummary;
    private _isUpdating;
    private _isComputing;
    private _didReportChange;
    get debugName(): string;
    constructor(_debugNameData: DebugNameData, _computeFn: (reader: IDerivedReader<TChange>, changeSummary: TChangeSummary) => T, _changeTracker: IChangeTracker<TChangeSummary> | undefined, _handleLastObserverRemoved: (() => void) | undefined, _equalityComparator: EqualityComparer<T>);
    protected onLastObserverRemoved(): void;
    get(): T;
    private _recompute;
    toString(): string;
    beginUpdate<T>(_observable: IObservable<T>): void;
    private _removedObserverToCallEndUpdateOn;
    endUpdate<T>(_observable: IObservable<T>): void;
    handlePossibleChange<T>(observable: IObservable<T>): void;
    handleChange<T, TChange>(observable: IObservableWithChange<T, TChange>, change: TChange): void;
    private _isReaderValid;
    readObservable<T>(observable: IObservable<T>): T;
    reportChange(change: TChange): void;
    addObserver(observer: IObserver): void;
    removeObserver(observer: IObserver): void;
    debugGetState(): {
        state: DerivedState;
        updateCount: number;
        isComputing: boolean;
        dependencies: Set<IObservable<any>>;
        value: T | undefined;
    };
    debugSetValue(newValue: unknown): void;
    setValue(newValue: T, tx: ITransaction, change: TChange): void;
}
export declare class DerivedWithSetter<T, TChangeSummary = any, TOutChanges = any> extends Derived<T, TChangeSummary, TOutChanges> implements ISettableObservable<T, TOutChanges> {
    readonly set: (value: T, tx: ITransaction | undefined, change: TOutChanges) => void;
    constructor(debugNameData: DebugNameData, computeFn: (reader: IDerivedReader<TOutChanges>, changeSummary: TChangeSummary) => T, changeTracker: IChangeTracker<TChangeSummary> | undefined, handleLastObserverRemoved: (() => void) | undefined, equalityComparator: EqualityComparer<T>, set: (value: T, tx: ITransaction | undefined, change: TOutChanges) => void);
}
