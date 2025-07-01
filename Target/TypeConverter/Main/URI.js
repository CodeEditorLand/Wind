import { URI as r } from "../../Platform/VSCode/Type.js";

const t = (o) => o.toJSON(),
	m = (o) => r.revive(o);
export { t as FromAPI, m as ToAPI };
