/**
 * @module HealthService
 * @description
 * Wind's Health Service for real-time service discovery and health monitoring
 * Provides comprehensive health monitoring for Mountain services and Wind components
 *
 * Features:
 * - Real-time service discovery
 * - Health status monitoring
 * - Performance metrics collection
 * - Error recovery mechanisms
 * - Service dependency tracking
 * - Health status reporting
 */

import { emit, invoke, listen } from "@tauri-apps/api/core";

/**
 * Service health status
 */
export enum ServiceHealthStatus {
	HEALTHY = "healthy",
	DEGRADED = "degraded",
	UNHEALTHY = "unhealthy",
	UNKNOWN = "unknown",
}

/**
 * Service discovery information
 */
export interface ServiceInfo {
	name: string;
	version: string;
	status: ServiceHealthStatus;
	lastHeartbeat: number;
	uptime: number;
	dependencies: string[];
	metrics: ServiceMetrics;
	endpoint?: string;
	port?: number;
}

/**
 * Service performance metrics
 */
export interface ServiceMetrics {
	responseTime: number;
	errorRate: number;
	throughput: number;
	memoryUsage: number;
	cpuUsage: number;
	lastUpdated: number;
}

/**
 * Health monitoring configuration
 */
export interface HealthConfig {
	heartbeatInterval: number;
	healthCheckInterval: number;
	timeoutThreshold: number;
	errorThreshold: number;
	enableAutoRecovery: boolean;
	maxRetryAttempts: number;
}

/**
 * Health event
 */
export interface HealthEvent {
	type:
		| "service_discovered"
		| "service_healthy"
		| "service_degraded"
		| "service_unhealthy"
		| "service_lost"
		| "recovery_attempted"
		| "recovery_successful";
	timestamp: number;
	service: string;
	data?: any;
	error?: string;
}

/**
 * Service discovery and health monitoring service
 */
export class HealthService {
	private discoveredServices: Map<string, ServiceInfo> = new Map();
	private healthConfig: HealthConfig;
	private eventListeners: Set<(event: HealthEvent) => void> = new Set();
	private heartbeatIntervalId: number | null = null;
	private healthCheckIntervalId: number | null = null;
	private serviceDependencies: Map<string, string[]> = new Map();
	private errorCounts: Map<string, number> = new Map();
	private recoveryAttempts: Map<string, number> = new Map();

	constructor(config: Partial<HealthConfig> = {}) {
		this.healthConfig = {
			heartbeatInterval: 5000,
			healthCheckInterval: 10000,
			timeoutThreshold: 30000,
			errorThreshold: 5,
			enableAutoRecovery: true,
			maxRetryAttempts: 3,
			...config,
		};

		console.log("[HealthService] Initializing health monitoring service");
		this.initialize();
	}

	/**
	 * Initialize health service
	 */
	private async initialize(): Promise<void> {
		try {
			// Set up event listeners
			await this.setupEventListeners();

			// Start service discovery
			await this.discoverServices();

			// Start heartbeat monitoring
			this.startHeartbeatMonitoring();

			// Start health checks
			this.startHealthChecks();

			console.log(
				"[HealthService] Health monitoring service initialized",
			);
		} catch (error) {
			console.error("[HealthService] Failed to initialize:", error);
			this.emitEvent({
				type: "service_unhealthy",
				timestamp: Date.now(),
				service: "HealthService",
				error: `Initialization failed: ${error}`,
			});
		}
	}

	/**
	 * Set up event listeners for Mountain health events
	 */
	private async setupEventListeners(): Promise<void> {
		try {
			// Listen for Mountain service status updates
			await listen("mountain_service_status", (event) => {
				this.handleMountainServiceStatus(event.payload as any);
			});

			// Listen for Mountain health alerts
			await listen("mountain_health_alert", (event) => {
				this.handleMountainHealthAlert(event.payload as any);
			});

			// Listen for Mountain performance metrics
			await listen("mountain_performance_metrics", (event) => {
				this.handleMountainPerformanceMetrics(event.payload as any);
			});

			console.log("[HealthService] Event listeners setup complete");
		} catch (error) {
			console.error(
				"[HealthService] Failed to setup event listeners:",
				error,
			);
			throw error;
		}
	}

	/**
	 * Discover available Mountain services
	 */
	private async discoverServices(): Promise<void> {
		try {
			console.log("[HealthService] Discovering Mountain services");

			// Get Mountain service status
			const mountainServices = await invoke(
				"mountain_get_services_status",
			);

			// Process discovered services
			for (const [serviceName, serviceInfo] of Object.entries(
				mountainServices,
			)) {
				await this.registerService(serviceName, serviceInfo as any);
			}

			console.log(
				`[HealthService] Discovered ${this.discoveredServices.size} Mountain services`,
			);
		} catch (error) {
			console.error("[HealthService] Service discovery failed:", error);
			this.emitEvent({
				type: "service_unhealthy",
				timestamp: Date.now(),
				service: "ServiceDiscovery",
				error: `Discovery failed: ${error}`,
			});
		}
	}

	/**
	 * Register a discovered service
	 */
	private async registerService(
		serviceName: string,
		serviceInfo: any,
	): Promise<void> {
		const service: ServiceInfo = {
			name: serviceName,
			version: serviceInfo.version || "1.0.0",
			status: this.mapStatus(serviceInfo.status),
			lastHeartbeat: Date.now(),
			uptime: serviceInfo.uptime || 0,
			dependencies: serviceInfo.dependencies || [],
			metrics: {
				responseTime: serviceInfo.responseTime || 0,
				errorRate: serviceInfo.errorRate || 0,
				throughput: serviceInfo.throughput || 0,
				memoryUsage: serviceInfo.memoryUsage || 0,
				cpuUsage: serviceInfo.cpuUsage || 0,
				lastUpdated: Date.now(),
			},
			endpoint: serviceInfo.endpoint,
			port: serviceInfo.port,
		};

		this.discoveredServices.set(serviceName, service);

		// Track dependencies
		this.serviceDependencies.set(serviceName, service.dependencies);

		// Initialize error count
		this.errorCounts.set(serviceName, 0);

		console.log(`[HealthService] Registered service: ${serviceName}`);

		this.emitEvent({
			type: "service_discovered",
			timestamp: Date.now(),
			service: serviceName,
			data: service,
		});
	}

	/**
	 * Map Mountain status to Wind health status
	 */
	private mapStatus(mountainStatus: string): ServiceHealthStatus {
		switch (mountainStatus?.toLowerCase()) {
			case "running":
				return ServiceHealthStatus.HEALTHY;
			case "degraded":
				return ServiceHealthStatus.DEGRADED;
			case "stopped":
			case "error":
				return ServiceHealthStatus.UNHEALTHY;
			default:
				return ServiceHealthStatus.UNKNOWN;
		}
	}

	/**
	 * Start heartbeat monitoring
	 */
	private startHeartbeatMonitoring(): void {
		this.heartbeatIntervalId = window.setInterval(async () => {
			await this.checkServiceHeartbeats();
		}, this.healthConfig.heartbeatInterval);

		console.log("[HealthService] Heartbeat monitoring started");
	}

	/**
	 * Check service heartbeats
	 */
	private async checkServiceHeartbeats(): Promise<void> {
		const now = Date.now();

		for (const [
			serviceName,
			serviceInfo,
		] of this.discoveredServices.entries()) {
			const timeSinceHeartbeat = now - serviceInfo.lastHeartbeat;

			if (timeSinceHeartbeat > this.healthConfig.timeoutThreshold) {
				console.warn(
					`[HealthService] Service ${serviceName} heartbeat timeout`,
				);

				// Mark service as unhealthy
				serviceInfo.status = ServiceHealthStatus.UNHEALTHY;

				this.emitEvent({
					type: "service_lost",
					timestamp: now,
					service: serviceName,
					error: `Heartbeat timeout: ${timeSinceHeartbeat}ms`,
				});

				// Attempt recovery if enabled
				if (this.healthConfig.enableAutoRecovery) {
					await this.attemptServiceRecovery(serviceName);
				}
			}
		}
	}

	/**
	 * Start health checks
	 */
	private startHealthChecks(): void {
		this.healthCheckIntervalId = window.setInterval(async () => {
			await this.performHealthChecks();
		}, this.healthConfig.healthCheckInterval);

		console.log("[HealthService] Health checks started");
	}

	/**
	 * Perform comprehensive health checks
	 */
	private async performHealthChecks(): Promise<void> {
		console.log("[HealthService] Performing health checks");

		for (const [
			serviceName,
			serviceInfo,
		] of this.discoveredServices.entries()) {
			try {
				await this.checkServiceHealth(serviceName, serviceInfo);
			} catch (error) {
				console.error(
					`[HealthService] Health check failed for ${serviceName}:`,
					error,
				);

				// Increment error count
				const errorCount = (this.errorCounts.get(serviceName) || 0) + 1;
				this.errorCounts.set(serviceName, errorCount);

				// Update service status based on error threshold
				if (errorCount >= this.healthConfig.errorThreshold) {
					serviceInfo.status = ServiceHealthStatus.UNHEALTHY;

					this.emitEvent({
						type: "service_unhealthy",
						timestamp: Date.now(),
						service: serviceName,
						error: `Health check failed: ${error}`,
					});
				}
			}
		}
	}

	/**
	 * Check individual service health
	 */
	private async checkServiceHealth(
		serviceName: string,
		serviceInfo: ServiceInfo,
	): Promise<void> {
		try {
			// Get detailed service status from Mountain
			const detailedStatus = await invoke(`mountain_get_service_status`, {
				service: serviceName,
			});

			// Update service information
			serviceInfo.status = this.mapStatus(detailedStatus.status);
			serviceInfo.lastHeartbeat = Date.now();
			serviceInfo.uptime = detailedStatus.uptime || serviceInfo.uptime;

			// Update metrics
			serviceInfo.metrics = {
				...serviceInfo.metrics,
				responseTime:
					detailedStatus.responseTime ||
					serviceInfo.metrics.responseTime,
				errorRate:
					detailedStatus.errorRate || serviceInfo.metrics.errorRate,
				throughput:
					detailedStatus.throughput || serviceInfo.metrics.throughput,
				memoryUsage:
					detailedStatus.memoryUsage ||
					serviceInfo.metrics.memoryUsage,
				cpuUsage:
					detailedStatus.cpuUsage || serviceInfo.metrics.cpuUsage,
				lastUpdated: Date.now(),
			};

			// Reset error count on successful health check
			this.errorCounts.set(serviceName, 0);

			// Emit health status event
			if (serviceInfo.status === ServiceHealthStatus.HEALTHY) {
				this.emitEvent({
					type: "service_healthy",
					timestamp: Date.now(),
					service: serviceName,
					data: serviceInfo,
				});
			}

			console.log(
				`[HealthService] Service ${serviceName} health check: ${serviceInfo.status}`,
			);
		} catch (error) {
			console.error(
				`[HealthService] Failed to check health for ${serviceName}:`,
				error,
			);
			throw error;
		}
	}

	/**
	 * Attempt service recovery
	 */
	private async attemptServiceRecovery(serviceName: string): Promise<void> {
		const currentAttempts = this.recoveryAttempts.get(serviceName) || 0;

		if (currentAttempts >= this.healthConfig.maxRetryAttempts) {
			console.warn(
				`[HealthService] Max recovery attempts reached for ${serviceName}`,
			);
			return;
		}

		console.log(
			`[HealthService] Attempting recovery for ${serviceName} (attempt ${currentAttempts + 1})`,
		);

		this.recoveryAttempts.set(serviceName, currentAttempts + 1);

		this.emitEvent({
			type: "recovery_attempted",
			timestamp: Date.now(),
			service: serviceName,
			data: { attempt: currentAttempts + 1 },
		});

		try {
			// Attempt to restart the service via Mountain
			await invoke("mountain_restart_service", { service: serviceName });

			// Wait for service to come back online
			await this.waitForServiceRecovery(serviceName);

			// Reset recovery attempts on success
			this.recoveryAttempts.set(serviceName, 0);

			this.emitEvent({
				type: "recovery_successful",
				timestamp: Date.now(),
				service: serviceName,
				data: { attempt: currentAttempts + 1 },
			});

			console.log(
				`[HealthService] Recovery successful for ${serviceName}`,
			);
		} catch (error) {
			console.error(
				`[HealthService] Recovery failed for ${serviceName}:`,
				error,
			);

			this.emitEvent({
				type: "service_unhealthy",
				timestamp: Date.now(),
				service: serviceName,
				error: `Recovery failed: ${error}`,
			});
		}
	}

	/**
	 * Wait for service recovery
	 */
	private async waitForServiceRecovery(serviceName: string): Promise<void> {
		const maxWaitTime = 30000; // 30 seconds
		const checkInterval = 1000; // 1 second
		const startTime = Date.now();

		while (Date.now() - startTime < maxWaitTime) {
			try {
				const status = await invoke(`mountain_get_service_status`, {
					service: serviceName,
				});

				if (status.status === "running") {
					console.log(
						`[HealthService] Service ${serviceName} recovered`,
					);
					return;
				}

				await new Promise((resolve) =>
					setTimeout(resolve, checkInterval),
				);
			} catch (error) {
				// Service not available yet, continue waiting
				await new Promise((resolve) =>
					setTimeout(resolve, checkInterval),
				);
			}
		}

		throw new Error(
			`Service ${serviceName} did not recover within ${maxWaitTime}ms`,
		);
	}

	/**
	 * Handle Mountain service status updates
	 */
	private handleMountainServiceStatus(statusUpdate: any): void {
		const { service, status, metrics } = statusUpdate;

		const serviceInfo = this.discoveredServices.get(service);
		if (!serviceInfo) {
			console.warn(
				`[HealthService] Received status update for unknown service: ${service}`,
			);
			return;
		}

		// Update service status
		serviceInfo.status = this.mapStatus(status);
		serviceInfo.lastHeartbeat = Date.now();

		// Update metrics if provided
		if (metrics) {
			serviceInfo.metrics = {
				...serviceInfo.metrics,
				...metrics,
				lastUpdated: Date.now(),
			};
		}

		console.log(
			`[HealthService] Service ${service} status updated: ${serviceInfo.status}`,
		);

		// Emit appropriate event
		const eventType =
			serviceInfo.status === ServiceHealthStatus.HEALTHY
				? "service_healthy"
				: serviceInfo.status === ServiceHealthStatus.DEGRADED
					? "service_degraded"
					: "service_unhealthy";

		this.emitEvent({
			type: eventType,
			timestamp: Date.now(),
			service: service,
			data: serviceInfo,
		});
	}

	/**
	 * Handle Mountain health alerts
	 */
	private handleMountainHealthAlert(alert: any): void {
		const { service, issue, severity } = alert;

		console.warn(
			`[HealthService] Health alert for ${service}: ${issue} (${severity})`,
		);

		const serviceInfo = this.discoveredServices.get(service);
		if (serviceInfo) {
			// Update service status based on alert severity
			if (severity === "critical") {
				serviceInfo.status = ServiceHealthStatus.UNHEALTHY;
			} else if (severity === "high") {
				serviceInfo.status = ServiceHealthStatus.DEGRADED;
			}

			this.emitEvent({
				type: "service_unhealthy",
				timestamp: Date.now(),
				service: service,
				error: issue,
			});
		}
	}

	/**
	 * Handle Mountain performance metrics
	 */
	private handleMountainPerformanceMetrics(metrics: any): void {
		const { service, ...performanceData } = metrics;

		const serviceInfo = this.discoveredServices.get(service);
		if (serviceInfo) {
			serviceInfo.metrics = {
				...serviceInfo.metrics,
				...performanceData,
				lastUpdated: Date.now(),
			};

			console.log(
				`[HealthService] Updated performance metrics for ${service}`,
			);
		}
	}

	/**
	 * Emit health event
	 */
	private emitEvent(event: HealthEvent): void {
		this.eventListeners.forEach((listener) => {
			try {
				listener(event);
			} catch (error) {
				console.error(
					"[HealthService] Error in event listener:",
					error,
				);
			}
		});
	}

	/**
	 * Add event listener
	 */
	onHealthEvent(listener: (event: HealthEvent) => void): void {
		this.eventListeners.add(listener);
	}

	/**
	 * Remove event listener
	 */
	offHealthEvent(listener: (event: HealthEvent) => void): void {
		this.eventListeners.delete(listener);
	}

	/**
	 * Get discovered services
	 */
	getDiscoveredServices(): Map<string, ServiceInfo> {
		return new Map(this.discoveredServices);
	}

	/**
	 * Get service health status
	 */
	getServiceHealth(serviceName: string): ServiceInfo | undefined {
		return this.discoveredServices.get(serviceName);
	}

	/**
	 * Get overall system health
	 */
	getSystemHealth(): {
		overallStatus: ServiceHealthStatus;
		healthyServices: number;
		totalServices: number;
		degradedServices: number;
		unhealthyServices: number;
	} {
		const services = Array.from(this.discoveredServices.values());
		const healthyServices = services.filter(
			(s) => s.status === ServiceHealthStatus.HEALTHY,
		).length;
		const degradedServices = services.filter(
			(s) => s.status === ServiceHealthStatus.DEGRADED,
		).length;
		const unhealthyServices = services.filter(
			(s) => s.status === ServiceHealthStatus.UNHEALTHY,
		).length;

		let overallStatus = ServiceHealthStatus.HEALTHY;
		if (unhealthyServices > 0) {
			overallStatus = ServiceHealthStatus.UNHEALTHY;
		} else if (degradedServices > 0) {
			overallStatus = ServiceHealthStatus.DEGRADED;
		}

		return {
			overallStatus,
			healthyServices,
			totalServices: services.length,
			degradedServices,
			unhealthyServices,
		};
	}

	/**
	 * Get service dependencies
	 */
	getServiceDependencies(serviceName: string): string[] {
		return this.serviceDependencies.get(serviceName) || [];
	}

	/**
	 * Get error count for service
	 */
	getServiceErrorCount(serviceName: string): number {
		return this.errorCounts.get(serviceName) || 0;
	}

	/**
	 * Get recovery attempts for service
	 */
	getRecoveryAttempts(serviceName: string): number {
		return this.recoveryAttempts.get(serviceName) || 0;
	}

	/**
	 * Manually trigger service discovery
	 */
	async triggerServiceDiscovery(): Promise<void> {
		await this.discoverServices();
	}

	/**
	 * Manually trigger health check
	 */
	async triggerHealthCheck(): Promise<void> {
		await this.performHealthChecks();
	}

	/**
	 * Dispose health service
	 */
	dispose(): void {
		if (this.heartbeatIntervalId) {
			window.clearInterval(this.heartbeatIntervalId);
			this.heartbeatIntervalId = null;
		}

		if (this.healthCheckIntervalId) {
			window.clearInterval(this.healthCheckIntervalId);
			this.healthCheckIntervalId = null;
		}

		this.eventListeners.clear();
		this.discoveredServices.clear();
		this.serviceDependencies.clear();
		this.errorCounts.clear();
		this.recoveryAttempts.clear();

		console.log("[HealthService] Health monitoring service disposed");
	}
}

/**
 * Singleton instance
 */
export const healthService = new HealthService();
