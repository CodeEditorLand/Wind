import { List } from "effect";
import type { Uri } from "../../../Platform/VSCode/Type.js";

const ConvertResourceListToPathString = (
	ResourceList: readonly Uri[],
): string => {
	const PathList = List.map(ResourceList, (Resource) => Resource.fsPath);
	return List.toArray(PathList).join("\n");
};

export default ConvertResourceListToPathString;

// Source/Integration/Clipboard/Convert/ResourceListToPathString.ts
import { List } from "effect";
import type { Uri } from "../../../Platform/VSCode/Type.js";

const ConvertResourceListToPathString = (
	ResourceList: readonly Uri[],
): string => {
	const PathList = List.map(ResourceList, (Resource) => Resource.fsPath);
	return List.toArray(PathList).join("\n");
};

export default ConvertResourceListToPathString;
