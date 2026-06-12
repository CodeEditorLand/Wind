export type { DecorationsProblem } from "./Type/DecorationsProblem.js";

export type {
	DecorationsService,
	FileDecoration,
} from "./Interface/DecorationsService.js";

export { StubDecorationsService } from "./Implementation/DecorationsStub.js";

export { default as LiveDecorationsService } from "./Live.js";

export { default as MockDecorationsService } from "./Mock.js";
