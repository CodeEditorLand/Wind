export default interface Interface {
    <T>([Store, [Item, _Item]]: Property<T>, Value: any): Return<T>;
}
export type Property<T> = [string, Signal<T>];
export type Return<T> = Signal<T>;
import type { Signal } from "solid-js";
