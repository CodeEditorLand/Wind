/*
 * File: Wind/Source/Application/Instantiation/Definition.ts
 * Responsibility: Implements the live IInstantiationService for the Wind module in the Cocoon sidecar, bridging VS Code's class-based dependency injection with Effect-TS's context and layer system to enable service/extension instantiation.
 * Modified: 2025-06-18 14:33:14 UTC
 * Dependency: ./Register.js, effect, vs/platform/instantiation/common/serviceCollection.js
 */

/**
 * @module Definition (Instantiation)
 * @description The live implementation of the IInstantiationService. This service is
 * a critical bridge between the legacy, class-based dependency injection of VS Code
 * and the modern, context-based dependency management of Effect-TS.
 */

import { Context, Effect, Layer, Runtime } from "effect";
import {
	_util,
	IInstantiationService,
	ServiceIdentifier,
	ServicesAccessor,
} from "vs/platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";

import { LayerMap } from "./Register.js";

class InstantiationServiceImpl implements IInstantiationService {
	readonly _serviceBrand: undefined;

	constructor(
		private readonly AppRuntime: Runtime.Runtime<any>,
		private readonly AppContext: Context.Context<any>,
	) {}

	/**
	 * Creates an instance of a class, satisfying its dependencies.
	 * This is the core of the compatibility bridge.
	 */
	createInstance = <T>(ctorOrDescriptor: any, ...args: any[]): T => {
		const Constructor = ctorOrDescriptor.ctor ?? ctorOrDescriptor;
		const StaticArgument = ctorOrDescriptor.staticArgument ?? [];
		const ServiceLayer = LayerMap.get(Constructor);

		// --- Modern, Effect-TS Layer Path ---
		// If we have registered a Layer for this class, we use the Effect ecosystem
		// to build it and its dependency graph.
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
				...StaticArgument,
				...args,
				...Dependencies,
			);
		}

		// --- Legacy, VS Code Decorator Path ---
		// If no Layer is found, fall back to VS Code's original DI system, which
		// uses decorators to add a static `_util.DI_DEPENDENCIES` property.
		const Dependencies =
			(Constructor[_util.DI_DEPENDENCIES] as any[] | undefined)
				?.map((dep) => this.AppContext.get(dep.id))
				.filter(Boolean) ?? [];

		return new Constructor(...StaticArgument, ...args, ...Dependencies);
	};

	/**
	 * Invokes a function with a `ServicesAccessor`, allowing it to access services
	 * from our main application context.
	 */
	invokeFunction = <R, TS extends any[] = []>(
		fn: (accessor: ServicesAccessor, ...args: TS) => R,
		...args: TS
	): R => {
		const accessor: ServicesAccessor = {
			get: <T>(id: ServiceIdentifier<T>) =>
				this.AppContext.get(id as unknown as Context.Tag<T, T>),
		};
		return fn(accessor, ...args);
	};

	/**
	 * Creates a child instantiation service with additional services.
	 */
	createChild = (services: ServiceCollection): IInstantiationService => {
		let ChildContext = this.AppContext;
		for (const [id, service] of services) {
			ChildContext = Context.add(
				ChildContext,
				id as unknown as Context.Tag<any, any>,
				service,
			);
		}
		const ChildRuntime = Runtime.make(ChildContext);
		return new InstantiationServiceImpl(ChildRuntime, ChildContext);
	};

	/**
	 * Disposes of the instantiation service by shutting down the entire Effect runtime.
	 */
	dispose = (): void => {
		Runtime.runFork(this.AppRuntime.shutdown);
	};
}

/**
 * An Effect that creates an instance of the InstantiationService.
 * It requires the application's `Runtime` as input.
 */
const Definition = (AppRuntime: Runtime.Runtime<any>) =>
	Effect.sync(
		() =>
			new InstantiationServiceImpl(
				AppRuntime,
				Runtime.context(AppRuntime),
			),
	);

export default Definition;
