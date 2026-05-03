import { deepmerge as n } from "deepmerge-ts";

import * as e from "../Constant/EnvironmentConstant.js";
import p from "./BaseConfig.js";

const a = {
	"import.meta.env.Authorize": JSON.stringify(process.env.Authorize ?? ""),
	"import.meta.env.Beam": JSON.stringify(
		process.env.Beam ?? "https://eu.i.posthog.com",
	),
	"import.meta.env.Report": JSON.stringify(process.env.Report ?? "true"),
	"import.meta.env.Replay": JSON.stringify(process.env.Replay ?? "false"),
	"import.meta.env.Ask": JSON.stringify(process.env.Ask ?? "false"),
	"import.meta.env.Brand": JSON.stringify(process.env.Brand ?? ""),
};
async function m(o) {
	return n(p, {
		outdir: "Target",
		drop: e.On ? [] : ["debugger", "console"],
		define: {
			__DEV__: e.On ? "true" : "false",
			__INCREMENT__: `"${`${e.On ? "DEVELOPMENT" : "PRODUCTION"}-${(await import("ulid")).ulid()}`}"`,
			...a,
		},
		treeShaking: !e.On,
		entryPoints: (
			await import("@playform/build/Target/Function/Entry.js")
		).default(o, ["Source/Configuration/*"]),
		platform: "browser",
		outbase: "Source",
		plugins: e.Compile
			? n(o.plugins || [], [
					{
						name: "Compile",
						setup({ onEnd: r }) {
							r(async ({ metafile: s }) => {
								const i = s?.outputs;
								for (const t in i)
									Object.prototype.hasOwnProperty.call(
										i,
										t,
									) &&
										t.endsWith(".js") &&
										(
											await import("@playform/build/Target/Function/Exec.js")
										).default(
											`Build '${t}' 											--ESBuild Configuration/ESBuild/Target/Compile.js 											--TypeScript Configuration/tsconfig/Target/Compile.json`,
										);
							});
						},
					},
				])
			: [],
	});
}
export { m as default };
