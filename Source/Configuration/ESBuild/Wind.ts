/**
 * @module Configuration/ESBuild/Wind
 * @description
 * ESBuild Wind configuration with all build targets.
 * This is the main configuration entry point.
 */

import BaseConfig from "./Config/BaseConfig.js";
import CompileConfig from "./Config/CompileConfig.js";
import TargetConfig from "./Config/TargetConfig.js";

export * from "./Constant/EnvironmentConstant.js";

export { sep, posix } from "./Constant/BoundConstant.js";

export { BaseConfig, TargetConfig, CompileConfig };
