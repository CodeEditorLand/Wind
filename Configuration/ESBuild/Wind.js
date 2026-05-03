import o from "./Config/BaseConfig.js";
import r from "./Config/CompileConfig.js";
import m from "./Config/TargetConfig.js";
import { posix as C, sep as x } from "./Constant/BoundConstant.js";

export * from "./Constant/EnvironmentConstant.js";
export {
	o as BaseConfig,
	r as CompileConfig,
	m as TargetConfig,
	C as posix,
	x as sep,
};
