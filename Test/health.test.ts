/**
 * Health Service Tests
 * Tests for the HealthService implementation
 */

import { HealthService, ServiceHealthStatus } from '../Source/Bootstrap/Integration/Services/HealthService';

// Mock Tauri APIs
const mockInvoke = async (command: string, args?: any): Promise<any> => {
    console.log(`Mock invoke: ${command}`, args);
    
    switch (command) {
        case 'mountain_get_services_status':
            return {
                'EditorService': { status: 'running', version: '1.0.0' },
                'ExtensionHostService': { status: 'running', version: '1.0.0' },
                'ConfigurationService': { status: 'running', version: '1.0.0' },
                'FileService': { status: 'running', version: '1.0.0' },
                'StorageService': { status: 'running', version: '1.0.0' }
            };
        case 'mountain_get_service_status':
            return { status: 'running', uptime: 1000 };
        case 'mountain_restart_service':
            return { success: true };
        default:
            return {};
    }
};

const mockListen = async (event: string, callback: (event: any) => void): Promise<void> => {
    console.log(`Mock listen: ${event}`);
    // Simulate receiving events
    setTimeout(() => {
        callback({
            payload: {
                service: 'EditorService',
                status: 'running',
                metrics: { responseTime: 5.0, errorRate: 0.1 }
            }
        });
    }, 100);
};

const mockEmit = async (event: string, payload?: any): Promise<void> => {
    console.log(`Mock emit: ${event}`, payload);
};

// Mock global Tauri API
(globalThis as any).__TAURI__ = {
    core: {
        invoke: mockInvoke,
        listen: mockListen,
        emit: mockEmit
    }
};

// Simple test runner
const runTests = async () => {
    console.log('Running HealthService tests...');
    
    let healthService: HealthService;
    
    // Test: should initialize health service
    try {
        healthService = new HealthService({
            heartbeatInterval: 1000,
            healthCheckInterval: 2000,
            timeoutThreshold: 5000,
            errorThreshold: 3,
            enableAutoRecovery: true,
            maxRetryAttempts: 2
        });
        
        console.log('✓ HealthService initialized successfully');
    } catch (error) {
        console.error('✗ HealthService initialization failed:', error);
        return;
    }
    
    // Test: should discover services
    try {
        const services = healthService.getDiscoveredServices();
        console.log(`✓ Service discovery: ${services.size} services found`);
    } catch (error) {
        console.error('✗ Service discovery failed:', error);
    }
    
    // Test: should get service health
    try {
        const serviceHealth = healthService.getServiceHealth('EditorService');
        console.log(`✓ Service health retrieved: ${serviceHealth?.status}`);
    } catch (error) {
        console.error('✗ Service health retrieval failed:', error);
    }
    
    // Test: should get system health
    try {
        const systemHealth = healthService.getSystemHealth();
        console.log(`✓ System health: ${systemHealth.overallStatus}`);
        console.log(`  Healthy: ${systemHealth.healthyServices}, Total: ${systemHealth.totalServices}`);
    } catch (error) {
        console.error('✗ System health retrieval failed:', error);
    }
    
    // Test: should handle events
    try {
        let eventReceived = false;
        healthService.onHealthEvent((event) => {
            console.log(`✓ Health event received: ${event.type} for ${event.service}`);
            eventReceived = true;
        });
        
        // Trigger a mock event
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✓ Event handling test completed');
    } catch (error) {
        console.error('✗ Event handling test failed:', error);
    }
    
    // Test: should trigger manual health check
    try {
        await healthService.triggerHealthCheck();
        console.log('✓ Manual health check triggered');
    } catch (error) {
        console.error('✗ Manual health check failed:', error);
    }
    
    // Test: should trigger service discovery
    try {
        await healthService.triggerServiceDiscovery();
        console.log('✓ Manual service discovery triggered');
    } catch (error) {
        console.error('✗ Manual service discovery failed:', error);
    }
    
    // Test: should get service dependencies
    try {
        const dependencies = healthService.getServiceDependencies('EditorService');
        console.log(`✓ Service dependencies: ${dependencies.length} dependencies`);
    } catch (error) {
        console.error('✗ Service dependencies retrieval failed:', error);
    }
    
    // Test: should get error counts
    try {
        const errorCount = healthService.getServiceErrorCount('EditorService');
        console.log(`✓ Service error count: ${errorCount}`);
    } catch (error) {
        console.error('✗ Service error count retrieval failed:', error);
    }
    
    // Test: should get recovery attempts
    try {
        const recoveryAttempts = healthService.getRecoveryAttempts('EditorService');
        console.log(`✓ Service recovery attempts: ${recoveryAttempts}`);
    } catch (error) {
        console.error('✗ Service recovery attempts retrieval failed:', error);
    }
    
    // Cleanup
    healthService.dispose();
    
    console.log('All HealthService tests completed!');
};

// Run tests if this file is executed directly
if (typeof window !== 'undefined') {
    runTests().catch(console.error);
}

export { runTests };
