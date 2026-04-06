import { Effect as t } from "effect";

import {
	BootstrapLive as d,
	BootstrapLive as e,
} from "./Implementation/BootstrapImplementation.js";
import {
	stage6_HealthCheck as _,
	stage0_Environment as c,
	stage2_Configuration as l,
	stage3_Services as u,
	stage4_Preparation as v,
	stage5_Initialization as x,
	stage1_Preload as y,
} from "./Implementation/BootstrapStage.js";
import {
	makeMockBootstrap as j,
	BootstrapMock as S,
} from "./Layer/BootstrapMock.js";
import { BootstrapTag as B, BootstrapTag as r } from "./Tag/BootstrapTag.js";

const n = (o) =>
	t
		.gen(function* () {
			return yield* (yield* r).run(o);
		})
		.pipe(t.provide(e));
export {
	d as BootstrapLive,
	S as BootstrapMock,
	B as BootstrapTag,
	j as makeMockBootstrap,
	n as runBootstrap,
	c as stage0_Environment,
	y as stage1_Preload,
	l as stage2_Configuration,
	u as stage3_Services,
	v as stage4_Preparation,
	x as stage5_Initialization,
	_ as stage6_HealthCheck,
};
