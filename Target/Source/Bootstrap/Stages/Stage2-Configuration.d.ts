/**
 * @module Bootstrap/Stages/Stage2-Configuration
 * @description
 * Stage 2: Configuration Loading
 * Fetches and validates workbench configuration from Mountain or meta tags.
 */
import type { StageResult, ConfigurationData } from '../Types/Types.js';
export declare class ConfigurationStage {
    static readonly STAGE_NAME: "Configuration";
    /**
     * Execute the configuration loading stage
     */
    static execute(): Promise<StageResult>;
    /**
     * Fetch configuration from appropriate source
     */
    private static fetchConfiguration;
    /**
     * Fetch configuration from Mountain backend
     */
    private static fetchFromMountain;
    /**
     * Fetch configuration from meta tags
     */
    private static fetchFromMetaTags;
    /**
     * Validate configuration structure
     */
    private static validateConfiguration;
    /**
     * Normalize configuration with defaults
     */
    private static normalizeConfiguration;
    /**
     * Persist configuration to window.vscode.context
     */
    private static persistConfiguration;
    /**
     * Generate a machine ID
     */
    private static generateMachineId;
    /**
     * Generate a session ID
     */
    private static generateSessionId;
    /**
     * Get configuration from window.vscode.context
     */
    static getConfiguration(): ConfigurationData | null;
}
//# sourceMappingURL=Stage2-Configuration.d.ts.map