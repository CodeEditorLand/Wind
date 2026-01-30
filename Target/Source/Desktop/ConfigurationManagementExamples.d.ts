/**
 * @file ConfigurationManagementExamples.ts
 * @description
 * Practical examples demonstrating the advanced configuration management system for Wind.
 * Shows how to validate, migrate, backup, restore, and sync configurations with Mountain.
 */
import { AdvancedConfigurationManager, ConfigurationValidator, MountainConfigurationSynchronizer, DesktopMain } from './DesktopMain.js';
/**
 * Example 1: Basic Configuration Validation
 */
export declare function example_basicValidation(): Promise<void>;
/**
 * Example 2: Configuration Versioning and Migration
 */
export declare function example_configurationMigration(configManager: AdvancedConfigurationManager): Promise<void>;
/**
 * Example 3: Configuration Backup and Restore
 */
export declare function example_backupAndRestore(desktopMain: DesktopMain): Promise<void>;
/**
 * Example 4: Mountain Synchronization
 */
export declare function example_mountainSync(synchronizer: MountainConfigurationSynchronizer, configManager: AdvancedConfigurationManager): Promise<void>;
/**
 * Example 5: Complex Configuration Validation
 */
export declare function example_complexValidation(validator: ConfigurationValidator): Promise<void>;
/**
 * Example 6: Error Handling in Configuration Operations
 */
export declare function example_errorHandling(configManager: AdvancedConfigurationManager, desktopMain: DesktopMain): Promise<void>;
/**
 * Example 7: Automated Backup Strategy
 */
export declare function example_automatedBackup(desktopMain: DesktopMain): Promise<void>;
/**
 * Example 8: Real-world Workflow
 */
export declare function example_realWorldWorkflow(desktopMain: DesktopMain, configManager: AdvancedConfigurationManager, synchronizer: MountainConfigurationSynchronizer): Promise<void>;
/**
 * Run all examples
 */
export declare function runAllExamples(desktopMain: DesktopMain, configManager: AdvancedConfigurationManager, synchronizer: MountainConfigurationSynchronizer): Promise<void>;
//# sourceMappingURL=ConfigurationManagementExamples.d.ts.map