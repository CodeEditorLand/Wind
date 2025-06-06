import { Effect, Layer, Context, Runtime } from "effect";
import type {
	IInstantiationService,
	ServicesAccessor,
	ServiceIdentifier,
} from "vs/platform/instantiation/common/instantiation.js";
import type { SyncDescriptor0 } from "vs/platform/instantiation/common/descriptors.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import type { DisposableStore } from "vs/base/common/lifecycle.js";
import { InstantiationProblem } from "./Error.js";

// A map from a service constructor to its Effect Layer.
// This will be populated as we refactor singletons.
const LayerMap = new Map<any, Layer.Layer<any, any, any>>();

class TauriInstantiationService implements IInstantiationService {
	readonly _serviceBrand: undefined;

	constructor(
		private readonly AppRuntime: Runtime.Runtime<any>,
		private readonly AppContext: Context.Context<any>,
	) {}

	private Run<A, E>(eff: Effect.Effect<A, E, any>): A {
		// This is a synchronous call, so we must run the effect synchronously.
		// This is a major architectural shift from the original async-heavy service.
		return Runtime.runSync(this.AppRuntime)(eff as any);
	}

	createInstance<T>(
		ctorOrDescriptor: any | SyncDescriptor0<T>,
		...args: any[]
	): T {
		const Constructor = ctorOrDescriptor.ctor ?? ctorOrDescriptor;
		const StaticArguments = ctorOrDescriptor.staticArguments ?? [];

		const ServiceLayer = LayerMap.get(Constructor);
		if (!ServiceLayer) {
			throw new InstantiationProblem({
				cause: "No Effect Layer registered for this constructor.",
				context: `Constructor: ${Constructor.name}`,
			});
		}

		// We create a new runtime with the specific layer for this instance,
		// inheriting the global context.
		const InstanceLayer = Layer.provide(
			ServiceLayer,
			this.AppContext as any,
		);
		const InstanceRuntime = Runtime.runSync(
			Effect.scoped(Layer.toRuntime(InstanceLayer)),
		);
		const InstanceContext = Runtime.context(InstanceRuntime);

		const Dependencies = Array.from(InstanceContext.tags).map((tag) =>
			InstanceContext.get(tag),
		);

		return new Constructor(...StaticArguments, ...args, ...Dependencies);
	}

	invokeFunction<R, TS extends any[] = []>(
		fn: (accessor: ServicesAccessor, ...args: TS) => R,
		...args: TS
	): R {
		const accessor: ServicesAccessor = {
			get: <T>(id: ServiceIdentifier<T>): T => {
				const tag = id as unknown as Context.Tag<T, T>;
				return this.AppContext.get(tag);
			},
		};

		return fn(accessor, ...args);
	}

	createChild(
		services: ServiceCollection,
		store?: DisposableStore,
	): IInstantiationService {
		// Creating a child context is the Effect-idiomatic way to do this.
		// We create a new context, add the new services to it, and create a new
		// instantiation service with the new context and runtime.
		let ChildContext = this.AppContext;
		for (const [id, service] of services) {
			const tag = id as unknown as Context.Tag<any, any>;
			ChildContext = Context.add(ChildContext, tag, service);
		}

		const ChildRuntime = Runtime.make(ChildContext);
		const ChildService = new TauriInstantiationService(
			ChildRuntime,
			ChildContext,
		);

		store?.add({ dispose: () => ChildRuntime.unsafeShutdown() });

		return ChildService;
	}

	dispose(): void {
		Runtime.runFork(this.AppRuntime.shutdown);
	}
}

const Definition = (AppRuntime: Runtime.Runtime<any>) =>
	Effect.sync(
		() =>
			new TauriInstantiationService(
				AppRuntime,
				Runtime.context(AppRuntime),
			),
	);

export default Definition;

import { Context, Effect, Layer, Runtime } from "effect";
import type {
	IInstantiationService,
	ServiceIdentifier,
	ServicesAccessor,
} from "vs/platform/instantiation/common/instantiation.js";
import type { SyncDescriptor0 } from "vs/platform/instantiation/common/descriptors.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import type { DisposableStore } from "vs/base/common/lifecycle.js";
import { InstantiationProblem } from "./Error.js";
import { LayerMap } from "./Register.js";

class TauriInstantiationService implements IInstantiationService {
	readonly _serviceBrand: undefined;

	constructor(
		private readonly AppRuntime: Runtime.Runtime<any>,
		private readonly AppContext: Context.Context<any>,
	) {}

	createInstance<T>(
		ctorOrDescriptor: any | SyncDescriptor0<T>,
		...args: any[]
	): T {
		const Constructor = ctorOrDescriptor.ctor ?? ctorOrDescriptor;
		const StaticArguments = ctorOrDescriptor.staticArguments ?? [];

		const ServiceLayer = LayerMap.get(Constructor);
		if (ServiceLayer) {
			const InstanceLayer = Layer.provide(
				ServiceLayer,
				this.AppContext as any,
			);
			const InstanceRuntime = Runtime.runSync(
				Effect.scoped(Layer.toRuntime(InstanceLayer)),
			);
			const InstanceContext = Runtime.context(InstanceRuntime);
			const Dependencies = Array.from(InstanceContext.tags).map((tag) =>
				InstanceContext.get(tag),
			);
			return new Constructor(
				...StaticArguments,
				...args,
				...Dependencies,
			);
		}

		// Fallback for classes not registered via Layers
		const Dependencies =
			(Constructor[_util.DI_DEPENDENCIES] as any[] | undefined)
				?.map((dep) => this.AppContext.get(dep.id))
				.filter(Boolean) ?? [];
		return new Constructor(...StaticArguments, ...args, ...Dependencies);
	}

	invokeFunction<R, TS extends any[] = []>(
		fn: (accessor: ServicesAccessor, ...args: TS) => R,
		...args: TS
	): R {
		const accessor: ServicesAccessor = {
			get: <T>(id: ServiceIdentifier<T>): T => {
				const tag = id as unknown as Context.Tag<T, T>;
				return this.AppContext.get(tag);
			},
		};
		return fn(accessor, ...args);
	}

	createChild(
		services: ServiceCollection,
		store?: DisposableStore,
	): IInstantiationService {
		let ChildContext = this.AppContext;
		for (const [id, service] of services) {
			const tag = id as unknown as Context.Tag<any, any>;
			ChildContext = Context.add(ChildContext, tag, service);
		}
		const ChildRuntime = Runtime.make(ChildContext);
		const ChildService = new TauriInstantiationService(
			ChildRuntime,
			ChildContext,
		);
		store?.add({ dispose: () => Runtime.runFork(ChildRuntime.shutdown) });
		return ChildService;
	}

	dispose(): void {
		Runtime.runFork(this.AppRuntime.shutdown);
	}
}

const Definition = (AppRuntime: Runtime.Runtime<any>) =>
	Effect.sync(
		() =>
			new TauriInstantiationService(
				AppRuntime,
				Runtime.context(AppRuntime),
			),
	);
export default Definition;
