/**
 * @module ConfigurationSync.test
 * @description
 * Integration tests for configuration synchronization between Wind and Mountain
 */

import { TauriConfigurationService, ConfigurationScope } from '../Desktop/TauriConfigurationService';

// Mock Tauri invoke function
jest.mock('@tauri-apps/api/core', () => ({
  invoke: jest.fn()
}));

import { invoke } from '@tauri-apps/api/core';

const mockInvoke = invoke as jest.Mock;

describe('Configuration Synchronization', () => {
  let windConfigService: TauriConfigurationService;

  beforeEach(async () => {
    mockInvoke.mockClear();
    // Mock successful configuration load
    mockInvoke.mockResolvedValue({
      application: {},
      workspace: {},
      profile: {}
    });
    windConfigService = new TauriConfigurationService();
    // Wait for initialization to complete
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  afterEach(() => {
    windConfigService.dispose();
  });

  describe('Bidirectional Sync', () => {
    test('should synchronize configuration changes from Wind to Mountain', async () => {
      // Mock successful configuration save
      mockInvoke.mockResolvedValue({});

      // Change configuration in Wind
      await windConfigService.updateValue('editor.fontSize', 16, ConfigurationScope.APPLICATION);

      // Verify Mountain was called with the configuration data
      expect(mockInvoke).toHaveBeenCalledWith('save_configuration_data', {
        configData: {
          application: expect.objectContaining({
            editor: expect.objectContaining({
              fontSize: 16
            })
          }),
          workspace: expect.any(Object),
          profile: expect.any(Object)
        }
      });
    });

    test('should load configuration from Mountain on initialization', async () => {
      // Mock configuration data from Mountain
      mockInvoke.mockResolvedValue({
        application: {
          editor: { fontSize: 18 },
          window: { theme: 'dark' }
        },
        workspace: {},
        profile: {}
      });

      // Re-initialize to trigger configuration load
      await windConfigService['loadConfiguration']();

      // Verify configuration was loaded
      const fontSize = windConfigService.getValue('editor.fontSize', 14, ConfigurationScope.APPLICATION);
      const theme = windConfigService.getValue('window.theme', 'light', ConfigurationScope.APPLICATION);

      expect(fontSize).toBe(18);
      expect(theme).toBe('dark');
    });

    test('should handle configuration conflicts with retry logic', async () => {
      // Mock conflict scenario: first save fails, second succeeds
      mockInvoke
        .mockRejectedValueOnce(new Error('Configuration conflict'))
        .mockResolvedValueOnce({});

      await windConfigService.updateValue('window.zoomLevel', 1, ConfigurationScope.APPLICATION);

      // Verify retry logic was executed (retries 3 times + initial call = 4 total)
      expect(mockInvoke).toHaveBeenCalledTimes(4);
    });
  });

  describe('Configuration Validation', () => {
    test('should validate configuration before synchronization', async () => {
      mockInvoke.mockResolvedValue({});

      // Valid configuration should succeed
      await expect(windConfigService.updateValue('editor.fontSize', 16, ConfigurationScope.APPLICATION))
        .resolves.not.toThrow();

      // Invalid configuration should fail
      await expect(windConfigService.updateValue('editor.fontSize', -5, ConfigurationScope.APPLICATION))
        .rejects.toThrow('Invalid configuration value');
    });

    test('should validate configuration keys', async () => {
      mockInvoke.mockResolvedValue({});

      // Valid key should succeed
      await expect(windConfigService.updateValue('valid.key', 'value', ConfigurationScope.APPLICATION))
        .resolves.not.toThrow();

      // Invalid key should fail
      await expect(windConfigService.updateValue('', 'value', ConfigurationScope.APPLICATION))
        .rejects.toThrow('Invalid configuration key');
    });
  });

  describe('Scope-based Configuration', () => {
    test('should manage different configuration scopes independently', async () => {
      mockInvoke.mockResolvedValue({});

      // Set different values for different scopes
      await windConfigService.updateValue('setting', 'app-value', ConfigurationScope.APPLICATION);
      await windConfigService.updateValue('setting', 'workspace-value', ConfigurationScope.WORKSPACE);
      await windConfigService.updateValue('setting', 'profile-value', ConfigurationScope.PROFILE);

      // Verify scopes are independent
      const appValue = windConfigService.getValue('setting', 'default', ConfigurationScope.APPLICATION);
      const workspaceValue = windConfigService.getValue('setting', 'default', ConfigurationScope.WORKSPACE);
      const profileValue = windConfigService.getValue('setting', 'default', ConfigurationScope.PROFILE);

      expect(appValue).toBe('app-value');
      expect(workspaceValue).toBe('workspace-value');
      expect(profileValue).toBe('profile-value');
    });
  });

  describe('Configuration Events', () => {
    test('should emit change events when configuration is updated', async () => {
      mockInvoke.mockResolvedValue({});

      const changeListener = jest.fn();
      windConfigService.onDidChangeConfiguration.addListener(changeListener);

      await windConfigService.updateValue('test.key', 'new-value', ConfigurationScope.APPLICATION);

      expect(changeListener).toHaveBeenCalled();
      const event = changeListener.mock.calls[0][0];
      expect(event.affectsConfiguration('test.key')).toBe(true);
      expect(event.changedConfiguration.has('test.key')).toBe(true);
    });

    test('should emit change events for all affected keys on reload', async () => {
      mockInvoke.mockResolvedValue({
        application: { key1: 'value1', key2: 'value2' },
        workspace: {},
        profile: {}
      });

      const changeListener = jest.fn();
      windConfigService.onDidChangeConfiguration.addListener(changeListener);

      await windConfigService.reloadConfiguration();

      expect(changeListener).toHaveBeenCalled();
      const event = changeListener.mock.calls[0][0];
      expect(event.changedConfiguration.size).toBeGreaterThan(0);
    });
  });

  describe('Error Recovery', () => {
    test('should recover from Mountain connection failures', async () => {
      // Mock Mountain being unavailable
      mockInvoke.mockRejectedValue(new Error('Mountain connection failed'));

      // Service should initialize with default configuration
      expect(windConfigService.isReady()).toBe(true);
      
      const value = windConfigService.getValue('editor.fontSize', 14, ConfigurationScope.APPLICATION);
      expect(value).toBe(14);
    });

    test('should handle corrupted configuration gracefully', async () => {
      // Mock corrupted configuration data
      mockInvoke.mockResolvedValue({
        application: null, // Invalid data
        workspace: {},
        profile: {}
      });

      // Re-initialize should handle corrupted data
      await windConfigService['loadConfiguration']();

      // Service should fall back to default configuration
      const value = windConfigService.getValue('editor.fontSize', 14, ConfigurationScope.APPLICATION);
      expect(value).toBe(14);
    });
  });
});
