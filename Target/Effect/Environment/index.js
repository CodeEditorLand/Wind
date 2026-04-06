import {
	DetectTimezone as a,
	DetectLocale as E,
	DetectArchitecture as f,
	DetectPlatform as p,
	GetUserAgent as y,
} from "./Implementation/EnvironmentHelper.js";
import {
	makeMockEnvironment as c,
	EnvironmentMock as i,
	EnvironmentLive as m,
	EnvironmentLive as o,
} from "./Implementation/EnvironmentImplementation.js";
import { EnvironmentTag as n } from "./Tag/EnvironmentTag.js";

export {
	f as DetectArchitecture,
	E as DetectLocale,
	p as DetectPlatform,
	a as DetectTimezone,
	m as EnvironmentLive,
	i as EnvironmentMock,
	n as EnvironmentTag,
	y as GetUserAgent,
	o as default,
	c as makeMockEnvironment,
};
