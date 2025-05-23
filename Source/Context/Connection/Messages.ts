import type Message from "@Context/Connection/Message";
import { createSignal, type Signal } from "solid-js";

export type Type = Signal<Message>;

export default createSignal<Message>(new Map([])) satisfies Type;
