/*
 * File: Wind/Source/Application/Editor/Live.ts
 * Responsibility: Responsibility could not be determined.
 * Modified: 2025-06-06 02:37:43 UTC
 * Dependency: ../EditorGroups.js, ../Instantiation.js, ../TextEditor.js, ./Definition.js, ./Tag.js, effect
 */

import { Layer } from "effect";

import { LiveEditorGroupsService } from "../EditorGroups.js";
import { LiveInstantiationService } from "../Instantiation.js";
import { LiveTextEditorService } from "../TextEditor.js";
import Definition from "./Definition.js";
import ServiceTag from "./Tag.js";

const DependenciesLayer = Layer.mergeAll(
	LiveEditorGroupsService,
	LiveInstantiationService,
	LiveTextEditorService,
);

const LiveEditorService: Layer.Layer<import("./Tag.js").Interface, any, any> =
	Layer.effect(ServiceTag, Definition).pipe(Layer.provide(DependenciesLayer));

export default LiveEditorService;
