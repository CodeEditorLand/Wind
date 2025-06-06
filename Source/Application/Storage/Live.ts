import { Layer } from "effect";

import Definition from "./Definition.js";
import ServiceTag, { type Interface as ServiceInterface } from "./Tag.js";

const Live: Layer.Layer<ServiceInterface, never, never> = Layer.effect(
	ServiceTag,
	Definition,
);

export default Live;
