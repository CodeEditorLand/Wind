import type {
	WorkbenchContextKeyChangeEvent,
	WorkbenchContextKeyService,
} from "../Interface/WorkbenchContextKeyService.js";
import { WorkbenchContextKeyError } from "../Type/WorkbenchContextKeyProblem.js";
import type {
	WorkbenchContextKeyBridgeShape,
	WorkbenchContextKeyGlobals,
} from "./WorkbenchContextKeyBridgeShape.js";

const Unavailable = (): WorkbenchContextKeyError =>
	new WorkbenchContextKeyError({
		_tag: "WorkbenchContextKeyBridgeUnavailable",

		reason: "globalThis.__CEL_SERVICES__.ContextKey is null.",
	});

const ToError = (cause: unknown): Error =>
	cause instanceof Error ? cause : new Error(String(cause));

function makeWorkbenchContextKeyService(): WorkbenchContextKeyService {
	const getBridge = (): WorkbenchContextKeyBridgeShape | null =>
		(globalThis as unknown as WorkbenchContextKeyGlobals).__CEL_SERVICES__
			?.ContextKey ?? null;

	const Get = <T = unknown>(Key: string): T | undefined => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.getContextKeyValue<T>(Key);
	};

	const SetKey = <T>(Key: string, Value: T): void => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		Bridge.createKey<T>(Key, undefined).set(Value);
	};

	const Reset = (Key: string): void => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		Bridge.createKey(Key, undefined).reset();
	};

	const Match = (Expression: string): boolean => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		try {
			return Bridge.contextMatchesRules(Expression);
		} catch (Cause) {
			throw new WorkbenchContextKeyError({
				_tag: "WorkbenchContextKeyEvalFailed",
				expression: Expression,
				error: ToError(Cause),
			});
		}
	};

	const Changes = (
		Callback: (event: WorkbenchContextKeyChangeEvent) => void,
	): { readonly dispose: () => void } => {
		const Bridge = getBridge();

		if (!Bridge) throw Unavailable();

		return Bridge.onDidChangeContext((Event) => {
			Callback({ affectedKeys: Event.keys ?? new Set() });
		});
	};

	const Service: WorkbenchContextKeyService = {
		Get,

		Set: SetKey,

		Reset,

		Match,

		Changes,
	};

	return Service;
}

export const WorkbenchContextKeyLive = makeWorkbenchContextKeyService();

export default WorkbenchContextKeyLive;
