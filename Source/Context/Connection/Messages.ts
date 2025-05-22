import type Message from "@Context/Connection/Message";
import { type Signal, createSignal } from "solid-js";

export type Type = Signal<Message>;

export default createSignal<Message>(new Map([])) satisfies Type;
