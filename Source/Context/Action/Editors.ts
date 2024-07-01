export default (await import("@Library/Create")).default(
	(await import("@Library/Persist")).default([
		(await import("solid-js")).createSignal(new Map([])),
		"Editors",
	]),
) satisfies Type;
