export type { DecorationsProblem } from "./Type/DecorationsProblem.js";
export type {
	DecorationsService,
	FileDecoration,
} from "./Interface/DecorationsService.js";
export {
	DecorationsServiceTag,
	Decorations,
} from "./Tag/DecorationsServiceTag.js";
export { StubDecorationsService } from "./Implementation/DecorationsStub.js";
export { default as LiveDecorationsServiceLayer } from "./Live.js";
export { default as MockDecorationsServiceLayer } from "./Mock.js";
