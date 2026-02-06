// Source/Bootstrap/Types/VSCodeTypes.ts
var ConfigurationTarget = /* @__PURE__ */ ((ConfigurationTarget2) => {
  ConfigurationTarget2[ConfigurationTarget2["USER"] = 1] = "USER";
  ConfigurationTarget2[ConfigurationTarget2["WORKSPACE"] = 2] = "WORKSPACE";
  ConfigurationTarget2[ConfigurationTarget2["WORKSPACE_FOLDER"] = 3] = "WORKSPACE_FOLDER";
  ConfigurationTarget2[ConfigurationTarget2["DEFAULT"] = 4] = "DEFAULT";
  ConfigurationTarget2[ConfigurationTarget2["MEMORY"] = 5] = "MEMORY";
  return ConfigurationTarget2;
})(ConfigurationTarget || {});
var LogLevel = /* @__PURE__ */ ((LogLevel2) => {
  LogLevel2[LogLevel2["Trace"] = 0] = "Trace";
  LogLevel2[LogLevel2["Debug"] = 1] = "Debug";
  LogLevel2[LogLevel2["Info"] = 2] = "Info";
  LogLevel2[LogLevel2["Warning"] = 3] = "Warning";
  LogLevel2[LogLevel2["Error"] = 4] = "Error";
  LogLevel2[LogLevel2["Critical"] = 5] = "Critical";
  LogLevel2[LogLevel2["Off"] = 6] = "Off";
  return LogLevel2;
})(LogLevel || {});
export {
  ConfigurationTarget,
  LogLevel
};
//# sourceMappingURL=VSCodeTypes.js.map
