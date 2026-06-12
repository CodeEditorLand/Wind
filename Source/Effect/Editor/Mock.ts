import { Layer } from "effect";

import { StubEditorService } from "./Implementation/EditorStub.js";

import { EditorServiceTag } from "./Tag/EditorServiceTag.js";

export const MockEditorServiceLayer = Layer.succeed(
	EditorServiceTag,

	StubEditorService,
);

export default MockEditorServiceLayer;
