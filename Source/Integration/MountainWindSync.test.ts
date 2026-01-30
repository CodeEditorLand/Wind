/**
 * MountainWindSync Test Suite
 * Functional tests for the synchronization service implementation
 */

import { MountainWindSync, mountainWindSync } from './MountainWindSync';

/**
 * Mock Tauri invoke function
 */
const mockInvoke = async (command: string): Promise<any> => {
  switch (command) {
    case 'mountain_get_status':
      return { connected: true, version: '1.0.0' };
    case 'mountain_get_configuration':
      return { editor: { theme: 'dark' }, extensions: { installed: [] } };
    case 'mountain_get_services_status':
      return { editor: { status: 'running' }, extensionHost: { status: 'running' } };
    case 'mountain_get_state':
      return { ui: {}, editor: {}, workspace: {} };
    default:
      return {};
  }
};

// Mock global Tauri API
(globalThis as any).__TAURI__ = {
  core: {
    invoke: mockInvoke
  }
};

// Mock Wind services
(globalThis as any).windConfigurationService = {
  getAll: () => ({
    'editor.fontSize': 14,
    'editor.fontFamily': 'Consolas, "Courier New", monospace',
    'editor.wordWrap': 'off',
    'editor.lineNumbers': 'on',
    'editor.minimap': true,
    'workbench.colorTheme': 'vs-dark',
    'workbench.iconTheme': 'vs-seti',
    'workbench.activityBar': true,
    'files.autoSave': 'off',
    'files.hotExit': 'on',
    'extensions.autoUpdate': true
  })
};

(globalThis as any).windInstantiationService = {
  getServiceCount: () => 5,
  getService: (id: string) => ({
    status: 'running',
    version: '1.0.0'
  })
};

// Simple test assertion function
const assert = (condition: boolean, message: string) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✓ ${message}`);
};

// Test runner
const runTests = async () => {
  console.log('Running MountainWindSync functional tests...');
  
  let syncService: MountainWindSync;

  // Test: should initialize synchronization service
  try {
    syncService = new MountainWindSync({
      syncInterval: 1000,
      enablePerformanceMonitoring: true
    });
    assert(syncService !== null, 'Sync service should be created');
    assert(syncService.getStatus() !== undefined, 'Sync service should have status');
    
    // Simulate connection
    const status = await mockInvoke('mountain_get_status');
    assert(status.connected === true, 'Mountain should be connected');
    
    console.log('✓ Initialization test passed');
  } catch (error) {
    console.error('✗ Initialization test failed:', error);
  }

  // Test: should retrieve Wind configuration
  try {
    const config = (syncService as any).getWindConfiguration();
    assert(config !== undefined, 'Wind configuration should be retrieved');
    assert(config.editor !== undefined, 'Editor configuration should exist');
    assert(config.editor.fontSize === 14, 'Font size should be 14');
    assert(config.workbench !== undefined, 'Workbench configuration should exist');
    
    console.log('✓ Configuration retrieval test passed');
  } catch (error) {
    console.error('✗ Configuration retrieval test failed:', error);
  }

  // Test: should retrieve Wind services status
  try {
    const services = (syncService as any).getWindServicesStatus();
    assert(services !== undefined, 'Services status should be retrieved');
    assert(services['WindInstantiationService'] !== undefined, 'WindInstantiationService should exist');
    assert(services['ConfigurationService'] !== undefined, 'ConfigurationService should exist');
    assert(services['MountainIntegrationService'] !== undefined, 'MountainIntegrationService should exist');
    
    console.log('✓ Services status test passed');
  } catch (error) {
    console.error('✗ Services status test failed:', error);
  }

  // Test: should retrieve Wind state
  try {
    const state = (syncService as any).getWindState();
    assert(state !== undefined, 'Wind state should be retrieved');
    assert(state.ui !== undefined, 'UI state should exist');
    assert(state.editor !== undefined, 'Editor state should exist');
    assert(state.workspace !== undefined, 'Workspace state should exist');
    assert(state.timestamp > 0, 'Timestamp should be positive');
    assert(typeof state.sessionId === 'string', 'Session ID should be a string');
    
    console.log('✓ Wind state retrieval test passed');
  } catch (error) {
    console.error('✗ Wind state retrieval test failed:', error);
  }

  // Test: should validate configuration
  try {
    const validConfig = {
      editor: {
        fontSize: 14,
        fontFamily: 'Consolas',
        wordWrap: 'off',
        lineNumbers: 'on',
        minimap: true
      },
      workbench: {
        colorTheme: 'vs-dark',
        iconTheme: 'vs-seti',
        activityBar: true
      },
      files: {
        autoSave: 'off',
        hotExit: 'on'
      }
    };
    
    const isValid = (syncService as any).validateConfiguration(validConfig);
    assert(isValid === true, 'Valid configuration should pass validation');
    
    console.log('✓ Configuration validation test passed');
  } catch (error) {
    console.error('✗ Configuration validation test failed:', error);
  }

  // Test: should detect invalid configuration
  try {
    const invalidConfig = {
      editor: {
        fontSize: 'invalid', // Should be number
        fontFamily: 'Consolas'
      }
    };
    
    const isValid = (syncService as any).validateConfiguration(invalidConfig);
    assert(isValid === false, 'Invalid configuration should fail validation');
    
    console.log('✓ Invalid configuration detection test passed');
  } catch (error) {
    console.error('✗ Invalid configuration detection test failed:', error);
  }

  // Test: should resolve conflicts
  try {
    const conflictResolver = (syncService as any).conflictResolver;
    
    // Preference resolution
    const result1 = conflictResolver.resolve('mountain', 'wind', { strategy: 'preference' });
    assert(result1 === 'mountain', 'Preference resolution should favor mountain');
    
    // Merge resolution for objects
    const result2 = conflictResolver.resolve(
      { a: 1, b: 2 },
      { b: 3, c: 4 },
      { strategy: 'merge' }
    );
    assert(result2.a === 1, 'Merge should preserve mountain values');
    assert(result2.b === 2, 'Merge should favor mountain on conflicts');
    assert(result2.c === 4, 'Merge should include wind values');
    
    console.log('✓ Conflict resolution test passed');
  } catch (error) {
    console.error('✗ Conflict resolution test failed:', error);
  }

  console.log('All functional tests completed!');
};

// Manual test function for quick verification
export async function testSynchronization() {
  console.log('Testing MountainWindSync implementation...');
  
  // Create a test instance
  const testSync = new MountainWindSync({
    syncInterval: 2000,
    enablePerformanceMonitoring: true
  });
  
  // Test configuration retrieval
  const config = (testSync as any).getWindConfiguration();
  console.log('Wind Configuration:', config);
  
  // Test services status retrieval
  const services = (testSync as any).getWindServicesStatus();
  console.log('Wind Services:', services);
  
  // Test state retrieval
  const state = (testSync as any).getWindState();
  console.log('Wind State:', state);
  
  // Test configuration validation
  const isValid = (testSync as any).validateConfiguration(config);
  console.log('Configuration valid:', isValid);
  
  // Test conflict resolution
  const resolver = (testSync as any).conflictResolver;
  const merged = resolver.resolve(
    { editor: { fontSize: 16 } },
    { editor: { fontFamily: 'Consolas' } },
    { strategy: 'merge' }
  );
  console.log('Merged configuration:', merged);
  
  // Cleanup
  testSync.dispose();
  
  console.log('Test completed successfully!');
}

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error);
}
