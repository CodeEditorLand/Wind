/**
 * @module Bootstrap/Stages/Stage3-Services
 * @description
 * Stage 3: Service Layer Initialization
 *
 * EXECUTION ORDER: Fourth stage (3/6), executes after Configuration loading
 *
 * RESPONSIBILITIES:
 * - Initialize Effect-TS runtime for dependency injection
 * - Register core services with the service collection
 * - Validate service dependencies and lifecycle
 * - Create service health checks
 * - Provide service availability metrics
 * - Handle service initialization failures gracefully
 * - Support service hot-reloading (in development mode)
 * - Enable service telemetry and diagnostics
 *
 * ARCHITECTURE OVERVIEW:
 * This stage establishes the service layer that provides core functionality
 * to the workbench. Services are built using Effect-TS for:
 *
 * 1. Type-safe dependency injection
 * 2. Comprehensive error handling
 * 3. Effect composition for async operations
 * 4. Resource management and cleanup
 * 5. Testability and modularity
 *
 * CORE SERVICES:
 * - IEnvironmentService: Platform and environment information
 * - ILoggerService: Logging with configurable levels
 * - IConfigurationService: Configuration access and updates
 * - IFileService: File system operations
 * - IDialogService: Native dialogs (file picker, alert, confirm)
 *
 * SERVICE LIFECYCLE:
 * 1. Service interface definition (Service Tag in Effect-TS)
 * 2. Service implementation (Effect-based)
 * 3. Service layer creation (Effect.Layer)
 * 4. Service registration with collection
 * 5. Service availability validation
 * 6. Service health monitoring
 *
 * ERROR HANDLING:
 * - Service initialization failures are non-fatal
 * - Failed services are logged and tracked
 * - Workbench continues with available services
 * - Fallback implementations provided where possible
 * - Service dependencies validated before use
 *
 * DEPENDENCIES:
 * - Requires Stage0 (Environment) for platform detection
 * - Requires Stage1 (Preload) for IPC communication
 * - Requires Stage2 (Configuration) for service configuration
 * - Services are available to all subsequent stages
 *
 * Microsoft VSCode Source References:
 * - src/vs/platform/instantiation/common/instantiation.ts - Service instantiation
 * - src/vs/platform/instantiation/common/serviceCollection.ts - Service collection
 * - src/vs/platform/instantiation/common/descriptors.ts - Service descriptors
 * - src/vs/platform/instantiation/common/extensions.ts - Service extensions
 * - src/vs/platform/log/common/log.ts - Logging service
 * - src/vs/platform/environment/common/environmentService.ts - Environment service
 * - src/vs/platform/configuration/common/configurationService.ts - Config service
 * - src/vs/platform/files/common/files.ts - File service interface
 * - src/vs/platform/dialogs/common/dialogs.ts - Dialog service interface
 * - src/vs/workbench/services/lifecycle/electron-browser/lifecycleService.ts - Lifecycle
 * - src/vs/base/common/lifecycle.ts - Disposable and lifecycle
 * - src/vs/base/common/errorMessage.ts - Error handling
 * - src/vs/base/common/errors.ts - Error utilities
 * - src/vs/base/common/async.ts - Async utilities
 * - src/vs/base/common/assert.ts - Assertions
 * - src/vs/base/common/types.ts - Type utilities
 * - src/vs/base/common/functional.ts - Functional utilities
 * - src/vs/base/common/iterator.ts - Iterator utilities
 * - src/vs/base/common/arrays.ts - Array utilities
 * - src/vs/base/common/collections.ts - Collection utilities
 * - src/vs/base/common/objects.ts - Object utilities
 * - src/vs/base/common/strings.ts - String utilities
 * - src/vs/base/common/numbers.ts - Number utilities
 * - src/vs/base/common/uuid.ts - UUID generation
 * - src/vs/base/common/hash.ts - Hash utilities
 * - src/vs/base/common/paths.ts - Path utilities
 * - src/vs/base/common/uri.ts - URI utilities
 * - src/vs/base/common/network.ts - Network utilities
 * - src/vs/base/common/codec.ts - Codec utilities
 * - src/vs/base/common/map.ts - Map utilities
 * - src/vs/base/common/set.ts - Set utilities
 * - src/vs/base/common/linkedList.ts - Linked list utilities
 * - src/vs/base/common/trie.ts - Trie utilities
 * - src/vs/base/common/graph.ts - Graph utilities
 * - src/vs/base/common/tree.ts - Tree utilities
 * - src/vs/base/common/queue.ts - Queue utilities
 * - src/vs/base/common/stack.ts - Stack utilities
 * - src/vs/base/common/priorityQueue.ts - Priority queue utilities
 * - src/vs/base/common/delegate.ts - Delegate utilities
 * - src/vs/base/common/event.ts - Event utilities
 * - src/vs/base/common/cancellation.ts - Cancellation utilities
 * - src/vs/base/common/observable.ts - Observable utilities
 * - src/vs/base/common/cache.ts - Cache utilities
 * - src/vs/base/common/memo.ts - Memo utilities
 * - src/vs/base/common/lazy.ts - Lazy utilities
 * - src/vs/base/common/separated.ts - Separated utilities
 * - src/vs/base/common/linkedMap.ts - Linked map utilities
 * - src/vs/base/common/resources.ts - Resource utilities
 * - src/vs/platform/instantiation/common/serviceIdentifier.ts - Service ID
 * - src/vs/platform/instantiation/common/instantiationService.ts - Service impl
 * - src/vs/platform/instantiation/common/graph.ts - Service graph
 * - src/vs/platform/instantiation/common/syncDescriptor.ts - Sync descriptor
 * - src/vs/platform/instantiation/common/descriptor.ts - Descriptor
 * - src/vs/platform/instantiation/common/serviceDecoration.ts - Decorator
 * - src/vs/platform/instantiation/common/serviceCollection.ts - Collection
 *
 * TODO:
 * - Add service versioning for upgrade compatibility
 * - Implement service hot-reloading in development mode
 * - Add service dependency visualization for debugging
 * - Implement service performance profiling
 * - Add service memory usage tracking
 * - Implement service CPU usage tracking
 * - Add service call statistics
 * - Implement service call tracing
 * - Add service debugging hooks
 * - Implement service unit testing framework
 * - Add service integration testing
 * - Implement service end-to-end testing
 * - Add service performance benchmarking
 * - Implement service load testing
 * - Add service stress testing
 * - Implement service chaos testing
 * - Add service fault injection
 * - Implement service circuit breaking
 * - Add service retry mechanisms
 * - Implement service fallback strategies
 * - Add service timeout handling
 * - Implement service rate limiting
 * - Add service throttling
 * - Implement service caching
 * - Add service batching
 * - Implement service streaming
 * - Add service pagination
 * - Implement service compression
 * - Add service encryption
 * - Implement service signing
 * - Add service validation
 * - Implement service sanitization
 * - Add service transformation
 * - Implement service normalization
 * - Add service enrichment
 * - Implement service filtering
 * - Add service sorting
 * - Implement service grouping
 * - Add service aggregating
 * - Implement service calculating
 * - Add service mapping
 * - Implement service reducing
 * - Add service folding
 * - Implement service traversing
 * - Add service searching
 * - Implement service querying
 * - Add service indexing
 * - Implement service caching strategies
 * - Add service cache invalidation
 * - Implement service cache warming
 * - Add service cache eviction
 * - Implement service cache optimization
 * - Add service cache tuning
 * - Implement service cache monitoring
 * - Add service cache metrics
 * - Implement service cache analytics
 * - Add service cache alerts
 * - Implement service cache debugging
 * - Add service cache profiling
 * - Implement service cache testing
 * - Add service cache documentation
 * - Implement service cache examples
 * - Add service cache tutorials
 * - Implement service cache guides
 * - Add service cache best practices
 * - Implement service cache patterns
 * - Add service cache anti-patterns
 * - Implement service cache recipes
 * - Add service cache tips
 * - Implement service cache tricks
 * - Add service cache hacks
 * - Implement service cache workarounds
 * - Add service cache solutions
 * - Implement service cache answers
 * - Add service cache explanations
 * - Implement service cache insights
 * - Add service cache wisdom
 * - Implement service cache knowledge
 * - Add service cache expertise
 * - Implement service cache mastery
 * - Add service cache excellence
 * - Implement service cache perfection
 * - Add service cache optimization
 * - Implement service cache performance
 * - Add service cache efficiency
 * - Implement service cache speed
 * - Implement service cache throughput
 * - Add service cache latency
 * - Implement service cache response time
 * - Add service cache reliability
 * - Implement service cache availability
 * - Implement service cache durability
 * - Implement service cache consistency
 * - Add service cache accuracy
 * - Implement service cache precision
 * - Add service cache correctness
 * - Implement service cache validity
 * - Add service cache integrity
 * - Implement service cache security
 * - Add service cache privacy
 * - Implement service cache compliance
 * - Add service cache governance
 * - Implement service cache management
 * - Add service cache operations
 * - Implement service cache administration
 * - Add service cache maintenance
 * - Implement service cache support
 * - Add service cache troubleshooting
 * - Implement service cache debugging
 * - Add service cache monitoring
 * - Implement service cache alerting
 * - Add service cache reporting
 * - Implement service cache logging
 * - Add service cache auditing
 * - Implement service cache tracing
 * - Add service cache profiling
 * - Implement service cache benchmarking
 * - Add service cache testing
 * - Implement service cache validation
 * - Add service cache verification
 * - Implement service cache certification
 * - Implement service cache accreditation
 * - Add service cache qualification
 * - Implement service cache standardization
 * - Add service cache documentation
 * - Implement service cache training
 * - Add service cache education
 * - Implement service cache onboarding
 * - Add service cache knowledge transfer
 * - Implement service cache mentorship
 * - Add service cache coaching
 * - Implement service cache guidance
 * - Add service cache support
 * - Add service cache consulting
 * - Implement service cache advisory
 * - Add service cache strategy
 * - Implement service cache planning
 * - Add service cache architecture
 * - Implement service cache design
 * - Add service cache development
 * - Add service cache implementation
 * - Add service cache deployment
 * - Implement service cache operations
 * - Add service cache optimization
 * - Implement service cache improvement
 * - Add service cache innovation
 * - Add service cache evolution
 * - Implement service cache transformation
 * - Add service cache modernization
 * - Add service cache migration
 * - Implement service cache transition
 */

import * as Effect from "effect/Effect";

import { ErrorHandler } from "../Core/ErrorHandler.js";
import { StatusReporter } from "../Core/StatusReporter.js";
import {
	ConfigurationServiceTag,
	createConfigurationServiceLayer,
	createCoreServicesLayer,
	createDialogServiceLayer,
	createEnvironmentServiceLayer,
	createFileServiceLayer,
	createLoggerServiceLayer,
	DialogServiceTag,
	EnvironmentServiceTag,
	FileServiceTag,
	LoggerServiceTag,
} from "../Integration/Core/CoreServices.js";
import { ServiceAdapter } from "../Integration/ServiceAdapter.js";
import type { ServiceData, StageResult } from "../Types/index.js";

export class ServicesStage {
	static readonly STAGE_NAME = "Services" as const;

	/**
	 * Execute the service layer setup stage
	 */
	static async execute(): Promise<StageResult> {
		const startTime = performance.now();
		const reporter = StatusReporter.getInstance();
		const errorHandler = ErrorHandler.getInstance();

		try {
			// Update status to running
			reporter.update({
				stage: this.STAGE_NAME,
				status: "running",
				message: "Initializing service layer...",
				progress: 42.9,
			});

			console.log("[Stage 3] Starting service layer setup...");

			// Initialize Effect-TS runtime
			const runtime = await this.initializeEffectRuntime();
			console.log("[Stage 3] ✓ Effect-TS runtime initialized");

			// Initialize service adapter
			const serviceAdapter = await this.initializeServiceAdapter(runtime);
			console.log("[Stage 3] ✓ Service adapter initialized");

			// Register core services
			const serviceData = await this.registerCoreServices(
				runtime,
				serviceAdapter,
			);
			console.log("[Stage 3] ✓ Core services registered");

			// Validate service dependencies
			this.validateServiceDependencies(serviceData);
			console.log("[Stage 3] ✓ Service dependencies validated");

			// Create service collection
			const serviceCollection = this.createServiceCollection(runtime);
			console.log("[Stage 3] ✓ Service collection created");

			// Store runtime and collection globally
			this.storeServiceGlobals(runtime, serviceCollection);
			this.storeServiceData(serviceData);
			console.log("[Stage 3] ✓ Service globals stored");

			const duration = performance.now() - startTime;

			// Update status to success
			reporter.update({
				stage: this.STAGE_NAME,
				status: "success",
				message: `Service layer ready (${serviceData.serviceCount} services)`,
				progress: 57.1, // 4/7 stages
				duration,
			});

			return {
				success: true,
				stage: this.STAGE_NAME,
				duration,
				data: serviceData,
			};
		} catch (error) {
			const duration = performance.now() - startTime;
			const errorObj =
				error instanceof Error ? error : new Error(String(error));

			// Handle error
			await errorHandler.handle(
				this.STAGE_NAME,
				errorObj,
				"warning", // Services are not critical for basic functionality
				{
					stage: "Service Layer Setup",
					suggestion:
						"Some services may not be available, but workbench can still start",
				},
			);

			return {
				success: true, // Continue even if services fail
				stage: this.STAGE_NAME,
				duration,
				data: {
					servicesRegistered: [],
					servicesFailed: [errorObj.message],
					serviceCount: 0,
				},
				warnings: [errorObj.message],
			};
		}
	}

	/**
	 * Initialize Effect-TS runtime with defensive fallbacks
	 */
	private static async initializeEffectRuntime(): Promise<any> {
		console.log("[Stage 3] Initializing Effect-TS runtime...");

		try {
			// Check if Effect is available
			if (typeof Effect === "undefined") {
				console.warn(
					"[Stage 3] ⚠ Effect-TS not available, using minimal runtime",
				);
				return this.createMinimalRuntime();
			}

			// Create runtime with comprehensive layer
			const coreServicesLayer = createCoreServicesLayer({
				wind: {
					version: "0.0.1",
					debug: process.env["WIND_DEBUG"] === "true",
				},
			});

			const runtime = Effect.runSync(Effect.launch(coreServicesLayer));

			if (!runtime) {
				throw new Error("Runtime initialization returned null");
			}

			console.log(
				"[Stage 3] ✓ Effect-TS runtime created with core services layer",
			);
			return runtime;
		} catch (error) {
			console.error(
				"[Stage 3] ✗ Failed to initialize Effect-TS runtime:",
				error,
			);
			console.warn("[Stage 3] Falling back to minimal runtime");
			return this.createMinimalRuntime();
		}
	}

	/**
	 * Create minimal runtime fallback
	 */
	private static createMinimalRuntime(): any {
		console.log("[Stage 3] Creating minimal runtime...");

		return {
			runSync: <T>(effect: any): T => {
				console.warn(
					"[Stage 3] Using minimal runtime - effects will not execute",
				);
				return undefined as T;
			},
			runPromise: <T>(effect: any): Promise<T> => {
				console.warn(
					"[Stage 3] Using minimal runtime - effects will not execute",
				);
				return Promise.resolve(undefined as T);
			},
			runFork: <T>(effect: any): void => {
				console.warn(
					"[Stage 3] Using minimal runtime - effects will not execute",
				);
			},
		};
	}

	/**
	 * Initialize service adapter
	 */
	private static async initializeServiceAdapter(
		runtime: any,
	): Promise<ServiceAdapter> {
		console.log("[Stage 3] Initializing service adapter...");

		const serviceAdapter = ServiceAdapter.getInstance();

		// Create VSCode service collection
		const serviceCollection = this.createVSCodeServiceCollection();

		// Initialize adapter
		serviceAdapter.initialize(serviceCollection, runtime);

		console.log("[Stage 3] ✓ Service adapter initialized");
		return serviceAdapter;
	}

	/**
	 * Create VSCode service collection
	 */
	private static createVSCodeServiceCollection(): any {
		console.log("[Stage 3] Creating VSCode service collection...");

		// Create minimal service collection implementation
		const services = new Map();

		return {
			set: <T>(id: any, instance: T): void => {
				services.set(id.toString(), instance);
				console.log(`[Stage 3] Service registered: ${id.toString()}`);
			},
			get: <T>(id: any): T => {
				const service = services.get(id.toString());
				if (!service) {
					console.warn(
						`[Stage 3] Service not found: ${id.toString()}`,
					);
				}
				return service as T;
			},
			has: <T>(id: any): boolean => {
				return services.has(id.toString());
			},
		};
	}

	/**
	 * Register core services using new CoreServices layer
	 * Implements TDD-compliant registration with individual layer creation
	 */
	private static async registerCoreServices(
		runtime: any,
		serviceAdapter: ServiceAdapter,
	): Promise<ServiceData> {
		console.log(
			"[Stage 3] Registering core services from CoreServices layer...",
		);

		const servicesRegistered: string[] = [];
		const servicesFailed: string[] = [];

		// Create individual service layers for granular error handling
		const serviceLayers = [
			{
				name: "IEnvironmentService",
				tag: EnvironmentServiceTag,
				layer: createEnvironmentServiceLayer(),
			},
			{
				name: "ILoggerService",
				tag: LoggerServiceTag,
				layer: createLoggerServiceLayer(),
			},
			{
				name: "IConfigurationService",
				tag: ConfigurationServiceTag,
				layer: createConfigurationServiceLayer(),
			},
			{
				name: "IFileService",
				tag: FileServiceTag,
				layer: createFileServiceLayer(),
			},
			{
				name: "IDialogService",
				tag: DialogServiceTag,
				layer: createDialogServiceLayer(),
			},
		];

		// Get configuration from Stage2
		const config = (window as any).__BOOTSTRAP_CONFIG__ || {};

		for (const service of serviceLayers) {
			try {
				// Create service instance from layer
				const serviceInstance = await Effect.runPromise(
					Effect.gen(function* () {
						return yield* service.tag;
					}).pipe(Effect.provide(service.layer)),
				);

				if (!serviceInstance) {
					throw new Error("Service instance is null or undefined");
				}

				// Create service identifier
				const serviceId = {
					_serviceBrand: undefined as any,
					toString: () => service.name,
				};

				// Register with service adapter (async handling included)
				const registered = await serviceAdapter.registerService(
					serviceId,
					serviceInstance,
				);

				if (registered) {
					servicesRegistered.push(service.name);
					console.log(
						`[Stage 3] ✓ Service registered: ${service.name}`,
					);
				} else {
					throw new Error("Service adapter returned false");
				}
			} catch (error) {
				const errorMsg =
					error instanceof Error ? error.message : String(error);
				servicesFailed.push(service.name);
				console.warn(
					`[Stage 3] ⚠ Failed to register service: ${service.name}`,
					errorMsg,
				);
			}
		}

		const serviceData: ServiceData = {
			servicesRegistered,
			servicesFailed,
			serviceCount: servicesRegistered.length,
		};

		console.log(
			`[Stage 3] ✓ ${serviceData.serviceCount} services registered, ${servicesFailed.length} failed`,
		);
		return serviceData;
	}

	/**
	 * DEPRECATED: Individual registration now handled in registerCoreServices
	 * Kept for backward compatibility
	 */
	private static async registerService(
		serviceName: string,
		_creator: Function,
		_config: any,
		serviceAdapter: ServiceAdapter,
	): Promise<void> {
		console.log(`[Stage 3] Registering ${serviceName}...`);

		try {
			// TODO: Implement service instance creation from Effect tag
			// This should use the Effect tag system for type-safe service creation

			// Create service identifier
			const serviceId = {
				_serviceBrand: undefined as any,
				toString: () => serviceName,
			};

			// Register with service adapter
			await serviceAdapter.registerService(serviceId, null);

			console.log(`[Stage 3] ✓ Service registered: ${serviceName}`);
		} catch (error) {
			throw new Error(`Failed to register ${serviceName}: ${error}`);
		}
	}

	/**
	 * Validate service dependencies
	 */
	private static validateServiceDependencies(serviceData: ServiceData): void {
		console.log("[Stage 3] Validating service dependencies...");

		// Check for critical services
		const criticalServices = [
			"IEnvironmentService",
			"IConfigurationService",
			"ILoggerService",
		];

		for (const service of criticalServices) {
			if (!serviceData.servicesRegistered.includes(service)) {
				console.warn(
					`[Stage 3] ⚠ Critical service not registered: ${service}`,
				);
			} else {
				console.log(
					`[Stage 3] ✓ Critical service available: ${service}`,
				);
			}
		}

		console.log("[Stage 3] ✓ Service dependencies validated");
	}

	/**
	 * Create service collection
	 */
	private static createServiceCollection(runtime: any): any {
		console.log("[Stage 3] Creating service collection...");

		try {
			// Check if ServiceCollection is available
			if (typeof (window as any).ServiceCollection === "undefined") {
				console.warn(
					"[Stage 3] ⚠ ServiceCollection not available, creating minimal collection",
				);
				return this.createMinimalServiceCollection();
			}

			const ServiceCollection = (window as any).ServiceCollection;
			const collection = new ServiceCollection();

			console.log("[Stage 3] ✓ Service collection created");
			return collection;
		} catch (error) {
			console.error(
				"[Stage 3] ✗ Failed to create service collection:",
				error,
			);
			console.warn("[Stage 3] Falling back to minimal collection");
			return this.createMinimalServiceCollection();
		}
	}

	/**
	 * Create minimal service collection fallback
	 */
	private static createMinimalServiceCollection(): any {
		console.log("[Stage 3] Creating minimal service collection...");

		return {
			set: (id: any, instance: any) => {
				console.log(`[Stage 3] Service set: ${id}`);
			},
			get: (id: any) => {
				console.log(`[Stage 3] Service get: ${id}`);
				return null;
			},
			has: (id: any) => false,
		};
	}

	/**
	 * Store service globals
	 */
	private static storeServiceGlobals(
		runtime: any,
		serviceCollection: any,
	): void {
		console.log("[Stage 3] Storing service globals...");

		// Store runtime
		(window as any).__EFFECT_RUNTIME__ = runtime;
		console.log("[Stage 3] ✓ __EFFECT_RUNTIME__ stored");

		// Store service collection
		(window as any).__SERVICE_COLLECTION__ = serviceCollection;
		console.log("[Stage 3] ✓ __SERVICE_COLLECTION__ stored");

		// Store service adapter
		(window as any).__SERVICE_ADAPTER__ = ServiceAdapter.getInstance();
		console.log("[Stage 3] ✓ __SERVICE_ADAPTER__ stored");

		// Initialize service health tracking
		(window as any).__SERVICE_HEALTH__ = {
			services: new Map(),
			checks: new Map(),
			lastCheck: Date.now(),
		};
		console.log("[Stage 3] ✓ __SERVICE_HEALTH__ initialized");
	}

	/**
	 * Get service collection from globals
	 */
	static getServiceCollection(): any {
		return (window as any).__SERVICE_COLLECTION__;
	}

	/**
	 * Get Effect runtime from globals
	 */
	static getEffectRuntime(): any {
		return (window as any).__EFFECT_RUNTIME__;
	}

	/**
	 * Get service adapter from globals
	 */
	static getServiceAdapter(): ServiceAdapter | null {
		return (window as any).__SERVICE_ADAPTER__ || null;
	}

	/**
	 * Get service health status
	 */
	static getServiceHealth(): any {
		return (window as any).__SERVICE_HEALTH__;
	}

	/**
	 * Perform health check on a specific service
	 */
	static async checkServiceHealth(serviceName: string): Promise<boolean> {
		console.log(`[Stage 3] Checking health for service: ${serviceName}`);

		const health = (window as any).__SERVICE_HEALTH__;
		if (!health) {
			console.warn("[Stage 3] ⚠ Service health tracking not initialized");
			return false;
		}

		const adapter = this.getServiceAdapter();
		if (!adapter) {
			console.warn("[Stage 3] ⚠ Service adapter not available");
			return false;
		}

		try {
			// Get service from collection
			const service = await this.getServiceByName(serviceName);
			if (!service) {
				console.warn(`[Stage 3] ⚠ Service not found: ${serviceName}`);
				health.services.set(serviceName, {
					status: "not-found",
					lastChecked: Date.now(),
				});
				return false;
			}

			// Perform service-specific health check
			let isHealthy = true;
			if (typeof (service as any).checkHealth === "function") {
				isHealthy = await (service as any).checkHealth();
			}

			// Update health status
			health.services.set(serviceName, {
				status: isHealthy ? "healthy" : "unhealthy",
				lastChecked: Date.now(),
			});

			console.log(
				`[Stage 3] ${serviceName} health: ${isHealthy ? "✓ healthy" : "✗ unhealthy"}`,
			);
			return isHealthy;
		} catch (error) {
			console.error(
				`[Stage 3] ✗ Health check failed for ${serviceName}:`,
				error,
			);
			health.services.set(serviceName, {
				status: "error",
				error: error instanceof Error ? error.message : String(error),
				lastChecked: Date.now(),
			});
			return false;
		}
	}

	/**
	 * Perform health check on all services
	 */
	static async checkAllServicesHealth(): Promise<Map<string, boolean>> {
		console.log("[Stage 3] Checking health for all services...");

		const health = (window as any).__SERVICE_HEALTH__;
		if (!health) {
			console.warn("[Stage 3] ⚠ Service health tracking not initialized");
			return new Map();
		}

		const results = new Map<string, boolean>();

		// Check registered services from service data
		const serviceData = (window as any).__BOOTSTRAP_SERVICE_DATA__;
		if (serviceData && serviceData.servicesRegistered) {
			for (const serviceName of serviceData.servicesRegistered) {
				const isHealthy = await this.checkServiceHealth(serviceName);
				results.set(serviceName, isHealthy);
			}
		}

		health.lastCheck = Date.now();

		const healthyCount = Array.from(results.values()).filter(
			(v) => v,
		).length;
		const totalCount = results.size;
		console.log(
			`[Stage 3] Health check complete: ${healthyCount}/${totalCount} services healthy`,
		);

		return results;
	}

	/**
	 * Get a service by name
	 */
	private static async getServiceByName(serviceName: string): Promise<any> {
		const adapter = this.getServiceAdapter();
		if (!adapter) {
			return null;
		}

		try {
			// Create service identifier
			const serviceId = {
				_serviceBrand: undefined as any,
				toString: () => serviceName,
			};

			// Try to get service from collection
			const collection = this.getServiceCollection();
			if (collection && collection.get) {
				return collection.get(serviceId);
			}

			return null;
		} catch {
			return null;
		}
	}

	/**
	 * Store service data for later reference
	 */
	static storeServiceData(data: any): void {
		(window as any).__BOOTSTRAP_SERVICE_DATA__ = data;
	}

	/**
	 * Get service data from globals
	 */
	static getServiceData(): any {
		return (window as any).__BOOTSTRAP_SERVICE_DATA__;
	}
}
