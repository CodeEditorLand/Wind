// Source/Application/Instantiation/Live.ts
import { Context, Effect, Layer, Runtime } from "effect";
import type { DisposableStore } from "vs/base/common/lifecycle.js";
import type {
	IInstantiationService,
	ServiceIdentifier,
	ServicesAccessor,
} from "vs/platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";

import InstantiationProblem from "./Error.js";
import { AppLayer } from "./Layer.js"; // This will be our master layer aggregator
import InstantiationServiceTag, {
	type Interface as InstantiationService,
} from "./Tag.js";

// The new, Effect-based implementation of IInstantiationService.
class TauriInstantiationService implements InstantiationService {
	readonly _serviceBrand: undefined;

	// It holds a reference to the fully-built application Runtime and Context.
	constructor(
		private readonly AppRuntime: Runtime.Runtime<
			Context.Context.Provided<typeof AppLayer>
		>,
		private readonly AppContext: Context.Context<
			Context.Context.Provided<typeof AppLayer>
		>,
	) {}

	// `createInstance` is now a pure lookup in the Layer map (which we will build).
	// In this model, instances are not created on-demand in the same way; they are
	// constructed as part of the Layer composition. This method is for compatibility.
	createInstance<T>(ctorOrDescriptor: any, ...args: any[]): T {
		// A full implementation would need a mapping from constructor to Tag,
		// or use a less safe, dynamic approach for legacy compatibility.
		// For now, we assume we invoke functions that use the accessor.
		console.warn(
			"TauriInstantiationService.createInstance is a compatibility layer and should be used sparingly.",
		);
		return this.invokeFunction((accessor) => {
			const dependencies = (
				ctorOrDescriptor.ctor ?? ctorOrDescriptor
			)._DI_SERVICES.map((id: ServiceIdentifier<any>) =>
				accessor.get(id),
			);
			return new (ctorOrDescriptor.ctor ?? ctorOrDescriptor)(
				...dependencies,
				...args,
			);
		});
	}

	// This is the primary way VS Code gets services. We fulfill it from our context.
	invokeFunction<R, TS extends any[] = []>(
		fn: (accessor: ServicesAccessor, ...args: TS) => R,
		...args: TS
	): R {
		const accessor: ServicesAccessor = {
			get: <T>(id: ServiceIdentifier<T>): T => {
				const tag = id as unknown as Context.Tag<T>;
				// We synchronously get the service from the already-built context.
				// If it's missing, it's a programming error (the Layer was misconfigured).
				return Context.get(this.AppContext, tag);
			},
		};

		return fn(accessor, ...args);
	}

	// Child services become nested Scopes/Layers in Effect.
	createChild(services: ServiceCollection): IInstantiationService {
		let ChildContext = this.AppContext;
		for (const [id, service] of services) {
			const tag = id as unknown as Context.Tag<any>;
			ChildContext = Context.add(ChildContext, tag, service);
		}
		const ChildRuntime = Runtime.make(ChildContext);

		return new TauriInstantiationService(ChildRuntime, ChildContext);
	}

	dispose(): void {
		// The runtime holds the scope, shutting it down releases all resources.
		Runtime.runFork(this.AppRuntime.shutdown);
	}
}

// The definition of our service is an Effect that builds the service instance.
// It requires the entire application's runtime to be built first.
const Definition = Effect.gen(function* (_) {
	const AppRuntime = yield* _(
		Effect.runtime<Context.Context.Provided<typeof AppLayer>>(),
	);
	const AppContext = yield* _(
		Effect.context<Context.Context.Provided<typeof AppLayer>>(),
	);
	return new TauriInstantiationService(AppRuntime, AppContext);
});

// The "Live" layer for the InstantiationService.
// It depends on the entire AppLayer, and provides the InstantiationServiceTag.
const LiveInstantiationService = Layer.effect(
	InstantiationServiceTag,
	Definition,
).pipe(Layer.provide(AppLayer));

export default LiveInstantiationService;
