/**
 * @module Persist
 *
 */
declare const _default: <T>([[Item, _Item], Store]: Property<T>) => Promise<Return<T>>;
export default _default;
import type Interface from "../Interface/Persist.js";
import type { Signal } from "solid-js";
export declare const Local: StoreJsAPI;
export type Property<T> = [Signal<T>, Interface];
export type Return<T> = [Interface, Signal<T>];
