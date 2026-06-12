1|/**
2| * @module Effect/Sandbox/Interface/SandboxService
3| * @description
4| * Service interface for Sandbox globals access.
5| * Provides methods to access VSCode preload globals and configuration.
6| * @see {@link Effect/Sandbox/Tag/SandboxTag} Service tag
7| * @see {@link Effect/Sandbox/Layer/SandboxLive} Live implementation
8| * @category Interface
9| */
10|
12|
13|import type {
14|	ConfigurationNotReadyError,
15|	IPCRenderer,
16|	ISandboxConfiguration,
17|	SandboxContext,
18|	SandboxGlobals,
19|	SandboxNotReadyError,
20|} from "../../../Types/Sandbox.ts";
21|
22|/**
23| * Sandbox service interface for VSCode preload globals access.
24| * Provides safe access to window.vscode API with proper error handling and ready state management.
25| */
26|export interface SandboxService {
27|	/** Access the complete sandbox globals from window.vscode */
28|	readonly globals: Effect.Effect<SandboxGlobals, SandboxNotReadyError>;
29|
30|	/** Safe check if sandbox is ready (window.vscode exists) */
31|	readonly isReady: Effect.Effect<boolean, never>;
32|
33|	/** Wait for sandbox to be ready (polls until timeout) */
34|	readonly awaitReady: Effect.Effect<SandboxGlobals, SandboxNotReadyError>;
35|
36|	/** Get IPC renderer from globals (convenience method) */
37|	readonly ipc: Effect.Effect<IPCRenderer, SandboxNotReadyError>;
38|
39|	/** Get configuration context from globals */
40|	readonly configuration: Effect.Effect<SandboxContext, SandboxNotReadyError>;
41|
42|	/** Resolve configuration with proper error handling */
43|	readonly resolveConfiguration: Effect.Effect<
44|		ISandboxConfiguration,
45|		ConfigurationNotReadyError
46|	>;
47|}
48|
