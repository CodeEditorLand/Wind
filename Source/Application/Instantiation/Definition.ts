/*
 * File: Wind/Source/Application/Instantiation/Definition.ts
 * Role: Provides the live implementation of the IInstantiationService.
 * Responsibilities:
 *   - Acts as a critical bridge between the legacy, class-based dependency injection
 *     of VS Code and the modern, context-based dependency management of Effect-TS.
 *   - Manages the creation of service instances, correctly resolving dependencies
 *     from either the Effect `Context` or VS Code's legacy decorator metadata.
 */

import { Context, Effect, Layer, Runtime } from "effect";
import {
	_util,
	IInstantiationService,
	type ServiceIdentifier,
	type ServicesAccessor,
} from "vs/platform/instantiation/common/instantiation.js";
import { ServiceCollection } from "vs/platform/instantiation/common/serviceCollection.js";
import { LayerMap } from "./Register.js";

/**
 * The concrete implementation of the `IInstantiationService`.
 */
class InstantiationServiceImpl implements IInstantiationService {
	public readonly _serviceBrand: undefined;

	constructor(
		private readonly AppRuntime: Runtime.Runtime<any>,
		private readonly AppContext: Context.Context<any>,
	) {}

	/**
	 * Creates an instance of a class, satisfying its dependencies. This is the
	 * core of the compatibility bridge. It checks for a registered `Layer` first
	 * and falls back to the legacy decorator-based system if none is found.
	 * @param CtorOrDescriptor - The constructor or a descriptor object.
	 * @param Args - Additional constructor arguments.
	 * @returns The created instance.
	 */
	public createInstance = <T>(CtorOrDescriptor: any, ...Args: any[]): T => {
		const Constructor = CtorOrDescriptor.ctor ?? CtorOrDescriptor;
		const StaticArgument = CtorOrDescriptor.staticArguments ?? [];

		const ServiceLayer = LayerMap.get(Constructor);

		// --- Modern, Effect-TS Layer Path ---
		if (ServiceLayer) {
			const InstanceLayer = Layer.provide(
				ServiceLayer,
				this.AppContext as any,
			);
			const InstanceRuntime = Runtime.runSync(
				Effect.scoped(Layer.toRuntime(InstanceLayer)),
			);
			const InstanceContext = Runtime.context(InstanceRuntime);
			const Dependencies = Array.from(InstanceContext.tags).map((Tag) =>
				InstanceContext.get(Tag),
			);

			return new Constructor(...StaticArgument, ...Args, ...Dependencies);
		}

		// --- Legacy, VS Code Decorator Path ---
		const Dependencies =
			(Constructor[_util.DI_DEPENDENCIES] as any[] | undefined)
				?.map((Dependency) => this.AppContext.get(Dependency.id))
				.filter(Boolean) ?? [];

		return new Constructor(...StaticArgument, ...Args, ...Dependencies);
	};

	/**
	 * Invokes a function with a `ServicesAccessor`, allowing it to access services
	 * from the main application `Context`.
	 */
	public invokeFunction = <R, T extends any[] = []>(
		FunctionToInvoke: (Accessor: ServicesAccessor, ...Args: T) => R,
		...Args: T
	): R => {
		const Accessor: ServicesAccessor = {
			get: <T>(ID: ServiceIdentifier<T>) =>
				this.AppContext.get(ID as unknown as Context.Tag<T, T>),
		};
		return FunctionToInvoke(Accessor, ...Args);
	};

	/**
	 * Creates a child instantiation service with additional services, creating a
	 * new, extended `Context` and `Runtime`.
	 */
	public createChild = (
		Services: ServiceCollection,
	): IInstantiationService => {
		let ChildContext = this.AppContext;
		for (const [ID, Service] of Services) {
			ChildContext = Context.add(
				ChildContext,
				ID as unknown as Context.Tag<any, any>,
				Service,
			);
		}
		const ChildRuntime = Runtime.make(ChildContext);
		return new InstantiationServiceImpl(ChildRuntime, ChildContext);
	};

	/**
	 * Disposes of the instantiation service by shutting down the entire Effect runtime.
	 */
	public dispose = (): void => {
		Runtime.runFork(this.AppRuntime.shutdown);
	};
}

/**
 * An `Effect` that creates an instance of the `InstantiationServiceImpl`.
 * It requires the application's `Runtime` as input to access the global context.
 * @param AppRuntime - The main application `Runtime`.
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
