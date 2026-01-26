/**
 * @module Service (Platform/VSCode/Configuration)
 * @description Effect-TS service for handling VSCode's configuration system.
 * This service manages CLI argument parsing, argv.json configuration,
 * user data paths, and other configuration aspects that VSCode expects.
 * 
 * Key responsibilities:
 * - CLI argument parsing (minimist-compatible)
 * - argv.json file management
 * - User data path resolution
 * - Portable mode configuration
 * - NLS (internationalization) configuration
 */

import { Effect, Context } from 'effect';
import type { NativeParsedArgs } from '@codeeditorland/output/vs/platform/environment/common/argv.js';

/**
 * Interface representing VSCode's configuration system
 */
export interface IConfigurationService {
    /**
     * CLI argument parsing
     */
    readonly parseCLIArgs: (argv?: string[]) => NativeParsedArgs;
    
    /**
     * Configuration file management
     */
    readonly readArgvConfigSync: () => IArgvConfig;
    readonly createDefaultArgvConfigSync: (path: string) => void;
    readonly getArgvConfigPath: () => string;
    
    /**
     * Path resolution
     */
    readonly getUserDataPath: (args: NativeParsedArgs, productName: string) => string;
    readonly getCodeCachePath: () => string | undefined;
    readonly configurePortable: (product: any) => any;
    
    /**
     * Configuration validation and transformation
     */
    readonly configureCommandlineSwitchesSync: (cliArgs: NativeParsedArgs) => IArgvConfig;
    readonly getJSFlags: (cliArgs: NativeParsedArgs) => string | null;
    
    /**
     * Internationalization
     */
    readonly processZhLocale: (locale: string) => string;
    readonly getUserDefinedLocale: (argvConfig: IArgvConfig) => string | undefined;
}

/**
 * Interface for argv.json configuration
 */
export interface IArgvConfig {
    readonly [key: string]: string | string[] | boolean | undefined;
    readonly locale?: string;
    readonly 'disable-lcd-text'?: boolean;
    readonly 'proxy-bypass-list'?: string;
    readonly 'disable-hardware-acceleration'?: boolean;
    readonly 'force-color-profile'?: string;
    readonly 'enable-crash-reporter'?: boolean;
    readonly 'crash-reporter-id'?: string;
    readonly 'enable-proposed-api'?: string[];
    readonly 'log-level'?: string | string[];
    readonly 'disable-chromium-sandbox'?: boolean;
    readonly 'use-inmemory-secretstorage'?: boolean;
    readonly 'enable-rdp-display-tracking'?: boolean;
    readonly 'remote-debugging-port'?: string;
}

/**
 * Effect-TS service tag for ConfigurationService
 */
export class ConfigurationService extends Effect.Service<IConfigurationService>()(
    "vscode/Configuration", 
    {
        effect: Effect.gen(function* () {
            // Import VSCode's configuration utilities
            const { getUserDataPath: vsGetUserDataPath } = yield* Effect.promise(() => 
                import('@codeeditorland/output/vs/platform/environment/node/userDataPath.js')
            );
            
            const { parse } = yield* Effect.promise(() => 
                import('@codeeditorland/output/vs/base/common/jsonc.js')
            );
            
            /**
             * CLI argument parsing (minimist-compatible)
             */
            const parseCLIArgs = (argv?: string[]): NativeParsedArgs => {
                const args = argv || process.argv || [];
                const result: NativeParsedArgs = {
                    _: [],
                    'user-data-dir': undefined,
                    locale: undefined,
                    'js-flags': undefined,
                    'crash-reporter-directory': undefined,
                    'disable-chromium-sandbox': false,
                    sandbox: true
                };
                
                for (let i = 2; i < args.length; i++) {
                    const arg = args[i];
                    
                    if (arg.startsWith('--')) {
                        const key = arg.slice(2);
                        const nextArg = args[i + 1];
                        
                        if (nextArg && !nextArg.startsWith('--')) {
                            result[key as keyof NativeParsedArgs] = nextArg as any;
                            i++; // Skip the value
                        } else {
                            result[key as keyof NativeParsedArgs] = true as any;
                        }
                    } else if (!arg.startsWith('-')) {
                        result._.push(arg);
                    }
                }
                
                return result;
            };
            
            /**
             * Read argv.json configuration
             */
            const readArgvConfigSync = (): IArgvConfig => {
                try {
                    const configPath = getArgvConfigPath();
                    
                    // In Tauri environment, we need to use Tauri's file system APIs
                    // For now, return a default configuration
                    return {
                        // Default configuration for Wind
                        'disable-hardware-acceleration': false,
                        'enable-crash-reporter': true,
                        'log-level': 'info'
                    };
                } catch (error) {
                    console.warn('Failed to read argv.json, using defaults:', error);
                    return {};
                }
            };
            
            /**
             * Create default argv.json configuration
             */
            const createDefaultArgvConfigSync = (path: string): void => {
                try {
                    const defaultConfig = `{
  "//": "This configuration file allows you to pass permanent command line arguments to VSCode Wind.",
  "//": "Only a subset of arguments is currently supported.",
  "disable-hardware-acceleration": false,
  "enable-crash-reporter": true,
  "log-level": "info"
}`;
                    
                    // In Tauri, we would use the file system API here
                    console.log('Default argv.json would be created at:', path);
                } catch (error) {
                    console.error('Failed to create default argv.json:', error);
                }
            };
            
            /**
             * Get argv.json path
             */
            const getArgvConfigPath = (): string => {
                // In Wind/Tauri environment, we use a different path structure
                const vscodePortable = process.env['VSCODE_PORTABLE'];
                
                if (vscodePortable) {
                    return `${vscodePortable}/argv.json`;
                }
                
                // Use Wind-specific data folder
                const dataFolderName = 'VSCode-Wind';
                if (process.env['VSCODE_DEV']) {
                    return `${dataFolderName}-dev/argv.json`;
                }
                
                // For now, return a sensible default
                if (typeof window !== 'undefined' && (window as any).__TAURI__) {
                    // Tauri app data directory
                    return 'vscode-wind/argv.json';
                }
                
                return 'vscode-wind/argv.json';
            };
            
            /**
             * User data path resolution
             */
            const getUserDataPath = (args: NativeParsedArgs, productName: string): string => {
                // Use VSCode's existing logic but adapt for Wind/Tauri
                try {
                    return vsGetUserDataPath(args, productName);
                } catch (error) {
                    // Fallback for Wind environment
                    const userDataDir = args['user-data-dir'];
                    if (userDataDir) {
                        return userDataDir;
                    }
                    
                    // Tauri-specific data directory
                    if (typeof window !== 'undefined' && (window as any).__TAURI__) {
                        return 'vscode-wind-user-data';
                    }
                    
                    return 'vscode-wind-user-data';
                }
            };
            
            /**
             * Code cache path resolution
             */
            const getCodeCachePath = (): string | undefined => {
                // For now, disable code caching in Wind
                // This can be optimized later
                return undefined;
            };
            
            /**
             * Portable mode configuration
             */
            const configurePortable = (product: any): any => {
                // Portable mode not currently supported in Wind
                return {
                    isPortable: false,
                    portableDataPath: undefined
                };
            };
            
            /**
             * Command-line switch configuration
             */
            const configureCommandlineSwitchesSync = (cliArgs: NativeParsedArgs): IArgvConfig => {
                const argvConfig = readArgvConfigSync();
                
                // Apply CLI args over config file
                const result: IArgvConfig = { ...argvConfig };
                
                // Merge CLI arguments into configuration
                if (cliArgs.locale) {
                    result.locale = cliArgs.locale;
                }
                
                if (cliArgs['disable-hardware-acceleration']) {
                    result['disable-hardware-acceleration'] = true;
                }
                
                return result;
            };
            
            /**
             * JavaScript flags processing
             */
            const getJSFlags = (cliArgs: NativeParsedArgs): string | null => {
                const jsFlags: string[] = [];
                
                if (cliArgs['js-flags']) {
                    jsFlags.push(cliArgs['js-flags']);
                }
                
                // Add Wind-specific JS flags if needed
                if (process.platform === 'linux') {
                    jsFlags.push('--nodecommit_pooled_pages');
                }
                
                return jsFlags.length > 0 ? jsFlags.join(' ') : null;
            };
            
            /**
             * Chinese locale processing
             */
            const processZhLocale = (locale: string): string => {
                if (locale.startsWith('zh')) {
                    const region = locale.split('-')[1];
                    
                    if (['hans', 'cn', 'sg', 'my'].includes(region)) {
                        return 'zh-cn';
                    }
                    
                    return 'zh-tw';
                }
                
                return locale;
            };
            
            /**
             * User-defined locale extraction
             */
            const getUserDefinedLocale = (argvConfig: IArgvConfig): string | undefined => {
                const locale = argvConfig.locale;
                return typeof locale === 'string' ? locale.toLowerCase() : undefined;
            };
            
            return {
                parseCLIArgs,
                readArgvConfigSync,
                createDefaultArgvConfigSync,
                getArgvConfigPath,
                getUserDataPath,
                getCodeCachePath,
                configurePortable,
                configureCommandlineSwitchesSync,
                getJSFlags,
                processZhLocale,
                getUserDefinedLocale
            };
        })
    }
) {}