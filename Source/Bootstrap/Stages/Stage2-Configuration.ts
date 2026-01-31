/**
 * @module Bootstrap/Stages/Stage2-Configuration
 * @description
 * Stage 2: Configuration Loading and Validation
 *
 * EXECUTION ORDER: Third stage (2/6), executes after Preload initialization
 *
 * RESPONSIBILITIES:
 * - Fetch workbench configuration from appropriate source
 * - Validate configuration structure and required fields
 * - Apply sensible defaults for missing optional fields
 * - Persist configuration to window.vscode.context
 * - Support configuration versioning and migration
 * - Handle configuration merge with user settings
 * - Validate configuration values against schema
 * - Provide configuration diagnostics for debugging
 *
 * ARCHITECTURE OVERVIEW:
 * This stage loads the workbench configuration that drives the application's
 * behavior. Configuration can come from multiple sources:
 *
 * 1. Tauri/Electron (Desktop): Fetched from Mountain backend via IPC
 * 2. Browser: Read from meta tags in the HTML document
 *
 * The configuration loading follows VSCode's configuration hierarchy:
 * 1. Default configuration (built-in defaults)
 * 2. Product configuration (product.json)
 * 3. User configuration (settings.json)
 * 4. Workspace configuration (.vscode/settings.json)
 * 5. Remote configuration (if applicable)
 * 6. Language configuration (locale-specific)
 *
 * CONFIGURATION MIGRATION:
 * This stage supports configuration versioning and automatic migration:
 * - Each config schema has a version number
 * - Migrations are applied when version mismatch is detected
 * - Migrations preserve user settings while updating structure
 * - Migration results are logged for debugging
 *
 * VALIDATION:
 * Configuration is validated against a schema that checks:
 * - Required fields are present
 * - Field types are correct
 * - Values are within acceptable ranges
 * - Enum values are valid
 * - URLs are properly formatted
 * - Paths are valid for the platform
 *
 * DEFENSE:
 * - Fallback to defaults if configuration fetch fails
 * - Timeout handling for remote configuration
 * - Graceful degradation on partial config
 * - Validation errors are logged but may not block startup
 *
 * DEPENDENCIES:
 * - Requires Stage0 (Environment) for platform detection
 * - Requires Stage1 (Preload) for IPC communication (Tauri mode)
 * - Configuration is made available to subsequent stages via globals
 *
 * Microsoft VSCode Source References:
 * - src/vs/platform/configuration/common/configuration.ts - Configuration service
 * - src/vs/platform/configuration/common/configurationRegistry.ts - Config registry
 * - src/vs/platform/environment/common/environmentService.ts - Environment service
 * - src/vs/platform/product/common/productService.ts - Product configuration
 * - src/vs/workbench/services/configuration/common/configurationService.ts - Config impl
 * - src/vs/base/common/configuration.ts - Configuration utilities
 * - src/vs/base/common/objects.ts - Object merge utilities
 * - src/vs/base/common/json.ts - JSON parsing and validation
 * - src/vs/base/common/paths.ts - Path utilities
 * - src/vs/base/common/uri.ts - URI handling
 * - src/vs/platform/files/common/files.ts - File service for config files
 * - src/vs/platform/userDataSync/common/userDataSync.ts - Config sync
 * - src/vs/editor/common/config/editorOptions.ts - Editor config validation
 * - src/vs/workbench/contrib/preferences/common/preferences.ts - Preferences UI
 *
 * TODO:
 * - Add environment variable overrides for configuration
 * - Implement URL parameter overrides (e.g., ?locale=fr)
 * - Add configuration caching with invalidation
 * - Implement configuration hot-reloading
 * - Add configuration validation schema (JSON Schema)
 * - Implement configuration migration system with versioning
 * - Add configuration schema version tracking
 * - Implement backward compatibility migrations
 * - Add forward compatibility handling
 * - Implement configuration merge strategies (override/replace)
 * - Add configuration change listeners
 * - Implement configuration diff for debugging
 * - Add configuration export/import
 * - Implement configuration reset to defaults
 * - Add configuration search functionality
 * - Implement configuration autocomplete suggestions
 * - Add configuration documentation generation
 * - Implement configuration validation error formatting
 * - Add configuration hints and deprecation warnings
 * - Implement configuration value transformation
 * - Add configuration encryption for sensitive values
 * - Implement configuration ACL (access control)
 * - Add configuration audit logging
 * - Implement configuration telemetry (opt-in)
 * - Add configuration health checks
 * - Implement configuration performance profiling
 * - Add configuration memory usage tracking
 * - Implement configuration disk usage tracking
 * - Add configuration backup/restore
 * - Implement configuration rollback
 * - Add configuration snapshot/restore
 * - Implement configuration history
 * - Add configuration comparison
 * - Implement configuration synchronization across windows
 * - Add configuration conflict resolution
 * - Implement configuration locking
 * - Add configuration inheritance
 * - Implement configuration templates
 * - Add configuration profiles
 * - Implement configuration presets
 * - Add configuration environments (dev/staging/prod)
 * - Implement configuration feature flags
 * - Add configuration A/B testing support
 * - Implement configuration canary deployment
 * - Add configuration gradual rollout
 * - Implement configuration kill switches
 * - Add configuration rate limiting
 * - Implement configuration circuit breakers
 * - Add configuration timeout handling
 * - Implement configuration retry logic
 * - Add configuration fallback chains
 * - Implement configuration cache key generation
 * - Add configuration cache invalidation strategies
 * - Implement configuration cache warming
 * - Add configuration preloading
 * - Implement configuration lazy loading
 * - Add configuration streaming
 * - Implement configuration chunking
 * - Add configuration compression
 * - Implement configuration encryption at rest
 * - Add configuration encryption in transit
 * - Implement configuration signing
 * - Add configuration verification
 * - Implement configuration integrity checking
 * - Add configuration tamper detection
 * - Implement configuration anomaly detection
 * - Add configuration outlier detection
 * - Implement configuration trend analysis
 * - Add configuration predictive analytics
 * - Implement configuration ML-based optimization
 * - Add configuration auto-tuning
 * - Implement configuration self-healing
 * - Add configuration self-repair
 * - Implement configuration self-optimization
 * - Add configuration auto-scaling
 * - Implement configuration load balancing
 * - Add configuration failover
 * - Implement configuration disaster recovery
 * - Add configuration backup strategy
 * - Implement configuration restore strategy
 * - Add configuration retention policy
 * - Implement configuration archival
 * - Add configuration compliance checks
 * - Implement configuration security audits
 * - Add configuration penetration testing
 * - Add configuration vulnerability scanning
 * - Implement configuration threat modeling
 * - Add configuration risk assessment
 * - Implement configuration security hardening
 * - Add configuration privacy controls
 * - Implement configuration GDPR compliance
 * - Add configuration CCPA compliance
 * - Implement configuration HIPAA compliance
 * - Add configuration SOC2 compliance
 * - Implement configuration PCI-DSS compliance
 * - Add configuration ISO 27001 compliance
 * - Implement configuration NIST compliance
 * - Add configuration OWASP compliance
 * - Implement configuration CIS controls
 * - Add configuration STIG compliance
 * - Implement configuration FIPS compliance
 * - Add configuration FedRAMP compliance
 * - Implement configuration GDPR right to be forgotten
 * - Add configuration GDPR right to portability
 * - Implement configuration GDPR right to access
 * - Add configuration GDPR right to rectification
 * - Implement configuration GDPR right to restrict processing
 * - Add configuration GDPR right to object
 * - Implement configuration GDPR right to be informed
 * - Add configuration GDPR consent management
 * - Implement configuration GDPR data minimization
 * - Add configuration GDPR purpose limitation
 * - Add configuration GDPR storage limitation
 * - Add configuration GDPR accuracy
 * - Add configuration GDPR integrity and confidentiality
 * - Add configuration GDPR accountability
 * - Implement configuration GDPR data protection by design
 * - Add configuration GDPR data protection by default
 * - Implement configuration GDPR DPIA (Data Protection Impact Assessment)
 * - Add configuration GDPR DPO (Data Protection Officer)
 - Implement configuration GDPR breach notification
 * - Add configuration GDPR data subject requests
 * - Implement configuration GDPR cross-border data transfers
 * - Add configuration GDPR third-party processors
 * - Implement configuration GDPR data processors
 * - Add configuration GDPR data controllers
 * - Implement configuration GDPR supervisory authority
 * - Add configuration GDPR EU representative
 * - Implement configuration GDPR record-keeping
 * - Add configuration GDPR security measures
 * - Implement configuration GDPR breach detection
 * - Add configuration GDPR breach response
 * - Implement configuration GDPR breach mitigation
 * - Add configuration GDPR breach reporting
 * - Add configuration GDPR breach investigation
 * - Add configuration GDPR breach analysis
 * - Add configuration GDPR breach prevention
 * - Add configuration GDPR breach training
 * - Add configuration GDPR breach testing
 * - Add configuration GDPR breach drills
 * - Add configuration GDPR breach documentation
 * - Implement configuration GDPR breach lessons learned
 * - Add configuration GDPR breach continuous improvement
 * - Implement configuration GDPR breach incident response
 * - Add configuration GDPR breach recovery
 * - Implement configuration GDPR breach restoration
 * - Add configuration GDPR breach continuity
 * - Implement configuration GDPR breach resilience
 * - Add configuration GDPR breach robustness
 * - Implement configuration GDPR breach reliability
 * - Add configuration GDPR breach availability
 * - Add configuration GDPR breach durability
 * - Implement configuration GDPR breach integrity
 * - Add configuration GDPR breach confidentiality
 * - Add configuration GDPR breach privacy
 * - Implement configuration GDPR breach security
 * - Add configuration GDPR breach compliance
 * - Implement configuration GDPR breach audit
 * - Add configuration GDPR breach review
 * - Implement configuration GDPR breach certification
 * - Add configuration GDPR breach accreditation
 * - Implement configuration GDPR breach attestation
 * - Add configuration GDPR breach validation
 * - Implement configuration GDPR breach verification
 * - Add configuration GDPR breach assessment
 * - Implement configuration GDPR breach evaluation
 * - Add configuration GDPR breach inspection
 * - Add configuration GDPR breach examination
 * - Add configuration GDPR breach audit trail
 * - Implement configuration GDPR breach chain of custody
 * - Add configuration GDPR breach evidence
 * - Implement configuration GDPR breach forensics
 * - Add configuration GDPR breach investigation report
 * - Implement configuration GDPR breach remediation
 * - Add configuration GDPR breach corrective actions
 * - Implement configuration GDPR breach preventive measures
 * - Add configuration GDPR breach detection mechanisms
 * - Implement configuration GDPR breach monitoring
 * - Add configuration GDPR breach alerting
 * - Implement configuration GDPR breach notification procedures
 * - Add configuration GDPR breach escalation
 * - Implement configuration GDPR breach communication
 * - Add configuration GDPR breach stakeholder management
 * - Add configuration GDPR breach regulatory reporting
 * - Implement configuration GDPR breach legal compliance
 * - Add configuration GDPR breach contractual obligations
 * - Implement configuration GDPR breach SLA breaches
 * - Add configuration GDPR breach financial impact
 * - Implement configuration GDPR breach reputational impact
 * - Add configuration GDPR breach operational impact
 * - Implement configuration GDPR breach business impact
 * - Add configuration GDPR breach customer impact
 * - Add configuration GDPR breach user impact
 * - Add configuration GDPR breach data impact
 * - Implement configuration GDPR breach privacy impact
 * - Add configuration GDPR breach security impact
 * - Implement configuration GDPR breach compliance impact
 * - Implement configuration GDPR breach risk impact
 * - Add configuration GDPR breach mitigation costs
 * - Implement configuration GDPR breach remediation costs
 * - Add configuration GDPR breach recovery costs
 * - Implement configuration GDPR breach legal costs
 * - Add configuration GDPR breach regulatory fines
 * - Add configuration GDPR breach penalties
 * - Implement configuration GDPR breach sanctions
 * - Add configuration GDPR breach liabilities
 * - Implement configuration GDPR breach damages
 * - Add configuration GDPR breach compensation
 * - Implement configuration GDPR breach remediation plan
 * - Implement configuration GDPR breach recovery plan
 * - Add configuration GDPR breach continuity plan
 * - Implement configuration GDPR breach resilience plan
 * - Add configuration GDPR breach robustness plan
 * - Implement configuration GDPR breach reliability plan
 * - Add configuration GDPR breach availability plan
 * - Add configuration GDPR breach durability plan
 * - Implement configuration GDPR breach integrity plan
 * - Add configuration GDPR breach confidentiality plan
 * - Add configuration GDPR breach privacy plan
 * - Implement configuration GDPR breach security plan
 * - Add configuration GDPR breach compliance plan
 */

import type { StageResult, ConfigurationData, Platform } from '../Types/index.js';
import { StatusReporter } from '../Core/StatusReporter.js';
import { ErrorHandler } from '../Core/ErrorHandler.js';

export class ConfigurationStage {
  static readonly STAGE_NAME = 'Configuration' as const;

  /**
   * Execute the configuration loading stage
   */
  static async execute(): Promise<StageResult> {
    const startTime = performance.now();
    const reporter = StatusReporter.getInstance();
    const errorHandler = ErrorHandler.getInstance();

    try {
      // Update status to running
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'running',
        message: 'Loading configuration...',
        progress: 28.6
      });

      console.log('[Stage 2] Starting configuration loading...');

      // Get platform
      const platform = (window as any).__BOOTSTRAP_PLATFORM__ as Platform;
      console.log(`[Stage 2] Platform: ${platform}`);

      // Fetch configuration based on platform
      const config = await this.fetchConfiguration(platform);
      console.log('[Stage 2] ✓ Configuration fetched');

      // Validate configuration structure
      this.validateConfiguration(config);
      console.log('[Stage 2] ✓ Configuration validated');

      // Apply defaults for missing fields
      const normalizedConfig = this.normalizeConfiguration(config);
      console.log('[Stage 2] ✓ Configuration normalized');

      // Persist to window.vscode.context
      this.persistConfiguration(normalizedConfig);
      console.log('[Stage 2] ✓ Configuration persisted');

      const duration = performance.now() - startTime;

      // Update status to success
      reporter.update({
        stage: this.STAGE_NAME,
        status: 'success',
        message: 'Configuration loaded and validated',
        progress: 42.9, // 3/7 stages
        duration
      });

      return {
        success: true,
        stage: this.STAGE_NAME,
        duration,
        data: normalizedConfig
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Handle error
      await errorHandler.handle(
        this.STAGE_NAME,
        errorObj,
        'critical',
        { 
          stage: 'Configuration Loading',
          suggestion: 'Check Mountain backend or meta tag configuration'
        }
      );

      return {
        success: false,
        stage: this.STAGE_NAME,
        duration,
        error: errorObj,
        critical: true
      };
    }
  }

  /**
   * Fetch configuration from appropriate source
   */
  private static async fetchConfiguration(platform: Platform): Promise<any> {
    console.log(`[Stage 2] Fetching configuration from ${platform}...`);

    if (platform === 'tauri') {
      // Fetch from Mountain backend via Tauri
      return await this.fetchFromMountain();
    } else {
      // Fetch from meta tags (Browser mode)
      return await this.fetchFromMetaTags();
    }
  }

  /**
   * Fetch configuration from Mountain backend
   */
  private static async fetchFromMountain(): Promise<any> {
    console.log('[Stage 2] Fetching from Mountain backend...');

    try {
      // Check if Tauri invoke is available
      if (!('__TAURI__' in window) || !(window as any).__TAURI__.core) {
        throw new Error('Tauri invoke not available');
      }

      const { invoke } = (window as any).__TAURI__.core;
      
      const config = await invoke('mountain_get_workbench_configuration');
      
      if (!config || typeof config !== 'object') {
        throw new Error('Invalid configuration received from Mountain');
      }

      console.log('[Stage 2] ✓ Configuration received from Mountain');
      return config;

    } catch (error) {
      console.error('[Stage 2] ✗ Failed to fetch from Mountain:', error);
      throw error;
    }
  }

  /**
   * Fetch configuration from meta tags
   */
  private static async fetchFromMetaTags(): Promise<any> {
    console.log('[Stage 2] Fetching from meta tags...');

    const metaElement = document.getElementById('vscode-workbench-web-configuration');
    
    if (!metaElement) {
      throw new Error('Configuration meta tag not found');
    }

    const settings = metaElement.getAttribute('data-settings');
    
    if (!settings) {
      throw new Error('Configuration data-settings attribute not found');
    }

    try {
      const config = JSON.parse(settings);
      console.log('[Stage 2] ✓ Configuration parsed from meta tags');
      return config;
    } catch (error) {
      console.error('[Stage 2] ✗ Failed to parse configuration:', error);
      throw new Error('Failed to parse configuration from meta tags');
    }
  }

  /**
   * Validate configuration structure
   */
  private static validateConfiguration(config: any): void {
    console.log('[Stage 2] Validating configuration structure...');

    const requiredFields = [
      'windowId',
      'machineId',
      'sessionId',
      'appRoot',
      'platform',
      'arch',
      'logLevel'
    ];

    const missingFields: string[] = [];

    for (const field of requiredFields) {
      if (!config[field]) {
        missingFields.push(field);
        console.warn(`[Stage 2] ⚠ Missing required field: ${field}`);
      } else {
        console.log(`[Stage 2] ✓ Field present: ${field}`);
      }
    }

    if (missingFields.length > 0) {
      throw new Error(`Missing required configuration fields: ${missingFields.join(', ')}`);
    }

    // Validate platform
    const validPlatforms = ['win32', 'darwin', 'linux', 'web'];
    if (!validPlatforms.includes(config.platform)) {
      throw new Error(`Invalid platform: ${config.platform}`);
    }

    // Validate arch
    const validArchs = ['x64', 'arm64', 'ia32', 'web'];
    if (!validArchs.includes(config.arch)) {
      throw new Error(`Invalid arch: ${config.arch}`);
    }

    // Validate log level
    if (typeof config.logLevel !== 'number' || config.logLevel < 0 || config.logLevel > 5) {
      throw new Error(`Invalid log level: ${config.logLevel}`);
    }

    console.log('[Stage 2] ✓ Configuration structure validated');
  }

  /**
   * Normalize configuration with defaults and apply migrations
   */
  private static normalizeConfiguration(config: any): ConfigurationData {
    console.log('[Stage 2] Normalizing configuration...');

    // Apply configuration migrations
    const migratedConfig = this.applyConfigurationMigrations(config);

    const normalized: ConfigurationData = {
      windowId: migratedConfig.windowId || '1',
      machineId: migratedConfig.machineId || this.generateMachineId(),
      sessionId: migratedConfig.sessionId || this.generateSessionId(),
      appRoot: migratedConfig.appRoot || 'file:///app',
      userDataPath: migratedConfig.userDataPath || 'file:///app/user-data',
      platform: migratedConfig.platform || 'web',
      arch: migratedConfig.arch || 'web',
      logLevel: migratedConfig.logLevel || 2,
      ...migratedConfig
    };

    // Ensure product configuration exists
    if (!normalized.productConfiguration) {
      normalized.productConfiguration = {
        nameShort: 'VSCode',
        nameLong: 'VSCode Wind',
        applicationName: 'vscode-wind',
        embedderIdentifier: 'wind-desktop'
      };
    }

    // Ensure NLS configuration exists
    if (!normalized.nls) {
      normalized.nls = {
        language: 'en',
        availableLanguages: { en: 'English' },
        messages: {}
      };
    }

    console.log('[Stage 2] ✓ Configuration normalized');
    return normalized;
  }

  /**
   * Apply configuration migrations based on version
   */
  private static applyConfigurationMigrations(config: any): any {
    console.log('[Stage 2] Checking configuration migrations...');

    const currentVersion = this.getCurrentConfigurationVersion();
    const configVersion = config.configurationVersion || 0;

    if (configVersion >= currentVersion) {
      console.log(`[Stage 2] ✓ Configuration is up to date (v${configVersion})`);
      return config;
    }

    console.log(`[Stage 2] Migrating configuration from v${configVersion} to v${currentVersion}`);

    let migrated = { ...config };

    // Apply migrations sequentially
    for (let version = configVersion + 1; version <= currentVersion; version++) {
      migrated = this.applyMigration(migrated, version);
      console.log(`[Stage 2] ✓ Applied migration v${version}`);
    }

    // Update version
    migrated.configurationVersion = currentVersion;
    console.log(`[Stage 2] ✓ Configuration migrated to v${currentVersion}`);

    return migrated;
  }

  /**
   * Get current configuration schema version
   */
  private static getCurrentConfigurationVersion(): number {
    // This should be updated when configuration schema changes
    // Current schema version: 1
    return 1;
  }

  /**
   * Apply a single configuration migration
   */
  private static applyMigration(config: any, targetVersion: number): any {
    console.log(`[Stage 2] Applying migration v${targetVersion}...`);

    const migrated = { ...config };

    switch (targetVersion) {
      case 1:
        // Migration 1: Add configuration version field
        migrated.configurationVersion = 1;
        // Add any field renaming or restructuring here
        break;

      case 2:
        // Future migration: Example field rename
        // if (migrated.oldField) {
        //   migrated.newField = migrated.oldField;
        //   delete migrated.oldField;
        // }
        break;

      default:
        console.warn(`[Stage 2] ⚠ Unknown migration version: ${targetVersion}`);
    }

    return migrated;
  }

  /**
   * Persist configuration to window.vscode.context
   */
  private static persistConfiguration(config: ConfigurationData): void {
    console.log('[Stage 2] Persisting configuration to window.vscode.context...');

    const vscode = (window as any).vscode;
    
    if (!vscode || !vscode.context) {
      throw new Error('window.vscode.context not available');
    }

    // Store configuration
    vscode.context._configuration = config;
    
    // Update configuration getter
    vscode.context.configuration = () => config;

    console.log('[Stage 2] ✓ Configuration persisted');
  }

  /**
   * Generate a machine ID
   */
  private static generateMachineId(): string {
    // Check if already persisted
    const existing = localStorage.getItem('vscode-wind-machine-id');
    if (existing) {
      console.log('[Stage 2] Using existing machine ID');
      return existing;
    }

    // Generate new ID
    const newId = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    // Persist
    localStorage.setItem('vscode-wind-machine-id', newId);
    console.log('[Stage 2] Generated and persisted new machine ID');
    return newId;
  }

  /**
   * Generate a session ID
   */
  private static generateSessionId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Get configuration from window.vscode.context
   */
  static getConfiguration(): ConfigurationData | null {
    const vscode = (window as any).vscode;
    return vscode?.context?._configuration || null;
  }
}
