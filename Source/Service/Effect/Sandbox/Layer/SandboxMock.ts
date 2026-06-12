1|/**
2| * @module Effect/Sandbox/Layer/SandboxMock
3| * @description
4| * Mock layer for Sandbox service.
5| * Provides a no-op implementation suitable for testing.
6| * @see {@link Effect/Sandbox/Layer/SandboxLive} Live layer
7| * @see {@link Effect/Sandbox/Interface/SandboxService} Service interface
8| * @category Layer
9| */
10|
12|
13|import {

14|	ConfigurationNotReadyError,

15|	SandboxNotReadyError,

16|} from "../../../Types/Sandbox.js";

17|import type { SandboxService } from "../Interface/SandboxService.js";

18|import { Sandbox } from "../Tag/SandboxTag.js";

19|
20|/**
21| * Mock layer for Sandbox service.
22| * Provides a failing implementation for testing non-vscode environments.
23| *
24| * @example
25| * ```ts
27| * import { SandboxMockLive } from "./Service/Sandbox/Layer/SandboxMock.js";
28| *
29| * const testLayer = SandboxMockLive;
30| * ```
31| */
32|const SandboxMockLive = Layer.succeed(Sandbox, {
33|	globals: Effect.die(new SandboxNotReadyError()),
34|	isReady: Effect.succeed(false),
35|	awaitReady: Effect.die(new SandboxNotReadyError()),
36|	ipc: Effect.die(new SandboxNotReadyError()),
37|	configuration: Effect.die(new SandboxNotReadyError()),
38|	resolveConfiguration: Effect.fail(new ConfigurationNotReadyError()),
39|});

40|
41|export default SandboxMockLive;

42|
