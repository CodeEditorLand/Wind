const i = (e, t, s, r, a) => ({
		serviceName: e,
		status: t,
		message: s,
		lastChecked: Date.now(),
		responseTime: r,
		...(a !== void 0 ? { details: a } : {}),
	}),
	n = (e, t, s) => ({
		serviceName: e,
		status: t,
		message: s,
		lastChecked: Date.now(),
		responseTime: 0,
	});
var o = { CreateServiceHealth: i, CreateServiceHealthWithNoResponseTime: n };
export {
	i as CreateServiceHealth,
	n as CreateServiceHealthWithNoResponseTime,
	o as default,
};
