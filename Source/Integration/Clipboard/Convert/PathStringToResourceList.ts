/*
 * File: Wind/Source/Integration/Clipboard/Convert/PathStringToResourceList.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:23 UTC
 * Dependency: ../../../Platform/VSCode/Type.js, effect
 */

import { List } from "effect";
import { Uri } from "../../../Platform/VSCode/Type.js";

const ConvertPathStringToResourceList = (
	PathString: string,
): readonly Uri[] => {
	if (!PathString.trim()) {
		return [];
	}

	const PathList = PathString.split("\n").filter(
		(Path) => Path.trim() !== "",
	);
	const UriList = List.map(PathList, (Path) => Uri.file(Path));

	return List.toArray(UriList);
};

export default ConvertPathStringToResourceList;

import { List } from "effect";
import { UriConstructor } from "../../../Platform/VSCode/Type.js";
import type { Uri } from "../../../Platform/VSCode/Type.js";

const ConvertPathStringToResourceList = (
	PathString: string,
): readonly Uri[] => {
	if (!PathString.trim()) {
		return [];
	}

	const PathList = PathString.split("\n").filter(
		(Path) => Path.trim() !== "",
	);
	const UriList = List.map(PathList, (Path) => UriConstructor.file(Path));

	return List.toArray(UriList);
};

export default ConvertPathStringToResourceList;
