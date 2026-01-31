/**
 * @module Types/Sandbox
 * @description
 * Atomic type definitions for VSCode sandbox globals.
 * Mirrors the VSCode preload contract exactly.
 * 
 * Reference: vs/base/parts/sandbox/electron-browser/globals.ts
 */

// IPC Message envelope
export interface IPCMessage {
  readonly channel: string;
  readonly args: ReadonlyArray<unknown>;
}

// IPC Renderer interface (matches VSCode's preload)
export interface IPCRenderer {
  readonly send: (channel: string, ...args: unknown[]) => void;
  readonly invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
  readonly on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => () => void;
  readonly once: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
  readonly removeListener: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void;
  readonly removeAllListeners: (channel: string) => void;
}

// MessagePort acquisition (for SharedProcessWorker)
export interface IPCMessagePort {
  readonly acquire: (responseChannel: string, nonce: string) => void;
}

// WebFrame interface
export interface WebFrame {
  readonly setZoomLevel: (level: number) => void;
}

// Process environment
export interface ProcessEnvironment {
  readonly [key: string]: string | undefined;
}

// VSCode sandbox node process
export interface SandboxNodeProcess {
  readonly platform: NodeJS.Platform;
  readonly arch: string;
  readonly env: ProcessEnvironment;
  readonly versions: {
    readonly node: string;
    readonly chrome: string;
    readonly electron: string;
  };
  readonly cwd: () => string;
  readonly shellEnv: () => Promise<ProcessEnvironment>;
  readonly getProcessMemoryInfo: () => Promise<{
    readonly workingSetSize: number;
    readonly peakWorkingSetSize: number;
    readonly privateBytes: number;
    readonly sharedBytes: number;
  }>;
  readonly on: (type: 'uncaughtException' | 'unhandledRejection', callback: (error: Error) => void) => void;
}

// Sandbox context (configuration access)
export interface SandboxContext {
  readonly configuration: () => Promise<ISandboxConfiguration>;
  readonly resolveConfiguration: () => Promise<ISandboxConfiguration>;
}

// VSCode sandbox configuration
export interface ISandboxConfiguration {
  readonly readonly?: boolean;
  readonly userEnv?: ProcessEnvironment;
  readonly zoomLevel?: number;
  readonly workspace?: {
    readonly id: string;
    readonly uri: string;
    readonly name: string;
  };
  // Additional VSCode-specific config
  readonly [key: string]: unknown;
}

// WebUtils
export interface WebUtils {
  readonly getPathForFile: (file: File) => string;
}

// Complete sandbox globals
export interface SandboxGlobals {
  readonly ipcRenderer: IPCRenderer;
  readonly ipcMessagePort: IPCMessagePort;
  readonly webFrame: WebFrame;
  readonly process: SandboxNodeProcess;
  readonly context: SandboxContext;
  readonly webUtils: WebUtils;
}

// Error types
export class SandboxNotReadyError extends Error {
  readonly _tag = "SandboxNotReadyError";
  constructor() {
    super("window.vscode is not initialized. Preload script not executed.");
  }
}

export class IPCChannelError extends Error {
  readonly _tag = "IPCChannelError";
  constructor(readonly channel: string, readonly cause: unknown) {
    super(`IPC channel '${channel}' error: ${String(cause)}`);
  }
}

export class ConfigurationNotReadyError extends Error {
  readonly _tag = "ConfigurationNotReadyError";
  constructor() {
    super("Configuration not yet resolved from preload");
  }
}
