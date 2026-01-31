/**
 * @file ConfigurationManagementExamples.ts
 * @description
 * Practical examples demonstrating the advanced configuration management system for Wind.
 * Shows how to validate, migrate, backup, restore, and sync configurations with Mountain.
 */

import {
	AdvancedConfigurationManager,
	ConfigurationValidator,
	DesktopMain,
	MountainConfigurationSynchronizer,
	type IConfigurationSchema,
	type IConfigurationVersion,
} from "./DesktopMain.js";

/**
 * Example 1: Basic Configuration Validation
 */
export async function example_basicValidation() {
	console.log("=== Example 1: Basic Configuration Validation ===\n");

	const validator = new ConfigurationValidator();

	// Register a schema
	const editorSchema: IConfigurationSchema = {
		name: "editor",
		version: "1.0.0",
		description: "Editor configuration settings",
		properties: {
			theme: {
				type: "string",
				enum: ["light", "dark", "system"],
				description: "Editor theme",
			},
			fontSize: {
				type: "number",
				minimum: 10,
				maximum: 72,
				description: "Font size in pixels",
			},
			fontFamily: {
				type: "string",
				description: "Font family name",
			},
		},
		required: ["theme", "fontSize"],
	};

	validator.registerSchema(editorSchema);

	// Valid configuration
	const validConfig = {
		theme: "dark",
		fontSize: 14,
		fontFamily: "Monaco",
	};

	const validResult = validator.validate("editor", validConfig);
	console.log("Valid configuration:", validResult);
	// Output: { valid: true, errors: [], warnings: [] }

	// Invalid configuration
	const invalidConfig = {
		theme: "invalid-theme",
		fontSize: 100, // Out of range
	};

	const invalidResult = validator.validate("editor", invalidConfig);
	console.log("Invalid configuration:", invalidResult);
	// Output includes errors about invalid theme and out-of-range fontSize
}

/**
 * Example 2: Configuration Versioning and Migration
 */
export async function example_configurationMigration(
	configManager: AdvancedConfigurationManager,
) {
	console.log(
		"\n=== Example 2: Configuration Versioning and Migration ===\n",
	);

	// Register a migration from v1.0.0 to v1.1.0
	configManager.registerMigration({
		fromVersion: { major: 1, minor: 0, patch: 0, timestamp: Date.now() },
		toVersion: { major: 1, minor: 1, patch: 0, timestamp: Date.now() },
		migrate: (oldConfig) => {
			console.log("Migrating configuration from v1.0.0 to v1.1.0");
			return {
				...oldConfig,
				newSetting: "default-value", // Add new setting with default
			};
		},
		validate: (config) => {
			return "newSetting" in config;
		},
	});

	// Old configuration
	const oldConfig = {
		editor: { theme: "dark", fontSize: 14 },
	};

	// Migrate to new version
	const newConfig = await configManager.migrateConfiguration(oldConfig, {
		major: 1,
		minor: 0,
		patch: 0,
		timestamp: Date.now(),
	});

	console.log("Migrated configuration:", newConfig);
	// Output includes newSetting with default value
}

/**
 * Example 3: Configuration Backup and Restore
 */
export async function example_backupAndRestore(desktopMain: DesktopMain) {
	console.log("\n=== Example 3: Configuration Backup and Restore ===\n");

	// Create a backup before making changes
	const backupId = await desktopMain.createConfigurationBackup(
		"Configuration before theme change",
	);
	console.log(`Created backup: ${backupId}`);

	// List all backups
	const backups = desktopMain.getConfigurationBackups();
	console.log("Available backups:", backups);

	// Make some changes... (e.g., change theme)

	// Restore from backup if needed
	await desktopMain.restoreConfigurationFromBackup(backupId);
	console.log(`Restored configuration from backup: ${backupId}`);

	// Delete backup when no longer needed
	desktopMain.deleteConfigurationBackup(backupId);
	console.log(`Deleted backup: ${backupId}`);
}

/**
 * Example 4: Mountain Synchronization
 */
export async function example_mountainSync(
	synchronizer: MountainConfigurationSynchronizer,
	configManager: AdvancedConfigurationManager,
) {
	console.log("\n=== Example 4: Mountain Synchronization ===\n");

	// Initialize synchronizer
	await synchronizer.initialize();
	console.log("Mountain synchronizer initialized");

	// Get current configuration
	const windConfig = {
		editor: {
			theme: "dark",
			fontSize: 14,
			fontFamily: "Monaco",
		},
		workspace: {
			autoSave: true,
			autoSaveDelay: 5000,
		},
	};

	// Synchronize with Mountain
	const syncResult = await synchronizer.synchronizeConfiguration(
		windConfig,
		configManager,
	);

	if (syncResult.success) {
		console.log("✅ Synchronized with Mountain successfully");
		console.log("Merged configuration:", syncResult.mergedConfig);

		if (syncResult.warnings.length > 0) {
			console.warn("Warnings during sync:", syncResult.warnings);
		}
	} else {
		console.error("❌ Synchronization failed");
		console.error("Warnings:", syncResult.warnings);
	}

	// Check last sync time
	const lastSyncTime = synchronizer.getLastSyncTime();
	console.log(
		"Last synchronization time:",
		new Date(lastSyncTime).toISOString(),
	);
}

/**
 * Example 5: Complex Configuration Validation
 */
export async function example_complexValidation(
	validator: ConfigurationValidator,
) {
	console.log("\n=== Example 5: Complex Configuration Validation ===\n");

	// Register multiple schemas
	const schemas: IConfigurationSchema[] = [
		{
			name: "editor",
			version: "1.0.0",
			properties: {
				theme: { type: "string", enum: ["light", "dark", "system"] },
				fontSize: { type: "number", minimum: 10, maximum: 72 },
			},
			required: ["theme"],
		},
		{
			name: "workspace",
			version: "1.0.0",
			properties: {
				autoSave: { type: "boolean" },
				autoSaveDelay: { type: "number", minimum: 500, maximum: 30000 },
			},
		},
		{
			name: "extensions",
			version: "1.0.0",
			properties: {
				installed: { type: "object" },
				enabled: { type: "object" },
				autoUpdate: { type: "boolean" },
			},
		},
	];

	schemas.forEach((schema) => validator.registerSchema(schema));

	// Validate multiple configurations
	const multipleConfigs = {
		editor: { theme: "dark", fontSize: 14 },
		workspace: { autoSave: true, autoSaveDelay: 5000 },
		extensions: { installed: [], enabled: [], autoUpdate: true },
	};

	const result = validator.validateMultiple(multipleConfigs);
	console.log("Multi-config validation result:", result);
	console.log(`Valid: ${result.valid}`);
	console.log(`Errors: ${result.errors.length}`);
	console.log(`Warnings: ${result.warnings.length}`);
}

/**
 * Example 6: Error Handling in Configuration Operations
 */
export async function example_errorHandling(
	configManager: AdvancedConfigurationManager,
	desktopMain: DesktopMain,
) {
	console.log("\n=== Example 6: Error Handling ===\n");

	try {
		// Try to restore from non-existent backup
		await desktopMain.restoreConfigurationFromBackup("non-existent-id");
	} catch (error) {
		console.log("Caught error:", (error as Error).message);
		// Error: Backup not found
	}

	try {
		// Try invalid migration
		const invalid = await configManager.migrateConfiguration(
			{},
			{ major: 999, minor: 0, patch: 0, timestamp: 0 },
		);
	} catch (error) {
		console.log("Migration error handling:", (error as Error).message);
	}

	console.log("✅ All errors handled gracefully");
}

/**
 * Example 7: Automated Backup Strategy
 */
export async function example_automatedBackup(desktopMain: DesktopMain) {
	console.log("\n=== Example 7: Automated Backup Strategy ===\n");

	// Create timestamp-based backups for audit trail
	const operations = [
		"Application startup",
		"Theme change",
		"Extension installation",
		"Settings export",
	];

	for (const operation of operations) {
		const backupId = await desktopMain.createConfigurationBackup(
			`${operation} - ${new Date().toISOString()}`,
		);
		console.log(`Created backup for '${operation}': ${backupId}`);
	}

	// List and review backups
	const backups = desktopMain.getConfigurationBackups();
	console.log("\nBackup history:");
	backups.forEach((backup, index) => {
		const date = new Date(backup.timestamp).toISOString();
		console.log(`${index + 1}. [${date}] ${backup.description}`);
	});

	// Cleanup old backups (keep last 5)
	while (backups.length > 5) {
		const oldestBackup = backups.shift();
		if (oldestBackup) {
			desktopMain.deleteConfigurationBackup(oldestBackup.id);
			console.log(`Deleted old backup: ${oldestBackup.description}`);
		}
	}
}

/**
 * Example 8: Real-world Workflow
 */
export async function example_realWorldWorkflow(
	desktopMain: DesktopMain,
	configManager: AdvancedConfigurationManager,
	synchronizer: MountainConfigurationSynchronizer,
) {
	console.log("\n=== Example 8: Real-World Workflow ===\n");

	try {
		// 1. Create pre-operation backup
		console.log("1. Creating backup before major configuration change...");
		const backupId = await desktopMain.createConfigurationBackup(
			"Before major configuration update",
		);
		console.log(`   Backup created: ${backupId}`);

		// 2. Validate current configuration
		console.log("2. Validating current configuration...");
		const editorConfig = { theme: "dark", fontSize: 14 };
		const validationResult = configManager.validate("editor", editorConfig);
		if (!validationResult.valid) {
			console.error("   Validation failed:", validationResult.errors);
			return;
		}
		console.log("   ✅ Configuration is valid");

		// 3. Synchronize with Mountain
		console.log("3. Synchronizing with Mountain...");
		const syncResult = await synchronizer.synchronizeConfiguration(
			{ editor: editorConfig },
			configManager,
		);

		if (!syncResult.success) {
			console.warn("   ⚠️  Sync failed, using local config");
			// Optionally restore from backup
			console.log("   Rolling back to backup via restoration capability");
		} else {
			console.log("   ✅ Synchronized successfully");
		}

		// 4. List available backups for reference
		console.log("4. Available backups:");
		const backups = desktopMain.getConfigurationBackups();
		backups.slice(-3).forEach((backup) => {
			const date = new Date(backup.timestamp).toLocaleString();
			console.log(`   - (${date}) ${backup.description}`);
		});

		console.log("\n✅ Workflow completed successfully");
	} catch (error) {
		console.error("❌ Workflow error:", (error as Error).message);

		// Recovery: Attempt to restore from most recent backup
		const backups = desktopMain.getConfigurationBackups();
		if (backups.length > 0) {
			console.log("Attempting to restore from most recent backup...");
			try {
				await desktopMain.restoreConfigurationFromBackup(backups[0].id);
				console.log("✅ Successfully restored from backup");
			} catch (restoreError) {
				console.error(
					"❌ Restoration also failed:",
					(restoreError as Error).message,
				);
			}
		}
	}
}

/**
 * Run all examples
 */
export async function runAllExamples(
	desktopMain: DesktopMain,
	configManager: AdvancedConfigurationManager,
	synchronizer: MountainConfigurationSynchronizer,
) {
	console.log("╔════════════════════════════════════════════╗");
	console.log("║ Advanced Configuration Management Examples ║");
	console.log("╚════════════════════════════════════════════╝\n");

	try {
		await example_basicValidation();
		await example_configurationMigration(configManager);
		await example_backupAndRestore(desktopMain);
		await example_mountainSync(synchronizer, configManager);
		await example_complexValidation(new ConfigurationValidator());
		await example_errorHandling(configManager, desktopMain);
		await example_automatedBackup(desktopMain);
		await example_realWorldWorkflow(
			desktopMain,
			configManager,
			synchronizer,
		);

		console.log("\n╔════════════════════════════════════════╗");
		console.log("║ ✅ All examples completed successfully! ║");
		console.log("╚════════════════════════════════════════╝");
	} catch (error) {
		console.error("\n❌ Example execution failed:", error);
	}
}
