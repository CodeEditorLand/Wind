/**
 * @module Define
 * @description
 * Defines the service for handling dependency injection, conforming to the
 * `IInstantiationService` contract from VS Code. This service is the core
 * of the hybrid dependency injection system.
 */

import {
	IInstantiationService,
	type ServiceIdentifier,
} from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { InstantiationService as VSCodeInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "@codeeditorland/output/vs/platform/instantiation/common/serviceCollection.js";
import { Context, Effect } from "effect";

/**
 * The `Effect.Service` for the `IInstantiationService`.
 *
 * This service implementation "lifts" the original `InstantiationService` class
 * from VS Code. It is responsible for creating instances of other services
 * and components, wiring up their dependencies.
 *
 * The key function of this service is to act as a bridge. Its `Layer` will
 * take all services from the Effect `Context`, place them into a `ServiceCollection`,
 * and then create the `VSCodeInstantiationService` with that collection. This
 * allows legacy VS Code code to receive instances of our Effect-native services.
 *
 * It is registered with the identifier "instantiationService" for compatibility.
 */
export class InstantiationService extends Effect.Service<IInstantiationService>()(
	"instantiationService",
	{
		effect: Effect.gen(function* (Generator) {
			const Services = new ServiceCollection();
			const ServiceInstance = new VSCodeInstantiationService(
				Services,
				true,
			);

			// The InstantiationService must be able to inject itself.
			Services.set(IInstantiationService, ServiceInstance);

			// The layer will be responsible for populating the rest of the services
			// by reading from the Effect Context.
			const AllServices = yield* Generator(Context.AllServices);
			for (const [Tag, Service] of AllServices) {
				if ("id" in Tag && typeof Tag.id === "function") {
					Services.set(Tag.id as ServiceIdentifier<unknown>, Service);
				}
			}

			return ServiceInstance;
		}),
	},
) {}
