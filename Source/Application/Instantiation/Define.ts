/**
 * @module Define
 * @description
 * Defines the service for handling dependency injection, conforming to the
 * `IInstantiationService` contract from VS Code.
 */

import { IInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiation.js";
import { InstantiationService as VSCodeInstantiationService } from "@codeeditorland/output/vs/platform/instantiation/common/instantiationService.js";
import { ServiceCollection } from "@codeeditorland/output/vs/platform/instantiation/common/serviceCollection.js";
import { Effect } from "effect";

/**
 * The `Effect.Service` for the `IInstantiationService`.
 *
 * This service implementation "lifts" the original `InstantiationService` class
 * from VS Code. It is responsible for creating instances of other services
 * and components, wiring up their dependencies. This is the core of the
 * hybrid dependency injection system, allowing Effect-native services to be
 * injected into legacy VS Code components.
 *
 * It is registered with the identifier "instantiationService" for compatibility.
 */
export class InstantiationService extends Effect.Service<IInstantiationService>()(
	"instantiationService",
	{
		effect: Effect.gen(function* (Generator) {
			// In a real scenario, this would gather all registered services.
			// For now, we start with an empty collection. The layer will populate it.
			const services = new ServiceCollection();
			const instantiationService = new VSCodeInstantiationService(
				services,
				true,
			);

			// This is a minimal implementation. The layer will be responsible for
			// populating the service collection.
			services.set(IInstantiationService, instantiationService);

			return instantiationService;
		}),
	},
) {}
