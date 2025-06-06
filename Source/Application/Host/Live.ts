import { Layer, type Context } from "effect";

import ActualHostServiceTag from "../../Platform/VSCode/Provide/Host.js";
import Definition from "./Definition.js";

type HostServiceType = Context.Tag.Service<typeof ActualHostServiceTag>;

const Live: Layer.Layer<HostServiceType, never, never> = Layer.succeed(
	ActualHostServiceTag,
	Definition,
);

export default Live;
