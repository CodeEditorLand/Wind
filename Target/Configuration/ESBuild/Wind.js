import o from "./Config/BaseConfig.js";
import m from "./Config/CompileConfig.js";
import r from "./Config/TargetConfig.js";
import { posix as C, sep as x } from "./Constant/BoundConstant.js";

export * from "./Constant/EnvironmentConstant.js";
export {
	o as BaseConfig,
	m as CompileConfig,
	r as TargetConfig,
	C as posix,
	x as sep,
};
