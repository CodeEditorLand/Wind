var s = ((r) => (
	(r[(r.Trace = 0)] = "Trace"),
	(r[(r.Debug = 1)] = "Debug"),
	(r[(r.Info = 2)] = "Info"),
	(r[(r.Warning = 3)] = "Warning"),
	(r[(r.Error = 4)] = "Error"),
	(r[(r.Critical = 5)] = "Critical"),
	(r[(r.Off = 6)] = "Off"),
	r
))(s || {});
export { s as LogLevel };
