/**
 * @module TauriConfigurationService.test
 * @description
 * Tests for the TauriConfigurationService implementation
 */

import { TauriConfigurationService, ConfigurationScope } from './TauriConfigurationService';

// Mock Tauri invoke function
const mockInvoke = jest.fn();
jest.mock('@tauri-apps/api/core', () => ({
  invoke: (...args: any[]) => mockInvoke(...args)
}));

describe('TauriConfigurationService', () => {
  let configService: TauriConfigurationService;

  beforeEach(() => {
    mockInvoke.mockClear();
    configService = new TauriConfigurationService();
  });

  afterEach(() => {
    configService.dispose();
  });

  describe('Configuration Validation', () => {
    test('should validate configuration keys', () => {
      // Valid keys
      expect(configService['validateConfigurationKey']('editor.fontSize')).toBe(true);
      expect(configService['validateConfigurationKey']('window.zoomLevel')).toBe(true);
      expect(configService['validateConfigurationKey']('theme')).toBe(true);

      // Invalid keys
      expect(configService['validateConfigurationKey']('')).toBe(false);
      expect(configService['validateConfigurationKey']('editor..fontSize')).toBe(false);
      expect(configService['validateConfigurationKey']('.editor.fontSize')).toBe(false);
      expect(configService['validateConfigurationKey']('editor.fontSize.')).toBe(false);
    });

    test('should validate configuration values', () => {
      // Valid values
      expect(configService['validateConfigurationValue']('editor.fontSize', 14)).toBe(true);
      expect(configService['validateConfigurationValue']('window.zoomLevel', 0)).toBe(true);
      expect(configService['validateConfigurationValue']('editor.lineNumbers', 'on')).toBe(true);
      expect(configService['validateConfigurationValue']('window.theme', 'dark')).toBe(true);

      // Invalid values
      expect(configService['validateConfigurationValue']('editor.fontSize', undefined)).toBe(false);
      expect(configService['validateConfigurationValue']('window.zoomLevel', -10)).toBe(false);
      expect(configService['validateConfigurationValue']('window.zoomLevel', 10)).toBe(false);
      expect(configService['validateConfigurationValue']('editor.fontSize', 5)).toBe(false);
      expect(configService['validateConfigurationValue']('editor.fontSize', 101)).toBe(false);
    });
  });

  describe('Configuration Operations', () => {
    test('should set and get configuration values', async () => {
      mockInvoke.mockResolvedValue({});

      await configService.updateValue('editor.fontSize', 16, ConfigurationScope.APPLICATION);
      const value = configService.getValue('editor.fontSize', 14, ConfigurationScope.APPLICATION);

      expect(value).toBe(16);
    });

    test('should handle configuration conflicts with retry logic', async () => {
      // Mock initial failure followed by success
      mockInvoke
        .mockRejectedValueOnce(new Error('Conflict'))
        .mockResolvedValueOnce({});

      await configService.updateValue('window.zoomLevel', 1, ConfigurationScope.APPLICATION);

      expect(mockInvoke).toHaveBeenCalledTimes(2);
    });

    test('should emit configuration change events', async () => {
      mockInvoke.mockResolvedValue({});

      const changeListener = jest.fn();
      configService.onDidChangeConfiguration.addListener(changeListener);

      await configService.updateValue('theme', 'light', ConfigurationScope.APPLICATION);

      expect(changeListener).toHaveBeenCalled();
      const event = changeListener.mock.calls[0][0];
      expect(event.affectsConfiguration('theme')).toBe(true);
    });
  });

  describe('Scope Management', () => {
    test('should manage different configuration scopes', async () => {
      mockInvoke.mockResolvedValue({});

      await configService.updateValue('workspace.setting', 'value1', ConfigurationScope.WORKSPACE);
      await configService.updateValue('profile.setting', 'value2', ConfigurationScope.PROFILE);

      const workspaceValue = configService.getValue('workspace.setting', 'default', ConfigurationScope.WORKSPACE);
      const profileValue = configService.getValue('profile.setting', 'default', ConfigurationScope.PROFILE);

      expect(workspaceValue).toBe('value1');
      expect(profileValue).toBe('value2');
    });
  });

  describe('Configuration Inspection', () => {
    test('should inspect configuration values', async () => {
      mockInvoke.mockResolvedValue({});

      await configService.updateValue('editor.fontSize', 18, ConfigurationScope.APPLICATION);
      const inspection = configService.inspect('editor.fontSize', ConfigurationScope.APPLICATION);

      expect(inspection.value).toBe(18);
    });

    test('should list all configuration keys', async () => {
      mockInvoke.mockResolvedValue({});

      await configService.updateValue('key1', 'value1', ConfigurationScope.APPLICATION);
      await configService.updateValue('key2.subkey', 'value2', ConfigurationScope.APPLICATION);

      const keys = configService.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2.subkey');
    });
  });

  describe('Error Handling', () => {
    test('should handle initialization failures gracefully', async () => {
      mockInvoke.mockRejectedValue(new Error('Failed to load configuration'));

      // Service should initialize with default configuration
      expect(configService.isReady()).toBe(true);
      
      const value = configService.getValue('editor.fontSize', 14, ConfigurationScope.APPLICATION);
      expect(value).toBe(14);
    });

    test('should handle save failures with retry logic', async () => {
      mockInvoke.mockRejectedValue(new Error('Save failed'));

      await expect(configService.updateValue('test.key', 'value', ConfigurationScope.APPLICATION))
        .rejects.toThrow('Configuration synchronization failed after 3 attempts');
    });
  });
});
