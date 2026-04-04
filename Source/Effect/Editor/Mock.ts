import { Layer } from "effect";
import { EditorServiceTag } from "./Tag/EditorServiceTag.js";
import { StubEditorService } from "./Implementation/EditorStub.js";

export const MockEditorServiceLayer = Layer.succeed(
	EditorServiceTag,
	StubEditorService,
);

export default MockEditorServiceLayer;
