import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag, { type Interface as ServiceInterface } from "./Tag.js";

// The Live layer provides the Definition for the ServiceTag.
// It has no requirements of its own because the Definition is self-contained
// and fetches its dependencies via side-effects (Tauri invokes).
const Live: Layer.Layer<ServiceInterface, never, never> = Layer.effect(
	ServiceTag,
	Definition,
);

export default Live;
